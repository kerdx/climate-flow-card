# Changelog

## v1.7.2

- Fix mixed single/range programs: set `hvac_mode` for scalar slots, switch to `heat_cool` for range slots, then restore the configured mode. The editor and backend reject mixed enabled programs without the required mode or entity capability.
- Reject single outside-schedule targets for enabled `heat_cool` programs before applying them; preserve disabled drafts and surface errors for invalid stored schedules without discarding them.
- Keep the relative-time chip current with a timer at the next displayed time boundary, and clean up the timer when the card disconnects.
- Close translation files in the package tests to prevent `ResourceWarning`s.

## v1.7.1

- Avoid rebuilding the card on Home Assistant updates that do not change anything it displays, reducing unnecessary work and preserving focus. Relevant climate/scheduler state, locale, units and aging timestamps still trigger a refresh.
- Fix circular-layout secondary temperature visibility so `show_current_temperature_chip` is respected, and format the schedule's next-change timestamp as a localized date/time instead of exposing its raw ISO value.
- Keep schedule evaluation running for other climate entities when one entity's target validation fails; record the validation error on the affected entity. Clarify the localized `heat_cool` error: single targets are unsupported in that mode, while dual targets are required.
- Add jsdom interaction tests for the circular dial and schedule range editor, end-to-end scheduler evaluation tests, and install the test dependency in CI. Correct the YAML syntax in the `save_program` service description.

## v1.7.0

- Slots accept both target forms: either one `temperature`, or `target_temp_low` + `target_temp_high` for heat_cool. The key set is exact in both shapes, mixed slots are allowed when the program specifies the scalar-slot mode, both bounds are validated on the entity grid (limits, step, low strictly below high), and the overlap rules are unchanged. Stored programs keep working as they are; no migration.
- `heat_cool` joins the schedulable program modes and is offered by the `save_program` service whenever the entity exposes it: a heat_cool program requires both temperatures in every slot, while mixed programs switch to heat_cool for range slots and restore their configured scalar mode for single-target slots. The outside-schedule target, manual override and vacation pause remain single-target features and cannot be applied in heat_cool mode.
- The scheduler sends the right payload at a slot boundary: a dual slot applies `set_temperature` with `target_temp_low`/`target_temp_high` compared against the entity's current bounds (same numeric tolerance as single targets), while single slots and the outside-schedule temperature keep `temperature`. The applied-state cache key covers both bounds.
- The schedule dialog edits both shapes: a per-slot **Range** switch (offered only where heat_cool exists, always kept on slots that already carry a pair) swaps the single temperature field for low/high inputs, seeded from the entity's live range or one step above the current value; switching back reuses the low bound, which is already on the entity grid. Save goes through a single payload builder that emits exactly one target form per slot.
- Client-side validation mirrors the backend before any service call: a pair must be numeric and ordered, heat_cool needs a pair in every slot, mixed programs require a scalar-slot mode, and outside-schedule scalar targets are refused in heat_cool. New localized codes: `heat_cool_dual_required`, `dual_range_invalid`, `dual_slot_unsupported`, `mixed_slots_mode_required` (EN/IT in the integration exceptions and in the card strings), and the `invalid_hvac_mode` message lists the full mode set.
- `services.yaml` documents the two slot shapes and adds `heat_cool` to the program's HVAC mode options.

## v1.6.0

- New `circular` layout: a round SVG dial whose 270° arc, thumb(s) and centre number follow the target. The dial is draggable like the other layouts' heroes (6 px threshold, one step every 12 px, clamped to the entity limits, a single batched `set_temperature` on release, retries before the optimistic rollback, and an aborted gesture restores the real value); arrow keys and the +/- controls are unchanged, and `getCardSize` reports 3.
- `heat_cool` dials carry two thumbs: the pointer grabs the nearer bound and moves it alone, keeping one step between low and high inside the entity limits, and commits an explicit `target_temp_low`/`target_temp_high` payload through the same optimistic path (so a failed call still rolls back).
- The dial reuses the shared rules of the other layouts: `main_temperature` decides which number sits in the centre (with `current` the dial keeps its arc but stops being a slider and opens the entity details), `accent_color`/mode accents colour the arc, `surface`, `animations`/`animation_duration` and `haptics` all apply, and the state chip, humidity, unavailable badge, schedule button, override/pause badges and HVAC selector are all there.

