<div align="center">

# Climate Flow Card

### A climate card with an optional persistent weekly schedule for Home Assistant.

[![Minimum Home Assistant version](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-41BDF5)](https://www.home-assistant.io/) · [MIT License](LICENSE)

</div>

**Climate Flow Card** (`custom:climate-flow-card`) provides three layouts: `pill`, `compact`, and the interactive `circular` thermostat dial. Its optional scheduler runs in the integration backend and persists across restarts.

![Climate Flow Card pill layout preview](docs/images/climate-flow-card.png)

Preview only: sample entity data; not captured from a live Home Assistant instance.

## Screenshots

| Pill layout | Compact layout |
| --- | --- |
| ![Pill card with temperature and schedule controls](docs/images/Schermata%20del%202026-10-25%2014-03-42.png) | ![Compact card with a draggable target temperature](docs/images/Schermata%20del%202026-10-25%2014-05-35.png) |

| Weekly schedule dialog before adding slots | Weekly schedule with an enabled temperature slot |
| --- | --- |
| ![Empty weekly schedule dialog](docs/images/Schermata%20del%202026-10-25%2014-04-12.png) | ![Weekly schedule with an enabled slot](docs/images/Schermata%20del%202026-10-25%2014-04-47.png) |

## Install

Install through HACS as a **custom repository**: add `https://github.com/kerdx/climate-flow-card` with category **Integration**, install **Climate Flow Scheduler**, and restart Home Assistant. Then add the integration under **Settings → Devices & services → Add integration** and add **Climate Flow Card** to a dashboard. The integration registers the card automatically; no Lovelace resource is needed.

Minimum Home Assistant version: **2025.1**. For manual installation, copy `custom_components/climate_flow_scheduler` into `config/custom_components/`, restart, and add the integration.

### Card not in the card picker

The card is loaded by the integration itself, so it only exists once the integration is set up:

1. Check that **Climate Flow Scheduler** is listed and loaded under **Settings → Devices & services**. Installing the files alone registers nothing, because no config entry means `async_setup` never runs.
2. Reload the Home Assistant page in the browser (hard reload: `Ctrl`/`Cmd` + `Shift` + `R`). The frontend index is served once per page load, so a tab opened before the integration was added does not include the card module.
3. Verify the asset is served: open `https://<your-ha>/climate_flow_scheduler/climate-flow-card.js` in a browser tab. A 404 means the integration is not loaded; a JavaScript error means the module failed to parse.
4. Open the browser console on a dashboard: `window.customCards` must contain an entry with `type: "climate-flow-card"`. Card picker registrations only appear if the module was loaded before the picker dialog was opened.

## Card layouts and controls

- **`pill`** is the horizontal layout; **`compact`** uses two rows; **`circular`** displays an SVG dial with a 270° temperature arc.
- The target can be adjusted with the +/- buttons, keyboard arrows, or by dragging the temperature control. Continuous slider, drag, and held-arrow changes are batched; failed requests are retried before the optimistic value rolls back. A single +/- press is applied immediately.
- In `heat_cool` mode, the circular dial has separate low/high handles. Drag the nearer handle to adjust that bound while preserving at least one temperature step between them.
- `main_temperature` chooses whether the current or target temperature is prominent. On the circular layout, choosing `current` makes the dial display-only; activating it opens the climate entity details.
- The card editor exposes the same settings as YAML. Background tap, hold, and double-tap actions can independently toggle the climate, open more-info, or do nothing; the default tap remains the historic toggle action.

## Card configuration

```yaml
type: custom:climate-flow-card
entity: climate.living_room
layout: pill # pill | compact | circular
# Optional look, both set from the card editor as well:
# accent_color: "#3f9cf4" # accent for icon, chips, slider and calendar button; remove it to follow the theme again
# surface: default # default | elevated (contrast and depth) | blend (no background, for dark dashboards)
# main_temperature: target # target | current: which temperature takes the prominent slot
# show_entity_picture: false # replace the circular icon with the entity picture
# language: auto # auto | en | it: fixes the card language independently of the interface
# Optional background actions (the default tap still toggles heating off/on):
# tap_action: toggle # toggle | more-info | none
# hold_action: none # toggle | more-info | none (long press)
# double_tap_action: none # toggle | more-info | none
# Interaction and feedback:
# haptics: true # vibrate on every step and action (needs navigator.vibrate)
# haptics_style: medium # light | medium | heavy
# animations: true # value and button animations; false makes the card static
# animation_duration: 220 # milliseconds for the value animation
# The target number is draggable (drag to adjust, arrow keys work too) and
# slider/drag/arrow commits are batched into a single service call.
# With layout: circular the dial itself is the control: dragging it moves the
# target, and on a heat_cool entity it grabs the nearer of the two bounds.
```

No legacy card-tag or layout aliases are supported.

## Scheduler

The scheduler stores one weekly program per climate entity. Manage it with the card's calendar button or call the `climate_flow_scheduler` services. Programs contain non-overlapping slots, using Home Assistant's local time; weekdays use ISO numbering (`1` = Monday, `7` = Sunday), and an end time earlier than the start time continues into the next day.

Each slot must use exactly one target shape:

```yaml
# Single target
- id: weekday-comfort
  days: [1, 2, 3, 4, 5]
  start: "06:30"
  end: "08:00"
  temperature: 20

# Dual target for heat_cool
- id: weekday-night
  days: [1, 2, 3, 4, 5]
  start: "22:00"
  end: "06:30"
  target_temp_low: 18
  target_temp_high: 21
```

Targets must fit the climate entity's temperature limits and step. Programs may contain both slot shapes, but a dual-target slot requires the effective HVAC mode to be `heat_cool`. If the program sets `hvac_mode: heat_cool`, every slot must use the dual-target shape; the entity must expose that mode. The schedule editor offers a **Range** switch when the entity supports `heat_cool` and keeps it enabled for slots that already have a range.

`hvac_mode` is optional; when set, it is applied before the target both during and outside the slots. An optional outside-schedule temperature (`away_temperature`) sets a target outside slots; if it is absent, no target is sent outside slots. `hvac_mode` is still applied outside slots even when no target is sent. The outside-schedule temperature, manual overrides, and vacation pauses are single-target features, so they require an effective mode that accepts a single temperature; overrides and pauses cannot be used in `heat_cool` mode.

Example service call for a `heat_cool` program:

```yaml
service: climate_flow_scheduler.save_program
data:
  climate_entity: climate.living_room
  enabled: true
  hvac_mode: heat_cool
  slots:
    - id: weekday-comfort
      days: [1, 2, 3, 4, 5]
      start: "06:30"
      end: "22:00"
      target_temp_low: 20
      target_temp_high: 22
```

Other services enable/disable or delete a program, set a temporary manual override, pause the schedule for 1–30 days, and resume it. A manual override lasts 30 minutes, 1 hour, 2 hours, or until the next schedule boundary. A vacation pause lasts 1, 3, 7, 14, or 30 days and then resumes the weekly program automatically. **Resume schedule** / `resume_program` clears both an override and a pause immediately. A manual override takes precedence over a pause while active.

Pauses and overrides survive a restart. The card shows them in its schedule dialog, and the diagnostic sensor reports an active pause as `pause` (`target`, `until`).

Breaking rename: old integration entries, service calls, and stored schedules are not migrated. Services use the `climate_flow_scheduler` domain: `save_program`, `set_enabled`, `delete_program`, `set_manual_override`, `set_pause`, and `resume_program`.

## Development

- JavaScript tests: `npm test`
- Python tests: `python3 -m unittest discover -s tests_backend`

See [issues](https://github.com/kerdx/climate-flow-card/issues) for bug reports and feature requests.
