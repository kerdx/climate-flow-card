"""Compatibility checks that run only with a real Home Assistant install.

The rest of the backend suite stubs Home Assistant so it can run in a bare
checkout. CI also runs this suite with ``homeassistant==2025.1.0`` installed:
then the integration imports the real package and the real keyed state tracker,
which is what catches API drift early.
"""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

try:
    import homeassistant
except ImportError:  # pragma: no cover - a bare checkout skips this module
    homeassistant = None
else:
    # Only the absence of Home Assistant skips this module: if it is installed
    # but a module moved, the import error must fail loudly.
    from homeassistant.core import State
    from homeassistant.exceptions import HomeAssistantError


ROOT = Path(__file__).parents[1]
INTEGRATION_DIR = ROOT / "custom_components" / "climate_flow_scheduler"
MODULE_NAME = "climate_flow_scheduler_real_homeassistant"


class _FakeBus:
    """Records the global listener the real tracker registers."""

    def __init__(self) -> None:
        self.listeners: list[tuple[str, object, object]] = []

    def async_listen(self, event_type, action, event_filter=None):
        self.listeners.append((event_type, action, event_filter))
        return lambda: None


class _FakeHass:
    """Only the surface ``async_track_state_change_event`` touches."""

    def __init__(self) -> None:
        self.data: dict[str, object] = {}
        self.bus = _FakeBus()


def _load_integration():
    spec = importlib.util.spec_from_file_location(
        MODULE_NAME,
        INTEGRATION_DIR / "__init__.py",
        submodule_search_locations=[str(INTEGRATION_DIR)],
    )
    assert spec and spec.loader, "integration __init__.py must be loadable"
    module = importlib.util.module_from_spec(spec)
    sys.modules[MODULE_NAME] = module
    spec.loader.exec_module(module)
    return module


@unittest.skipIf(homeassistant is None, "homeassistant is not installed")
class RealHomeAssistantTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.integration = _load_integration()

    def test_integration_uses_the_real_home_assistant_error(self) -> None:
        self.assertIs(self.integration.HomeAssistantError, HomeAssistantError)
        error = self.integration.ScheduleValidationError("bad target", code="invalid_target")
        self.assertIsInstance(error, HomeAssistantError)
        self.assertEqual(error.translation_domain, "climate_flow_scheduler")
        self.assertEqual(error.translation_key, "invalid_target")

    def test_target_step_falls_back_to_the_card_grid_with_real_states(self) -> None:
        without_step = State(
            "climate.living_room",
            "heat",
            {"min_temp": 7, "max_temp": 30},
        )
        self.assertEqual(self.integration._step(without_step), 0.5)
        explicit_step = State(
            "climate.living_room",
            "heat",
            {"min_temp": 7, "max_temp": 30, "target_temp_step": 1},
        )
        self.assertEqual(self.integration._step(explicit_step), 1.0)

    def test_real_tracker_is_scoped_to_programmed_entities(self) -> None:
        hass = _FakeHass()
        scheduler = self.integration.Scheduler(hass, store=None)
        scheduler.programs = {
            "climate.living_room": {"slots": []},
            "climate.bedroom": {"slots": []},
        }
        scheduler._refresh_state_tracking()

        self.assertEqual(len(hass.bus.listeners), 1, "one global bus listener is shared")
        _, _, event_filter = hass.bus.listeners[0]
        tracker_data = next(iter(hass.data.values()))
        self.assertEqual(
            set(tracker_data.callbacks),
            {"climate.living_room", "climate.bedroom"},
        )
        self.assertTrue(event_filter({"entity_id": "climate.living_room"}))
        self.assertFalse(
            event_filter({"entity_id": "sensor.outdoor_temperature"}),
            "an unrelated entity is filtered out before dispatch",
        )

        # Deleting a program drops its entity from the real tracker.
        scheduler.programs = {"climate.living_room": {"slots": []}}
        scheduler._refresh_state_tracking()
        tracker_data = next(iter(hass.data.values()))
        self.assertEqual(set(tracker_data.callbacks), {"climate.living_room"})

        # With no programs left the tracker removes its bus listener.
        scheduler.programs = {}
        scheduler._refresh_state_tracking()
        self.assertEqual(hass.data, {})


if __name__ == "__main__":
    unittest.main()
