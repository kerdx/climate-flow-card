"""Pure schedule validation and weekly calendar evaluation (no HA imports)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from copy import deepcopy
from collections.abc import Callable
import math
import re
from typing import Any

_TIME = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
_SLOT_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")
# Modes a program may set. heat_cool is available since slots can carry both
# target temperatures; a program that selects it must use dual slots.
_SCHEDULABLE_MODES = ("off", "heat", "cool", "auto", "dry", "fan_only", "heat_cool")
# The two accepted slot shapes: one target, or the heat_cool pair. The key set
# is exact in both cases, like every other slot rule below.
SINGLE_TARGET_SLOT_KEYS = frozenset({"id", "days", "start", "end", "temperature"})
DUAL_TARGET_SLOT_KEYS = frozenset({"id", "days", "start", "end", "target_temp_low", "target_temp_high"})


class ScheduleError(ValueError):
    """Invalid or conflicting program schedule."""

    def __init__(self, message: str, code: str = "invalid_program", **context: Any) -> None:
        """Carry a machine-readable ``code`` with substitution ``context``.

        The message stays a human-readable English fallback (for service
        callers and logs); the card translates ``code`` with ``context``.
        """
        super().__init__(message)
        self.code = code
        self.context = dict(context)


def error_entry(code: str, message: str, **context: Any) -> dict[str, Any]:
    """Build the canonical stored error shape {code, context, message}."""
    return {"code": code, "context": dict(context), "message": message}


def structured_error(error: Any) -> dict[str, Any]:
    """Normalize any exception into :func:`error_entry` storage form.

    Known ``code``/``context`` attributes win; anything else becomes
    ``unexpected_failure`` with its text as ``message``, so the card can
    localize known codes and fall back to the raw message otherwise.
    """
    code = getattr(error, "code", None) or "unexpected_failure"
    context = getattr(error, "context", None)
    return error_entry(code, str(error), **dict(context or {}))


def availability_action(enabled: bool, has_active_slot: bool, old_state: Any, new_state: Any) -> str | None:
    """Return pending/retry only for availability transitions during an active slot."""
    if not enabled or not has_active_slot or new_state is None:
        return None
    unavailable = ("unavailable", "unknown")
    if new_state in unavailable:
        return "pending"
    if old_state in unavailable:
        return "retry"
    return None


# Attributes whose change can invalidate a cached validation outcome: mode,
# advertised modes, and the temperature grid. A program blocked because its
# hvac_mode is not exposed yet retries as soon as the entity reports another
# hvac_modes list, so no Home Assistant object is needed to decide that.
CONFIG_ATTRIBUTES = ("hvac_mode", "hvac_modes", "min_temp", "max_temp", "target_temp_step")


def entity_config_changed(
    old_attributes: Any,
    new_attributes: Any,
    old_state: Any = None,
    new_state: Any = None,
) -> bool:
    """Return whether a state event may unblock a validation-rejected program.

    ``old_attributes is None`` marks the first event of an entity, where there
    is no previous configuration to compare. Unrelated attribute churn (name,
    icon, friendly_name, ...) must not trigger a retry, and only transitions
    into or out of ``heat_cool`` count as a relevant state change.
    """
    if old_attributes is None:
        return True
    if new_attributes is None:
        return False
    if any(old_attributes.get(key) != new_attributes.get(key) for key in CONFIG_ATTRIBUTES):
        return True
    return bool(
        old_state is not None
        and new_state is not None
        and old_state != new_state
        and "heat_cool" in (old_state, new_state)
    )


def snapshot_entity_state(entity_id: str, mappings: tuple[dict[str, Any], ...], sets: tuple[set[str], ...] = ()) -> tuple[Any, ...]:
    """Capture entity-scoped mutable state for rollback after failed persistence."""
    return (
        tuple((mapping, entity_id in mapping, deepcopy(mapping.get(entity_id))) for mapping in mappings),
        tuple((members, entity_id in members) for members in sets),
        entity_id,
    )


def restore_entity_state(snapshot: tuple[Any, ...]) -> None:
    """Restore a snapshot made by :func:`snapshot_entity_state`."""
    mappings, sets, entity_id = snapshot
    for mapping, existed, value in mappings:
        if existed:
            mapping[entity_id] = value
        else:
            mapping.pop(entity_id, None)
    for members, existed in sets:
        if existed:
            members.add(entity_id)
        else:
            members.discard(entity_id)


def _minute(value: str) -> int:
    if not isinstance(value, str) or not _TIME.fullmatch(value):
        raise ScheduleError("Time must use HH:MM in 24-hour format", "invalid_time")
    hour, minute = map(int, value.split(":"))
    return hour * 60 + minute


def _temperature(value: Any) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ScheduleError("Temperature must be a finite number", "invalid_temperature")
    result = float(value)
    if not math.isfinite(result):
        raise ScheduleError("Temperature must be a finite number", "invalid_temperature")
    return result


def _hvac_mode(value: Any) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str) or value not in _SCHEDULABLE_MODES:
        raise ScheduleError("hvac_mode must be one of " + ", ".join(_SCHEDULABLE_MODES), "invalid_hvac_mode")
    return value


def validate_target(target: Any, minimum: Any, maximum: Any, step: Any) -> float:
    """Validate limits and grid alignment without silently rounding."""
    value = _temperature(target)
    try:
        low, high, increment = float(minimum), float(maximum), float(step)
    except (TypeError, ValueError) as err:
        raise ScheduleError("Climate temperature range or step is unavailable", "climate_range_unavailable") from err
    if not all(math.isfinite(item) for item in (low, high, increment)) or increment <= 0 or low >= high:
        raise ScheduleError("Climate temperature range or step is invalid", "climate_range_invalid")
    if value < low or value > high:
        raise ScheduleError(f"Target {value:g} is outside climate limits", "target_outside_limits", value=value)
    units = (value - low) / increment
    if not math.isclose(units, round(units), rel_tol=0, abs_tol=1e-7):
        raise ScheduleError(f"Target {value:g} is not aligned to climate temperature step", "target_off_step", value=value)
    return value


def validate_single_target_mode(state_mode: Any, attribute_mode: Any = None) -> None:
    """Reject climate modes that cannot safely accept a single temperature."""
    if state_mode == "heat_cool" or attribute_mode == "heat_cool":
        raise ScheduleError("Schedules do not support heat_cool mode", "heat_cool_unsupported")


def slot_is_dual(slot: Any) -> bool:
    """Whether a validated slot carries the heat_cool pair instead of one value."""
    return isinstance(slot, dict) and "target_temp_low" in slot


def slot_target(slot: dict[str, Any]) -> float | tuple[float, float]:
    """The value to apply: a float, or ``(low, high)`` for a dual slot."""
    if slot_is_dual(slot):
        return float(slot["target_temp_low"]), float(slot["target_temp_high"])
    return float(slot["temperature"])


def validate_dual_target(low: Any, high: Any, minimum: Any, maximum: Any, step: Any) -> tuple[float, float]:
    """Validate both bounds on the entity grid, low strictly below high."""
    low_value = validate_target(low, minimum, maximum, step)
    high_value = validate_target(high, minimum, maximum, step)
    if low_value >= high_value:
        raise ScheduleError(
            f"The low target {low_value:g} must stay below the high target {high_value:g}",
            "dual_range_invalid", low=low_value, high=high_value,
        )
    return low_value, high_value


def dual_needs_update(current_low: Any, current_high: Any, low: float, high: float, step: float) -> bool:
    """Whether either bound differs from what the entity currently reports."""
    return target_needs_update(current_low, low, step) or target_needs_update(current_high, high, step)


def target_needs_update(current: Any, target: float, step: float) -> bool:
    """Compare targets using a small numeric tolerance, never half a climate step."""
    if current is None:
        return True
    try:
        current_value = float(current)
        target_value = float(target)
        step_value = float(step)
    except (TypeError, ValueError):
        return True
    if not all(math.isfinite(value) for value in (current_value, target_value, step_value)) or step_value <= 0:
        return True
    tolerance = min(step_value * 1e-3, 1e-3)
    return not math.isclose(current_value, target_value, abs_tol=tolerance, rel_tol=0)


def validate_program(slots: Any, enabled: Any = False, away_temperature: Any = None, hvac_mode: Any = None) -> dict[str, Any]:
    if not isinstance(enabled, bool):
        raise ScheduleError("enabled must be boolean", "invalid_enabled")
    if not isinstance(slots, list):
        raise ScheduleError("slots must be a list", "invalid_slots")
    if len(slots) > 50:
        raise ScheduleError("A program may contain at most 50 slots", "too_many_slots", max=50)
    if enabled and not slots:
        raise ScheduleError("An enabled program must contain at least one slot", "empty_enabled_program")
    away: float | None
    if away_temperature is None:
        away = None
    else:
        try:
            away = _temperature(away_temperature)
        except ScheduleError as err:
            raise ScheduleError("Outside schedule temperature must be a finite number", "invalid_away_temperature") from err
    mode = _hvac_mode(hvac_mode)
    result: list[dict[str, Any]] = []
    ids: set[str] = set()
    occupied: dict[int, list[tuple[int, int, str]]] = {day: [] for day in range(1, 8)}
    for slot in slots:
        if not isinstance(slot, dict):
            raise ScheduleError("Each slot requires exactly id, days, start, end, and either temperature or target_temp_low with target_temp_high", "invalid_slot_schema")
        keys = set(slot)
        is_dual = keys == set(DUAL_TARGET_SLOT_KEYS)
        if not is_dual and keys != set(SINGLE_TARGET_SLOT_KEYS):
            raise ScheduleError("Each slot requires exactly id, days, start, end, and either temperature or target_temp_low with target_temp_high", "invalid_slot_schema")
        slot_id = slot["id"]
        if not isinstance(slot_id, str) or not _SLOT_ID.fullmatch(slot_id):
            raise ScheduleError("Slot id must be 1..64 ASCII letters, digits, dots, underscores, or hyphens; it must start alphanumeric", "invalid_slot_id")
        if slot_id in ids:
            raise ScheduleError(f"Duplicate slot id: {slot_id}", "duplicate_slot_id", id=slot_id)
        ids.add(slot_id)
        days = slot["days"]
        if not isinstance(days, list) or not days or any(type(day) is not int or day not in range(1, 8) for day in days):
            raise ScheduleError("days must be a non-empty list of ISO weekdays 1..7", "invalid_days")
        if len(set(days)) != len(days):
            raise ScheduleError("days cannot contain duplicates", "duplicate_days")
        start, end = _minute(slot["start"]), _minute(slot["end"])
        if start == end:
            raise ScheduleError("start and end must differ", "same_start_end")
        temperature = _temperature(slot["temperature"]) if not is_dual else None
        if is_dual:
            low = _temperature(slot["target_temp_low"])
            high = _temperature(slot["target_temp_high"])
            if low >= high:
                raise ScheduleError(
                    f"The low target {low:g} must stay below the high target {high:g}",
                    "dual_range_invalid", low=low, high=high,
                )
            clean = {"id": slot_id, "days": list(days), "start": slot["start"], "end": slot["end"], "target_temp_low": low, "target_temp_high": high}
        else:
            clean = {"id": slot_id, "days": list(days), "start": slot["start"], "end": slot["end"], "temperature": temperature}
        result.append(clean)
        for day in days:
            if end > start:
                intervals = [(day, start, end)]
            else:
                intervals = [(day, start, 1440), (day % 7 + 1, 0, end)]
            for target_day, lo, hi in intervals:
                if lo == hi:
                    continue
                for old_lo, old_hi, old_id in occupied[target_day]:
                    if lo < old_hi and old_lo < hi:
                        raise ScheduleError(f"Slots {old_id} and {slot_id} overlap", "slots_overlap", a=old_id, b=slot_id)
                occupied[target_day].append((lo, hi, slot_id))
    if mode == "heat_cool" and any(not slot_is_dual(slot) for slot in result):
        # Checked here rather than at apply time: the program mode is known at
        # save time, and heat_cool has no single temperature to send.
        raise ScheduleError(
            "A heat_cool program needs both temperatures in every slot",
            "heat_cool_dual_required",
        )
    return {"enabled": enabled, "slots": result, "away_temperature": away, "hvac_mode": mode}


def active_slot(slots: list[dict[str, Any]], now: datetime) -> dict[str, Any] | None:
    weekday = now.isoweekday()
    minute = now.hour * 60 + now.minute
    for slot in slots:
        start, end = _minute(slot["start"]), _minute(slot["end"])
        if end > start:
            if weekday in slot["days"] and start <= minute < end:
                return slot
        elif (weekday in slot["days"] and minute >= start) or (((weekday - 2) % 7 + 1) in slot["days"] and minute < end):
            return slot
    return None


def program_status(slots: list[dict[str, Any]], enabled: bool, now: datetime) -> tuple[dict[str, Any] | None, datetime | None]:
    """Return actionable slot and next change; disabled programs return neither."""
    if not enabled:
        return None, None
    return active_slot(slots, now), next_boundary(slots, now)


# Applied-state kind for the outside-schedule target. User slot ids must start
# with an alphanumeric character, so this cannot collide with a real slot id.
AWAY_TARGET = "__away__"


def resolve_target(slots: list[dict[str, Any]], away_temperature: Any, now: datetime) -> tuple[str | None, float | tuple[float, float] | None]:
    """Return the target to apply as ``(kind, temperature)`` at ``now``.

    The kind is the active slot id, :data:`AWAY_TARGET` when only the
    outside-schedule temperature applies, or ``None`` when the program leaves
    the entity untouched (no active slot and no outside-schedule temperature).
    A manual target change then stands until the kind changes. A dual slot
    yields ``(low, high)``; the single-temperature cases stay floats.
    """
    slot = active_slot(slots, now)
    if slot is not None:
        return slot["id"], slot_target(slot)
    if away_temperature is not None:
        return AWAY_TARGET, float(away_temperature)
    return None, None


def effective_program_target(program: dict[str, Any], override: dict[str, Any] | None, now: datetime) -> tuple[str | None, float | None]:
    """Resolve an unexpired manual override before the configured program target."""
    if override:
        expiry = override.get("expires_at")
        if isinstance(expiry, str):
            expiry = datetime.fromisoformat(expiry)
        if isinstance(expiry, datetime) and expiry.tzinfo is not None and _as_utc(now) < _as_utc(expiry):
            return "__manual_override__", float(override["target"])
    return resolve_target(program["slots"], program.get("away_temperature"), now)


def manual_override_expiry(program: dict[str, Any], now: datetime, duration: Any) -> datetime:
    """Validate override semantics and calculate its timezone-aware expiry."""
    if program.get("hvac_mode") == "off":
        raise ScheduleError("Manual temperature overrides are unavailable when the program sets HVAC off", "override_hvac_off")
    if duration not in ("30m", "1h", "2h", "next_change"):
        raise ScheduleError("Invalid override duration", "invalid_override_duration")
    if duration == "next_change":
        _, boundary = program_status(program["slots"], True, now)
        if boundary is None:
            raise ScheduleError("No upcoming schedule boundary", "no_next_change")
        return boundary
    elapsed = {"30m": timedelta(minutes=30), "1h": timedelta(hours=1), "2h": timedelta(hours=2)}[duration]
    expiry_utc = _as_utc(now) + elapsed
    return expiry_utc.astimezone(now.tzinfo) if now.tzinfo is not None else expiry_utc.replace(tzinfo=None)


def validate_override_step(step: Any) -> float | None:
    """Validate an optional explicit card-step override (never round targets)."""
    if step is None:
        return None
    if isinstance(step, bool) or not isinstance(step, (int, float)):
        raise ScheduleError("Override step must be a finite number greater than zero", "invalid_override_step")
    try:
        value = float(step)
    except (OverflowError, ValueError) as err:
        raise ScheduleError("Override step must be a finite number greater than zero", "invalid_override_step") from err
    if not math.isfinite(value) or value <= 0:
        raise ScheduleError("Override step must be a finite number greater than zero", "invalid_override_step")
    return value


def normalize_manual_override(raw: Any) -> dict[str, Any] | None:
    """Sanitize persisted override data while preserving optional explicit step."""
    if not isinstance(raw, dict) or set(raw) - {"target", "expires_at", "step"}:
        return None
    try:
        target = _temperature(raw["target"])
        expiry = raw["expires_at"]
        if isinstance(expiry, str):
            expiry = datetime.fromisoformat(expiry)
        if not isinstance(expiry, datetime) or expiry.tzinfo is None:
            return None
        step = validate_override_step(raw.get("step"))
    except (KeyError, ScheduleError, TypeError, ValueError, OverflowError):
        return None
    result = {"target": target, "expires_at": expiry.isoformat()}
    if step is not None:
        result["step"] = step
    return result


def validate_manual_override_target(target: Any, minimum: Any, maximum: Any, native_step: Any, override_step: Any = None) -> float:
    """Validate an override target on its explicit card grid or native grid."""
    selected_step = validate_override_step(override_step) if override_step is not None else native_step
    return validate_target(target, minimum, maximum, selected_step)


def override_is_operational(program: dict[str, Any], override: dict[str, Any] | None, now: datetime) -> bool:
    """Whether an unexpired override should trigger availability retries."""
    return bool(program.get("enabled") and override and effective_program_target(program, override, now)[0] == "__manual_override__")


# A pause holds one fixed target until it expires; then the weekly program is
# evaluated again with no user action. Like :data:`AWAY_TARGET` the kind can
# never collide with a slot id, which must start alphanumeric.
PAUSE_TARGET = "__pause__"
# Accepted pause lengths, in the same string form as override durations.
PAUSE_DURATIONS = {"1d": timedelta(days=1), "3d": timedelta(days=3), "7d": timedelta(days=7), "14d": timedelta(days=14), "30d": timedelta(days=30)}


def pause_expiry(now: datetime, duration: Any) -> datetime:
    """Validate a pause length and return its timezone-aware expiry."""
    if not isinstance(duration, str) or duration not in PAUSE_DURATIONS:
        raise ScheduleError("Invalid pause duration", "invalid_pause_duration")
    expiry_utc = _as_utc(now) + PAUSE_DURATIONS[duration]
    return expiry_utc.astimezone(now.tzinfo) if now.tzinfo is not None else expiry_utc.replace(tzinfo=None)


def normalize_pause(raw: Any) -> dict[str, Any] | None:
    """Sanitize persisted pause data; a naive or malformed expiry is dropped."""
    if not isinstance(raw, dict) or set(raw) - {"target", "until"}:
        return None
    try:
        target = _temperature(raw["target"])
        until = raw["until"]
        if isinstance(until, str):
            until = datetime.fromisoformat(until)
        if not isinstance(until, datetime) or until.tzinfo is None:
            return None
    except (KeyError, ScheduleError, TypeError, ValueError, OverflowError):
        return None
    return {"target": target, "until": until.isoformat()}


def pause_is_active(pause: Any, now: datetime) -> bool:
    """Whether a validated pause still applies at ``now``."""
    if not isinstance(pause, dict):
        return False
    until = pause.get("until")
    try:
        if isinstance(until, str):
            until = datetime.fromisoformat(until)
        if not isinstance(until, datetime) or until.tzinfo is None:
            return False
    except (TypeError, ValueError, OverflowError):
        return False
    return _as_utc(now) < _as_utc(until)


def effective_target(program: dict[str, Any], override: dict[str, Any] | None, pause: Any, now: datetime) -> tuple[str | None, float | None]:
    """Resolve the target to apply: manual override, then pause, then program.

    A temporary manual override is an explicit user action, so it wins over a
    pause; an expired pause or override falls through to the weekly program.
    """
    if override and override_is_operational(program, override, now):
        return effective_program_target(program, override, now)
    if pause_is_active(pause, now):
        return PAUSE_TARGET, float(pause["target"])
    return resolve_target(program["slots"], program.get("away_temperature"), now)


def program_apply_key(mode: Any, target_kind: Any, target: Any) -> str:
    """Include override and pause temperatures in the cache identity."""
    key = f"{mode or '-'}|{target_kind or '-'}"
    if target_kind in ("__manual_override__", PAUSE_TARGET) and target is not None:
        values = target if isinstance(target, tuple) else (target,)
        key += "|" + ",".join(float(value).hex() for value in values)
    return key


def clear_manual_override(overrides: dict[str, Any], entity_id: str) -> Any:
    """Remove and return one entity's override, if any."""
    return overrides.pop(entity_id, None)


