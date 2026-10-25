"""Import support for the runtime tests.

``async_evaluate`` runs inside the integration module, which imports
``homeassistant`` and ``voluptuous`` at module level. Those are absent in a bare
checkout, so this module makes the import work: the real packages are used when
present (a CI image with Home Assistant installed), and minimal stubs fill in
only what is missing.

The fakes below are deliberately duck-typed: the scheduler only ever calls
``hass.states.get``, ``hass.services.async_call`` and the Store load/save pair.
"""

from __future__ import annotations

import importlib.util
import sys
import types
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parents[1]
INTEGRATION_DIR = ROOT / "custom_components" / "climate_flow_scheduler"
MODULE_NAME = "climate_flow_scheduler_under_test"

# The evaluation loop reads "now" through ``homeassistant.util.dt``. Tests move
# the clock by writing here; the attribute is patched on whatever module the
# integration actually imported, so this works with the stub and with HA.
CLOCK = {"now": datetime(2026, 1, 5, 9, 30, tzinfo=timezone.utc)}  # Monday, 09:30 UTC


def _missing(name: str) -> bool:
    try:
        __import__(name)
    except ImportError:
        return True
    return False


def _permissive(*args: object, **kwargs: object) -> None:
    """Tolerates any attribute the integration touches at import time."""
    return None


def _ensure_module(name: str, **attrs: object) -> types.ModuleType:
    """Register ``name`` (and its parent chain) unless the real one exists.

    A stub module also answers unknown attributes with a permissive no-op, so a
    new module-level use in the integration (a schema helper, a decorator) does
    not turn into an AttributeError here.
    """
    if not _missing(name):
        return sys.modules[name]
    parts = name.split(".")
    for index in range(1, len(parts) + 1):
        dotted = ".".join(parts[:index])
        if dotted in sys.modules:
            continue
        module = types.ModuleType(dotted)
        # A package: relative and dotted imports resolve through __path__.
        module.__path__ = []  # type: ignore[attr-defined]
        sys.modules[dotted] = module
        if index > 1:
            setattr(sys.modules[".".join(parts[: index - 1])], parts[index - 1], module)
    module = sys.modules[name]
    for key, value in attrs.items():
        setattr(module, key, value)
    if not hasattr(module, "__getattr__"):
        module.__getattr__ = lambda attribute: _permissive  # type: ignore[attr-defined]
    return module


def _install_stubs() -> None:
    """Fill in every dependency ``__init__.py`` imports, missing parts only."""

    class _HomeAssistantError(Exception):
        """Stands in for homeassistant.exceptions.HomeAssistantError."""

    class _Callback:  # decorator factories used at import time
        def __call__(self, func):
            return func

    def _decorator(func):
        return func

    _ensure_module("homeassistant")
    _ensure_module("homeassistant.components")
    _ensure_module("homeassistant.components.frontend", add_extra_js_url=lambda *a, **k: None)
    _ensure_module("homeassistant.components.http", StaticPathConfig=type("StaticPathConfig", (), {"__init__": lambda self, *a, **k: None}))
    _ensure_module("homeassistant.config_entries", ConfigEntry=type("ConfigEntry", (), {}))
    _ensure_module(
        "homeassistant.core",
        HomeAssistant=type("HomeAssistant", (), {}),
        ServiceCall=type("ServiceCall", (), {}),
        callback=_decorator,
    )
    _ensure_module("homeassistant.exceptions", HomeAssistantError=_HomeAssistantError)
    _ensure_module("homeassistant.helpers")
    _ensure_module(
        "homeassistant.helpers.config_validation",
        entity_id=str,
        match=lambda *a, **k: str,
        empty_config_schema=lambda *a, **k: _permissive,
    )
    _ensure_module("homeassistant.helpers.event", async_track_time_change=lambda *a, **k: None)
    _ensure_module("homeassistant.helpers.storage", Store=type("Store", (), {}))
    _ensure_module("homeassistant.util")
    _ensure_module("homeassistant.util.dt", now=lambda: CLOCK["now"], utcnow=lambda: CLOCK["now"])
    if _missing("voluptuous"):
        vol = _ensure_module("voluptuous")
        vol.Invalid = type("Invalid", (Exception,), {})  # type: ignore[attr-defined]
        vol.Schema = lambda *a, **k: (lambda value: value)  # type: ignore[attr-defined]
        for name in ("All", "Any", "In", "Optional", "Required", "Match"):
            setattr(vol, name, lambda *a, **k: None)


def integration_module() -> types.ModuleType:
    """Import the integration package once, stubbing Home Assistant if needed."""
    cached = sys.modules.get(MODULE_NAME)
    if cached is not None:
        return cached
    spec = importlib.util.spec_from_file_location(
        MODULE_NAME,
        INTEGRATION_DIR / "__init__.py",
        submodule_search_locations=[str(INTEGRATION_DIR)],
    )
    assert spec and spec.loader, "integration __init__.py must be loadable"
    try:
        module = importlib.util.module_from_spec(spec)
        sys.modules[MODULE_NAME] = module
        spec.loader.exec_module(module)
    except ImportError:
        # A bare checkout: install the stubs and retry the same module name.
        sys.modules.pop(MODULE_NAME, None)
        _install_stubs()
        module = importlib.util.module_from_spec(spec)
        sys.modules[MODULE_NAME] = module
        spec.loader.exec_module(module)
    # Every test asserts against a deterministic clock instead of wall time.
    module.dt_util.now = lambda: CLOCK["now"]
    return module


class FakeState:
    def __init__(self, state: str, **attributes: object) -> None:
        self.state = state
        self.attributes = dict(attributes)


class FakeHass:
    """Only what the evaluation loop touches: states.get and services.async_call."""

    def __init__(self, states: dict[str, FakeState]) -> None:
        self.states = _States(states)
        self.services = _Services()


class _States:
    def __init__(self, states: dict[str, FakeState]) -> None:
        self._states = states

    def get(self, entity_id: str) -> FakeState | None:
        return self._states.get(entity_id)

    def set(self, entity_id: str, state: FakeState) -> None:
        self._states[entity_id] = state


class _Services:
    def __init__(self) -> None:
        self.calls: list[tuple[str, str, dict]] = []

    async def async_call(self, domain: str, service: str, data: dict | None = None, blocking: bool = False) -> None:
        self.calls.append((domain, service, dict(data or {})))


class FakeStore:
    """Programs are written by the tests directly; loading returns what is set."""

    def __init__(self, data: dict | None = None) -> None:
        self.data = data
        self.saves = 0

    async def async_load(self) -> dict | None:
        return self.data

    async def async_save(self, data: dict) -> None:
        self.saves += 1
        self.data = data
