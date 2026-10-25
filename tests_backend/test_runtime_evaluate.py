"""Runtime tests: the evaluation loop applies programs against a fake hass.

Every other suite checks this code as source text or through the pure helpers;
here the real ``async_evaluate`` runs end to end, so what is asserted is the
traffic on the wire -- mode before target, no call when the target already
matches, the heat_cool pair, and the validation path that must record an error
instead of aborting the whole loop.
"""

from __future__ import annotations

import unittest

from ha_test_support import (
    CLOCK,
    FakeHass,
    FakeState,
    FakeStore,
    MODULE_NAME,
    integration_module,
)

integration = integration_module()
_ORIGINAL_NOW = integration.dt_util.now

CLIMATE = "climate.living_room"


def climate_slot(slot_id="day", days=None, start="09:00", end="10:00", temperature=21):
    return {"id": slot_id, "days": days or [1], "start": start, "end": end, "temperature": temperature}


def dual_slot(slot_id="day", days=None, start="09:00", end="10:00", low=18, high=22):
    return {"id": slot_id, "days": days or [1], "start": start, "end": end, "target_temp_low": low, "target_temp_high": high}


def entity(state="heat", **attributes):
    base = {
        "friendly_name": "Living room",
        "min_temp": 7,
        "max_temp": 30,
        "target_temp_step": 0.5,
        "hvac_modes": ["off", "heat", "cool", "heat_cool"],
        "current_temperature": 19,
    }
    base.update(attributes)
    return FakeState(state, **base)