def next_boundary(slots: list[dict[str, Any]], now: datetime) -> datetime | None:
    candidates: list[datetime] = []
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    # Include yesterday so an overnight Sunday slot contributes its Monday
    # end boundary when evaluation starts after midnight.
    for delta in range(-1, 9):
        day = midnight + timedelta(days=delta)
        weekday = day.isoweekday()
        for slot in slots:
            start, end = _minute(slot["start"]), _minute(slot["end"])
            if weekday in slot["days"]:
                candidates.extend(_valid_local_boundaries(day + timedelta(minutes=start)))
                end_boundary = day + timedelta(minutes=end) if end > start else day + timedelta(days=1, minutes=end)
                candidates.extend(_valid_local_boundaries(end_boundary))

    # A DST offset change can itself end or begin a wall-clock slot, notably
    # when the clock repeats an autumn hour. Include only transitions that
    # actually change the active slot.
    candidates.extend(_active_timezone_transitions(slots, now))
    now_utc = _as_utc(now)
    future = [candidate for candidate in candidates if _as_utc(candidate) > now_utc]
    return min(future, key=_as_utc) if future else None


def _valid_local_boundaries(candidate: datetime) -> list[datetime]:
    """Resolve gaps forward and return both physical occurrences in a fold."""
    if candidate.tzinfo is None:
        return [candidate]
    for offset in range(181):
        current = candidate + timedelta(minutes=offset)
        wall = current.replace(tzinfo=None)
        valid = []
        for fold in (0, 1):
            occurrence = wall.replace(tzinfo=candidate.tzinfo, fold=fold)
            round_trip = occurrence.astimezone(timezone.utc).astimezone(candidate.tzinfo)
            if round_trip.replace(tzinfo=None) == wall:
                valid.append(occurrence)
        if valid:
            return list({_as_utc(value): value for value in valid}.values())
    return [candidate]