## v1.5.0

- Fix the card editor showing every toggle as switched off (the schedule calendar, HVAC selector, +/- controls, haptics and animations included) while the card rendered them active: the field sync read the stripped config, which only carries non-default values, instead of resolving the effective value.
- Drag the target number to change it: the hero of each layout is now a slider (`role="slider"`, arrow keys included) that follows the pointer, snaps one step every 12 px, clamps to the entity limits, and commits once when the finger is released. A gesture shorter than 6 px is still a tap, a vertical move is left to scrolling, and an aborted gesture restores the real value without sending anything.
- Continuous inputs are batched: the slider, a drag and held arrow keys wait 220 ms for the gesture to settle before calling `set_temperature`, and a failed batch is retried twice before the optimistic value rolls back. A single +/- press keeps its immediate call.
- Haptics: a short vibration per temperature step, arrow key and card action (`haptics` on by default, `haptics_style` light/medium/heavy). Browsers without `navigator.vibrate` stay silent.
- Motion: the value animates only when it changes, buttons press in, and both can be turned off with `animations` (with `animation_duration` in milliseconds for the value animation).

## v1.4.0

- Configurable card background actions: `tap_action`, `hold_action` and `double_tap_action` (`toggle`, `more-info`, `none`). The default keeps the historic tap-to-toggle, a double tap is detected within 300 ms, a long press after 550 ms and a press released early does nothing; the card's accessible label now states what a tap does.
- Per-mode accents: with no explicit `accent_color`, the icon, chips, slider and calendar button take the active mode's colour (heat, cool, dry, auto, fan) and fall back to the theme when the climate is off.
- New `main_temperature` option (`target` by default, `current` to swap) chooses which value takes the prominent slot of each layout; the other value moves to the secondary chip, and an empty hero falls back to the available temperature instead of leaving a blank slot.
- Entity picture support: `show_entity_picture` replaces the circular icon with the entity picture (or the `entity_picture` URL), in both layouts.
- The editor now emits only the values that differ from their defaults, so a saved config stays small and readable, and a config written by an older version is cleaned up on the first edit.
- New `language` option (`auto`, `en`, `it`) fixes the card's own language independently of the Home Assistant interface language; the card editor always follows the interface language.

## v1.3.0

- Redesigned the `compact` layout for a premium look: the setpoint is now a hero number with its own unit, the state chip is tinted with the accent, the icon glows while the entity runs, the slider track is a gradient that follows the value, controls are bordered pills, and a thin accent line runs along the top of the card. Surface, border and shadow are tuned to read well on dark themes.
- New `accent_color` option overrides the accent colour used by the icon, chips, slider and calendar button; the editor gained a colour picker with a button to go back to the theme colour, and an invalid value fails `setConfig` instead of being ignored.
- New `surface` option chooses the card background: `default` follows the theme, `elevated` adds contrast and depth, `blend` drops the background for dark dashboards.
- The card URL now carries the manifest version (`/climate_flow_scheduler/climate-flow-card.js?v=<version>`), so an upgrade changes the URL and the browser downloads the updated card instead of keeping the previous module in cache (the static path is served without cache headers).

## v1.2.0

