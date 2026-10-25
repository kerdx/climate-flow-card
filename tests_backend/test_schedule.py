"""Regression tests for pure weekly calendar logic."""

import unittest
from datetime import datetime, timedelta, timezone
import importlib.util
import ast
import re
from pathlib import Path
from zoneinfo import ZoneInfo

_MODULE = Path(__file__).parents[1] / "custom_components/climate_flow_scheduler/schedule.py"
_SPEC = importlib.util.spec_from_file_location("pure_schedule", _MODULE)
schedule = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(schedule)
ScheduleError, active_slot, validate_program, validate_target = (
    schedule.ScheduleError, schedule.active_slot, schedule.validate_program, schedule.validate_target
)
validate_single_target_mode = schedule.validate_single_target_mode
slot_is_dual = schedule.slot_is_dual
slot_target = schedule.slot_target
validate_dual_target = schedule.validate_dual_target
dual_needs_update = schedule.dual_needs_update
next_boundary = schedule.next_boundary
target_needs_update = schedule.target_needs_update
program_status = schedule.program_status
resolve_target = schedule.resolve_target
effective_program_target = schedule.effective_program_target
manual_override_expiry = schedule.manual_override_expiry
program_apply_key = schedule.program_apply_key
clear_manual_override = schedule.clear_manual_override
override_is_operational = schedule.override_is_operational
validate_override_step = schedule.validate_override_step
normalize_manual_override = schedule.normalize_manual_override
validate_manual_override_target = schedule.validate_manual_override_target
AWAY_TARGET = schedule.AWAY_TARGET
availability_action = schedule.availability_action
snapshot_entity_state = schedule.snapshot_entity_state
restore_entity_state = schedule.restore_entity_state
entity_config_changed = schedule.entity_config_changed
CONFIG_ATTRIBUTES = schedule.CONFIG_ATTRIBUTES
migrate_storage_data = schedule.migrate_storage_data
DATA_MIGRATIONS = schedule.DATA_MIGRATIONS
structured_error = schedule.structured_error
error_entry = schedule.error_entry
pause_expiry = schedule.pause_expiry
normalize_pause = schedule.normalize_pause
pause_is_active = schedule.pause_is_active
effective_target = schedule.effective_target
PAUSE_TARGET = schedule.PAUSE_TARGET
PAUSE_DURATIONS = schedule.PAUSE_DURATIONS
ROOT = Path(__file__).parents[1]


def slot(slot_id="a", days=None, start="09:00", end="10:00", temperature=21):
    return {"id": slot_id, "days": days or [1], "start": start, "end": end, "temperature": temperature}


def dual_slot(slot_id="a", days=None, start="09:00", end="10:00", low=18, high=22):
    return {"id": slot_id, "days": days or [1], "start": start, "end": end, "target_temp_low": low, "target_temp_high": high}


