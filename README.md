<div align="center">

# Climate Flow Card

### A climate card with an optional persistent weekly schedule for Home Assistant.

[![Minimum Home Assistant version](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-41BDF5)](https://www.home-assistant.io/) · [MIT License](LICENSE)

</div>

**Climate Flow Card** (`custom:climate-flow-card`) provides `pill` and `compact` layouts. The optional scheduler runs in the integration backend and persists across restarts.

![Climate Flow Card pill layout preview](docs/images/climate-flow-card.png)

Preview only: sample entity data; not captured from a live Home Assistant instance.

## Install

Install through HACS as a **custom repository**: add `https://github.com/kerdx/climate-flow-card` with category **Integration**, install **Climate Flow Scheduler**, and restart Home Assistant. Then add the integration under **Settings → Devices & services → Add integration** and add **Climate Flow Card** to a dashboard. The integration registers the card automatically; no Lovelace resource is needed.

Minimum Home Assistant version: **2025.1**. For manual installation, copy `custom_components/climate_flow_scheduler` into `config/custom_components/`, restart, and add the integration.

## Card configuration

```yaml
type: custom:climate-flow-card
entity: climate.living_room
layout: pill # or compact
```

No legacy card-tag or layout aliases are supported.

## Scheduler

The backend scheduler is optional and stores one program per climate entity. Programs contain non-overlapping slots with weekdays, Home Assistant local start/end times, and target temperatures. An optional `hvac_mode` can be applied both during and outside slots. An optional outside-schedule temperature sets a target outside slots; if it is absent, no target is sent outside slots, even though the configured HVAC mode still applies there.

Manual target changes can create a temporary override (30 minutes, 1 hour, 2 hours, or until the next schedule boundary); **Resume schedule** clears it immediately.

Breaking rename: old integration entries, service calls, and stored schedules are not migrated. Services use the `climate_flow_scheduler` domain: `save_program`, `set_enabled`, `delete_program`, `set_manual_override`, and `resume_program`.

## Development

- JavaScript tests: `npm test`
- Python tests: `python3 -m unittest discover -s tests_backend`

See [issues](https://github.com/kerdx/climate-flow-card/issues) for bug reports and feature requests.