class RuntimeEvaluateTests(unittest.IsolatedAsyncioTestCase):
    """async_evaluate, executed for real, against a fake Home Assistant."""

    def setUp(self) -> None:
        # A fixed Monday morning keeps "the 09:00-10:00 slot is active" true
        # for every test without touching wall time; CLOCK drives whatever dt
        # module the integration imported.
        integration.dt_util.now = lambda: CLOCK["now"]

    def tearDown(self) -> None:
        integration.dt_util.now = _ORIGINAL_NOW

    def scheduler(self, states, programs):
        hass = FakeHass(states)
        scheduler = integration.Scheduler(hass, FakeStore())
        scheduler.programs = dict(programs)
        return scheduler, hass

    async def test_single_slot_sets_mode_then_temperature_once(self):
        program = integration.validate_program([climate_slot(temperature=21)], True, None, "heat")
        # The entity runs in another mode, so the mode call must come first.
        scheduler, hass = self.scheduler(
            {CLIMATE: entity("auto", hvac_modes=["off", "heat", "auto"], temperature=20)},
            {CLIMATE: program},
        )
        await scheduler.async_evaluate()
        self.assertEqual(
            hass.services.calls,
            [
                ("climate", "set_hvac_mode", {"entity_id": CLIMATE, "hvac_mode": "heat"}),
                ("climate", "set_temperature", {"entity_id": CLIMATE, "temperature": 21.0}),
            ],
            "the mode is applied before the target",
        )
        self.assertEqual(scheduler.errors.get(CLIMATE), None)
        self.assertEqual(scheduler.pending, set())
        self.assertIsNotNone(scheduler.applied_slot.get(CLIMATE))
        # An unchanged program applies once: the cache key short-circuits.
        await scheduler.async_evaluate()
        self.assertEqual(len(hass.services.calls), 2)

    async def test_aligned_target_sends_no_call_but_still_marks_applied(self):
        program = integration.validate_program([climate_slot(temperature=21)], True, None, None)
        scheduler, hass = self.scheduler({CLIMATE: entity(temperature=21)}, {CLIMATE: program})
        await scheduler.async_evaluate()
        self.assertEqual(hass.services.calls, [], "nothing to change, nothing sent")
        self.assertIsNotNone(scheduler.applied_slot.get(CLIMATE))

    async def test_dual_slot_sends_the_pair_and_skips_when_aligned(self):
        program = integration.validate_program([dual_slot(low=18, high=22)], True, None, "heat_cool")
        scheduler, hass = self.scheduler(
            {CLIMATE: entity("heat_cool", target_temp_low=17, target_temp_high=24)},
            {CLIMATE: program},
        )
        await scheduler.async_evaluate()
        self.assertEqual(
            hass.services.calls,
            [
                (
                    "climate",
                    "set_temperature",
                    {"entity_id": CLIMATE, "target_temp_low": 18.0, "target_temp_high": 22.0},
                )
            ],
            "a heat_cool slot sends both bounds and no scalar temperature",
        )
        # The entity now reports the pair: the same program must send nothing.
        hass.states.set(
            CLIMATE,
            entity("heat_cool", target_temp_low=18, target_temp_high=22),
        )
        scheduler.applied_slot.clear()
        await scheduler.async_evaluate()
        self.assertEqual(len(hass.services.calls), 1, "an aligned pair is not resent")

    async def test_mixed_slots_switch_to_heat_cool_then_restore_scalar_mode(self):
        program = integration.validate_program(
            [
                dual_slot("range", start="09:00", end="10:00", low=18, high=22),
                climate_slot("single", start="10:00", end="11:00", temperature=21),
            ],
            True,
            None,
            "heat",
        )
        scheduler, hass = self.scheduler(
            {CLIMATE: entity("heat", temperature=20)}, {CLIMATE: program}
        )
        original_now = CLOCK["now"]
        try:
            await scheduler.async_evaluate()
            self.assertEqual(
                hass.services.calls,
                [
                    ("climate", "set_hvac_mode", {"entity_id": CLIMATE, "hvac_mode": "heat_cool"}),
                    (
                        "climate",
                        "set_temperature",
                        {"entity_id": CLIMATE, "target_temp_low": 18.0, "target_temp_high": 22.0},
                    ),
                ],
                "a range slot switches to heat_cool before sending both bounds",
            )

            CLOCK["now"] = original_now.replace(hour=10, minute=30)
            hass.states.set(CLIMATE, entity("heat_cool", temperature=20, target_temp_low=18, target_temp_high=22))
            await scheduler.async_evaluate()
            self.assertEqual(
                hass.services.calls[2:],
                [
                    ("climate", "set_hvac_mode", {"entity_id": CLIMATE, "hvac_mode": "heat"}),
                    ("climate", "set_temperature", {"entity_id": CLIMATE, "temperature": 21.0}),
                ],
                "a scalar slot restores the configured mode before sending its target",
            )
        finally:
            CLOCK["now"] = original_now

    async def test_mixed_slots_without_scalar_mode_are_rejected_even_if_entity_is_unavailable(self):
        program = integration.validate_program(
            [dual_slot("range"), climate_slot("single", start="10:00", end="11:00")],
            True,
        )
        scheduler, hass = self.scheduler(
            {CLIMATE: entity("unavailable")}, {CLIMATE: program}
        )
        await scheduler.async_evaluate()
        self.assertEqual(hass.services.calls, [])
        self.assertEqual(scheduler.errors[CLIMATE]["code"], "mixed_slots_mode_required")

    async def test_save_rejects_shape_errors_even_when_entity_is_unavailable(self):
        cases = [
            (
                [dual_slot("range"), climate_slot("single", start="10:00", end="11:00")],
                None,
                None,
                "mixed_slots_mode_required",
            ),
            ([dual_slot()], 17, "heat_cool", "heat_cool_unsupported"),
        ]
        for slots, away_temperature, hvac_mode, expected_code in cases:
            with self.subTest(code=expected_code):
                scheduler, _ = self.scheduler({CLIMATE: entity("unavailable")}, {})
                with self.assertRaises(integration.ScheduleValidationError) as catch:
                    await scheduler.async_set_program(
                        CLIMATE, True, slots, away_temperature, hvac_mode
                    )
                self.assertEqual(catch.exception.code, expected_code)
                self.assertNotIn(CLIMATE, scheduler.programs)

    async def test_heat_cool_outside_target_is_rejected_without_a_service_call(self):
        program = integration.validate_program(
            [dual_slot()], True, away_temperature=17, hvac_mode="heat_cool"
        )
        scheduler, hass = self.scheduler(
            {CLIMATE: entity("heat_cool", target_temp_low=18, target_temp_high=22)},
            {CLIMATE: program},
        )
        await scheduler.async_evaluate()
        self.assertEqual(hass.services.calls, [])
        self.assertEqual(scheduler.errors[CLIMATE]["code"], "heat_cool_unsupported")

    async def test_out_of_range_target_records_an_error_and_the_loop_continues(self):
        # Two entities: the first has a target outside the entity limits. The
        # validation error must be recorded for it *and* the second entity must
        # still be applied -- a raised ScheduleError here would abort the whole
        # loop and silently stop the schedule for everyone after it.
        broken = integration.validate_program([climate_slot(temperature=40)], True, None, None)
        healthy = integration.validate_program([climate_slot(temperature=21)], True, None, None)
        scheduler, hass = self.scheduler(
            {"climate.a": entity(), "climate.b": entity()},
            {"climate.a": broken, "climate.b": healthy},
        )
        with self.assertLogs(MODULE_NAME, level="WARNING") as logs:
            await scheduler.async_evaluate()
        error = scheduler.errors.get("climate.a")
        self.assertIsInstance(error, dict)
        self.assertEqual(error["code"], "target_outside_limits")
        self.assertIn("outside climate limits", error["message"])
        self.assertTrue(any("climate.a" in line for line in logs.output))
        self.assertNotIn("climate.a", scheduler.pending, "a permanent validation failure is not pending")
        self.assertEqual(
            hass.services.calls,
            [("climate", "set_temperature", {"entity_id": "climate.b", "temperature": 21.0})],
            "the entity after the failing one still applies",
        )
        self.assertEqual(scheduler.errors.get("climate.b"), None)

    async def test_unexposed_mode_is_recorded_without_any_call(self):
        program = integration.validate_program([climate_slot()], True, None, "dry")
        scheduler, hass = self.scheduler(
            {CLIMATE: entity(hvac_modes=["off", "heat"])}, {CLIMATE: program}
        )
        with self.assertLogs(MODULE_NAME, level="WARNING"):
            await scheduler.async_evaluate()
        self.assertEqual(hass.services.calls, [])
        error = scheduler.errors.get(CLIMATE)
        self.assertIsInstance(error, dict)
        self.assertEqual(error["code"], "unsupported_hvac_mode")

    async def test_unavailable_entity_stays_pending_with_no_call(self):
        program = integration.validate_program([climate_slot()], True, None, "heat")
        scheduler, hass = self.scheduler(
            {CLIMATE: entity("unavailable", temperature=None)}, {CLIMATE: program}
        )
        await scheduler.async_evaluate()
        self.assertEqual(hass.services.calls, [])
        self.assertIn(CLIMATE, scheduler.pending)
        error = scheduler.errors.get(CLIMATE)
        self.assertIsInstance(error, dict)
        self.assertEqual(error["code"], "entity_unavailable")

    async def test_off_program_mode_applies_the_mode_without_a_target(self):
        program = integration.validate_program([climate_slot()], True, None, "off")
        scheduler, hass = self.scheduler({CLIMATE: entity("heat")}, {CLIMATE: program})
        await scheduler.async_evaluate()
        self.assertEqual(
            hass.services.calls,
            [("climate", "set_hvac_mode", {"entity_id": CLIMATE, "hvac_mode": "off"})],
            "off sends the mode and no temperature",
        )


if __name__ == "__main__":
    unittest.main()