def _as_utc(value: datetime) -> datetime:
    return value.astimezone(timezone.utc) if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


def _active_timezone_transitions(slots: list[dict[str, Any]], now: datetime) -> list[datetime]:
    if not slots or now.tzinfo is None:
        return []
    tz = now.tzinfo
    cursor = _as_utc(now).replace(second=0, microsecond=0)
    end = cursor + timedelta(days=9)
    found: list[datetime] = []
    while cursor < end:
        following = min(cursor + timedelta(minutes=30), end)
        if following.astimezone(tz).utcoffset() != cursor.astimezone(tz).utcoffset():
            # Find the first second with the new UTC offset.
            lo, hi = int(cursor.timestamp()), int(following.timestamp())
            old_offset = cursor.astimezone(tz).utcoffset()
            while hi - lo > 1:
                mid = (lo + hi) // 2
                if datetime.fromtimestamp(mid, timezone.utc).astimezone(tz).utcoffset() == old_offset:
                    lo = mid
                else:
                    hi = mid
            transition = datetime.fromtimestamp(hi, timezone.utc).astimezone(tz)
            before = transition.astimezone(timezone.utc) - timedelta(seconds=1)
            after = transition.astimezone(timezone.utc) + timedelta(seconds=1)
            before_slot = active_slot(slots, before.astimezone(tz))
            after_slot = active_slot(slots, after.astimezone(tz))
            before_id = before_slot["id"] if before_slot else None
            after_id = after_slot["id"] if after_slot else None
            if before_id != after_id:
                found.append(transition)
        cursor = following
    return found


