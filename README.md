<div align="center">

# Climate Flow Card

### A Home Assistant climate card with an optional, persistent weekly schedule.

[![Validate](https://github.com/kerdx/climate-flow-card/actions/workflows/validate.yml/badge.svg)](https://github.com/kerdx/climate-flow-card/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Minimum Home Assistant version](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-41BDF5)](https://www.home-assistant.io/)
[![Add repository to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=kerdx&repository=climate-flow-card&category=integration)

</div>

Climate Flow Card (`custom:climate-flow-card`) provides climate controls and an optional weekly scheduler. Programs are stored and run by the **Climate Flow Scheduler** integration, independently of the dashboard, and survive Home Assistant restarts.

> This is an independent project and is not affiliated with Bubble Card or Nodalia. The `bubble_climate_scheduler` integration domain and service names are retained for compatibility with existing configurations and automations.

## Contents

- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Installation](#installation)
- [Card configuration](#card-configuration)
  - [Layouts](#layouts)
- [Weekly scheduling](#weekly-scheduling)
  - [Temporary overrides](#temporary-overrides)
- [Services](#services)
- [Compatibility and behavior](#compatibility-and-behavior)
- [Troubleshooting and tests](#troubleshooting-and-tests)
- [Links](#links)

## Quick start

1. Install the **Climate Flow Scheduler** integration using [HACS](#hacs) or [manual installation](#manual-installation).
2. Restart Home Assistant and add **Climate Flow Scheduler** under **Settings → Devices & services → Add integration**.
3. Add a **Climate Flow Card** from the dashboard card picker, or use this YAML:

   ```yaml
   type: custom:climate-flow-card
   entity: climate.living_room
   name: Living Room
   ```

4. Use the calendar button to create and enable a weekly program (optional).

## Requirements

- Home Assistant 2025.1 or newer.
- A climate entity for the card and scheduler.

The integration serves and registers the card JavaScript automatically. No Lovelace resource, `schedule.*` helper, or webhook is required.

## Installation

This is a HACS custom repository and is not listed in HACS's default catalog. No GitHub release has been published yet, so HACS uses the default `main` branch until the first release is available.

### HACS

1. In HACS, open **⋮ → Custom repositories**.
2. Add `https://github.com/kerdx/climate-flow-card` with category **Integration**.
3. Install **Climate Flow Scheduler** from the custom repository and restart Home Assistant.
4. Add the **Climate Flow Scheduler** integration under **Settings → Devices & services → Add integration**.
5. Refresh the dashboard and add **Climate Flow Card** using the card picker.

On Home Assistant 2026.11 and newer, HACS is integrated into the **Marketplace**; use its custom-repository option to add this integration.

### Manual installation

1. Copy `custom_components/bubble_climate_scheduler` into `config/custom_components/`.
2. Restart Home Assistant and add **Climate Flow Scheduler** under **Settings → Devices & services → Add integration**.
3. Refresh the dashboard and add **Climate Flow Card** using the card picker.

## Card configuration

| Option | Default | Description |
| --- | --- | --- |
| `entity` | Required | Climate entity. |
| `name` | Entity name | Card title. |
| `icon` | Entity icon | Icon override. |
| `layout` | `bubble` | `bubble` is the horizontal layout; `row` is a supported alias. `compact` is the legacy two-row layout. Other values are rejected. |
| `show_state_chip` | `true` | Show HVAC state and relative time in the status line. |
| `show_current_temperature_chip` | `true` | Show measured temperature. |
| `show_humidity_chip` | `false` | Show humidity when available (independent of `show_state_chip`). |
| `show_unavailable_badge` | `true` | Show an unavailable indicator. |
| `show_mode_buttons` | `true` | Show the HVAC mode dropdown in `compact`; in `bubble`, use the entity details opened from the setpoint. |
| `show_step_controls` | `true` | Show decrease/increase target controls. |
| `show_schedule_button` | `true` | Show the calendar button and weekly editor. Set to `false` to hide it. |
| `show_preset_modes` | `true` | Show native preset modes when advertised by the climate entity. Set to `false` to hide them. |
| `step` | Entity step, otherwise `0.5` | Explicit temperature increment. Overrides `target_temp_step`; if omitted, the entity step is used with a `0.5` fallback. An invalid declared entity step disables target controls when no explicit override is set. |

New card presets omit `step` so the entity's `target_temp_step` is followed by default. If an older card saved `step: 0.5`, remove that option to use the entity's step.

### Layouts

- **`bubble`** (default): horizontal layout with a status icon, entity name and status, current-temperature chip, +/- setpoint controls, and a separate calendar button. Colors follow the Home Assistant theme.
- **`compact`**: the legacy two-row layout with entity details and chips above the target, slider, and HVAC-mode dropdown.

Both layouts support native preset modes when the entity advertises them, keyboard controls, and accessible labels. The `show_mode_buttons` dropdown is available only in `compact`; in `bubble`, change HVAC mode from the entity details opened by the setpoint.

## Weekly scheduling

Each climate entity can have **one** saved program. It runs only while **Enabled**. Configure it from the calendar button or the services below.

- **Slots:** Non-overlapping time intervals with one target temperature each. Days use ISO numbering (1 Monday through 7 Sunday); times are `HH:MM` in Home Assistant's timezone. Intervals are `[start, end)`. An end earlier than its start crosses midnight. Timezone and daylight-saving transitions are handled.
- **HVAC mode (optional):** Set before the target, including outside scheduled slots while the program is enabled. Without a configured mode, the scheduler does not change the HVAC mode. `heat_cool` is not supported because a program has one target; `off` sets the mode without a temperature.
- **Outside-schedule temperature (optional):** Applied outside all slots. If omitted, no target is sent outside a slot.

Each slot must contain exactly `id`, `days`, `start`, `end`, and `temperature`. The editor generates slot IDs; service calls must provide a unique ID of 1–64 ASCII letters, digits, dots, underscores, or hyphens, starting with a letter or digit. `days` must be a non-empty list of unique ISO weekdays from 1 to 7. Enabled programs need at least one slot. A program supports up to 50 slots; slots cannot overlap, and a slot's start and end must differ.

Manual changes remain in effect until the next schedule boundary. If the climate entity is unavailable, its pending action is retried when it becomes available.

### Temporary overrides

With an enabled program, changing the target opens a dialog to hold the manual target for **30 minutes**, **1 hour**, **2 hours**, or until `next_change`; **Cancel** leaves the target unchanged. **Resume schedule** ends an active override immediately. All override durations require a single-target mode; `next_change` additionally requires a future schedule boundary. Scheduled overrides are unavailable for `heat_cool` and when the program's HVAC mode is `off`. Without an enabled scheduler program, the card's normal dual-target controls for `heat_cool` remain available.

## Services

Service IDs remain under `bubble_climate_scheduler` for compatibility:

| Service | Parameters |
| --- | --- |
| `bubble_climate_scheduler.save_program` | `climate_entity`, `enabled`, `slots`; optional `away_temperature`, `hvac_mode` |
| `bubble_climate_scheduler.set_enabled` | `climate_entity`, `enabled` |
| `bubble_climate_scheduler.delete_program` | `climate_entity` |
| `bubble_climate_scheduler.set_manual_override` | `climate_entity`, `temperature`, `duration` (`30m`, `1h`, `2h`, or `next_change`); optional `step` |
| `bubble_climate_scheduler.resume_program` | `climate_entity` — clears any override and immediately evaluates the current program |

Example `save_program` call:

```yaml
service: bubble_climate_scheduler.save_program
data:
  climate_entity: climate.living_room
  enabled: true
  hvac_mode: cool
  away_temperature: 17
  slots:
    - id: weekday-morning
      days: [1, 2, 3, 4, 5]
      start: "06:30"
      end: "08:00"
      temperature: 21
```

The integration also provides a diagnostic sensor for configured programs.

## Compatibility and behavior

- New cards use `custom:climate-flow-card`; existing `custom:bubble-climate-card` cards continue to work.
- `layout: row` remains an alias for `bubble`. `compact` is the legacy two-row layout; the `bubble` layout is an independent Climate Flow Card design, not an official Bubble Card feature.
- In either layout, tapping an unused card area requests `off` from an active mode, or `heat` when already off, if the entity advertises the requested mode. Enter/Space also works when the card is focused; interactive child controls do not trigger the toggle.
- The `compact` slider sends a target when the change is committed, not continuously while dragging.
- Target values must satisfy the entity's limits and step; values are not silently rounded.
- The card UI is available in English and Italian based on Home Assistant's language, with English fallback. The `compact` layout displays raw values where `bubble` localizes numbers and relative times.
- Existing `custom:bubble-climate-card` dashboards and `bubble_climate_scheduler.*` automations remain compatible. Since the original and renamed repositories use the same Home Assistant integration domain, do not install both repositories side by side.

## Troubleshooting and tests

- If the card picker does not show **Climate Flow Card**, confirm that the integration is installed and added under **Settings → Devices & services**, then restart Home Assistant and refresh the dashboard.
- If the schedule editor reports that its backend is missing, confirm that **Climate Flow Scheduler** is installed and configured, not just that the card is present.
- To inspect scheduler diagnostics, open **Developer Tools → States** and find the sensor whose `scheduler_domain` attribute is `bubble_climate_scheduler`.
- Check Home Assistant logs when troubleshooting scheduler behavior.

Run the repository tests with:

```sh
npm test
python3 -m unittest discover -s tests_backend
```

The JavaScript tests use the Node.js built-in test runner (CI uses Node 22). The Python backend tests use the standard library, run on Python 3, and do not require Home Assistant to be installed.

The project has not yet been visually verified in a live Home Assistant frontend.

## Links

- [Repository](https://github.com/kerdx/climate-flow-card)
- [Report a bug or request a feature](https://github.com/kerdx/climate-flow-card/issues)
- [Releases](https://github.com/kerdx/climate-flow-card/releases)
- [MIT license](LICENSE)