class ScheduleTests(unittest.TestCase):
    def test_schema_and_ids_and_target(self):
        valid = validate_program([slot()], True)
        self.assertTrue(valid["enabled"])
        self.assertEqual(valid["slots"][0]["temperature"], 21.0)
        for slots in ([slot(), slot()], [slot(temperature=True)], [slot(temperature=float("nan"))], [slot(temperature="21")]):
            with self.subTest(slots=slots), self.assertRaises(ScheduleError):
                validate_program(slots)
        with self.assertRaises(ScheduleError):
            validate_program([slot(days=[0])])

    def test_away_temperature_validation(self):
        program = validate_program([slot()], True, 17)
        self.assertEqual(program["away_temperature"], 17.0)
        self.assertIsNone(validate_program([slot()])["away_temperature"])
        self.assertEqual(validate_program([], False, 17)["away_temperature"], 17.0)
        # Pure validation preserves a disabled program's draft; the climate-
        # aware enable/save path rejects a scalar outside target in heat_cool.
        heat_cool = validate_program([dual_slot()], False, 17, "heat_cool")
        self.assertEqual(heat_cool["away_temperature"], 17.0)
        for bad in (True, "17", float("nan"), float("inf")):
            with self.subTest(bad=bad), self.assertRaises(ScheduleError):
                validate_program([slot()], False, bad)

    def test_hvac_mode_validation(self):
        program = validate_program([slot()], True, None, "cool")
        self.assertEqual(program["hvac_mode"], "cool")
        self.assertIsNone(validate_program([slot()])["hvac_mode"])
        for mode in ("off", "heat", "auto", "dry", "fan_only"):
            self.assertEqual(validate_program([], False, None, mode)["hvac_mode"], mode)
        # heat_cool is schedulable now that slots can carry both temperatures,
        # but only with dual slots: a single target has nothing to send.
        self.assertEqual(validate_program([], False, None, "heat_cool")["hvac_mode"], "heat_cool")
        self.assertEqual(validate_program([dual_slot()], True, None, "heat_cool")["hvac_mode"], "heat_cool")
        for bad in (True, "", "banana", 3):
            with self.subTest(bad=bad), self.assertRaises(ScheduleError):
                validate_program([slot()], False, None, bad)
        with self.assertRaises(ScheduleError) as single:
            validate_program([slot()], True, None, "heat_cool")
        self.assertEqual(single.exception.code, "heat_cool_dual_required")

    def test_same_day_overlap_and_half_open(self):
        with self.assertRaises(ScheduleError):
            validate_program([slot("a", start="09:00", end="10:01"), slot("b", start="10:00", end="11:00")])
        validate_program([slot("a", end="10:00"), slot("b", start="10:00", end="11:00")])

    def test_overnight_overlap_and_sunday_wrap(self):
        with self.assertRaises(ScheduleError):
            validate_program([slot("night", [7], "23:00", "02:00"), slot("early", [1], "01:00", "03:00")])
        program = validate_program([slot("night", [7], "23:00", "02:00")])
        self.assertEqual(active_slot(program["slots"], datetime(2026, 10, 12, 1, 59))["id"], "night")
        self.assertIsNone(active_slot(program["slots"], datetime(2026, 10, 12, 2, 0)))
        self.assertEqual(active_slot(program["slots"], datetime(2026, 10, 11, 23, 0))["id"], "night")

    def test_active_half_open(self):
        program = validate_program([slot()])
        self.assertIsNone(active_slot(program["slots"], datetime(2026, 10, 12, 8, 59)))
        self.assertEqual(active_slot(program["slots"], datetime(2026, 10, 12, 9, 0))["id"], "a")
        self.assertIsNone(active_slot(program["slots"], datetime(2026, 10, 12, 10, 0)))

    def test_bad_time_and_empty(self):
        for bad in ("24:00", "9:00", "10:60", "10:00:00"):
            with self.subTest(bad=bad), self.assertRaises(ScheduleError):
                validate_program([slot(start=bad)])
        with self.assertRaises(ScheduleError):
            validate_program([slot(start="09:00", end="09:00")])

    def test_range_step_and_fail_closed(self):
        self.assertEqual(validate_target(20, 5, 30, 0.5), 20)
        for target, low, high, step in ((4, 5, 30, 0.5), (30.5, 5, 30, 0.5), (20.1, 5, 30, 0.5), (float("inf"), 5, 30, 0.5), (20, 5, 30, 0)):
            with self.subTest(target=target, step=step), self.assertRaises(ScheduleError):
                validate_target(target, low, high, step)

    def test_single_target_mode_fails_closed(self):
        validate_single_target_mode("heat", "heat")
        for state_mode, attribute_mode in (("heat_cool", "heat"), ("heat", "heat_cool")):
            with self.subTest(state_mode=state_mode, attribute_mode=attribute_mode), self.assertRaises(ScheduleError):
                validate_single_target_mode(state_mode, attribute_mode)

    def test_target_comparison_uses_small_numeric_tolerance(self):
        self.assertFalse(target_needs_update(20.0001, 20, 0.5))
        self.assertTrue(target_needs_update(20.2, 20, 0.5))
        self.assertTrue(target_needs_update(20.5, 20, 0.5))
        self.assertTrue(target_needs_update(None, 20, 0.5))

    def test_disabled_program_has_no_actionable_slot_or_boundary(self):
        slots = validate_program([slot()], False)["slots"]
        current, boundary = program_status(slots, False, datetime(2026, 10, 12, 9, 30))
        self.assertIsNone(current)
        self.assertIsNone(boundary)
        current, boundary = program_status(slots, True, datetime(2026, 10, 12, 9, 30))
        self.assertEqual(current["id"], "a")
        self.assertEqual(boundary, datetime(2026, 10, 12, 10, 0))

    def test_resolve_target_prefers_slot_then_away(self):
        slots = validate_program([slot("day", [1], "09:00", "10:00")], True, 17)["slots"]
        self.assertEqual(resolve_target(slots, 17, datetime(2026, 10, 12, 9, 30)), ("day", 21.0))
        self.assertEqual(resolve_target(slots, 17, datetime(2026, 10, 12, 10, 30)), (AWAY_TARGET, 17.0))
        self.assertEqual(resolve_target(slots, None, datetime(2026, 10, 12, 10, 30)), (None, None))
        self.assertEqual(resolve_target([], None, datetime(2026, 10, 12, 10, 30)), (None, None))
        self.assertEqual(resolve_target([], 17, datetime(2026, 10, 12, 10, 30)), (AWAY_TARGET, 17.0))
        # A dual slot resolves to the pair; a single slot and the away target
        # stay floats, so the apply step can tell the two payloads apart.
        dual = validate_program([dual_slot("day", [1], "09:00", "10:00", 17, 21)], True)["slots"]
        self.assertEqual(resolve_target(dual, None, datetime(2026, 10, 12, 9, 30)), ("day", (17.0, 21.0)))

    def test_dual_slot_schema_is_exact_and_mixed_programs_are_allowed(self):
        program = validate_program(
            [dual_slot("day", [1], "09:00", "10:00"), slot("night", [1], "21:00", "22:00", 19)],
            True,
            hvac_mode="heat",
        )
        self.assertEqual(program["slots"][0]["target_temp_low"], 18.0)
        self.assertEqual(program["slots"][0]["target_temp_high"], 22.0)
        self.assertEqual(program["slots"][1]["temperature"], 19.0)
        self.assertNotIn("temperature", program["slots"][0])
        self.assertEqual(slot_is_dual(program["slots"][0]), True)
        self.assertEqual(slot_is_dual(program["slots"][1]), False)
        self.assertEqual(slot_target(program["slots"][0]), (18.0, 22.0))
        self.assertEqual(slot_target(program["slots"][1]), 19.0)
        # The key set is exact in both shapes: a partial pair, an extra key or
        # both shapes at once are all schema errors.
        partial = dual_slot()
        partial.pop("target_temp_high")
        both = {**dual_slot(), "temperature": 20}
        extra = {**dual_slot(), "fan_mode": "auto"}
        for bad in (partial, both, extra, {**slot(), "target_temp_low": 18}):
            with self.subTest(bad=bad), self.assertRaises(ScheduleError) as catch:
                validate_program([bad])
            self.assertEqual(catch.exception.code, "invalid_slot_schema")
        # Overnight dual slots keep the same overlap rule as single ones.
        with self.assertRaises(ScheduleError):
            validate_program([dual_slot("night", [7], "23:00", "02:00"), dual_slot("early", [1], "01:00", "03:00")])

    def test_dual_range_validation(self):
        with self.assertRaises(ScheduleError) as equal:
            validate_program([dual_slot(low=20, high=20)])
        self.assertEqual(equal.exception.code, "dual_range_invalid")
        with self.assertRaises(ScheduleError) as inverted:
            validate_program([dual_slot(low=22, high=18)])
        self.assertEqual(inverted.exception.code, "dual_range_invalid")
        for bad in (True, "20", float("nan"), float("inf")):
            with self.subTest(bad=bad), self.assertRaises(ScheduleError) as catch:
                validate_program([dual_slot(low=bad, high=22)])
            self.assertEqual(catch.exception.code, "invalid_temperature")
        # On the entity grid: both bounds must sit on the step, inside limits.
        self.assertEqual(validate_dual_target(17.5, 22, 7, 30, 0.5), (17.5, 22.0))
        with self.assertRaises(ScheduleError) as off_step:
            validate_dual_target(17.3, 22, 7, 30, 0.5)
        self.assertEqual(off_step.exception.code, "target_off_step")
        with self.assertRaises(ScheduleError) as outside:
            validate_dual_target(5, 31, 7, 30, 0.5)
        self.assertEqual(outside.exception.code, "target_outside_limits")
        with self.assertRaises(ScheduleError) as touching:
            validate_dual_target(20, 20, 7, 30, 0.5)
        self.assertEqual(touching.exception.code, "dual_range_invalid")
        # The apply step compares each bound with the native tolerance.
        self.assertFalse(dual_needs_update(18, 22, 18.0, 22.0, 0.5))
        self.assertTrue(dual_needs_update(18, 22, 18.5, 22.0, 0.5))
        self.assertTrue(dual_needs_update(18, 21.5, 18.0, 22.0, 0.5))
        self.assertTrue(dual_needs_update(None, None, 18.0, 22.0, 0.5))

    def test_apply_key_covers_both_bounds_of_a_user_target(self):
        # Override and pause targets are hashed into the cache identity; a
        # pair must distinguish both bounds, not just the first one.
        self.assertNotEqual(
            program_apply_key(None, "__manual_override__", (20.0, 22.0)),
            program_apply_key(None, "__manual_override__", (20.0, 21.0)),
        )
        self.assertNotEqual(
            program_apply_key(None, "__manual_override__", (20.0, 22.0)),
            program_apply_key(None, "__manual_override__", 20.0),
        )

    def test_availability_transitions_require_retry_only_during_active_slot(self):
        self.assertEqual(availability_action(True, True, "heat", "unavailable"), "pending")
        self.assertEqual(availability_action(True, True, "unavailable", "heat"), "retry")
        self.assertIsNone(availability_action(True, False, "unavailable", "heat"))
        self.assertIsNone(availability_action(False, True, "unavailable", "heat"))
        self.assertIsNone(availability_action(True, True, "heat", "heat"))

    def test_entity_config_change_retries_on_hvac_modes_and_key_attributes(self):
        old = {
            "hvac_mode": "cool", "hvac_modes": ["off", "cool"],
            "min_temp": 7, "max_temp": 30, "target_temp_step": 0.5,
        }
        # A program rejected because the configured mode is missing retries as
        # soon as the entity advertises another mode list.
        self.assertIn("hvac_modes", CONFIG_ATTRIBUTES)
        self.assertTrue(entity_config_changed(old, {**old, "hvac_modes": ["off", "cool", "heat"]}, "cool", "cool"))
        self.assertTrue(entity_config_changed(old, {**old, "hvac_modes": None}, "cool", "cool"))
        # The pre-existing retries stay: configured mode, limits, step and the
        # transition into or out of heat_cool.
        for key, value in (("hvac_mode", "heat"), ("min_temp", 5), ("max_temp", 32), ("target_temp_step", 1)):
            with self.subTest(key=key):
                self.assertIn(key, CONFIG_ATTRIBUTES)
                self.assertTrue(entity_config_changed(old, {**old, key: value}, "cool", "cool"))
        self.assertTrue(entity_config_changed(old, dict(old), "heat_cool", "heat"))
        self.assertTrue(entity_config_changed(old, dict(old), "heat", "heat_cool"))
        # An unchanged attribute never causes a retry, and neither does churn
        # on attributes the validation does not read.
        self.assertFalse(entity_config_changed(old, dict(old), "cool", "cool"))
        self.assertFalse(entity_config_changed(old, {**old, "friendly_name": "Kitchen", "icon": "mdi:radiator"}, "cool", "cool"))
        self.assertFalse(entity_config_changed(old, dict(old), "heat", "cool"))
        self.assertFalse(entity_config_changed(old, dict(old), "heat", "idle"))
        # First appearance of the entity has no previous configuration.
        self.assertTrue(entity_config_changed(None, old, None, "cool"))

    def test_state_changed_routes_hvac_modes_retry_through_pure_helper(self):
        """The HA listener must delegate its comparison so hvac_modes counts."""
        init_path = ROOT / "custom_components/climate_flow_scheduler/__init__.py"
        source = init_path.read_text(encoding="utf-8")
        module = ast.parse(source)
        handlers = [
            node for node in ast.walk(module)
            if isinstance(node, ast.AsyncFunctionDef) and node.name == "async_state_changed"
        ]
        self.assertEqual(len(handlers), 1)
        calls = [
            node for node in ast.walk(handlers[0])
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "entity_config_changed"
        ]
        self.assertEqual(len(calls), 1)
        args = [
            arg for arg in ast.walk(calls[0])
            if isinstance(arg, ast.Attribute) and isinstance(arg.value, ast.Name)
        ]
        self.assertIn(("new", "attributes"), [(arg.value.id, arg.attr) for arg in args])
        self.assertIn(("new", "state"), [(arg.value.id, arg.attr) for arg in args])
        self.assertIn(("old", "attributes"), [(arg.value.id, arg.attr) for arg in args])
        self.assertIn(("old", "state"), [(arg.value.id, arg.attr) for arg in args])
        # The retry stays gated: a config change alone re-evaluates only while
        # a validation error blocks the program.
        self.assertIn("if config_changed and validation_blocked:", source)

    def test_explicit_override_step_short_circuits_native_step_for_comparison(self):
        source = (ROOT / "custom_components/climate_flow_scheduler/__init__.py").read_text(encoding="utf-8")
        module = ast.parse(source)
        evaluator = next(node for node in ast.walk(module) if isinstance(node, ast.AsyncFunctionDef) and node.name == "async_evaluate")
        comparison = next(node for node in ast.walk(evaluator) if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "target_needs_update")
        self.assertIsInstance(comparison.args[2], ast.Name)
        self.assertEqual(comparison.args[2].id, "comparison_step")
        assignment = next(node for node in ast.walk(evaluator) if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "comparison_step" for t in node.targets))
        self.assertIsInstance(assignment.value, ast.IfExp)
        self.assertIsInstance(assignment.value.test, ast.Compare)
        self.assertIsInstance(assignment.value.body, ast.Name)
        self.assertEqual(assignment.value.body.id, "step_override")
        self.assertIsInstance(assignment.value.orelse, ast.Call)
        self.assertEqual(assignment.value.orelse.func.id, "_step")

    def test_readme_outside_slot_rule_separates_mode_call_from_target(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        normalized_readme = readme.casefold().replace("**", "")
        self.assertNotRegex(normalized_readme, r"outside slots no call is made")
        self.assertRegex(
            normalized_readme,
            r"no target temperature call is made unless outside schedule"
            r"|outside-schedule temperature.{0,160}(?:if omitted|if it is absent).{0,100}"
            r"no target is sent outside",
        )
        self.assertRegex(
            normalized_readme,
            r"`set_hvac_mode` is still sent outside the slots"
            r"|(?:hvac_mode|hvac mode.{0,40}(?:optional|set)).{0,120}"
            r"(?:applied|set|sent|including).{0,80}outside(?: scheduled)? slots",
        )

    def test_entity_snapshot_rolls_back_mapping_and_set_state(self):
        programs = {"climate.room": {"enabled": True, "slots": [{"id": "old"}]}}
        errors = {"climate.room": "old error"}
        applied = {"climate.room": "old"}
        logged = {"climate.room": "old log"}
        pending = {"climate.room"}
        snapshot = snapshot_entity_state(
            "climate.room", (programs, errors, applied, logged), (pending,)
        )
        programs["climate.room"]["slots"].clear()
        errors.pop("climate.room")
        applied["climate.room"] = "new"
        logged.pop("climate.room")
        pending.clear()
        restore_entity_state(snapshot)
        self.assertEqual(programs["climate.room"]["slots"], [{"id": "old"}])
        self.assertEqual(errors["climate.room"], "old error")
        self.assertEqual(applied["climate.room"], "old")
        self.assertEqual(logged["climate.room"], "old log")
        self.assertIn("climate.room", pending)

        missing = snapshot_entity_state("climate.new", (programs, errors), (pending,))
        programs["climate.new"] = {"enabled": True}
        errors["climate.new"] = "failed"
        pending.add("climate.new")
        restore_entity_state(missing)
        self.assertNotIn("climate.new", programs)
        self.assertNotIn("climate.new", errors)
        self.assertNotIn("climate.new", pending)

    def test_config_flow_exports_home_assistant_expected_class(self):
        path = Path(__file__).parents[1] / "custom_components/climate_flow_scheduler/config_flow.py"
        module = ast.parse(path.read_text(encoding="utf-8"))
        flow_classes = [node for node in module.body if isinstance(node, ast.ClassDef) and node.name == "ConfigFlow"]
        self.assertEqual(len(flow_classes), 1)
        self.assertTrue(any(isinstance(base, ast.Attribute) and base.attr == "ConfigFlow" for base in flow_classes[0].bases))
        aborts = [node for node in ast.walk(flow_classes[0]) if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "async_abort"]
        self.assertTrue(any(any(keyword.arg == "reason" and isinstance(keyword.value, ast.Constant) and keyword.value.value == "single_instance_allowed" for keyword in call.keywords) for call in aborts))

    def test_empty_enabled_and_input_bounds(self):
        self.assertEqual(validate_program([], False)["slots"], [])
        with self.assertRaises(ScheduleError):
            validate_program([], True)
        with self.assertRaises(ScheduleError):
            validate_program([slot("bad id")])
        with self.assertRaises(ScheduleError):
            validate_program([slot("x" * 65)])
        with self.assertRaises(ScheduleError):
            validate_program([slot(str(index)) for index in range(51)])

    def test_next_boundary_regular_and_overnight_week_wrap(self):
        program = validate_program([slot("morning", [1], "09:00", "10:00")])
        self.assertEqual(next_boundary(program["slots"], datetime(2026, 10, 12, 8, 30)), datetime(2026, 10, 12, 9, 0))
        self.assertEqual(next_boundary(program["slots"], datetime(2026, 10, 12, 9, 30)), datetime(2026, 10, 12, 10, 0))
        overnight = validate_program([slot("sun", [7], "23:00", "02:00")])
        self.assertEqual(next_boundary(overnight["slots"], datetime(2026, 10, 11, 23, 30)), datetime(2026, 10, 12, 2, 0))
        self.assertEqual(next_boundary(overnight["slots"], datetime(2026, 10, 12, 1, 0)), datetime(2026, 10, 12, 2, 0))

    def test_next_boundary_zoneinfo_dst(self):
        tz = ZoneInfo("Europe/Rome")
        slots = validate_program([slot("dst", [7], "02:30", "04:00")])["slots"]
        now = datetime(2026, 3, 29, 1, 30, tzinfo=tz)
        boundary = next_boundary(slots, now)
        self.assertEqual(boundary.hour, 3)
        self.assertEqual(boundary.minute, 0)
        self.assertEqual(boundary.tzinfo, tz)
        # Weekly evaluation follows local wall-clock time on both sides of DST.
        self.assertIsNone(active_slot(slots, datetime(2026, 3, 29, 1, 59, tzinfo=tz)))
        self.assertEqual(active_slot(slots, datetime(2026, 3, 29, 3, 0, tzinfo=tz))["id"], "dst")

    def test_next_boundary_autumn_fold_uses_physical_time(self):
        tz = ZoneInfo("Europe/Rome")
        slots = validate_program([slot("fold", [7], "02:30", "04:00")])["slots"]
        now = datetime(2026, 10, 25, 2, 45, tzinfo=tz, fold=0)
        boundary = next_boundary(slots, now)
        self.assertEqual(boundary.astimezone(ZoneInfo("UTC")), datetime(2026, 10, 25, 1, 0, tzinfo=ZoneInfo("UTC")))
        self.assertEqual(boundary.hour, 2)
        self.assertEqual(boundary.minute, 0)
        self.assertEqual(boundary.fold, 1)


class ManualOverrideRuntimeTests(unittest.TestCase):
    def test_override_precedes_program_then_expiry_restores_target(self):
        now = datetime(2026, 1, 5, 9, 30, tzinfo=ZoneInfo("Europe/Rome"))
        program = {"enabled": True, "slots": [slot("morning", [1], "09:00", "10:00", 21)], "away_temperature": 17}
        override = {"target": 23.5, "expires_at": (now + timedelta(minutes=30)).isoformat()}
        self.assertEqual(effective_program_target(program, override, now), ("__manual_override__", 23.5))
        self.assertNotEqual(program_apply_key(None, "__manual_override__", 23.5), program_apply_key(None, "__manual_override__", 24))
        self.assertEqual(effective_program_target(program, override, now + timedelta(minutes=31)), ("__away__", 17.0))

    def test_clear_override_is_immediate_and_program_changes_remove_override(self):
        overrides = {"climate.test": {"target": 22}}
        self.assertEqual(clear_manual_override(overrides, "climate.test"), {"target": 22})
        self.assertNotIn("climate.test", overrides)
        overrides["climate.test"] = {"target": 22}
        clear_manual_override(overrides, "climate.test")  # shared disabled/deleted/replaced cleanup path
        self.assertEqual(overrides, {})

    def test_duration_validation_next_change_and_off_program(self):
        now = datetime(2026, 1, 5, 9, 30, tzinfo=timezone.utc)
        program = {"slots": [slot("morning", [1], "09:00", "10:00")], "hvac_mode": None}
        self.assertEqual(manual_override_expiry(program, now, "30m"), now + timedelta(minutes=30))
        self.assertEqual(manual_override_expiry(program, now, "next_change"), datetime(2026, 1, 5, 10, tzinfo=timezone.utc))
        with self.assertRaises(ScheduleError) as invalid:
            manual_override_expiry(program, now, "invalid")
        self.assertEqual(invalid.exception.code, "invalid_override_duration")
        with self.assertRaises(ScheduleError) as no_boundary:
            manual_override_expiry({"slots": [], "hvac_mode": None}, now, "next_change")
        self.assertEqual(no_boundary.exception.code, "no_next_change")
        with self.assertRaises(ScheduleError) as off:
            manual_override_expiry({**program, "hvac_mode": "off"}, now, "1h")
        self.assertEqual(off.exception.code, "override_hvac_off")

    def test_override_durations_are_elapsed_time_across_dst_fold(self):
        tz = ZoneInfo("Europe/Rome")
        now = datetime(2026, 10, 25, 2, 30, tzinfo=tz, fold=0)
        expiry = manual_override_expiry({"slots": [], "hvac_mode": None}, now, "1h")
        self.assertEqual((expiry.hour, expiry.minute, expiry.fold), (2, 30, 1))
        self.assertEqual((expiry.astimezone(timezone.utc) - now.astimezone(timezone.utc)), timedelta(hours=1))

    def test_override_is_operational_outside_slots_and_step_override_is_strict(self):
        now = datetime(2026, 1, 5, 12, tzinfo=timezone.utc)
        program = {"enabled": True, "slots": [], "away_temperature": None, "hvac_mode": None}
        override = {"target": 20.5, "expires_at": (now + timedelta(minutes=20)).isoformat()}
        self.assertTrue(override_is_operational(program, override, now))
        self.assertEqual(availability_action(True, override_is_operational(program, override, now), "unavailable", "heat"), "retry")
        self.assertEqual(validate_override_step(0.5), 0.5)
        self.assertEqual(validate_target(20.5, 10, 30, validate_override_step(0.5)), 20.5)
        with self.assertRaises(ScheduleError):
            validate_target(20.5, 10, 30, 1)
        for bad in (True, 0, -0.5, float("nan"), float("inf"), "0.5"):
            with self.assertRaises(ScheduleError):
                validate_override_step(bad)

    def test_explicit_override_step_is_preserved_and_used_for_evaluation_validation(self):
        expiry = datetime(2026, 1, 5, 10, tzinfo=timezone.utc).isoformat()
        persisted = {"target": 20.5, "expires_at": expiry, "step": 0.5}
        normalized = normalize_manual_override(persisted)
        self.assertEqual(normalized, persisted)
        # The evaluation validation path uses the per-override explicit grid;
        # omitted step keeps the entity's native grid.
        self.assertEqual(validate_manual_override_target(20.5, 10, 30, 1, normalized["step"]), 20.5)
        with self.assertRaises(ScheduleError):
            validate_manual_override_target(20.5, 10, 30, 1)
        native_grid = normalize_manual_override({"target": 20, "expires_at": expiry})
        self.assertEqual(native_grid, {"target": 20.0, "expires_at": expiry})
        self.assertIsNone(normalize_manual_override({**persisted, "step": float("nan")}))
        self.assertIsNone(normalize_manual_override({**persisted, "target": True}))


class PauseTests(unittest.TestCase):
    """Vacation pause: expiry, persisted shape, and target precedence."""

    def now(self):
        # Monday, inside the 11:00-13:00 slot used below.
        return datetime(2026, 1, 5, 12, 0, tzinfo=timezone.utc)

    def test_pause_expiry_durations(self):
        now = self.now()
        for duration, days in (("1d", 1), ("3d", 3), ("7d", 7), ("14d", 14), ("30d", 30)):
            self.assertEqual(pause_expiry(now, duration), now + timedelta(days=days))
        for bad in (None, "", "2d", "1h", 3, ["1d"]):
            with self.subTest(bad=bad), self.assertRaises(ScheduleError) as catch:
                pause_expiry(now, bad)
            self.assertEqual(catch.exception.code, "invalid_pause_duration")
        naive = datetime(2026, 1, 5, 12, 0)
        self.assertEqual(pause_expiry(naive, "1d"), naive + timedelta(days=1))

    def test_normalize_pause_rejects_naive_or_malformed(self):
        self.assertEqual(
            normalize_pause({"target": 16, "until": "2026-01-06T12:00:00+00:00"}),
            {"target": 16.0, "until": "2026-01-06T12:00:00+00:00"},
        )
        self.assertEqual(
            normalize_pause({"target": 16, "until": datetime(2026, 1, 6, 12, tzinfo=timezone.utc)}),
            {"target": 16.0, "until": "2026-01-06T12:00:00+00:00"},
        )
        for bad in (
            None, [], {}, {"target": 16, "until": "2026-01-06T12:00:00"},
            {"target": "16", "until": "2026-01-06T12:00:00+00:00"},
            {"target": 16}, {"target": 16, "until": "2026-01-06T12:00:00+00:00", "extra": 1},
            {"target": float("nan"), "until": "2026-01-06T12:00:00+00:00"},
        ):
            with self.subTest(bad=bad):
                self.assertIsNone(normalize_pause(bad))

    def test_pause_is_active_until_the_expiry(self):
        pause = {"target": 16.0, "until": "2026-01-06T12:00:00+00:00"}
        self.assertTrue(pause_is_active(pause, self.now()))
        self.assertFalse(pause_is_active(pause, datetime(2026, 1, 6, 12, 0, tzinfo=timezone.utc)))
        self.assertFalse(pause_is_active(pause, datetime(2026, 1, 7, 12, 0, tzinfo=timezone.utc)))
        for bad in (None, {}, {"until": "nope"}, {"until": "2026-01-06T12:00:00"}, {"until": 5}):
            self.assertFalse(pause_is_active(bad, self.now()))

    def test_effective_target_prefers_override_then_pause_then_program(self):
        now = self.now()
        program = validate_program([slot("a", days=[1], start="11:00", end="13:00", temperature=21)], True, 17)
        pause = {"target": 16.0, "until": (now + timedelta(days=2)).isoformat()}
        override = {"target": 23.0, "expires_at": (now + timedelta(hours=1)).isoformat()}
        self.assertEqual(effective_target(program, None, None, now), ("a", 21.0))
        self.assertEqual(effective_target(program, None, pause, now), (PAUSE_TARGET, 16.0))
        self.assertEqual(effective_target(program, override, pause, now), ("__manual_override__", 23.0))
        expired_pause = {"target": 16.0, "until": (now - timedelta(minutes=1)).isoformat()}
        self.assertEqual(effective_target(program, None, expired_pause, now), ("a", 21.0))
        expired_override = {"target": 23.0, "expires_at": (now - timedelta(minutes=1)).isoformat()}
        self.assertEqual(effective_target(program, expired_override, pause, now), (PAUSE_TARGET, 16.0))
        self.assertEqual(effective_target(program, None, None, now.replace(hour=20)), (AWAY_TARGET, 17.0))

    def test_apply_key_distinguishes_pause_targets(self):
        self.assertNotEqual(program_apply_key("heat", PAUSE_TARGET, 16.0), program_apply_key("heat", PAUSE_TARGET, 18.0))
        self.assertNotEqual(program_apply_key("heat", PAUSE_TARGET, 16.0), program_apply_key("heat", "a", 16.0))


class StorageMigrationTests(unittest.TestCase):
    """Migrate-or-discard contract for the scheduler storage payload."""

    def test_current_version_payload_passes_through_without_mutation(self):
        payload = {"schema_version": 2, "programs": {"climate.x": {}, "last": None}}
        migrated = migrate_storage_data(payload, 2, 2)
        self.assertEqual(migrated, payload)
        self.assertIsNot(migrated, payload)
        # The stored payload itself must not be rewritten in place.
        payload["programs"]["climate.y"] = "later"
        self.assertEqual(migrated["programs"], {"climate.x": {}, "last": None})

    def test_newer_payload_cannot_be_downgraded(self):
        self.assertIsNone(migrate_storage_data({"schema_version": 3}, 3, 2))

    def test_registered_v2_to_v3_migration_initializes_pauses(self):
        programs = {"climate.x": {"slots": []}}
        overrides = {"climate.x": {"target": 21.0, "expires_at": "2026-01-06T12:00:00+00:00"}}
        migrated = migrate_storage_data(
            {"schema_version": 2, "programs": programs, "overrides": overrides}, 2, 3
        )
        self.assertEqual(migrated["programs"], programs)
        self.assertEqual(migrated["overrides"], overrides)
        self.assertEqual(migrated["pauses"], {})
        self.assertEqual(migrated["schema_version"], 3)
        # A payload that already carries pauses keeps them untouched.
        pauses = {"climate.x": {"target": 16.0, "until": "2026-01-06T12:00:00+00:00"}}
        kept = migrate_storage_data({"schema_version": 2, "pauses": pauses, "programs": {}}, 2, 3)
        self.assertEqual(kept["pauses"], pauses)

    def test_registered_v1_to_v2_migration_preserves_programs_and_initializes_overrides(self):
        programs = {"climate.x": {"slots": []}}
        migrated = migrate_storage_data({"schema_version": 1, "programs": programs}, 1, 2)
        self.assertEqual(migrated["programs"], programs)
        self.assertEqual(migrated["overrides"], {})
        self.assertEqual(migrated["schema_version"], 2)

    def test_registered_steps_apply_in_order_and_set_the_target_version(self):
        old_one = DATA_MIGRATIONS.get(1)
        old_two = DATA_MIGRATIONS.get(2)
        step_two = lambda payload: {"renamed": payload["programs"], "extra": True}
        step_three = lambda payload: {**payload, "extra": payload["extra"] and "kept"}
        DATA_MIGRATIONS.update({1: step_two, 2: step_three})
        def restore(version, old):
            if old is None:
                DATA_MIGRATIONS.pop(version, None)
            else:
                DATA_MIGRATIONS[version] = old
        self.addCleanup(restore, 1, old_one)
        self.addCleanup(restore, 2, old_two)
        migrated = migrate_storage_data({"schema_version": 1, "programs": {"climate.x": {}}}, 1, 3)
        self.assertEqual(migrated["renamed"], {"climate.x": {}})
        self.assertEqual(migrated["extra"], "kept")
        self.assertEqual(migrated["schema_version"], 3)
        self.assertNotIn("programs", migrated)

    def test_invalid_inputs_fail_closed(self):
        self.assertIsNone(migrate_storage_data(None, 1, 1))
        self.assertIsNone(migrate_storage_data([], 1, 1))
        self.assertIsNone(migrate_storage_data({}, 0, 1))
        self.assertIsNone(migrate_storage_data({}, "1", 1))

    def test_step_returning_a_non_dict_rejects_the_payload(self):
        DATA_MIGRATIONS.update({1: lambda payload: [payload]})
        self.addCleanup(DATA_MIGRATIONS.pop, 1)
        self.assertIsNone(migrate_storage_data({"schema_version": 1}, 1, 2))


class BackendErrorCodeTests(unittest.TestCase):
    """Schedule errors carry machine-readable codes the card can translate."""

    def test_validation_errors_carry_codes_and_context(self):
        with self.assertRaises(ScheduleError) as catch:
            validate_program([slot("morning"), slot("night")], True)
        self.assertEqual(catch.exception.code, "slots_overlap")
        self.assertEqual(catch.exception.context, {"a": "morning", "b": "night"})
        with self.assertRaises(ScheduleError) as catch:
            schedule._minute("24:00")
        self.assertEqual(catch.exception.code, "invalid_time")
        self.assertEqual(catch.exception.context, {})
        with self.assertRaises(ScheduleError) as catch:
            validate_target(30, 7, 28, 0.5)
        self.assertEqual(catch.exception.code, "target_outside_limits")
        self.assertEqual(catch.exception.context, {"value": 30.0})
        with self.assertRaises(ScheduleError) as catch:
            validate_target(28.3, 7, 30, 0.5)
        self.assertEqual(catch.exception.code, "target_off_step")
        self.assertEqual(catch.exception.context, {"value": 28.3})
        # The English message stays the human-readable fallback.
        self.assertIn("not aligned to climate temperature step", str(catch.exception))

    def test_structured_error_normalizes_for_storage_and_card(self):
        known = ScheduleError("bad times", "invalid_time")
        self.assertEqual(
            structured_error(known),
            {"code": "invalid_time", "context": {}, "message": "bad times"},
        )
        plain = ValueError("boom")
        self.assertEqual(
            structured_error(plain),
            {"code": "unexpected_failure", "context": {}, "message": "boom"},
        )
        self.assertEqual(
            error_entry("service_call_failed", "unreachable", entity="climate.x"),
            {"code": "service_call_failed", "context": {"entity": "climate.x"}, "message": "unreachable"},
        )


if __name__ == "__main__":
    unittest.main()