- New brand icon: the thermometer placeholder is replaced by a thermometer inside a schedule loop on the teal brand gradient, shipped as `brand/icon.png` (256px) plus a new `brand/icon@2x.png` (512px) for high-resolution displays.
- The preset selector (none/hold/program) is removed from both card layouts and from the card editor configuration.
- The "Controls and steps" toggles now work as expected in both layouts: `show_step_controls` gates the +/- buttons (pill included) and `show_mode_buttons` now also shows the HVAC mode selector in the pill layout.
- An empty step value in the editor no longer breaks the card: a cleared step box means "follow the entity's own step" instead of an invalid override that failed `setConfig`.
- The card editor is redesigned like Bubble Card: a wide dialog (the HA edit dialog is opened in its large/full mode while the editor is mounted) with labeled sections (Identity, Chips, Controls), switch rows, segmented choices, help text, and a live inert preview of the card.

## v1.1.0

- Add a vacation pause: the new `set_pause` service holds one validated target for 1, 3, 7, 14, or 30 days and the weekly program resumes automatically when the pause expires. Pauses persist across restarts (storage schema v3, migrated from v2 without touching programs or overrides) and are cleared when a program is replaced, disabled, or deleted.
- Target precedence is now explicit and tested: an unexpired manual override wins over the pause, the pause wins over the program, and an expired pause or override falls through to the weekly schedule.
- The card shows the active pause as a badge with a resume action in both layouts, and its schedule dialog gains a pause section (target, length, start) that replaces the controls with the pause expiry while a pause is active.
- `resume_program` (and the card's resume action) now clears the pause together with the manual override; the diagnostic sensor reports the pause as `pause: {target, until}`.
- New error codes `invalid_pause_duration` and `pause_hvac_off` are translated in English and Italian.

## v1.0.1

- Register the card frontend resource in `async_setup` instead of at the end of `async_setup_entry`: the card is now loaded as soon as the integration is set up and no longer disappears when a config entry is reloaded (a reload does not re-run `async_setup`, so the previous `remove_extra_js_url` on unload hid the card until the next Home Assistant restart).
- `getEntitySuggestion` now returns the documented Home Assistant shape (`{ config }`) instead of a bare card configuration, and the card-picker entry advertises `preview: true` plus its `documentationURL`.
- Card tests no longer depend on the machine locale for the default-locale number formatting check (an Italian-default machine rendered `20,5` and failed the suite).
- README: troubleshooting steps for a card that does not show up in the picker (integration must be added, then reload the browser page so the frontend index includes the newly registered module).

## v1.0.0

- Breaking rebrand: renamed integration domain, directory, services and storage key to `climate_flow_scheduler`; existing config entries, service calls and schedules are not migrated.
- Renamed frontend asset and card tag to `climate-flow-card.js` and `custom:climate-flow-card`; removed legacy card registration and layout aliases. Layouts are `pill` and `compact`.
- Updated HACS, workflows, docs and tests for the breaking rename.

## v0.2.3

- Add persisted, temporary manual target overrides for 30 minutes, 1 hour, 2 hours, or until the next program boundary, with immediate resume and automatic return to schedule.
- Clear overrides when a program is replaced, disabled, or deleted; expose override diagnostics and localized card actions.
- Add native climate preset-mode selection when the entity advertises preset modes, with a card option to hide it.
- Bump storage schema to v2 with a lossless v1 program migration.
- Rebrand as Climate Flow / Climate Flow Card / Climate Flow Scheduler; new cards use `custom:climate-flow-card`, legacy card-tag registration is removed, and existing default integration titles are migrated without overwriting custom titles.

## v0.2.2

- Build `CONFIG_SCHEMA` by calling the canonical factory with the integration domain (`CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)`) instead of assigning `cv.empty_config_schema` itself. Home Assistant validates the configuration container with `CONFIG_SCHEMA`, so the bare factory handed it a function whose result is another function instead of the configuration mapping; setup then failed with a `TypeError` (function received instead of the configuration dict) and aborted before the static path was registered, which made the frontend card return 404.
- Add regression tests: the packaging suite now parses `__init__.py` and asserts `CONFIG_SCHEMA` is the result of calling exactly one canonical `cv` factory (`empty_config_schema`, `config_entry_only_config_schema`, `platform_only_config_schema`) with `DOMAIN`, and that the resulting validator returns the configuration container unchanged (including for an empty configuration).
- Manifest version bumped to 0.2.2 to match this changelog section.

## v0.2.1

- Ship the card as a single source file (`www/climate-flow-card.js`): JavaScript tests and packaging checks read the shipped asset, and any duplicate copy of the source fails packaging.
- Migrate instead of discarding on version mismatch: storage payloads move through registered schema steps (`migrate_storage_data`) or are dropped with an explicit warning, and a config-entry `async_migrate_entry` rejects entries saved by newer releases.
- Backend errors now carry machine-readable codes (`{code, context, message}`) in `last_error` and the diagnostic sensor; the card translates them in English and Italian with the new `errorLabel` helper.
- Service-call errors are localized through the integration `exceptions` translations (EN/IT) plus translation metadata on `ScheduleValidationError`; the readable English message stays as fallback on releases without exception translation.
- The visual editor groups options into localized sections (identity, visible elements, advanced controls) with per-field help texts and an inert live preview of the edited config.
- CI runs the card and backend test suites alongside hassfest/HACS validation, and a manual release workflow gates on manifest/CHANGELOG consistency; packaging tests keep manifest version and CHANGELOG in sync.

## v0.2.0

- Add an optional HVAC mode to a saved program: the scheduler applies `climate.set_hvac_mode` before the slot target, validates the mode against the entity's exposed `hvac_modes`, and leaves the current mode untouched when none is set. Schedulable program modes are `off`, `heat`, `cool`, `auto`, `dry`, and `fan_only`; `heat_cool` stays unsupported because a program uses a single target, and `off` sets the mode without a target.
- Add an optional outside-schedule temperature (`away_temperature`) applied whenever no slot is active; programs without it keep the previous behavior of no climate call outside slots. The outside target is validated together with the slot targets against the entity's limits and step.
- Track the applied program state by mode plus target kind, so a manual mode or target change still stands until the next slot boundary (including the outside-schedule target); availability handling treats mode-only and outside-target programs as active for pending retries.
- Extend the `save_program` service with the optional `away_temperature` and `hvac_mode` fields and document them in `services.yaml`.
- Extend the weekly schedule editor with an HVAC mode selector (default "Don't change", limited to the modes the entity exposes and the backend accepts) and an "Outside schedule" temperature field; both are validated in the editor and saved with the program.
- Localize the card and its schedule editor in English and Italian, following `hass.locale.language` with an English fallback: control aria labels, editor labels and actions, day names, HVAC mode and status labels, and validation messages.
- Retry mode validation when a climate entity advertises an updated `hvac_modes` list; preserve keyboard focus after optimistic +/- updates and use distinct two-letter weekday pills.
- Honor an explicit card `step` as an override: a `step` set in the card configuration now takes precedence over the entity's `target_temp_step` (previously the entity step always won); new card presets omit `step` so the entity's increment is respected by default, with 0.5 as fallback.
- Tint the schedule calendar button with the accent color while the entity's program is enabled, in both card layouts (`pill` and `compact`); the tint follows the program's enabled state on the card button only and is not applied inside the schedule editor dialog.
- Add backend and frontend tests for the new program fields, the step override, and the localized strings.

## v0.1.9

- Toggle between `heat` and `off` by tapping a non-interactive card area or pressing Enter/Space, only when both modes are supported; child controls do not trigger the toggle.
- Show the requested target optimistically immediately when using +/- controls in `pill` and `compact` layouts, then reconcile with Home Assistant or roll back on error/timeout.
- Send compact slider targets when the change is committed.
- No backend changes.

## v0.1.8

- Rename the default horizontal layout to `pill`; `compact` remains available, and no old layout aliases are accepted.
- Show the calendar button by default as a standalone pill, separate from the temperature control group; set `show_schedule_button: false` to hide it. Existing configurations that explicitly saved `false` continue to hide it and must be changed explicitly to show the button.
- No backend changes.

## v0.1.7

- Refine the `pill` layout to more faithfully match the reference screenshot, with decrease, target setpoint, and increase grouped in one control pill and consistent spacing before temperature units.
- Improve narrow-width navigation and horizontal overflow handling so controls remain reachable without overflowing the card.
- Hide the calendar button by default; it remains available as an opt-in with `show_schedule_button: true`. Preserve the existing `compact` layout.
- No backend changes.

## v0.1.6

- Match the referenced card screenshot: the pill current-temperature chip is tinted with the accent color while the climate entity is active (icon follows the text color), and the target setpoint renders as borderless text between the minus and plus pills.
- Keep minus, plus, and the calendar button as independent rounded pills.
- Redesign the weekly schedule editor dialog with a premium look: sticky header with accent calendar icon, entity subtitle, and close button; a status pill with next change and active slot; a toggle switch for Enabled; rounded slot cards with uppercase titles and a remove action; accent-filled single-letter day pills; bordered time/target fields; and a Save/Delete action bar. The dialog carries its own styles instead of duplicating them in both card layouts.

## v0.1.5

- Restyle the `pill` layout control cluster to match the Pill Card look: decrease, target setpoint, increase, and the schedule calendar button are now independent rounded pills with a gap instead of one fused background bar.
- Emphasize the pill current-temperature chip with a pill background and semibold text; its house icon stays secondary-colored and hidden from assistive technology.
- Controls keep theme-driven colors (`--secondary-background-color`, `--divider-color`) and the existing shrink/scroll behavior on narrow cards; the calendar button remains reachable.
- No backend, manifest behavior, or card option changes.

## v0.1.4

- Make the horizontal entity-pill climate layout the default (`layout: pill`): circular status-aware icon, name plus live `hvac_action`/state status with relative time, current-temperature chip, and a control cluster with decrease, setpoint, increase, and the schedule calendar button.
- Keep `layout: compact` as the previous two-pill card with HVAC mode dropdown and slider; reject unknown layouts. The visual editor exposes `pill`/`compact` in a layout dropdown.
- Show an `mdi:home-thermometer` house icon inside the pill current-temperature chip (text stays in a span with an accessible label); the icon hides together with the chip when disabled or unavailable.
- Localize the pill relative time with `Intl.RelativeTimeFormat(hass.locale.language, { numeric: 'auto' })` and a short-English fallback, and localize pill current/target numbers with `Intl.NumberFormat(hass.locale.language, { maximumFractionDigits: 2 })`; `compact` rendering is unchanged.
- Keep the pill control cluster shrinkable (`flex: 0 1 auto` with `min-width: 0`) so it scrolls within the available width instead of being clipped, keeping the calendar button reachable.
- Show pill humidity whenever `show_humidity_chip` is enabled, even with `show_state_chip: false`; state and relative time remain governed by `show_state_chip`. pill humidity numbers use the same locale formatting as temperatures.
- Mark the pill current-temperature chip with `role="img"` (keeping its accessible label) and hide the decorative climate icon from assistive technology.
- Migration: v0.1.3 editor configs may contain a saved `layout: compact` key; set `layout: pill` or remove the key for the new look, or keep `compact` for the previous layout.
- No backend, manifest, or version changes; the scheduler editor and HA registry re-registration behavior are unchanged.

## v0.1.3

- Re-register the card and editor in the active `customElements` registry once the Home Assistant frontend is ready, verifying both tags in the live registry with bounded retries; keep the `customCards` picker entry independent of element registration. A deterministic `define()` failure during the poll is reported once and stops polling instead of escaping uncaught from the timer.

## v0.1.2

- Introduce a compact, fixed two-pill premium layout.
- Use a 0.5°C temperature step fallback; the climate entity's `target_temp_step` takes precedence when declared.
- Replace potentially overflowing HVAC mode buttons with an HVAC mode dropdown.

## v0.1.1

- Add a visual card editor for choosing a climate entity.
- Load and register the card frontend through the integration, enabling it to appear in the dashboard card picker without a manually configured resource.
- Document the HACS and manual installation flows.