# Storage schema migrations, keyed by the schema version a payload is being
# upgraded *from*. To introduce a new storage layout: bump STORAGE_VERSION in
# const.py, register a callable that rewrites a payload of the previous
# version into the next one, and keep the chain complete so every stored
# version can reach the current one. Payloads written by a newer version are
# rejected, never silently downgraded.
DATA_MIGRATIONS: dict[int, Callable[[dict[str, Any]], dict[str, Any]]] = {}


def _migrate_v1_to_v2(data: dict[str, Any]) -> dict[str, Any]:
    """Preserve all v1 programs and initialize persisted manual overrides."""
    data.setdefault("overrides", {})
    return data


DATA_MIGRATIONS[1] = _migrate_v1_to_v2


def _migrate_v2_to_v3(data: dict[str, Any]) -> dict[str, Any]:
    """Initialize the persisted vacation pauses; programs and overrides stay."""
    data.setdefault("pauses", {})
    return data


DATA_MIGRATIONS[2] = _migrate_v2_to_v3


def migrate_storage_data(data: Any, from_version: Any, to_version: int) -> dict[str, Any] | None:
    """Return ``data`` upgraded from ``from_version`` to ``to_version``.

    Steps come from :data:`DATA_MIGRATIONS` and are applied in order; the
    returned payload is a copy with ``schema_version`` set to ``to_version``
    (the input mapping is never mutated). ``None`` marks a payload that
    cannot be migrated -- non-dict data, a missing schema version, a request
    to move *backwards*, a version with no registered step, or a step that
    produced invalid data -- so the caller must discard it and log.
    """
    if not isinstance(data, dict) or not isinstance(from_version, int) or from_version < 1 or from_version > to_version:
        return None
    # Migrate a deep copy: a step may rewrite nested structures in place
    # without ever touching the stored payload the caller holds.
    result: Any = deepcopy(data)
    for version in range(from_version, to_version):
        migration = DATA_MIGRATIONS.get(version)
        if migration is None:
            return None
        result = migration(result)
        if not isinstance(result, dict):
            return None
    return {**result, "schema_version": to_version}
