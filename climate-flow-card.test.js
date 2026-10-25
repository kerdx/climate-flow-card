import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ClimateFlowCard, ClimateFlowCardEditor, CLIMATE_FLOW_CARD_TAG, CLIMATE_FLOW_CARD_EDITOR_TAG, registerClimateFlowElements, isClimateFlowElementsRegistered, isHomeAssistantFrontendReady, scheduleClimateFlowReregistration, clampTarget, temperaturePayload, targetModel, hvacToggleMode, scheduleDraft, validateScheduleDraft, seedRange, draftSlotPayload, defaultCardConfig, configSchema, configSchemaFields, getEntitySuggestion, sameCardConfig, errorLabel, effectiveStep, normalizeLayout, isClimateActive, isScheduleEnabled, awayTemperaturePayload, schedulableModes, manualOverrideServicePayload, overrideDurationChoices, formatOverrideExpiry, overrideFocusSelector,
  pauseServicePayload, pauseDurationChoices, activePause, PAUSE_DURATIONS, climateStatusKey, statusLabel, modeLabel, resolveLanguage, cardStrings, fieldLabel, pickEntityTimestamp, formatRelativeTime, relativeRefreshDelay, formatNumber, pillStatusParts, currentTemperatureDisplay, CARD_SURFACES, normalizeAccentColor, normalizeSurface, sliderFillPercent, paintSliderFill, CARD_ACTIONS, normalizeCardAction, MODE_ACCENTS, modeAccentColor, cardLanguage, mainTemperatureKind, CARD_OPTION_DEFAULTS, cardDefault, stripCardDefaults, heroTemperaturePlan,
  HAPTIC_STYLES, HAPTIC_PATTERNS, hapticPattern, normalizeHapticStyle, vibrateSupported, fireHaptic,
  ANIMATION_DURATION_DEFAULT, normalizeAnimationDuration, COMMIT_DEBOUNCE_MS, COMMIT_RETRY_MS, COMMIT_RETRIES,
  DRAG_THRESHOLD_PX, DRAG_STEP_PX, dragStepValue,
  DIAL_SWEEP, DIAL_START_ANGLE, DIAL_RADIUS, DIAL_DRAG_THRESHOLD_PX,
  dialFraction, dialAngle, dialPoint, dialArc, dialFractionFromAngle, dialValueFromPointer, dialBoundValue } from './custom_components/climate_flow_scheduler/www/climate-flow-card.js';

test('module imports without browser DOM and exports the card class', () => {
  assert.equal(typeof ClimateFlowCard, 'function');
  assert.equal(typeof clampTarget, 'function');
});

test('pill status and temperatures preserve readable separators and spacing', () => {
  assert.deepEqual(pillStatusParts({ statusText: 'Off', relativeText: '1 hour ago' }), ['Off', '1 hour ago']);
  assert.equal(currentTemperatureDisplay(20.5, '°C', 'it-IT'), `${formatNumber(20.5, 'it-IT')} °C`);
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.match(source, /\.status-line span\+span:before\{content:' · '/);
  assert.match(source, /overflow-x:auto;overflow-y:hidden;overscroll-behavior-inline:contain/);
  assert.match(source, /\.meta\{flex:1 1 0;min-width:0/);
});

test('temperature inputs and +/- controls use polished theme-aware styling', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.match(source, /\.field \.temperature-field\{[^}]*linear-gradient/s);
  assert.match(source, /\.temperature-value:focus-within\{[^}]*box-shadow/s);
  assert.match(source, /\.field \.temperature-value input\{[^}]*font-variant-numeric:tabular-nums/s);
  assert.match(source, /\.temperature-step\{[^}]*font-weight:700/s);
  assert.match(source, /adjustTemperatureInput\(input, -1, true/);
  assert.match(source, /\.body button\[data-delta\]\{[^}]*font-weight:700/s);
  assert.match(source, /\.row button\[data-delta\]\{[^}]*font-weight:700/s);
  assert.match(source, /unit\.setAttribute\('aria-hidden', 'true'\)/);
});

test('the pill-card target keeps its original unboxed setpoint appearance', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.match(source, /\.controls\{[^}]*gap:0;background:var\(--secondary-background-color\);border-radius:999px;padding:2px;/);
  assert.match(source, /\.controls button\{[^}]*background:transparent;border:0;border-radius:999px;padding:7px 10px/);
  assert.match(source, /\.controls \.setpoint\{font-weight:700;min-width:58px;text-align:center;background:transparent;font-size:15px;padding:7px 2px;font-variant-numeric:tabular-nums;letter-spacing:-\.02em\}/);
  assert.doesNotMatch(source, /\.controls button\[data-delta\]\{[^}]*border:/);
  assert.match(source, /\.controls button\[data-delta\]:not\(:disabled\):hover\{background:var\(--divider-color\);color:var\(--primary-text-color\);box-shadow:none\}/);
  assert.match(source, /\.controls button\[data-delta\]\.step-feedback:not\(:disabled\),\.controls button\[data-delta\]:not\(:disabled\):active\{background:var\(--divider-color\);color:var\(--primary-text-color\);box-shadow:none;transform:scale\(\.96\)\}/);
  assert.match(source, /\.status\[data-climate-state="active"\]\[data-show-state-indicator="true"\]::before/);
  assert.match(source, /\.status\[data-climate-state="unavailable"\]\{color:var\(--error-color\)\}/);
});

test('editor schema groups the options into localized sections', () => {
  assert.deepEqual(configSchema.map((entry) => entry.type), ['grid', 'grid', 'expandable']);
  assert.deepEqual(configSchema.map((entry) => entry.name), ['identity', 'chips', 'controls']);
  assert.equal(configSchema[2].collapsed, true);
  for (const lang of ['en', 'it']) {
    const strings = cardStrings(lang);
    assert.deepEqual(Object.keys(strings.sections), ['identity', 'chips', 'controls']);
    assert.ok(strings.sections.identity && strings.sections.chips && strings.sections.controls);
  }
  // Every help entry maps to a real schema field, in both languages.
  const names = configSchemaFields().map((entry) => entry.name).sort();
  for (const lang of ['en', 'it']) {
    const help = cardStrings(lang).help;
    assert.deepEqual(Object.keys(help).sort(), names);
  }
});

test('editor schema exposes climate entity and all supported visual options', () => {
  const fields = configSchemaFields();
  assert.deepEqual(fields[0].selector.entity, { filter: { domain: ['climate'] } });
  const names = fields.map((entry) => entry.name);
  for (const name of ['entity', 'name', 'icon', 'layout', 'accent_color', 'surface', 'step', 'show_state_chip', 'show_current_temperature_chip', 'show_humidity_chip', 'show_unavailable_badge', 'show_mode_buttons', 'show_step_controls', 'show_schedule_button']) assert.ok(names.includes(name));
  // The native preset dropdown next to the setpoint is gone for good.
  assert.equal(names.includes('show_preset_modes'), false);
  assert.deepEqual(fields.find((entry) => entry.name === 'layout').selector, { select: { mode: 'dropdown', options: ['pill', 'compact', 'circular'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'surface').selector, { select: { mode: 'dropdown', options: CARD_SURFACES } });
  assert.deepEqual(fields.find((entry) => entry.name === 'accent_color').selector, { color: {} });
  assert.deepEqual(defaultCardConfig('climate.living_room'), {
    entity: 'climate.living_room', layout: 'pill',
    show_state_chip: true, show_current_temperature_chip: true, show_humidity_chip: false,
    show_unavailable_badge: true, show_mode_buttons: true, show_step_controls: true, show_schedule_button: true,
  });
  assert.equal(Object.hasOwn(defaultCardConfig('climate.living_room'), 'show_preset_modes'), false);
  assert.equal(typeof ClimateFlowCard.getStubConfig, 'function');
  assert.equal(typeof ClimateFlowCard.getConfigElement, 'function');
});

test('no preset dropdown remains and localized override actions exist', () => {
  // Presets (none/hold/program) were dropped from the card: the climate
  // entity details remain the place to change them.
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /preset-mode|presetModes|presetServicePayload|show_preset_modes|set_preset_mode/);
  assert.doesNotMatch(source, /presetNone|t\.presets/);
  assert.deepEqual(manualOverrideServicePayload('climate.room', 21, '30m', 0.5), { climate_entity: 'climate.room', temperature: 21, duration: '30m', step: 0.5 });
  assert.deepEqual(manualOverrideServicePayload('climate.room', 21, '1h'), { climate_entity: 'climate.room', temperature: 21, duration: '1h' });
  assert.equal(manualOverrideServicePayload('climate.room', 21, '1h', 0), null);
  for (const language of ['en', 'it']) {
    const strings = cardStrings(language);
    assert.ok(strings.overrideChoice && strings.resumeSchedule && strings.overrideActive('18:00'));
    assert.deepEqual(overrideDurationChoices(strings).map(([value]) => value), ['30m', '1h', '2h', 'next_change']);
  }
  assert.equal(formatOverrideExpiry('bad date', 'en'), 'bad date');
  assert.match(formatOverrideExpiry('2026-01-01T12:00:00Z', 'en'), /2026/);
  assert.equal(overrideFocusSelector(true, null), '.slider');
  assert.equal(overrideFocusSelector(false, '0.5'), '[data-delta="0.5"]');
  assert.match(source, /set_manual_override/);
  assert.match(source, /resume_program/);
  assert.doesNotMatch(source, /globalThis\.prompt|window\.prompt/);
  assert.match(source, /dialog\.showModal\(\)/);
  assert.equal((source.match(/overrideActive\(formatOverrideExpiry\(/g) || []).length, 3, 'override expiry is visible in every layout');
  assert.match(source, /_showServiceError\(error\)/);
  assert.match(source, /dualOverrideUnsupported/);
});

test('card service wrapper consumes rejections and exposes them for accessible reporting', async () => {
  const card = new ClimateFlowCard();
  const reported = [];
  card._hass = { callService: async () => { throw new Error('service unavailable'); } };
  card._showServiceError = (error) => reported.push(error.message);
  await assert.doesNotReject(card._service('climate', 'set_temperature', { temperature: 21 }));
  assert.deepEqual(reported, ['service unavailable']);
});

test('sameCardConfig compares shallow configs so the editor can skip re-rendering', () => {
  const config = defaultCardConfig('climate.living_room');
  assert.equal(sameCardConfig(config, { ...config }), true);
  assert.equal(sameCardConfig(config, { ...config, name: 'Sala' }), false);
  assert.equal(sameCardConfig({ step: 0.5 }, { step: '0.5' }), false);
  assert.equal(sameCardConfig(undefined, config), false);
  assert.equal(sameCardConfig(config, null), false);
  assert.equal(sameCardConfig(null, null), true);
  // An absent key and an explicit undefined are equivalent for the editor.
  assert.equal(sameCardConfig(config, { ...config, extra: undefined }), true);
  assert.equal(sameCardConfig(config, { ...config, extra: 1 }), false);
});

test('editor builds its sections once and never resets the shadow root (static check, no rendering)', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const start = source.indexOf('export class ClimateFlowCardEditor');
  const end = source.indexOf('export class ClimateFlowCard extends');
  assert.ok(start !== -1 && end !== -1 && start < end);
  const editor = source.slice(start, end);
  assert.doesNotMatch(editor, /shadowRoot\.innerHTML\s*=/);
  // hass ticks reach the live controls and preview without rebuilding the DOM.
  assert.match(editor, /if \(this\._entityPicker\) this\._entityPicker\.hass = value;/);
  assert.match(editor, /this\.shadowRoot\.append\(style, panel, previewBox\)/);
  // A field edit compares the merged config before dispatching config-changed.
  assert.match(editor, /if \(sameCardConfig\(this\._config, next\)\) return;/);
  // The dialog opens wide (large/full) while the editor is mounted.
  assert.match(editor, /_widenDialog/);
  assert.match(editor, /hui-dialog-edit-card/);
});

test('editor renders localized sections with help text and an inert live preview', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const start = source.indexOf('export class ClimateFlowCardEditor');
  const end = source.indexOf('export class ClimateFlowCard extends');
  const editor = source.slice(start, end);
  // Section titles come from the localized sections map, fields from fieldLabel.
  assert.match(editor, /strings\.sections\[section\.name\] \|\| section\.name/);
  assert.match(editor, /fieldLabel\(strings, name\)/);
  assert.match(editor, /strings\.help\[name\] \|\| ''/);
  // Switch rows are role=switch inputs bound to boolean config keys.
  assert.match(editor, /input\.type = 'checkbox'/);
  assert.match(editor, /setAttribute\('role', 'switch'\)/);
  // The preview is a real card fed with the edited config, but inert:
  // clicks must never call services while the user is only configuring.
  assert.match(source, /\.preview\{pointer-events:none\}/);
  assert.match(editor, /document\.createElement\('climate-flow-card'\)/);
  assert.match(editor, /this\._preview\.hass = value;/);
  // A null or empty step is stripped before it can reach the card.
  assert.match(editor, /delete raw\.step/);
});

test('entity suggestion targets climate entities only and wraps the card config', () => {
  // Home Assistant reads suggestion.config, so the suggestion must nest it.
  assert.deepEqual(getEntitySuggestion({}, 'climate.living_room'), {
    config: { type: 'custom:climate-flow-card', ...defaultCardConfig('climate.living_room') },
  });
  assert.equal(getEntitySuggestion({}, 'light.living_room'), null);
  assert.deepEqual(ClimateFlowCard.getStubConfig({ states: {} }), defaultCardConfig('climate.example'));
  assert.equal(Object.hasOwn(ClimateFlowCard.getStubConfig({ states: {} }), 'type'), false);
});

test('target is bounded and rounded to entity step', () => {
  const entity = { attributes: { min_temp: 7, max_temp: 30, target_temp_step: 0.5 } };
  assert.equal(clampTarget(19.26, entity), 19.5);
  assert.equal(clampTarget(21, entity), 21);
  assert.equal(clampTarget(40, entity), 30);
  assert.equal(clampTarget(10, { attributes: { min_temp: 0, max_temp: 10, target_temp_step: 4 } }), 8);
  assert.equal(clampTarget(10, { attributes: { min_temp: 0, max_temp: 9.9999999995, target_temp_step: 10 } }), 0);
  assert.equal(clampTarget(0.3, { attributes: { min_temp: 0.1, max_temp: 0.3, target_temp_step: 0.1 } }), 0.3);
  assert.equal(clampTarget(1, { attributes: { min_temp: 0, max_temp: 10, target_temp_step: 1e-320 } }), null);
  assert.equal(clampTarget(0, { attributes: { min_temp: 5, max_temp: 10, target_temp_step: 4 } }), 5);
  assert.equal(clampTarget(-5, { attributes: { min_temp: 5, max_temp: 10, target_temp_step: 4 } }), 5);
  assert.equal(clampTarget('bad', entity), null);
  assert.equal(clampTarget(null, entity), null);
  assert.equal(clampTarget(20, { attributes: { min_temp: null, max_temp: 30, target_temp_step: 0.5 } }), null);
  assert.equal(clampTarget(20, { attributes: { min_temp: 5, max_temp: 30, target_temp_step: 0 } }), null);
});

test('effective step prefers a valid entity step and otherwise uses fallback', () => {
  assert.equal(effectiveStep({ attributes: { target_temp_step: 0.5 } }), 0.5);
  assert.equal(effectiveStep({ attributes: { target_temp_step: 1 } }, 0.5), 1);
  assert.equal(effectiveStep({ attributes: {} }), 0.5);
  assert.equal(effectiveStep({ attributes: { target_temp_step: null } }, 0.25), 0.25);
  assert.equal(effectiveStep({ attributes: { target_temp_step: 'unavailable' } }, 0.25), 0.25);
  assert.equal(effectiveStep({ attributes: { target_temp_step: 0 } }, 0.25), null);
  assert.equal(effectiveStep({ attributes: { target_temp_step: -1 } }, 0.25), null);
  assert.equal(effectiveStep({ attributes: { target_temp_step: 'invalid' } }, 0.25), null);
  assert.equal(clampTarget(21.4, { attributes: { min_temp: 10, max_temp: 30, target_temp_step: 0 } }, 0.5), null);
  assert.equal(temperaturePayload({ state: 'heat', attributes: { min_temp: 10, max_temp: 30, temperature: 21, target_temp_step: 'invalid' } }, 21, 0.5), null);
  assert.equal(clampTarget(21.4, { attributes: { min_temp: 10, max_temp: 30, target_temp_step: 1 } }, 0.5), 21);
  assert.equal(clampTarget(21.4, { attributes: { min_temp: 10, max_temp: 30 } }, 0.5), 21.5);
});

test('an explicitly configured step overrides the entity step', () => {
  const entity = { state: 'heat', attributes: { min_temp: 10, max_temp: 30, target_temp_step: 1, temperature: 21 } };
  assert.equal(effectiveStep(entity, 0.5, 0.5), 0.5);
  assert.equal(effectiveStep(entity, 0.5, '0.5'), 0.5);
  assert.equal(effectiveStep(entity, 0.5, 1), 1);
  assert.equal(effectiveStep(entity, 0.5, null), 1);
  assert.equal(effectiveStep({ attributes: {} }, 0.5, 0.5), 0.5);
  assert.equal(effectiveStep(entity, 0.5, 0), null);
  assert.equal(effectiveStep(entity, 0.5, -1), null);
  assert.equal(effectiveStep(entity, 0.5, 'invalid'), 1);
  assert.equal(clampTarget(21.4, entity, 0.5, 0.5), 21.5);
  assert.equal(clampTarget(21.4, entity, 0.5), 21);
  assert.deepEqual(temperaturePayload(entity, 21.5, 0.5, 0.5), { temperature: 21.5 });
  assert.deepEqual(temperaturePayload(entity, 21.5, 0.5), { temperature: 22 });
});

// setConfig only needs attachShadow: with no shadowRoot _render returns early,
// so the card's step handling can be exercised without a DOM.
const configuredCard = (config) => {
  const card = new ClimateFlowCard();
  card.attachShadow = () => {};
  card.setConfig(config);
  return card;
};

test('accent colour and surface options normalise, validate and reach the chrome', () => {
  // Normalisation keeps a hand-written config from breaking the render.
  assert.equal(normalizeAccentColor('#3F9CF4'), '#3f9cf4');
  assert.equal(normalizeAccentColor(' #abc '), '#abc');
  assert.equal(normalizeAccentColor('#12345'), null);
  assert.equal(normalizeAccentColor('red'), null);
  assert.equal(normalizeAccentColor(undefined), null);
  assert.equal(normalizeAccentColor(42), null);
  assert.deepEqual(CARD_SURFACES, ['default', 'elevated', 'blend']);
  assert.equal(normalizeSurface('elevated'), 'elevated');
  assert.equal(normalizeSurface('blend'), 'blend');
  assert.equal(normalizeSurface('glass'), 'default');
  assert.equal(normalizeSurface(undefined), 'default');
  // A typo in YAML fails loudly instead of being silently ignored.
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), accent_color: 'red' }), /hex colour/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), surface: 'glass' }), /surface must be one of/);
  // Accepted values are stored normalised, and an emptied editor field is dropped.
  assert.equal(configuredCard({ ...defaultCardConfig('climate.living_room'), accent_color: '#ABCDEF' }).config.accent_color, '#abcdef');
  assert.equal(configuredCard({ ...defaultCardConfig('climate.living_room'), surface: 'blend' }).config.surface, 'blend');
  const emptied = configuredCard({ ...defaultCardConfig('climate.living_room'), accent_color: '', surface: '' });
  assert.equal(Object.hasOwn(emptied.config, 'accent_color'), false);
  assert.equal(Object.hasOwn(emptied.config, 'surface'), false);

  // The chrome lands on ha-card, the element every accent rule reads from.
  const card = configuredCard({ ...defaultCardConfig('climate.living_room'), accent_color: '#ABC', surface: 'blend' });
  const sets = [], removed = [];
  const recording = () => ({ style: { setProperty: (key, value) => sets.push([key, value]), removeProperty: (key) => removed.push(key) }, dataset: {} });
  const target = recording();
  Object.defineProperty(card, 'shadowRoot', { value: { querySelector: (selector) => (selector === 'ha-card' ? target : null) }, configurable: true });
  card._applyCardChrome();
  assert.deepEqual(sets, [['--climate-flow-accent-color', '#abc'], ['--cf-motion', '220ms']]);
  assert.equal(target.dataset.surface, 'blend');
  assert.equal(target.dataset.motion, 'on');
  // Without an override the property is removed and the surface falls back.
  const plain = configuredCard(defaultCardConfig('climate.living_room'));
  const plainTarget = recording();
  Object.defineProperty(plain, 'shadowRoot', { value: { querySelector: () => plainTarget }, configurable: true });
  plain._applyCardChrome();
  assert.deepEqual(removed, ['--climate-flow-accent-color']);
  assert.equal(plainTarget.dataset.surface, 'default');
  assert.equal(plainTarget.dataset.motion, 'on');
  // Disabling animations flips the motion flag and a duration override feeds
  // the same custom property.
  const still = configuredCard({ ...defaultCardConfig('climate.living_room'), animations: false, animation_duration: 500 });
  const stillTarget = recording();
  Object.defineProperty(still, 'shadowRoot', { value: { querySelector: () => stillTarget }, configurable: true });
  still._applyCardChrome();
  assert.equal(stillTarget.dataset.motion, 'off');
  assert.equal(sets.at(-1)[0], '--cf-motion');
  assert.equal(sets.at(-1)[1], '500ms');
});

test('card background actions normalise and keep the historic toggle behaviour', () => {
  assert.deepEqual(CARD_ACTIONS, ['toggle', 'more-info', 'none']);
  assert.equal(normalizeCardAction('more-info', 'toggle'), 'more-info');
  assert.equal(normalizeCardAction('none', 'toggle'), 'none');
  assert.equal(normalizeCardAction('turbo', 'toggle'), 'toggle');
  assert.equal(normalizeCardAction(undefined, 'none'), 'none');
  for (const [key, fallback] of [['tap_action', 'toggle'], ['hold_action', 'none'], ['double_tap_action', 'none']]) {
    assert.equal(configuredCard(defaultCardConfig('climate.living_room')).config[key], fallback, key);
    assert.equal(configuredCard({ ...defaultCardConfig('climate.living_room'), [key]: 'more-info' }).config[key], 'more-info', key);
  }
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), tap_action: 'turbo' }), /tap_action must be one of/);
});

test('per-mode accents, card language and main temperature helpers', () => {
  assert.equal(MODE_ACCENTS.heat, '#f59f42');
  assert.equal(MODE_ACCENTS.cool, '#71c0ff');
  assert.equal(modeAccentColor('cool'), '#71c0ff');
  assert.equal(modeAccentColor('off'), null);
  assert.equal(modeAccentColor(undefined), null);
  assert.equal(cardLanguage({ language: 'it' }, 'en'), 'it');
  assert.equal(cardLanguage({ language: 'auto' }, 'it'), 'it');
  assert.equal(cardLanguage({}, 'it'), 'it');
  assert.equal(mainTemperatureKind('current'), 'current');
  assert.equal(mainTemperatureKind('target'), 'target');
  assert.equal(mainTemperatureKind('bogus'), 'target');
  // Both are validated like the other cosmetic options.
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), main_temperature: 'both' }), /main_temperature/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), language: 'fr' }), /language must be/);
  const card = configuredCard({ ...defaultCardConfig('climate.living_room'), language: 'it', main_temperature: 'current' });
  assert.equal(card.config.main_temperature, 'current');
  assert.equal(cardLanguage(card.config, 'en'), 'it');
});

test('hero slot prefers the configured temperature and falls back, chip takes the other', () => {
  assert.deepEqual(heroTemperaturePlan({ hasTarget: true, hasCurrent: true, main: 'target' }), { hero: 'target', chip: 'current' });
  assert.deepEqual(heroTemperaturePlan({ hasTarget: true, hasCurrent: true, main: 'current' }), { hero: 'current', chip: 'target' });
  // An empty hero takes the other temperature instead of leaving a blank slot.
  assert.deepEqual(heroTemperaturePlan({ hasTarget: true, hasCurrent: false, main: 'current' }), { hero: 'target', chip: null });
  assert.deepEqual(heroTemperaturePlan({ hasTarget: false, hasCurrent: true, main: 'target' }), { hero: 'current', chip: null });
  assert.deepEqual(heroTemperaturePlan({ hasTarget: false, hasCurrent: false, main: 'target' }), { hero: null, chip: null });
  // Anything but "current" means target.
  assert.deepEqual(heroTemperaturePlan({ hasTarget: true, hasCurrent: true, main: 'bogus' }), { hero: 'target', chip: 'current' });
});

test('defaults are resolved per option and stripped from the emitted YAML', () => {
  for (const [name, fallback] of Object.entries(CARD_OPTION_DEFAULTS)) assert.equal(cardDefault(name, 'climate.living_room'), fallback, name);
  assert.equal(cardDefault('show_humidity_chip', 'climate.living_room'), false);
  assert.equal(cardDefault('accent_color', 'climate.living_room'), undefined);
  // A config at its defaults collapses to the only key that cannot be dropped.
  assert.deepEqual(stripCardDefaults({ ...defaultCardConfig('climate.living_room') }), { entity: 'climate.living_room' });
  assert.deepEqual(stripCardDefaults({ entity: 'climate.living_room', surface: 'blend', step: 1 }), { entity: 'climate.living_room', surface: 'blend', step: 1 });
  assert.deepEqual(stripCardDefaults({ entity: 'climate.living_room', name: '', accent_color: null, unknown_option: '' }), { entity: 'climate.living_room' });
  assert.deepEqual(stripCardDefaults({ entity: 'climate.living_room', type: 'custom:climate-flow-card' }), { entity: 'climate.living_room', type: 'custom:climate-flow-card' });
});

test('actions, mode accents, language and main temperature are wired in both layouts', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  // Background gestures: tap, double tap (after its window) and long press.
  assert.match(source, /this\._runCardAction\(this\.config\.tap_action\)/);
  assert.match(source, /this\._runCardAction\(doubleTap\)/);
  assert.match(source, /this\._runCardAction\(hold\)/);
  assert.match(source, /pointerdown', \(ev\)=>\{ if \(!eligible\(ev\)\) return;/);
  assert.match(source, /normalizeCardAction\(this\.config\.tap_action, 'toggle'\)/);
  assert.match(source, /this\._holdFired\s*=\s*true/);
  // The aria-label tells what the background does instead of assuming toggle.
  assert.equal((source.match(/_actionLabel\(t\)/g) || []).length, 3, 'every layout labels the card by its tap action');
  // The mode accent only fills in when no explicit accent is configured.
  assert.match(source, /normalizeAccentColor\(this\.config\?\.accent_color\) \|\| modeAccentColor\(/);
  // main_temperature drives the hero slot of each layout, with the shared
  // fallback rule (an empty hero takes the other temperature).
  assert.ok((source.match(/heroTemperaturePlan\(\{/g) || []).length >= 2, 'both layouts plan hero and chip');
  assert.match(source, /const showHero = \(plan\.hero === 'target' && hasTarget\)/);
  // The entity picture swaps the glyph in both layouts.
  assert.ok((source.match(/this\._paintIcon\(/g) || []).length >= 2, 'both layouts paint the entity picture');
  assert.match(source, /_paintIcon\(box, glyph, picture\)/);
});

test('haptics, motion and drag helpers normalise without a vibration API', () => {
  assert.deepEqual(HAPTIC_STYLES, ['light', 'medium', 'heavy']);
  assert.deepEqual(hapticPattern('light'), [8]);
  assert.deepEqual(hapticPattern('heavy'), [26]);
  assert.deepEqual(hapticPattern('bogus'), HAPTIC_PATTERNS.medium);
  assert.equal(normalizeHapticStyle('heavy'), 'heavy');
  assert.equal(normalizeHapticStyle('nope'), 'medium');
  assert.equal(normalizeAnimationDuration(500), 500);
  assert.equal(normalizeAnimationDuration('250'), 250);
  assert.equal(normalizeAnimationDuration(0), ANIMATION_DURATION_DEFAULT);
  assert.equal(normalizeAnimationDuration('bad'), ANIMATION_DURATION_DEFAULT);
  assert.equal(normalizeAnimationDuration(999999), 2000);
  // Node exposes no navigator.vibrate: firing a haptic must be a silent no-op.
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  if (original && !original.configurable) return;
  delete globalThis.navigator;
  assert.equal(vibrateSupported(), false);
  assert.equal(fireHaptic({ haptics: true, haptics_style: 'heavy' }), false);
  const seen = [];
  Object.defineProperty(globalThis, 'navigator', { value: { vibrate: (pattern) => { seen.push(pattern); return true; } }, configurable: true, writable: true });
  try {
    assert.equal(vibrateSupported(), true);
    assert.equal(fireHaptic({ haptics: true, haptics_style: 'light' }), true);
    assert.deepEqual(seen, [[8]]);
    assert.equal(fireHaptic({ haptics: true }), true);
    assert.deepEqual(seen.at(-1), [16]);
    assert.equal(fireHaptic({ haptics: false, haptics_style: 'heavy' }), false);
    assert.equal(fireHaptic(undefined), false);
    assert.deepEqual(seen.length, 2);
  } finally {
    if (original) Object.defineProperty(globalThis, 'navigator', original);
    else delete globalThis.navigator;
  }
  // Config validation: bad feedback options fail loudly, good ones normalise.
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), haptics: 'yes' }), /haptics must be true or false/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), animations: 1 }), /animations must be true or false/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), haptics_style: 'soft' }), /haptics_style must be one of/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), animation_duration: -5 }), /animation_duration/);
  const tuned = configuredCard({ ...defaultCardConfig('climate.living_room'), haptics: false, animations: false, haptics_style: 'heavy', animation_duration: '400' });
  assert.equal(tuned.config.haptics, false);
  assert.equal(tuned.config.animations, false);
  assert.equal(tuned.config.haptics_style, 'heavy');
  assert.equal(tuned.config.animation_duration, 400);
  const defaults = configuredCard(defaultCardConfig('climate.living_room'));
  assert.equal(defaults.config.haptics, true);
  assert.equal(defaults.config.animations, true);
  assert.equal(defaults.config.haptics_style, 'medium');
  assert.equal(Object.hasOwn(defaults.config, 'animation_duration'), false);
  // The feedback options are part of the default table, so the editor and the
  // YAML stripping treat them like every other option.
  for (const name of ['haptics', 'haptics_style', 'animations', 'animation_duration']) {
    assert.equal(cardDefault(name, 'climate.living_room'), CARD_OPTION_DEFAULTS[name], name);
    assert.ok(configSchemaFields().some((entry) => entry.name === name), `${name} is exposed in the editor`);
    for (const lang of ['en', 'it']) assert.ok(cardStrings(lang).help[name], `${lang} help for ${name}`);
  }
});

test('dial geometry maps values onto the 270° sweep and back', () => {
  // The dial is the only layout whose position is an angle, so the mapping
  // value ↔ fraction ↔ point is pure math worth pinning down exactly.
  assert.equal(DIAL_START_ANGLE, 135);
  assert.equal(DIAL_SWEEP, 270);
  assert.equal(DIAL_RADIUS, 80);
  assert.equal(DIAL_DRAG_THRESHOLD_PX, 6);
  assert.equal(dialFraction(18.5, 7, 30), (18.5 - 7) / 23);
  assert.equal(dialFraction(7, 7, 30), 0);
  assert.equal(dialFraction(30, 7, 30), 1);
  assert.equal(dialFraction(50, 7, 30), 1, 'a value past the maximum clamps');
  assert.equal(dialFraction(0, 7, 30), 0, 'a value below the minimum clamps');
  assert.equal(dialFraction(20, 30, 7), 0, 'an inverted or empty range stays at zero');
  assert.equal(dialFraction(null, 7, 30), 0);
  assert.equal(dialFraction(20, null, 30), 0);
  assert.equal(dialAngle(0), 135);
  assert.equal(dialAngle(0.5), 270);
  assert.equal(dialAngle(1), 405);
  assert.equal(dialAngle(-3), 135, 'out-of-range fractions clamp to the sweep');
  assert.equal(dialAngle(null), 135);
  // The extremes are symmetric around the bottom gap, the top of the sweep is
  // the midpoint of the range.
  assert.deepEqual(dialPoint(0), { x: 43.431, y: 156.569 });
  assert.deepEqual(dialPoint(0.5), { x: 100, y: 20 });
  assert.deepEqual(dialPoint(1), { x: 156.569, y: 156.569 });
  // Angle back to fraction: the sweep wraps past 360°, and a tap inside the
  // bottom gap snaps to the nearest end instead of wrapping around.
  assert.equal(dialFractionFromAngle(135), 0);
  assert.equal(dialFractionFromAngle(270), 0.5);
  assert.equal(dialFractionFromAngle(45), 1);
  assert.equal(dialFractionFromAngle(0), (360 - 135) / 270);
  assert.equal(dialFractionFromAngle(80), 1, 'the gap snaps to the end it is nearer to');
  assert.equal(dialFractionFromAngle(100), 0);
  assert.equal(dialFractionFromAngle(null), null);
  // Pointer coordinates → value, using a 200x200 rect centred at (100,100).
  const rect = { left: 0, top: 0, width: 200, height: 200 };
  assert.equal(dialValueFromPointer(100, 0, rect, 7, 30), 7 + 0.5 * 23, 'straight up is the middle of the range');
  assert.equal(dialValueFromPointer(0, 100, rect, 7, 30), 7 + (45 / 270) * 23, 'nine o\'clock is a sixth of the sweep');
  assert.equal(dialValueFromPointer(10, 10, rect, 30, 7), null, 'an inverted range has no scale');
  assert.equal(dialValueFromPointer(100, 0, { left: 0, top: 0, width: 0, height: 0 }, 7, 30), null, 'a zero-size rect cannot be measured');
  assert.equal(dialValueFromPointer(NaN, 0, rect, 7, 30), null);
  // The two sides of a heat_cool range keep one step between them and stay
  // inside the entity limits.
  const dualEntity = { attributes: { min_temp: 5, max_temp: 30, target_temp_low: 18, target_temp_high: 22 } };
  assert.equal(dialBoundValue(19.2, 'low', dualEntity, 0.5), 19, 'the dragged bound snaps to the step');
  assert.equal(dialBoundValue(24, 'low', dualEntity, 0.5), 21.5, 'the low bound stops one step below the high one');
  assert.equal(dialBoundValue(1, 'low', dualEntity, 0.5), 5, 'the low bound never passes the minimum');
  assert.equal(dialBoundValue(20.2, 'high', dualEntity, 0.5), 20, '20.2 is nearer to 20 than to 20.5');
  assert.equal(dialBoundValue(20.3, 'high', dualEntity, 0.5), 20.5);
  assert.equal(dialBoundValue(15, 'high', dualEntity, 0.5), 18.5, 'the high bound stays one step above the low one');
  assert.equal(dialBoundValue(99, 'high', dualEntity, 0.5), 30, 'the high bound never passes the maximum');
  assert.equal(dialBoundValue('nonsense', 'high', dualEntity, 0.5), null);
  // The arc: a full sweep, an empty one and the segment between two bounds.
  assert.deepEqual(dialArc(0, 1), { track: 376.991, dasharray: '376.991 502.655', dashoffset: 0 });
  assert.deepEqual(dialArc(0, 0), { track: 376.991, dasharray: '0.000 502.655', dashoffset: 0 });
  assert.deepEqual(dialArc(0.25, 0.75), { track: 376.991, dasharray: '188.496 502.655', dashoffset: -94.248 });
});

test('disconnecting a circular card removes its window-level drag listeners', () => {
  const previousWindow = globalThis.window;
  const removed = [];
  globalThis.window = { removeEventListener: (type) => removed.push(type) };
  try {
    const card = configuredCard(defaultCardConfig('climate.living_room'));
    card._dragListeners = { onMove() {}, onUp() {}, onCancel() {} };
    card._dialDrag = { active: true };
    card.disconnectedCallback();
    assert.deepEqual(removed, ['pointermove', 'pointerup', 'pointercancel', 'blur']);
    assert.equal(card._dialDrag, null);
    assert.equal(card._dragListeners, null);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('dragged values snap to the step and stay bounded', () => {
  assert.equal(DRAG_THRESHOLD_PX, 6);
  assert.equal(DRAG_STEP_PX, 12);
  assert.equal(dragStepValue(20, 0, 0.5), 20);
  assert.equal(dragStepValue(20, 12, 0.5), 20.5);
  assert.equal(dragStepValue(20, 30, 0.5), 21.5);
  assert.equal(dragStepValue(20, -13, 0.5), 19.5);
  assert.equal(dragStepValue(20, 5, 0.5), 20, 'below the step threshold nothing moves');
  assert.equal(dragStepValue(null, 12, 0.5), null);
  assert.equal(dragStepValue(20, 12, 0), null);
  assert.equal(dragStepValue(20, null, 0.5), null);
});

test('a batched commit coalesces the gesture, retries and rolls back at the end', async (t) => {
  const entity = { state: 'heat', attributes: { temperature: 21, min_temp: 7, max_temp: 30, target_temp_step: 0.5 } };
  const calls = [];
  let failNext = true;
  const card = configuredCard(defaultCardConfig('climate.living_room'));
  card._hass = { states: { 'climate.living_room': entity }, services: {}, callService: (domain, service, data) => { calls.push([domain, service, { ...data }]); return failNext ? Promise.reject(new Error('boom')) : Promise.resolve(); } };
  const scheduled = new Map();
  let nextId = 1;
  const realSetTimeout = globalThis.setTimeout, realClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = (fn, ms) => { const id = nextId++; scheduled.set(id, { fn, ms }); return id; };
  globalThis.clearTimeout = (id) => { scheduled.delete(id); };
  t.after(() => { globalThis.setTimeout = realSetTimeout; globalThis.clearTimeout = realClearTimeout; });
  const flush = async () => { for (let i = 0; i < 6; i += 1) await Promise.resolve(); };
  const timersOf = (ms) => [...scheduled.values()].filter((entry) => entry.ms === ms);
  const fire = (ms) => { const entry = [...scheduled].find(([, timer]) => timer.ms === ms); assert.ok(entry, `a ${ms}ms timer exists`); scheduled.delete(entry[0]); entry[1].fn(); };

  // The gesture shows its value at once and leaves the call for the pause.
  card._setTemperature(22, null, { debounce: true });
  assert.equal(card._optimistic.payload.temperature, 22, 'optimistic value is visible immediately');
  assert.equal(calls.length, 0, 'no service call before the pause');
  assert.equal(timersOf(COMMIT_DEBOUNCE_MS).length, 1, 'one debounced commit');
  assert.equal(timersOf(8000).length, 1, 'the optimistic timeout still runs');

  // A second request inside the window replaces the first one.
  card._setTemperature(23, null, { debounce: true });
  assert.equal(timersOf(COMMIT_DEBOUNCE_MS).length, 1, 'the pending commit is replaced, not stacked');
  assert.equal(calls.length, 0);

  fire(COMMIT_DEBOUNCE_MS);
  await flush();
  assert.equal(calls.length, 1, 'exactly one call for the whole gesture');
  assert.deepEqual(calls[0], ['climate', 'set_temperature', { entity_id: 'climate.living_room', temperature: 23 }]);
  assert.equal(timersOf(COMMIT_RETRY_MS).length, 1, 'a failure schedules a retry');
  assert.equal(card._optimistic.payload.temperature, 23, 'the value stays visible across retries');

  fire(COMMIT_RETRY_MS);
  await flush();
  assert.equal(calls.length, 2);
  assert.equal(timersOf(COMMIT_RETRY_MS).length, 1);

  fire(COMMIT_RETRY_MS);
  await flush();
  assert.equal(calls.length, 1 + COMMIT_RETRIES, 'the commit is attempted once plus the retries');
  assert.equal(card._optimistic, null, 'the optimistic value rolls back when every attempt fails');
  assert.equal(timersOf(COMMIT_RETRY_MS).length, 0, 'no further retries are queued');

  // A successful attempt keeps the value and schedules nothing.
  failNext = false;
  card._setTemperature(24, null, { debounce: true });
  fire(COMMIT_DEBOUNCE_MS);
  await flush();
  assert.equal(calls.length, 1 + COMMIT_RETRIES + 1);
  assert.equal(card._optimistic.payload.temperature, 24, 'a confirmed value is kept');
  assert.equal(timersOf(COMMIT_RETRY_MS).length, 0);
});

test('the circular layout is a first-class citizen of the config', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.equal(normalizeLayout('circular'), 'circular');
  assert.equal(normalizeLayout('dial'), null);
  assert.equal(configSchemaFields().find((entry) => entry.name === 'layout').selector.select.options.includes('circular'), true);
  // A taller card: the dial needs the vertical room the other two do not.
  assert.equal(configuredCard({ ...defaultCardConfig('climate.living_room'), layout: 'circular' }).getCardSize(), 3);
  assert.match(source, /Supported layouts are "pill", "compact" and "circular"\./);
  assert.match(source, /layout: 'pill is the horizontal pill card; compact is the two-row layout; circular is the round dial\.'/);
  assert.match(source, /layout: 'pill è la card a pillole orizzontale; compact è il layout a due righe; circular è il quadrante rotondo\.'/);
  // The dial reuses the shared plans instead of inventing its own rules.
  assert.match(source, /heroTemperaturePlan\(\{ hasTarget, hasCurrent: currentValue !== null, main: mainTemperatureKind\(c\.main_temperature\) \}\)/);
  assert.match(source, /dialBoundValue\(/);
  assert.match(source, /const previous = drag\.bound === 'low' \? drag\.low : drag\.high;[\s\S]{0,150}?if \(value === previous\) return;/);
  assert.match(source, /disconnectedCallback\(\)[^\n]*this\._detachDialDrag\(\)/);
  assert.match(source, /paintThumbs/);
  // A heat_cool dial patches each bound through the optimistic payload, which
  // is also what rolls the value back when the service call fails.
  assert.match(source, /target_temp_low: drag\.low, target_temp_high: drag\.high \}, debounce: true/);
});

test('editor field sync resolves defaults instead of the raw config', () => {
  // The editor keeps only non-default values in its config, so a control that
  // reads the raw config back shows every default as switched off: the
  // schedule-button toggle used to render off while the card showed it.
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const start = source.indexOf('export class ClimateFlowCardEditor');
  const end = source.indexOf('export class ClimateFlowCard extends');
  const editor = source.slice(start, end);
  assert.ok(start !== -1 && end > start, 'editor class slice');
  assert.match(editor, /const checked = Boolean\(this\._value\(name\)\)/);
  assert.match(editor, /const accent = normalizeAccentColor\(this\._value\(name\)\)/);
  assert.match(editor, /const current = this\._value\(name, control\._options \|\| \[\]\)/);
  assert.match(editor, /const value = this\._value\(name\) \?\? ''/);
  // Building reads the resolved value too, not the stripped config.
  assert.match(editor, /input\.checked = Boolean\(this\._value\(item\.name\)\)/);
  // The only direct read of the raw config lives inside _value itself.
  assert.equal((editor.match(/this\._config\[/g) || []).length, 1, 'raw config is read only by _value');
});

test('drag, batched commit, haptics and motion are wired in both layouts', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  // The drag listens on the window: the shadow tree is rebuilt during the
  // gesture, so an element listener would be lost on the first move.
  assert.match(source, /win\.addEventListener\('pointermove', onMove, \{ passive: false \}\)/);
  assert.match(source, /win\.addEventListener\('pointerup', onUp\)/);
  assert.match(source, /win\.addEventListener\('pointercancel', onCancel\)/);
  assert.match(source, /win\.addEventListener\('blur', onCancel\)/);
  assert.match(source, /Math\.abs\(dx\) < DRAG_THRESHOLD_PX \|\| Math\.abs\(dx\) <= Math\.abs\(dy\)/);
  assert.match(source, /dragStepValue\(drag\.origin, dx, drag\.step\)/);
  assert.match(source, /clampTarget\(value, this\._hass/);
  // An aborted gesture re-renders from the real state instead of keeping the
  // value the finger had reached, while a release commits it once.
  assert.match(source, /const onCancel = \(\) => \{[\s\S]{0,400}?_renderPreservingDeltaFocus\(\);/);
  assert.match(source, /const onUp = \(\) => \{[\s\S]{0,500}?_setTemperature\(drag\.value/);
  // Both heroes are sliders while adjustable and buttons otherwise.
  assert.equal((source.match(/this\._markHeroControl\(/g) || []).length, 3, 'hero role set in every layout');
  assert.equal((source.match(/this\._bindHeroControls\(/g) || []).length, 3, 'hero gestures bound in every layout');
  assert.match(source, /element\.setAttribute\('role', adjustable \? 'slider' : 'button'\)/);
  assert.match(source, /adjustable && plan\.hero === 'target'/);
  // Feedback on every deliberate step or action.
  assert.ok((source.match(/fireHaptic\(/g) || []).length >= 6, 'haptics fire from actions, steps, keys and drags');
  assert.match(source, /fireHaptic\(this\.config, 'light'\)/);
  assert.match(source, /fireHaptic\(c, 'medium'\)/);
  // Motion: one gate per layout, driven by the shared chrome.
  assert.equal((source.match(/@keyframes cf-bump/g) || []).length, 3, 'every layout defines the value animation');
  assert.equal((source.match(/\[data-motion="off"\] \*\{animation:none!important;transition:none!important\}/g) || []).length, 3);
  assert.match(source, /card\.dataset\.motion = this\.config\?\.animations === false \? 'off' : 'on'/);
  assert.match(source, /card\.style\.setProperty\('--cf-motion', `\$\{normalizeAnimationDuration\(this\.config\?\.animation_duration\)\}ms`\)/);
  assert.match(source, /\.bump\{animation:cf-bump var\(--cf-motion,220ms\)/);
  // Continuous inputs batch, direct ones do not.
  assert.ok((source.match(/\{ debounce: true \}/g) || []).length >= 3, 'slider, keys and drag all batch their commit');
  assert.match(source, /this\._setTemperature\(ev\.target\.value, e, \{ debounce: true \}\)/);
  assert.match(source, /COMMIT_DEBOUNCE_MS\)/);
  assert.match(source, /attempt < COMMIT_RETRIES/);
  assert.match(source, /clearTimeout\(this\._commitTimer\)/);

  // The circular layout drags the same way, reading the value from the angle
  // instead of a vertical delta. Its gesture captures one `drag` state: a
  // heat_cool dial has two bounds, and the pointer moves the nearest one
  // alone, so the threshold, the arc patch and the committed payload must all
  // go through that captured object.
  assert.match(source, /this\._dialDrag = drag;/);
  assert.match(source, /this\._dialDrag\.active = true;[\s\S]{0,120}?this\._dragConsumed = true;/);
  assert.match(source, /Math\.hypot\(moveEvent\.clientX - drag\.startClientX, moveEvent\.clientY - drag\.startClientY\) < DIAL_DRAG_THRESHOLD_PX/);
  assert.match(source, /clampTarget\(next, drag\.entity, drag\.step, this\._stepOverride\)/);
  assert.match(source, /dialBoundValue\(next, drag\.bound, drag\.entity, drag\.step\)/);
  assert.match(source, /if \(drag\.bound === 'low'\) drag\.low = value; else drag\.high = value;/);
  assert.match(source, /this\._patchDial\(\{ target_temp_low: drag\.low, target_temp_high: drag\.high \}\);/);
  assert.match(source, /this\._patchDial\(\{ temperature: value \}\);/);
  assert.match(source, /if \(drag\.active && drag\.bound\) \{/);
  assert.match(source, /this\._setTemperature\(null, drag\.entity, \{ payload: \{ target_temp_low: drag\.low, target_temp_high: drag\.high \}, debounce: true \}\);/);
  assert.match(source, /this\._setTemperature\(drag\.value, drag\.entity, \{ debounce: true \}\);/);
  assert.match(source, /const onCancelDial = \(\) => \{/);
  // The patch merges the optimistic payload, so a pending value is never
  // shadowed by a stale attribute while the finger is still on the dial.
  assert.match(source, /_patchDial\(nextAttributes\) \{[\s\S]{0,400}\{ \.\.\.\(base\?\.attributes \|\| \{\}\), \.\.\.nextAttributes \}/);
  assert.match(source, /_bindHeroControls\(hero, \{ entity: c\.entity, adjustable: heroAdjustable, dial: true \}\)/);
  assert.match(source, /if \(active\?\.matches\?\.\('\.dial\[role="slider"\]'\)\) return '\.dial\[role="slider"\]';/);
});

test('hero slider focus survives optimistic renders for held arrow keys', () => {
  const card = configuredCard(defaultCardConfig('climate.living_room'));
  let active = {
    matches: (selector) => selector === '.setpoint[role="slider"]',
  };
  let restored = false;
  const hero = { focus: () => { restored = true; active = hero; }, isConnected: true };
  const root = {
    host: card,
    get activeElement() { return active; },
    querySelector: (selector) => selector === '.setpoint[role="slider"]' ? hero : null,
  };
  Object.defineProperty(card, 'shadowRoot', { value: root, configurable: true });
  card._render = () => { active = root; };
  card._renderPreservingDeltaFocus();
  assert.equal(restored, true);
  assert.equal(active, hero);
});

test('compact slider fill maps the value onto the entity range', () => {
  assert.equal(sliderFillPercent({ min: '7', max: '30', value: '7' }), 0);
  assert.equal(sliderFillPercent({ min: '7', max: '30', value: '30' }), 100);
  assert.equal(sliderFillPercent({ min: '7', max: '30', value: '18.5' }), 50);
  assert.equal(sliderFillPercent({ min: '5', max: '5', value: '5' }), 100);
  assert.equal(sliderFillPercent({ min: 'a', max: 'b', value: 'c' }), 100);
  assert.equal(sliderFillPercent(undefined), 100);
  const painted = [];
  const slider = { min: '0', max: '10', value: '2.5', style: { setProperty: (key, value) => painted.push([key, value]) } };
  paintSliderFill(slider);
  assert.deepEqual(painted, [['--fill', '25%']]);
  assert.equal(paintSliderFill(null), null);
});

test('compact layout carries the premium accent, surface and hero-number treatment', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const compact = source.slice(source.indexOf('_renderCompact() {'), source.indexOf('_scheduleSensor() {'));
  // Surface variants hang off the card element, keyed by data-surface.
  assert.match(compact, /ha-card\[data-surface="elevated"\]/);
  assert.match(compact, /ha-card\[data-surface="blend"\]/);
  assert.match(compact, /--cf-accent:var\(--climate-flow-accent-color,var\(--primary-color\)\)/);
  // Hero target: number and unit are separate spans, the state chip is tinted.
  assert.match(compact, /unitText\.className='unit'/);
  assert.match(compact, /targetText\.append\(value, unitText\)/);
  assert.match(compact, /\.chip\.state\{/);
  assert.match(compact, /modeLabel\(e\?\.state, t\), 'state'\)/);
  // The icon tells idle from running, and the track is painted from the value.
  assert.match(compact, /\.icon\[data-active="true"\]/);
  assert.match(compact, /root\.querySelector\('\.icon'\)\.dataset\.active = String\(active\)/);
  assert.match(compact, /--fill,50%/);
  assert.match(compact, /paintSliderFill\(slider\)/);
  assert.match(compact, /\.slider'\)\?\.addEventListener\('input', \(ev\) => paintSliderFill\(ev\.target\)\)/);
  // The surface option must work in the pill layout too, otherwise the editor
  // offers a choice that silently does nothing on the default layout.
  const pill = source.slice(source.indexOf('_renderPill() {'), source.indexOf('_renderCompact() {'));
  assert.match(pill, /ha-card\[data-surface="elevated"\]/);
  assert.match(pill, /ha-card\[data-surface="blend"\]/);
  // The shared control gates must survive the restyle.
  assert.match(compact, /if \(c\.show_step_controls\) for \(const \[d,label,text\]/);
  assert.match(compact, /if \(c\.show_mode_buttons && modeList\.length\)/);
});

test('editor exposes a colour picker with a theme reset and default-first segments', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.match(source, /if \(selector\.color\) return this\._buildColor\(item, strings\)/);
  assert.match(source, /input\.type = 'color'/);
  assert.match(source, /this\._themeAccent\(\)/);
  assert.match(source, /group\._options = options/);
  assert.match(source, /const current = this\._value\(item\.name, options\)/);
  assert.match(source, /this\._value\(name, control\._options \|\| \[\]\)/);
  assert.match(source, /reset\.disabled = !current/);
});

test('new card presets carry no explicit step, so the entity step stays effective', () => {
  // The preset is not an override: an absent `step` key keeps target_temp_step
  // in charge and leaves 0.5 as the runtime fallback only.
  for (const preset of [defaultCardConfig('climate.living_room'), ClimateFlowCard.getStubConfig({ states: {} }), getEntitySuggestion({}, 'climate.living_room').config]) {
    assert.equal(Object.hasOwn(preset, 'step'), false);
    assert.equal(preset.step, undefined);
  }
  const stubCard = configuredCard(ClimateFlowCard.getStubConfig({ states: {} }));
  assert.equal(stubCard._stepOverride, null);
  assert.equal(stubCard.config.step, 0.5);
  assert.equal(effectiveStep({ attributes: { target_temp_step: 1 } }, stubCard.config.step, stubCard._stepOverride), 1);
  assert.equal(effectiveStep({ attributes: {} }, stubCard.config.step, stubCard._stepOverride), 0.5);
  assert.equal(effectiveStep({ attributes: { target_temp_step: null } }, stubCard.config.step, stubCard._stepOverride), 0.5);
  assert.deepEqual(
    temperaturePayload({ state: 'heat', attributes: { min_temp: 10, max_temp: 30, temperature: 21, target_temp_step: 1 } }, 21, stubCard.config.step, stubCard._stepOverride),
    { temperature: 21 },
  );
  const suggestedCard = configuredCard(getEntitySuggestion({}, 'climate.living_room').config);
  assert.equal(suggestedCard._stepOverride, null);
  assert.equal(effectiveStep({ attributes: { target_temp_step: 1 } }, suggestedCard.config.step, suggestedCard._stepOverride), 1);
});

test('an explicitly configured step still overrides the entity step after the preset change', () => {
  const entity = { state: 'heat', attributes: { min_temp: 10, max_temp: 30, temperature: 21, target_temp_step: 1 } };
  const card = configuredCard({ ...defaultCardConfig('climate.living_room'), step: 0.5 });
  assert.equal(card._stepOverride, 0.5);
  assert.equal(effectiveStep(entity, card.config.step, card._stepOverride), 0.5);
  assert.deepEqual(temperaturePayload(entity, 21.5, card.config.step, card._stepOverride), { temperature: 21.5 });
  assert.deepEqual(temperaturePayload(entity, 21, card.config.step, card._stepOverride), { temperature: 21 });
  const explicitStepCard = configuredCard({ ...defaultCardConfig('climate.living_room'), step: 1 });
  assert.equal(explicitStepCard._stepOverride, 1);
  assert.equal(effectiveStep({ attributes: { target_temp_step: 0.5 } }, explicitStepCard.config.step, explicitStepCard._stepOverride), 1);
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), step: 0 }), /step must be a number greater than zero/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('climate.living_room'), step: 'bad' }), /step must be a number greater than zero/);
});

test('an empty step from the editor follows the entity instead of breaking the card', () => {
  // The editor's step box is cleared to ''/null; treating that as an invalid
  // override made setConfig throw, so every toggle in the card editor failed.
  for (const step of ['', '   ', null, undefined]) {
    const card = configuredCard({ ...defaultCardConfig('climate.living_room'), step });
    assert.equal(card._stepOverride, null);
    assert.equal(card.config.step, 0.5);
  }
  // The entity step still wins at runtime for an emptied box.
  const card = configuredCard({ ...defaultCardConfig('climate.living_room'), step: '' });
  assert.equal(effectiveStep({ attributes: { target_temp_step: 1 } }, card.config.step, card._stepOverride), 1);
  // A real number keeps overriding, so only the empty case was relaxed.
  assert.equal(configuredCard({ ...defaultCardConfig('climate.living_room'), step: '0.5' })._stepOverride, 0.5);
});

test('control toggles gate +/- buttons and the HVAC select in both layouts', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const pill = source.slice(source.indexOf('_renderPill() {'), source.indexOf('_renderCompact() {'));
  const compact = source.slice(source.indexOf('_renderCompact() {'), source.indexOf('_scheduleSensor() {'));
  // Pill: the mode select is rendered only when show_mode_buttons is on (it
  // used to be missing entirely), and the +/- pair honors show_step_controls.
  assert.match(pill, /if \(c\.show_step_controls && adjustable\) \{ const minus/);
  assert.match(pill, /if \(c\.show_mode_buttons && modeList\.length\) \{ const select/);
  // Compact: same gates around the slider buttons and the hvac-mode select.
  assert.match(compact, /if \(c\.show_step_controls\) for \(const \[d,label,text\]/);
  assert.match(compact, /if \(c\.show_mode_buttons && modeList\.length\)/);
});

test('editor widening toggles the HA edit dialog large flag and restores it', () => {
  const editor = new ClimateFlowCardEditor();
  const dialog = { large: false };
  editor._findEditDialog = () => dialog;
  editor.connectedCallback();
  assert.equal(dialog.large, true);
  editor.disconnectedCallback();
  assert.equal(dialog.large, false);
  // A dialog the user already enlarged stays enlarged on close.
  const own = { large: true };
  const editor2 = new ClimateFlowCardEditor();
  editor2._findEditDialog = () => own;
  editor2.connectedCallback();
  assert.equal(own.large, true);
  editor2.disconnectedCallback();
  assert.equal(own.large, true);
  // A missing dialog (editor outside the HA dialog) is a harmless no-op.
  const editor3 = new ClimateFlowCardEditor();
  editor3._findEditDialog = () => null;
  editor3.connectedCallback();
  editor3.disconnectedCallback();
});

test('heat_cool model and payload use dual targets and preserve their gap', () => {
  const entity = { state: 'heat_cool', attributes: { min_temp: 5, max_temp: 35, target_temp_step: 0.5, target_temp_low: 18, target_temp_high: 22.5 } };
  assert.deepEqual(targetModel(entity), { dual: true, low: 18, high: 22.5, value: 20.25, min: 5, max: 35, available: true, controllable: true, sliderMin: 7.25, sliderMax: 32.75 });
  assert.deepEqual(temperaturePayload(entity, 20.75, 0.5), { target_temp_low: 18.5, target_temp_high: 23 });
  assert.deepEqual(temperaturePayload(entity, 34, 0.5), { target_temp_low: 30.5, target_temp_high: 35 });
  assert.equal(temperaturePayload({ ...entity, state: 'unavailable' }, 21, 0.5), null);
  assert.equal(temperaturePayload({ ...entity, attributes: { ...entity.attributes, target_temp_low: null } }, 21, 0.5), null);
  assert.equal(temperaturePayload({ ...entity, attributes: { ...entity.attributes, target_temp_high: 17 } }, 21, 0.5), null);
  const invalidBounds = { state: 'heat_cool', attributes: { min_temp: 5, max_temp: 10, target_temp_step: 0.5, target_temp_low: 4, target_temp_high: 10 } };
  assert.equal(temperaturePayload(invalidBounds, 7, 0.5), null);
});

test('single target payload uses standard temperature field', () => {
  assert.deepEqual(temperaturePayload({ state: 'heat', attributes: { min_temp: 10, max_temp: 30 } }, 21, 1), { temperature: 21 });
});

test('zero is a valid single target', () => {
  const entity = { state: 'heat', attributes: { min_temp: 0, max_temp: 10, target_temp_step: 1, temperature: 0 } };
  assert.equal(targetModel(entity).available, true);
  assert.deepEqual(temperaturePayload(entity, 0, 1), { temperature: 0 });
});

test('missing or unavailable climate state cannot produce a service payload', () => {
  const attrs = { min_temp: 5, max_temp: 30, temperature: 20 };
  assert.equal(temperaturePayload({ attributes: attrs }, 21, 0.5), null);
  assert.equal(targetModel({ state: 'unavailable', attributes: attrs }).available, false);
});

test('known target remains readable without numeric limits but is not controllable', () => {
  const model = targetModel({ state: 'heat', attributes: { temperature: 21.5, min_temp: null, max_temp: null } });
  assert.equal(model.available, true);
  assert.equal(model.value, 21.5);
  assert.equal(model.controllable, false);
  assert.equal(model.sliderMin, null);
});

test('schedule draft conversion and validation', () => {
  assert.deepEqual(scheduleDraft({ enabled: true, away_temperature: 17, hvac_mode: 'cool', slots: [{ id: 'a', days: [1, 8, 2], start: '07:30', end: '08:00', temperature: 20 }] }), {
    enabled: true, awayTemperature: 17, hvacMode: 'cool', slots: [{ id: 'a', days: [1, 2], start: '07:30', end: '08:00', temperature: 20, range: false, targetTempLow: null, targetTempHigh: null }],
  });
  const draft = scheduleDraft({ slots: [{ id: 'a', days: [1], start: '07:30', end: '08:00', temperature: 20 }] });
  assert.equal(draft.awayTemperature, null);
  assert.equal(draft.hvacMode, null);
  assert.equal(validateScheduleDraft(draft), null);
  assert.match(validateScheduleDraft({ ...draft, enabled: 'true' }), /Invalid schedule/);
  assert.match(validateScheduleDraft({ enabled: true, slots: [] }), /needs at least one slot/);
  assert.equal(validateScheduleDraft({ enabled: false, slots: [] }), null);
  assert.match(validateScheduleDraft({ enabled: false, slots: [{ ...draft.slots[0], end: '07:30' }] }), /start and end/);
  assert.ok(validateScheduleDraft({ slots: [{ ...draft.slots[0], temperature: '' }] }));
});

test('layout normalization accepts the three supported layouts and nothing else', () => {
  assert.equal(normalizeLayout(undefined), 'pill');
  assert.equal(normalizeLayout(null), 'pill');
  assert.equal(normalizeLayout(''), 'pill');
  assert.equal(normalizeLayout('pill'), 'pill');
  assert.equal(normalizeLayout('row'), null);
  assert.equal(normalizeLayout('compact'), 'compact');
  assert.equal(normalizeLayout('circular'), 'circular');
  assert.equal(normalizeLayout('tall'), null);
  assert.equal(defaultCardConfig('climate.living_room').layout, 'pill');
  assert.equal(ClimateFlowCard.getStubConfig({ states: {} }).layout, 'pill');
  assert.equal(getEntitySuggestion({}, 'climate.living_room').config.layout, 'pill');
});

test('program HVAC mode is validated and filtered to schedulable modes', () => {
  const draft = scheduleDraft({ enabled: false, slots: [] });
  for (const hvacMode of [null, '', 'off', 'heat', 'cool', 'auto', 'dry', 'fan_only', 'heat_cool']) {
    assert.equal(validateScheduleDraft({ ...draft, hvacMode }), null, `mode ${String(hvacMode)}`);
  }
  for (const hvacMode of ['banana', true]) {
    assert.match(validateScheduleDraft({ ...draft, hvacMode }), /Unsupported HVAC mode/);
  }
  assert.match(validateScheduleDraft({ ...draft, hvacMode: 'banana' }, cardStrings('it')), /non supportata/);
  // heat_cool joins the list only when the entity exposes it.
  assert.deepEqual(schedulableModes({ attributes: { hvac_modes: ['heat_cool', 'cool', 'heat', 'off'] } }), ['off', 'heat', 'cool', 'heat_cool']);
  assert.deepEqual(schedulableModes({ attributes: { hvac_modes: ['fan_only'] } }), ['fan_only']);
  assert.deepEqual(schedulableModes({ attributes: {} }), ['off', 'heat', 'cool', 'auto', 'dry', 'fan_only', 'heat_cool']);
  assert.deepEqual(schedulableModes(undefined), ['off', 'heat', 'cool', 'auto', 'dry', 'fan_only', 'heat_cool']);
});

test('dual-slot drafts carry the pair through validation and the payload', () => {
  // A heat_cool slot loads as a range and keeps no single temperature around.
  const dual = scheduleDraft({ enabled: true, hvac_mode: 'heat_cool', slots: [{ id: 'day', days: [1, 2], start: '08:00', end: '18:00', target_temp_low: 18, target_temp_high: 22.5 }] });
  assert.deepEqual(dual.slots[0], {
    id: 'day', days: [1, 2], start: '08:00', end: '18:00',
    temperature: null, range: true, targetTempLow: 18, targetTempHigh: 22.5,
  });
  // Exactly one target form goes on the wire, chosen in one place.
  assert.deepEqual(draftSlotPayload(dual.slots[0]), {
    id: 'day', days: [1, 2], start: '08:00', end: '18:00', target_temp_low: 18, target_temp_high: 22.5,
  });
  assert.equal(Object.hasOwn(draftSlotPayload(dual.slots[0]), 'temperature'), false, 'a range slot never carries temperature');
  const single = draftSlotPayload(scheduleDraft({ slots: [{ id: 'a', days: [3, 1], start: '09:00', end: '10:00', temperature: 21 }] }).slots[0]);
  assert.deepEqual(single, { id: 'a', days: [1, 3], start: '09:00', end: '10:00', temperature: 21 });
  assert.equal(Object.hasOwn(single, 'target_temp_low'), false, 'a single slot never carries a pair');
  // String inputs from the number fields are converted, like the old field.
  assert.deepEqual(draftSlotPayload({ ...dual.slots[0], targetTempLow: '18.5', targetTempHigh: '23' }).target_temp_low, 18.5);
  assert.equal(draftSlotPayload({ ...dual.slots[0], targetTempLow: '18.5', targetTempHigh: '23' }).target_temp_high, 23);
});

test('dual-slot draft validation mirrors the backend shape rules', () => {
  const base = { enabled: true, awayTemperature: null, hvacMode: null };
  const range = { id: 'a', days: [1], start: '09:00', end: '10:00', temperature: null, range: true, targetTempLow: 18, targetTempHigh: 22 };
  const single = { ...range, range: false, temperature: 21, targetTempLow: null, targetTempHigh: null };
  assert.equal(validateScheduleDraft({ ...base, slots: [range] }), null, 'a dual slot is valid on its own');
  assert.equal(validateScheduleDraft({ ...base, slots: [single] }), null, 'a single slot is valid on its own');
  assert.match(validateScheduleDraft({ ...base, slots: [single, range] }), /need a program HVAC mode/i, 'mixed programs need an explicit scalar-slot mode');
  assert.equal(validateScheduleDraft({ ...base, hvacMode: 'heat', slots: [single, range] }), null, 'a mixed program uses heat for scalar slots and heat_cool for ranges');
  // Both bounds are required and the low one stays strictly below the high one.
  for (const broken of [
    { ...range, targetTempLow: 22, targetTempHigh: 22 },
    { ...range, targetTempLow: 24, targetTempHigh: 22 },
    { ...range, targetTempLow: '', targetTempHigh: 22 },
    { ...range, targetTempLow: 18, targetTempHigh: null },
    { ...range, targetTempLow: 'warm', targetTempHigh: 22 },
  ]) {
    assert.match(validateScheduleDraft({ ...base, slots: [broken] }), /low temperature must stay below/i);
  }
  // heat_cool has no single temperature: every slot must carry a pair.
  assert.match(validateScheduleDraft({ ...base, hvacMode: 'heat_cool', slots: [single] }), /needs a temperature range in every slot/);
  assert.equal(validateScheduleDraft({ ...base, hvacMode: 'heat_cool', slots: [range] }), null);
  assert.match(validateScheduleDraft({ ...base, hvacMode: 'heat_cool', slots: [single, range] }), /needs a temperature range in every slot/, 'a mixed program under heat_cool is rejected');
  // With the entity known, an enabled program must pair the mode and the shape:
  // the same condition the backend validates on save.
  const heatCoolEntity = { state: 'heat', attributes: { hvac_modes: ['off', 'heat', 'heat_cool'] } };
  assert.equal(validateScheduleDraft({ ...base, slots: [single] }, undefined, heatCoolEntity), null, 'a single slot needs nothing special in heat');
  assert.equal(validateScheduleDraft({ ...base, hvacMode: 'heat', slots: [single, range] }, undefined, heatCoolEntity), null, 'mixed slots switch to heat_cool only for their range');
  assert.match(validateScheduleDraft({ ...base, hvacMode: 'heat', slots: [single, range] }, undefined, { state: 'heat', attributes: { hvac_modes: ['off', 'heat'] } }), /must support heat_cool/i);
  assert.equal(validateScheduleDraft({ ...base, hvacMode: 'off', slots: [range] }, undefined, heatCoolEntity), null, 'off never sends a target');
  assert.match(validateScheduleDraft({ ...base, hvacMode: 'heat', slots: [range] }, undefined, heatCoolEntity), /needs heat_cool: change the program mode/);
  assert.equal(validateScheduleDraft({ ...base, hvacMode: 'heat_cool', slots: [single] }, undefined, heatCoolEntity), 'heat_cool needs a temperature range in every slot.');
  assert.equal(validateScheduleDraft({ ...base, hvacMode: 'heat_cool', slots: [range] }, undefined, heatCoolEntity), null, 'heat_cool with pairs saves');
  // An entity already in heat_cool pairs the same way through its own state.
  const liveDual = { state: 'heat_cool', attributes: { hvac_modes: ['off', 'heat_cool'] } };
  assert.match(validateScheduleDraft({ ...base, slots: [single] }, undefined, liveDual), /needs a temperature range in every slot/);
  assert.equal(validateScheduleDraft({ ...base, slots: [range] }, undefined, liveDual), null);
  // A disabled program is only checked on enable, like the backend.
  assert.equal(validateScheduleDraft({ ...base, enabled: false, hvacMode: 'heat', slots: [range] }, undefined, heatCoolEntity), null);
  assert.equal(validateScheduleDraft({ ...base, enabled: false, slots: [single, range] }), null, 'a disabled mixed program can be configured before it is enabled');
  // An unavailable entity cannot be paired against anything at save time.
  assert.equal(validateScheduleDraft({ ...base, hvacMode: 'heat', slots: [range] }, undefined, { state: 'unavailable', attributes: {} }), null);
  // The Italian strings answer the same rules.
  assert.match(validateScheduleDraft({ ...base, slots: [{ ...range, targetTempLow: 24 }] }, cardStrings('it')), /sotto quella alta/);
  assert.match(validateScheduleDraft({ ...base, hvacMode: 'heat_cool', slots: [single] }, cardStrings('it')), /intervallo di temperatura/);
});

test('seeding a range from a single value stays on the grid and inside limits', () => {
  assert.deepEqual(seedRange(21, 0.5, 5, 30), { low: 21, high: 21.5 }, 'one step above the value it came from');
  assert.deepEqual(seedRange(30, 0.5, 5, 30), { low: 29.5, high: 30 }, 'room for the high bound at the maximum');
  assert.deepEqual(seedRange(5, 0.5, 5, 30), { low: 5, high: 5.5 }, 'the minimum is a valid low bound');
  assert.deepEqual(seedRange(null, 0.5, 5, 30), { low: 5, high: 5.5 }, 'without a value start from the minimum');
  assert.deepEqual(seedRange(21, 1, 5, 30), { low: 21, high: 22 }, 'the entity step drives the gap');
  assert.deepEqual(seedRange(21, null, 5, 30), { low: 21, high: 21.5 }, 'an unusable step falls back to half a degree');
});

test('the schedule dialog wires the range toggle, the pair fields and the payload', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  // The toggle only appears where heat_cool exists, but an already dual slot
  // keeps it so the user can go back to one temperature.
  assert.match(source, /const rangeCapable = schedulableModes\(entity\)\.includes\('heat_cool'\)/);
  assert.match(source, /if \(rangeCapable \|\| slot\.range\)/);
  assert.match(source, /rangeInput\.addEventListener\('change'/);
  // Switching on seeds a pair (live range when the entity has one), switching
  // off reuses the low bound, which is already on the entity grid.
  assert.match(source, /slot\.targetTempLow = liveLow; slot\.targetTempHigh = liveHigh;/);
  assert.match(source, /seedRange\(slot\.temperature, effectiveStep\(entity, this\.config\.step\)/);
  assert.match(source, /slot\.temperature = numeric\(slot\.targetTempLow\)/);
  // The slot fields render one shape or the other, never both.
  assert.match(source, /if \(slot\.range\) entries\.push\(\['targetTempLow', t\.targetLowField, 'number'\], \['targetTempHigh', t\.targetHighField, 'number'\]\)/);
  assert.match(source, /else entries\.push\(\['temperature', t\.targetField, 'number'\]\)/);
  // Save goes through the single payload builder and validates with the entity.
  assert.match(source, /slots: this\._scheduleDraft\.slots\.map\(draftSlotPayload\)/);
  assert.match(source, /validateScheduleDraft\(this\._scheduleDraft, t, entity\)/);
  assert.doesNotMatch(source, /temperature: Number\(s\.temperature\)/, 'the inline single-shape payload is gone');
});

test('outside-schedule temperature validation and payload', () => {
  const draft = scheduleDraft({ enabled: false, slots: [] });
  for (const awayTemperature of [17, 17.5, '17.5', '', '   ', null, undefined]) {
    assert.equal(validateScheduleDraft({ ...draft, awayTemperature }), null, `away ${String(awayTemperature)}`);
  }
  for (const awayTemperature of ['warm', 'NaN', {}]) {
    assert.match(validateScheduleDraft({ ...draft, awayTemperature }), /outside-schedule temperature/i);
  }
  const heatCoolRange = { id: 'range', days: [1], start: '09:00', end: '10:00', range: true, targetTempLow: 18, targetTempHigh: 22 };
  assert.equal(
    validateScheduleDraft({ enabled: false, awayTemperature: 17, hvacMode: 'heat_cool', slots: [heatCoolRange] }),
    null,
    'a disabled program can retain a draft outside target until it is enabled',
  );
  assert.match(
    validateScheduleDraft({ enabled: true, awayTemperature: 17, hvacMode: 'heat_cool', slots: [heatCoolRange] }),
    /outside-schedule temperature is a single target/i,
  );
  assert.match(
    validateScheduleDraft({ enabled: true, awayTemperature: 17, hvacMode: null, slots: [heatCoolRange] }, undefined, { state: 'heat_cool', attributes: { hvac_modes: ['off', 'heat_cool'] } }),
    /outside-schedule temperature is a single target/i,
  );
  assert.equal(awayTemperaturePayload(17), 17);
  assert.equal(awayTemperaturePayload('17.5'), 17.5);
  for (const empty of ['', '   ', null, undefined, 'unknown']) assert.equal(awayTemperaturePayload(empty), null);
});

test('pill schedule pill is a sibling of temperature controls in markup', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const pillSection = source.slice(source.indexOf('  _renderPill() {'), source.indexOf('  _renderCompact() {'));
  assert.match(pillSection, /<div class="controls"><\/div><button class="schedule"/);
  assert.doesNotMatch(pillSection, /controls\.append\(schedule\)/);
});

test('climate active state distinguishes running modes from off and unavailable', () => {
  assert.equal(isClimateActive({ state: 'heat' }), true);
  assert.equal(isClimateActive({ state: 'cool' }), true);
  assert.equal(isClimateActive('heat'), true);
  assert.equal(isClimateActive({ state: 'off' }), false);
  assert.equal(isClimateActive({ state: 'unavailable' }), false);
  assert.equal(isClimateActive({ state: 'unknown' }), false);
  assert.equal(isClimateActive({}), false);
  assert.equal(isClimateActive(null), false);
});

test('schedule enabled helper tracks the program enabled flag only', () => {
  assert.equal(isScheduleEnabled({ enabled: true }), true);
  assert.equal(isScheduleEnabled({ enabled: false }), false);
  assert.equal(isScheduleEnabled({ enabled: true, slots: [{ id: 'a' }], active_slot_id: null }), true);
  assert.equal(isScheduleEnabled({ enabled: false, active_slot_id: 'a' }), false);
  assert.equal(isScheduleEnabled({}), false);
  assert.equal(isScheduleEnabled(undefined), false);
  assert.equal(isScheduleEnabled(null), false);
});

test('status key prefers hvac_action and labels stay readable', () => {
  assert.equal(climateStatusKey({ state: 'heat', attributes: { hvac_action: 'heating' } }), 'heating');
  assert.equal(climateStatusKey({ state: 'heat', attributes: {} }), 'heat');
  assert.equal(climateStatusKey({ state: 'off', attributes: { hvac_action: 'off' } }), 'off');
  assert.equal(statusLabel('heating'), 'Heating');
  assert.equal(statusLabel('cooling'), 'Cooling');
  assert.equal(statusLabel('off'), 'Off');
  assert.equal(statusLabel('heat_cool'), 'Heat / cool');
  assert.equal(statusLabel('custom_mode'), 'Custom mode');
  assert.equal(statusLabel(''), '');
  assert.equal(statusLabel(null), '');
});

test('UI strings follow the Home Assistant locale with an English fallback', () => {
  assert.equal(resolveLanguage('it'), 'it');
  assert.equal(resolveLanguage('it-IT'), 'it');
  assert.equal(resolveLanguage('IT-it'), 'it');
  assert.equal(resolveLanguage('en-US'), 'en');
  assert.equal(resolveLanguage('de'), 'en');
  assert.equal(resolveLanguage(undefined), 'en');
  assert.equal(resolveLanguage(null), 'en');
  assert.equal(cardStrings('it').saveProgram, 'Salva programma');
  assert.equal(cardStrings('it').toggleHeating, 'Tocca lo sfondo della scheda per alternare riscaldamento e spento');
  assert.equal(cardStrings('it').temperatureControls, 'Controlli temperatura');
  assert.equal(cardStrings('it').dontChange, 'Non cambiare');
  assert.equal(cardStrings('en').badMode, 'Unsupported HVAC mode.');
  assert.equal(cardStrings('it-IT').outsideSchedule, 'Fuori orario');
  assert.equal(cardStrings('de').saveProgram, 'Save program');
  assert.deepEqual(cardStrings('it').dayPills, ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']);
  assert.deepEqual(cardStrings('en').dayPills, ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
  assert.equal(modeLabel('heat', cardStrings('it')), 'Caldo');
  assert.equal(modeLabel('heat'), 'Heat');
  assert.equal(modeLabel('fan_only', cardStrings('it')), 'Solo ventilazione');
  assert.equal(statusLabel('heating', cardStrings('it')), 'Riscaldamento');
  assert.equal(statusLabel('heating'), 'Heating');
  assert.equal(fieldLabel(cardStrings('it'), 'entity'), 'Entità climate');
  assert.equal(fieldLabel(cardStrings('it'), 'unknown_field'), 'unknown field');
  assert.match(validateScheduleDraft(scheduleDraft({ enabled: true, slots: [] }), cardStrings('it')), /almeno una fascia/);
  assert.match(validateScheduleDraft(scheduleDraft({ enabled: true, slots: [] })), /needs at least one slot/);
});

test('schedule day pills use unique short labels while aria-labels stay complete', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  for (const language of ['en', 'it']) {
    const strings = cardStrings(language);
    assert.equal(strings.dayPills.length, 7, `${language} pill labels`);
    assert.equal(strings.dayNames.length, 7, `${language} day names`);
    assert.equal(new Set(strings.dayPills).size, 7, `${language} pill labels must be unique`);
    assert.equal(new Set(strings.dayNames).size, 7, `${language} day names must be unique`);
    for (const pill of strings.dayPills) assert.equal(pill.length, 2, `${language} pill "${pill}" stays two letters`);
    for (const name of strings.dayNames) assert.ok(name.length > 2, `${language} name "${name}" stays a full day name`);
    for (const pill of strings.dayPills) assert.equal(strings.dayNames.includes(pill), false, `${language} pill "${pill}" is not an accessible name`);
    // First letters alone collide (Mar/Mer, Tue/Thu, Sat/Sun), which is why
    // the pill text no longer derives from them.
    assert.ok(new Set(strings.dayNames.map((name) => name[0])).size < 7, `${language} full names collide on their first letter`);
  }
  assert.doesNotMatch(source, /pill\.textContent = day\[0\]/);
  assert.doesNotMatch(source, /t\.days\.forEach/);
  assert.match(source, /t\.dayNames\.forEach\(\(name, i\) =>/);
  assert.match(source, /pill\.textContent = t\.dayPills\[i\]/);
  // The checkbox keeps the complete accessible name and its ISO weekday.
  assert.match(source, /cb\.setAttribute\('aria-label', name\)/);
  assert.match(source, /cb\.checked = slot\.days\.includes\(i \+ 1\)/);
  assert.match(source, /\[\.\.\.slot\.days, i \+ 1\]/);
  assert.match(source, /slot\.days\.filter\(\(x\) => x !== i \+ 1\)/);
});

test('relative time uses last change before last update and stays short', () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  assert.equal(formatRelativeTime('2026-10-12T11:59:40Z', now), 'just now');
  assert.equal(formatRelativeTime('2026-10-12T11:55:00Z', now), '5 min ago');
  assert.equal(formatRelativeTime('2026-10-12T10:00:00Z', now), '2 h ago');
  assert.equal(formatRelativeTime('2026-10-09T12:00:00Z', now), '3 d ago');
  assert.equal(formatRelativeTime('not-a-date', now), '');
  assert.equal(formatRelativeTime(null, now), '');
  assert.equal(pickEntityTimestamp({ last_changed: '2026-10-12T11:00:00Z', last_updated: '2026-10-12T11:59:00Z' }), '2026-10-12T11:00:00Z');
  assert.equal(pickEntityTimestamp({ last_updated: '2026-10-12T11:59:00Z' }), '2026-10-12T11:59:00Z');
  assert.equal(pickEntityTimestamp({ last_changed: 'bad', last_updated: 'also-bad' }), null);
  assert.equal(pickEntityTimestamp({}), null);
});

test('relative refresh is scheduled at the next visible time boundary', () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  assert.equal(relativeRefreshDelay('2026-10-12T11:59:30Z', now, 'en'), 500, 'localized seconds update at the next rounded second');
  assert.equal(relativeRefreshDelay('2026-10-12T11:58:30Z', now, 'en'), 29_500, 'localized minutes update at the next minute');
  assert.equal(relativeRefreshDelay('2026-10-12T11:59:20Z', now, ''), 4_500, 'the English fallback refreshes when just now changes');
  assert.equal(relativeRefreshDelay('2026-10-12T12:00:01Z', now, 'en'), 5_500, 'future timestamps refresh after the now label changes');
  assert.equal(relativeRefreshDelay('not-a-date', now, 'en'), null);
});

test('relative time localizes with hass locale through Intl', (t) => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const RealRtf = globalThis.Intl.RelativeTimeFormat;
  const seen = [];
  class FakeRtf {
    constructor(locale, options) { seen.push([locale, options]); }
    format(value, unit) {
      const abs = Math.abs(value);
      if (value === 0 && unit === 'second') return 'ora';
      if (unit === 'second') return `${abs} secondi fa`;
      if (unit === 'minute') return abs === 1 ? '1 minuto fa' : `${abs} minuti fa`;
      if (unit === 'hour') return abs === 1 ? '1 ora fa' : `${abs} ore fa`;
      return abs === 1 ? '1 giorno fa' : `${abs} giorni fa`;
    }
  }
  globalThis.Intl.RelativeTimeFormat = FakeRtf;
  t.after(() => { globalThis.Intl.RelativeTimeFormat = RealRtf; });
  assert.equal(formatRelativeTime('2026-10-12T11:59:17Z', now, 'it-IT'), '43 secondi fa');
  assert.equal(formatRelativeTime('2026-10-12T11:59:00Z', now, 'it-IT'), '1 minuto fa');
  assert.equal(formatRelativeTime('2026-10-12T10:00:00Z', now, 'it-IT'), '2 ore fa');
  assert.equal(formatRelativeTime('2026-10-09T12:00:00Z', now, 'it-IT'), '3 giorni fa');
  assert.equal(formatRelativeTime('2026-10-12T11:59:58Z', now, 'it-IT'), 'ora');
  assert.equal(formatRelativeTime('not-a-date', now, 'it-IT'), '');
  assert.equal(formatRelativeTime(null, now, 'it-IT'), '');
  assert.ok(seen.length >= 5);
  for (const [locale, options] of seen) {
    assert.equal(locale, 'it-IT');
    assert.deepEqual(options, { numeric: 'auto' });
  }
});

test('relative time falls back to short English without locale or Intl', (t) => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  assert.equal(formatRelativeTime('2026-10-12T11:59:17Z', now, ''), 'just now');
  assert.equal(formatRelativeTime('2026-10-12T11:59:17Z', now), 'just now');
  const RealIntl = globalThis.Intl;
  globalThis.Intl = undefined;
  t.after(() => { globalThis.Intl = RealIntl; });
  assert.equal(formatRelativeTime('2026-10-12T11:59:17Z', now, 'it-IT'), 'just now');
  assert.equal(formatRelativeTime('2026-10-12T11:55:00Z', now, 'it-IT'), '5 min ago');
  assert.equal(formatRelativeTime('2026-10-12T10:00:00Z', now, 'it-IT'), '2 h ago');
  assert.equal(formatRelativeTime('2026-10-09T12:00:00Z', now, 'it-IT'), '3 d ago');
});

test('pill numbers localize with hass locale while compact keeps raw output', (t) => {
  // Without a locale the helper follows the system default locale, so the
  // expectation must be derived rather than hardcoded as '20.5' (a machine
  // with an Italian default would render '20,5').
  assert.equal(formatNumber(20.5), new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(20.5));
  assert.equal(formatNumber(20), new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(20));
  assert.equal(formatNumber('20.5'), new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(20.5));
  assert.equal(formatNumber(null), '');
  assert.equal(formatNumber('unknown'), '');
  const RealNf = globalThis.Intl.NumberFormat;
  const seen = [];
  class FakeNf {
    constructor(locale, options) { seen.push([locale, options]); this.locale = locale; }
    format(n) {
      if (this.locale === 'it-IT') return String(n).replace('.', ',');
      return String(n);
    }
  }
  globalThis.Intl.NumberFormat = FakeNf;
  t.after(() => { globalThis.Intl.NumberFormat = RealNf; });
  assert.equal(formatNumber(20.5, 'it-IT'), '20,5');
  assert.equal(formatNumber(20.25, 'it-IT'), '20,25');
  assert.equal(formatNumber(20.5, 'en'), '20.5');
  assert.ok(seen.some(([locale, options]) => locale === 'it-IT' && options?.maximumFractionDigits === 2));
});

test('pill status parts keep humidity independent of the state chip', (t) => {
  assert.deepEqual(
    pillStatusParts({ statusText: 'Heating', humidityValue: 55, relativeText: '2 h ago', showStateChip: true, showHumidityChip: true }),
    ['Heating', '55%', '2 h ago'],
  );
  assert.deepEqual(
    pillStatusParts({ statusText: 'Heating', humidityValue: 55, relativeText: '2 h ago', showStateChip: false, showHumidityChip: true }),
    ['55%'],
  );
  assert.deepEqual(
    pillStatusParts({ statusText: 'Heating', humidityValue: 55, relativeText: '2 h ago', showStateChip: false, showHumidityChip: false }),
    [],
  );
  assert.deepEqual(
    pillStatusParts({ statusText: '', humidityValue: null, relativeText: '', showStateChip: true, showHumidityChip: true }),
    [],
  );
  assert.deepEqual(
    pillStatusParts({ statusText: 'Heating', humidityValue: null, relativeText: '2 h ago', showStateChip: true, showHumidityChip: true }),
    ['Heating', '2 h ago'],
  );
  const RealNf = globalThis.Intl.NumberFormat;
  class FakeNf {
    constructor(locale) { this.locale = locale; }
    format(n) {
      if (this.locale === 'it-IT') return String(n).replace('.', ',');
      return String(n);
    }
  }
  globalThis.Intl.NumberFormat = FakeNf;
  t.after(() => { globalThis.Intl.NumberFormat = RealNf; });
  assert.deepEqual(
    pillStatusParts({ statusText: 'Heating', humidityValue: 20.5, relativeText: '', showStateChip: false, showHumidityChip: true, locale: 'it-IT' }),
    ['20,5%'],
  );
});

test('pill shadow CSS scopes a hidden rule to .pill (static presence check, no rendering)', () => {
  // No DOM available here, so verify the pill shadow CSS statically: an
  // explicit `.pill [hidden]` rule must beat the author `.current`/`.controls`
  // display declarations (which otherwise override the UA `[hidden] none`).
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const pillStart = source.indexOf('  _renderPill() {');
  const compactStart = source.indexOf('  _renderCompact() {');
  assert.ok(pillStart !== -1 && compactStart !== -1 && pillStart < compactStart);
  const pillSection = source.slice(pillStart, compactStart);
  assert.match(pillSection, /\.pill\s*\[hidden\][^{]*\{[^}]*display\s*:\s*none\s*!important/);
  const compactSection = source.slice(compactStart);
  assert.doesNotMatch(compactSection, /\.pill\s*\[hidden\]/);
});

test('calendar button accent CSS exists per layout (static presence check, no rendering)', () => {
  // The calendar button is tinted with the same accent used by the active
  // current-temperature chip when the schedule program is enabled; verify the
  // rule is present and scoped in both layouts without rendering.
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const pillStart = source.indexOf('  _renderPill() {');
  const compactStart = source.indexOf('  _renderCompact() {');
  assert.ok(pillStart !== -1 && compactStart !== -1 && pillStart < compactStart);
  const pillSection = source.slice(pillStart, compactStart);
  const compactSection = source.slice(compactStart);
  assert.match(pillSection, /\.schedule\[data-active="true"\][^{]*\{[^}]*var\(--climate-flow-accent-color,var\(--primary-color\)\)/);
  assert.match(compactSection, /\.head \.schedule\[data-active="true"\][^{]*\{[^}]*var\(--climate-flow-accent-color,var\(--primary-color\)\)/);
  assert.match(pillSection, /schedule\.dataset\.active = scheduleActive/);
  assert.match(compactSection, /schedule\.dataset\.active = scheduleActive/);
});

const fakeRegistry = (entries = {}) => {
  // Minimal stand-in for CustomElementRegistry used without a DOM: it enforces
  // only duplicate-name and constructor-type checks. Unlike the native
  // registry it cannot validate custom-element construction steps or DOM Node
  // constraints, since no DOM Node exists in this harness.
  const store = new Map(Object.entries(entries));
  return {
    store,
    get(tag) { return store.get(tag); },
    define(tag, ctor) {
      if (typeof ctor !== 'function') throw new TypeError('Custom element constructor must be a function');
      if (store.has(tag)) throw new Error(`"${tag}" has already been defined`);
      store.set(tag, ctor);
    },
  };
};

const fakeTimers = () => {
  let nextId = 1;
  const pending = new Map();
  const cleared = [];
  return {
    pending,
    cleared,
    schedule(fn) { const id = nextId++; pending.set(id, fn); return id; },
    clear(id) { cleared.push(id); pending.delete(id); },
  };
};

const withBrowserStubs = (t, { registry, win } = {}) => {
  const prevElements = globalThis.customElements;
  const prevHTMLElement = globalThis.HTMLElement;
  const prevWindow = globalThis.window;
  class FakeHTMLElement {}
  globalThis.customElements = registry ?? fakeRegistry();
  globalThis.HTMLElement = FakeHTMLElement;
  globalThis.window = win ?? {};
  t.after(() => {
    if (prevElements === undefined) delete globalThis.customElements;
    else globalThis.customElements = prevElements;
    if (prevHTMLElement === undefined) delete globalThis.HTMLElement;
    else globalThis.HTMLElement = prevHTMLElement;
    if (prevWindow === undefined) delete globalThis.window;
    else globalThis.window = prevWindow;
  });
  return FakeHTMLElement;
};

test('card registration is idempotent in the same registry', (t) => {
  const registry = fakeRegistry();
  const win = { customCards: [] };
  withBrowserStubs(t, { registry, win });
  assert.equal(registerClimateFlowElements(), true);
  assert.equal(registerClimateFlowElements(), true);
  assert.equal(registry.get(CLIMATE_FLOW_CARD_TAG), ClimateFlowCard);
  assert.equal(registry.get(CLIMATE_FLOW_CARD_EDITOR_TAG), ClimateFlowCardEditor);
  assert.equal(registry.get(CLIMATE_FLOW_CARD_TAG), ClimateFlowCard);
  assert.equal(registry.get(CLIMATE_FLOW_CARD_EDITOR_TAG), ClimateFlowCardEditor);
  assert.equal(isClimateFlowElementsRegistered(), true);
  assert.equal(win.customCards.filter((card) => card?.type === 'climate-flow-card').length, 1);
  const [entry] = win.customCards.filter((card) => card?.type === 'climate-flow-card');
  assert.equal(entry.preview, true);
  assert.equal(entry.documentationURL, 'https://github.com/kerdx/climate-flow-card');
  assert.deepEqual(entry.getEntitySuggestion({}, 'climate.living_room'), {
    config: { type: 'custom:climate-flow-card', ...defaultCardConfig('climate.living_room') },
  });
});

test('window.customCards entry is preserved without customElements', (t) => {
  const prevElements = globalThis.customElements;
  const prevHTMLElement = globalThis.HTMLElement;
  const prevWindow = globalThis.window;
  const win = { customCards: [] };
  delete globalThis.customElements;
  delete globalThis.HTMLElement;
  globalThis.window = win;
  t.after(() => {
    if (prevElements === undefined) delete globalThis.customElements;
    else globalThis.customElements = prevElements;
    if (prevHTMLElement === undefined) delete globalThis.HTMLElement;
    else globalThis.HTMLElement = prevHTMLElement;
    if (prevWindow === undefined) delete globalThis.window;
    else globalThis.window = prevWindow;
  });
  assert.equal(registerClimateFlowElements(), false);
  assert.equal(registerClimateFlowElements(), false);
  assert.equal(win.customCards.filter((card) => card?.type === 'climate-flow-card').length, 1);
});

test('card re-registers in a replaced scoped registry once the frontend is ready', (t) => {
  const win = { customCards: [] };
  const nativeRegistry = fakeRegistry();
  withBrowserStubs(t, { registry: nativeRegistry, win });
  assert.equal(registerClimateFlowElements(), true);
  assert.equal(nativeRegistry.get(CLIMATE_FLOW_CARD_TAG), ClimateFlowCard);
    // Scoped polyfill replaces window.customElements: fresh registry that only
  // knows the app bundle element, reproducing customElements.get(card) holes.
  class HomeAssistantElement {}
  const scopedRegistry = fakeRegistry({ 'home-assistant': HomeAssistantElement });
  globalThis.customElements = scopedRegistry;
  assert.equal(isHomeAssistantFrontendReady(), true);
  assert.equal(scopedRegistry.get('climate-flow-card'), undefined);
  assert.equal(registerClimateFlowElements(), true);
  assert.equal(scopedRegistry.get(CLIMATE_FLOW_CARD_TAG), ClimateFlowCard);
  assert.equal(scopedRegistry.get(CLIMATE_FLOW_CARD_EDITOR_TAG), ClimateFlowCardEditor);
      assert.equal(isClimateFlowElementsRegistered(), true);
  assert.equal(win.customCards.filter((card) => card?.type === 'climate-flow-card').length, 1);
  assert.equal(nativeRegistry.get(CLIMATE_FLOW_CARD_TAG), ClimateFlowCard);
  });

test('deferred poll registers queued attempt in the live scoped registry', (t) => {
  const win = { customCards: [] };
  withBrowserStubs(t, { registry: fakeRegistry(), win });
  assert.equal(isHomeAssistantFrontendReady(), false);
  const timers = fakeTimers();
  const warnings = [];
  const cancel = scheduleClimateFlowReregistration({
    intervalMs: 1, maxAttempts: 5,
    schedule: timers.schedule, clear: timers.clear, warn: (message) => warnings.push(String(message)),
  });
  assert.equal(typeof cancel, 'function');
  assert.equal(timers.pending.size, 1);
  const [queuedId] = [...timers.pending.keys()];
  // Scoped polyfill swaps the registry while the poll is pending: the new live
  // registry already contains home-assistant but lost our tags.
  class HomeAssistantElement {}
  const scopedRegistry = fakeRegistry({ 'home-assistant': HomeAssistantElement });
  globalThis.customElements = scopedRegistry;
  assert.equal(isHomeAssistantFrontendReady(), true);
  const queuedPoll = timers.pending.get(queuedId);
  assert.equal(typeof queuedPoll, 'function');
  timers.pending.delete(queuedId);
  queuedPoll();
  assert.equal(scopedRegistry.get(CLIMATE_FLOW_CARD_TAG), ClimateFlowCard);
  assert.equal(scopedRegistry.get(CLIMATE_FLOW_CARD_EDITOR_TAG), ClimateFlowCardEditor);
    assert.equal(isClimateFlowElementsRegistered(), true);
  assert.equal(timers.pending.size, 0);
  assert.equal(warnings.length, 0);
  cancel();
});

test('ready poll retries until the bounded limit when verification keeps failing', (t) => {
  const win = { customCards: [] };
  class HomeAssistantElement {}
  // Registry reports the frontend as ready but silently drops our tags, so
  // every register() attempt leaves verification false without throwing.
  const store = new Map([['home-assistant', HomeAssistantElement]]);
  const refusingRegistry = {
    store,
    get(tag) { return store.get(tag); },
    define(tag, ctor) {
      if (typeof ctor !== 'function') throw new TypeError('Custom element constructor must be a function');
      if (tag === 'home-assistant') {
        if (!store.has(tag)) store.set(tag, ctor);
        return;
      }
    },
  };
  withBrowserStubs(t, { registry: refusingRegistry, win });
  assert.equal(isHomeAssistantFrontendReady(), true);
  const timers = fakeTimers();
  const warnings = [];
  scheduleClimateFlowReregistration({
    intervalMs: 1, maxAttempts: 2,
    schedule: timers.schedule, clear: timers.clear, warn: (message) => warnings.push(String(message)),
  });
  assert.equal(timers.pending.size, 1);
  assert.equal(isClimateFlowElementsRegistered(), false);
  const first = [...timers.pending.values()][0];
  timers.pending.clear();
  first();
  assert.equal(timers.pending.size, 1);
  assert.equal(isClimateFlowElementsRegistered(), false);
  const second = [...timers.pending.values()][0];
  timers.pending.clear();
  second();
  assert.equal(timers.pending.size, 0);
  assert.equal(isClimateFlowElementsRegistered(), false);
  assert.equal(warnings.length, 1);
});

test('define failure in poll surfaces once and stops polling without uncaught', (t) => {
  const win = { customCards: [] };
  withBrowserStubs(t, { registry: fakeRegistry(), win });
  assert.equal(isHomeAssistantFrontendReady(), false);
  const timers = fakeTimers();
  const warnings = [];
  scheduleClimateFlowReregistration({
    intervalMs: 1, maxAttempts: 5,
    schedule: timers.schedule, clear: timers.clear, warn: (message) => warnings.push(String(message)),
  });
  assert.equal(timers.pending.size, 1);
  const [queuedId] = [...timers.pending.keys()];
  // Scoped swap delivers a live registry that reports the frontend as ready
  // but throws deterministically when defining the card tag.
  class HomeAssistantElement {}
  const store = new Map([['home-assistant', HomeAssistantElement]]);
  const throwingRegistry = {
    get(tag) { return store.get(tag); },
    define(tag, ctor) {
      if (tag === CLIMATE_FLOW_CARD_TAG) throw new TypeError('invalid constructor');
      if (typeof ctor !== 'function') throw new TypeError('Custom element constructor must be a function');
      if (!store.has(tag)) store.set(tag, ctor);
    },
  };
  globalThis.customElements = throwingRegistry;
  assert.equal(isHomeAssistantFrontendReady(), true);
  const queuedPoll = timers.pending.get(queuedId);
  assert.equal(typeof queuedPoll, 'function');
  timers.pending.delete(queuedId);
  assert.doesNotThrow(queuedPoll);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /failed to register custom elements/);
  assert.match(warnings[0], /invalid constructor/);
  assert.equal(timers.pending.size, 0);
  assert.equal(isClimateFlowElementsRegistered(), false);
});

test('cancel clears a pending poll before it runs', (t) => {
  const win = { customCards: [] };
  withBrowserStubs(t, { registry: fakeRegistry(), win });
  assert.equal(isHomeAssistantFrontendReady(), false);
  const timers = fakeTimers();
  const warnings = [];
  let ran = 0;
  const originalSchedule = timers.schedule;
  const cancel = scheduleClimateFlowReregistration({
    intervalMs: 1, maxAttempts: 5,
    schedule: (fn, ms) => originalSchedule(() => { ran += 1; fn(); }, ms),
    clear: timers.clear,
    warn: (message) => warnings.push(String(message)),
  });
  assert.equal(timers.pending.size, 1);
  const [timerId] = [...timers.pending.keys()];
  cancel();
  assert.deepEqual(timers.cleared, [timerId]);
  assert.equal(timers.pending.size, 0);
  assert.equal(ran, 0);
  cancel();
  assert.equal(timers.cleared.length, 1);
  assert.equal(warnings.length, 0);
});

test('HVAC card toggle only requests supported heat/off modes', () => {
 assert.equal(hvacToggleMode({state:'off',attributes:{hvac_modes:['off','heat']}}),'heat');
 assert.equal(hvacToggleMode({state:'heat',attributes:{hvac_modes:['off','heat']}}),'off');
 assert.equal(hvacToggleMode({state:'off',attributes:{hvac_modes:['off']}}),null);
 assert.equal(hvacToggleMode({state:'heat',attributes:{hvac_modes:['heat']}}),null);
 assert.equal(hvacToggleMode({state:'unavailable',attributes:{hvac_modes:['heat','off']}}),null);
 assert.equal(hvacToggleMode({state:'unknown',attributes:{hvac_modes:['heat','off']}}),null);
});

test('card tap excludes controls and target updates optimistically with service rerender', () => {
 const source=readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url),'utf8');
 assert.match(source,/role="group" aria-label="Tap card background to toggle heating"/);
 assert.doesNotMatch(source,/ha-card tabindex="0" role="button"/);
 assert.match(source,/path\.some\(node=>node!==card[\s\S]*?node\?\.matches\?\.\('button,input,select,textarea,a,\[role="slider"\],\[role="button"\],\[role="group"\]'\)/);
 assert.match(source,/node!==card && node\?\.matches\?\./);
 assert.match(source,/ev\.key==='Enter'\|\|ev\.key===' '/);
 assert.match(source,/\.slider'\)\?\.addEventListener\('change'/);
 assert.doesNotMatch(source,/\.slider'\)\?\.addEventListener\('input',[^;]*_setTemperature/);
 assert.match(source,/this\._optimistic=\{entityId:this\.config\.entity,payload\}/);
 assert.match(source,/this\._renderPreservingDeltaFocus\(\); this\._optimisticTimer=setTimeout/);
 assert.match(source,/Promise\.resolve\(\)\.then\(\(\)=>this\._hass\?\.callService\('climate','set_temperature'/);
 assert.match(source,/if\(this\._optimistic===seq\)\{clearTimeout\(this\._optimisticTimer\);this\._optimistic=null;this\._renderPreservingDeltaFocus\(\);\}/);
 assert.match(source,/catch\(\(\)=>/);
});

test('optimistic target model uses the service payload for single and dual targets', () => {
 const single={state:'heat',attributes:{temperature:20,min_temp:5,max_temp:30,target_temp_step:1}};
 const payload=temperaturePayload(single,22,0.5); assert.deepEqual(payload,{temperature:22});
 assert.equal(targetModel({...single,attributes:{...single.attributes,...payload}}).value,22);
 const dual={state:'heat_cool',attributes:{target_temp_low:18,target_temp_high:22,min_temp:5,max_temp:30,target_temp_step:1}};
 const dualPayload=temperaturePayload(dual,23,0.5); assert.deepEqual(dualPayload,{target_temp_low:21,target_temp_high:25});
 assert.deepEqual([targetModel({...dual,attributes:{...dual.attributes,...dualPayload}}).low,targetModel({...dual,attributes:{...dual.attributes,...dualPayload}}).high],[21,25]);
});

test('every card rebuild restores focus on an active +/- delta and never steals it', async (t) => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');

  // Static wiring: all rebuild paths go through the same wrapper, and the
  // hass gate avoids rebuilding the DOM when nothing displayed has changed.
  assert.match(source, /const signature = this\._renderSignature\(\);\s+if \(signature === this\._renderedSignature && this\.shadowRoot\) \{\s+this\._scheduleRelativeRefresh\(\);\s+return;\s+\}\s+this\._renderedSignature = signature;\s+this\._renderPreservingDeltaFocus\(\);/);
  const cardStart = source.indexOf('export class ClimateFlowCard extends');
  const configStart = source.indexOf('  setConfig(config) {', cardStart);
  const hassStart = source.indexOf('  set hass(hass)', configStart);
  assert.ok(configStart !== -1 && hassStart > configStart, 'card config setter exists');
  assert.match(source.slice(configStart, hassStart), /this\._renderPreservingDeltaFocus\(\)/);
  assert.match(source, /this\._optimistic=\{entityId:this\.config\.entity,payload\}; this\._renderPreservingDeltaFocus\(\); this\._optimisticTimer=setTimeout/);
  assert.match(source, /this\._optimisticTimer=setTimeout\(\(\)=>\{this\._optimistic=null;this\._optimisticTimer=null;this\._renderPreservingDeltaFocus\(\);\},8000\)/);
  assert.match(source, /if\(this\._optimistic===seq\)\{clearTimeout\(this\._optimisticTimer\);this\._optimistic=null;this\._renderPreservingDeltaFocus\(\);\}/);
  // The wrapper captures the delta before the swap and restores it after it.
  const wrapStart = source.indexOf('_renderPreservingDeltaFocus() {');
  assert.ok(wrapStart !== -1, 'wrapper exists');
  const wrap = source.slice(wrapStart, source.indexOf('_setTemperature(', wrapStart));
  const capture = wrap.indexOf('const delta = this._focusedDelta();');
  const rebuild = wrap.indexOf('this._render();');
  const restore = wrap.indexOf('this._restoreDeltaFocus(delta);');
  assert.ok(capture !== -1 && rebuild !== -1 && restore !== -1, 'capture, render and restore all present');
  assert.ok(capture < rebuild && rebuild < restore, 'capture happens before the render and restore after it');
  assert.match(source, /activeElement\?\.dataset\?\.delta/);
  assert.match(source, /root\.querySelector\(`\[data-delta="\$\{delta\}"\]`\)\?\.focus\?\.\(\)/);

  // Behavioural checks without a DOM: a fake shadow root records every step.
  const delta = { dataset: { delta: '-0.5' } };
  const restored = ['activeElement', 'activeElement', 'render', 'activeElement', 'query [data-delta="-0.5"]', 'focus'];
  const newHarness = (callService = () => {}) => {
    const card = configuredCard(defaultCardConfig('climate.living_room'));
    const order = [];
    const focusState = { active: null };
    const shadow = { querySelector: (selector) => { order.push(`query ${selector}`); return selector === '[data-delta="-0.5"]' ? { focus: () => order.push('focus') } : null; } };
    Object.defineProperty(shadow, 'activeElement', { get: () => { order.push('activeElement'); return focusState.active; }, configurable: true });
    Object.defineProperty(card, 'shadowRoot', { value: shadow, configurable: true });
    card._render = () => order.push('render');
    card._hass = {
      states: { 'climate.living_room': { state: 'heat', attributes: { temperature: 21, min_temp: 7, max_temp: 30, target_temp_step: 0.5 } } },
      callService,
    };
    t.after(() => card.disconnectedCallback());
    return { card, order, focusState };
  };
  const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  // Swap setTimeout just for the scheduling call, so the 8s optimistic timer
  // can be fired by hand instead of waiting or mocking global timers.
  const scheduleOf = (run) => {
    const scheduled = [];
    const realSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (fn, ms) => { scheduled.push({ fn, ms }); return scheduled.length; };
    try { run(); } finally { globalThis.setTimeout = realSetTimeout; }
    return scheduled;
  };

  // Optimistic render, then a hass tick, then the 8s timeout: the delta that
  // owns focus keeps it through every rebuild.
  const kept = newHarness();
  kept.focusState.active = delta;
  const timers = scheduleOf(() => kept.card._setTemperature(20.5, null));
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 8000);
  assert.deepEqual(kept.order, restored);
  await flush();
  kept.order.length = 0;
  // The first tick through the setter repaints and seals the gate (HA hands
  // hass over right after setConfig), then identical ticks do nothing at all.
  const firstEntity = kept.card._hass.states['climate.living_room'];
  kept.card.hass = { ...kept.card._hass, states: { 'climate.living_room': { ...firstEntity, attributes: { ...firstEntity.attributes, temperature: 21.5 } } } };
  assert.deepEqual(kept.order, restored, 'a changed tick repaints and restores the delta focus');
  kept.order.length = 0;
  kept.card.hass = { ...kept.card._hass, states: { ...kept.card._hass.states } };
  assert.deepEqual(kept.order, [], 'an idle tick skips the rebuild entirely');
  kept.order.length = 0;
  // A tick that really changes the entity repaints and restores the delta.
  const liveEntity = kept.card._hass.states['climate.living_room'];
  kept.card.hass = { ...kept.card._hass, states: { 'climate.living_room': { ...liveEntity, attributes: { ...liveEntity.attributes, temperature: 20.5 } } } };
  assert.deepEqual(kept.order, restored, 'hass update restores the delta focus');
  kept.order.length = 0;
  timers[0].fn();
  assert.deepEqual(kept.order, restored, 'optimistic timeout restores the delta focus');

  // The same timer with focus already moved to a plain control: no restore.
  kept.order.length = 0;
  kept.focusState.active = { dataset: {} };
  const second = scheduleOf(() => kept.card._setTemperature(22, null));
  assert.deepEqual(kept.order, ['activeElement', 'activeElement', 'render']);
  kept.order.length = 0;
  second[0].fn();
  assert.deepEqual(kept.order, ['activeElement', 'activeElement', 'render']);

  // Service rollback re-renders too, and behaves the same way.
  const failing = newHarness(() => Promise.reject(new Error('service failed')));
  failing.focusState.active = delta;
  scheduleOf(() => failing.card._setTemperature(21, null));
  failing.order.length = 0;
  await flush();
  assert.equal(failing.card._optimistic, null, 'rollback clears the optimistic payload');
  assert.deepEqual(failing.order, restored, 'rollback restores the delta focus');

  const failingUnfocused = newHarness(() => Promise.reject(new Error('service failed')));
  scheduleOf(() => failingUnfocused.card._setTemperature(21, null));
  failingUnfocused.order.length = 0;
  await flush();
  assert.deepEqual(failingUnfocused.order, ['activeElement', 'activeElement', 'render']);

  // A live control that still owns focus after the swap keeps it: nothing is
  // queried and nothing is refocused.
  const keptLive = newHarness();
  keptLive.focusState.active = { dataset: { delta: '-0.5' }, isConnected: true };
  keptLive.card.hass = { ...keptLive.card._hass, states: { ...keptLive.card._hass.states } };
  assert.deepEqual(keptLive.order, ['activeElement', 'activeElement', 'render', 'activeElement']);

  // Focus already moved outside the card: the restore must not steal it back.
  // If a real entity update later rebuilds the tree while focus has fallen to
  // the document body, the captured delta is restored.
  const body = {};
  globalThis.document = { body, activeElement: { id: 'somewhere-else' } };
  try {
    const outside = newHarness();
    outside.focusState.active = delta;
    outside.card.hass = { ...outside.card._hass, states: { ...outside.card._hass.states } };
    assert.deepEqual(outside.order, ['activeElement', 'activeElement', 'render', 'activeElement']);
    globalThis.document.activeElement = body;
    outside.order.length = 0;
    const entity = outside.card._hass.states['climate.living_room'];
    outside.card.hass = { ...outside.card._hass, states: { 'climate.living_room': { ...entity, attributes: { ...entity.attributes, temperature: 21.5 } } } };
    assert.deepEqual(outside.order, restored);
  } finally { delete globalThis.document; }

  // A focus target without a delta (the slider, or nothing) is left alone.
  const plain = newHarness();
  plain.focusState.active = { dataset: {} };
  plain.card._setTemperature(21.5, null);
  assert.deepEqual(plain.order, ['activeElement', 'activeElement', 'render']);
  plain.order.length = 0;
  plain.focusState.active = null;
  plain.card._setTemperature(22, null);
  assert.deepEqual(plain.order, ['activeElement', 'activeElement', 'render']);
  plain.order.length = 0;
  assert.equal(plain.card._focusedDelta(), null);
  plain.card._restoreDeltaFocus(null);
  assert.deepEqual(plain.order, ['activeElement']);
});

test('the heat_cool_unsupported text describes the single-target case it reports', () => {
  // Regression: the wording dates from when the scheduler rejected the mode
  // outright; it now fires only when ONE target meets heat_cool, so the old
  // "schedules do not support heat_cool" phrasing contradicted the docs.
  const cardSource = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  const backendSource = readFileSync(new URL('./custom_components/climate_flow_scheduler/schedule.py', import.meta.url), 'utf8');
  assert.doesNotMatch(backendSource, /do not support the heat_cool/);
  assert.match(backendSource, /A single target cannot be applied while heat_cool is active; both target temperatures are required/);
  assert.match(cardSource, /heat_cool_unsupported: 'A single target cannot be applied while the climate runs heat_cool/);
  assert.doesNotMatch(cardSource, /do not support the heat_cool/);
  for (const file of ['en', 'it']) {
    const { exceptions } = JSON.parse(readFileSync(new URL(`./custom_components/climate_flow_scheduler/translations/${file}.json`, import.meta.url), 'utf8'));
    assert.doesNotMatch(exceptions.heat_cool_unsupported.message, /do not support the heat_cool|non supportano la modalità heat_cool/);
    assert.match(exceptions.heat_cool_unsupported.message, /single target|singolo target/i);
  }
});

test('errorLabel translates backend error codes with context placeholders', () => {
  const t = {
    errors: {
      entity_unavailable: 'The climate entity is unavailable; the target stays pending.',
      slots_overlap: 'Slots {a} and {b} overlap.',
      service_call_failed: 'The climate service call failed: {message}',
      target_outside_limits: 'Target {value} is outside the climate limits.',
    },
  };
  assert.equal(
    errorLabel(t, { code: 'slots_overlap', context: { a: 'morning', b: 'night' }, message: 'raw' }),
    'Slots morning and night overlap.',
  );
  assert.equal(
    errorLabel(t, { code: 'entity_unavailable', context: {}, message: 'Climate entity is unavailable; target is pending' }),
    'The climate entity is unavailable; the target stays pending.',
  );
  assert.equal(
    errorLabel(t, { code: 'service_call_failed', context: {}, message: 'boom' }),
    'The climate service call failed: boom',
  );
  assert.equal(
    errorLabel(t, { code: 'target_outside_limits', context: { value: null }, message: 'raw' }),
    'Target {value} is outside the climate limits.',
  );
  // Unknown code, plain legacy strings, and empty inputs fall back safely.
  assert.equal(errorLabel(t, { code: 'future_code', message: 'kept raw' }), 'kept raw');
  assert.equal(errorLabel(t, 'Legacy English text'), 'Legacy English text');
  assert.equal(errorLabel(t, ''), '');
  assert.equal(errorLabel(t, null), '');
  assert.equal(errorLabel({}, { code: 'slots_overlap', message: 'raw' }), 'raw');
});

test('card surfaces route backend errors through errorLabel for translation', () => {
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.ok(source.includes("p.textContent = errorLabel(t, program.last_error)"), 'schedule dialog must translate last_error');
  const routed = source.match(/errorLabel\(t, err\?\.message \|\| err\)/g);
  assert.ok(routed && routed.length >= 2, 'delete and save failures must be routed through errorLabel');
  // English and Italian both enumerate every known backend code.
  const maps = String(source).match(/errors: \{/g);
  assert.equal(maps.length, 2, 'both language blocks must carry an errors map');
  for (const code of ['entity_unavailable', 'service_call_failed', 'slots_overlap', 'target_outside_limits', 'no_program', 'unsupported_hvac_mode']) {
    const occurrences = source.split(` ${code}: `).length - 1;
    assert.ok(occurrences >= 2, `code ${code} must be localized in both languages`);
  }
});

test('vacation pause payloads, durations, and active state', () => {
  assert.deepEqual(PAUSE_DURATIONS, ['1d', '3d', '7d', '14d', '30d']);
  assert.deepEqual(pauseServicePayload('climate.room', 16, '7d'), { climate_entity: 'climate.room', temperature: 16, duration: '7d' });
  assert.deepEqual(pauseServicePayload('climate.room', '16.5', '1d'), { climate_entity: 'climate.room', temperature: 16.5, duration: '1d' });
  assert.equal(pauseServicePayload('climate.room', '', '1d'), null);
  assert.equal(pauseServicePayload('climate.room', 'warm', '1d'), null);
  assert.equal(pauseServicePayload('climate.room', 16, '2d'), null);
  assert.equal(pauseServicePayload('climate.room', 16, '1h'), null);
  for (const language of ['en', 'it']) {
    const strings = cardStrings(language);
    assert.ok(strings.pause && strings.pauseStart && strings.pauseInvalid && strings.pauseActive('18:00'));
    assert.deepEqual(pauseDurationChoices(strings).map(([value]) => value), PAUSE_DURATIONS);
    assert.ok(pauseDurationChoices(strings).every(([, label]) => typeof label === 'string' && label.length > 0));
  }
  assert.equal(pauseDurationChoices({}).length, PAUSE_DURATIONS.length);
  const now = Date.parse('2026-01-05T12:00:00Z');
  assert.equal(activePause({ target: 16, until: '2026-01-06T12:00:00Z' }, now).target, 16);
  assert.equal(activePause({ target: 16, until: '2026-01-05T11:59:00Z' }, now), null);
  assert.equal(activePause({ target: 16, until: 'not a date' }, now), null);
  assert.equal(activePause({ target: 16 }, now), null);
  assert.equal(activePause(null, now), null);
  const source = readFileSync(new URL('./custom_components/climate_flow_scheduler/www/climate-flow-card.js', import.meta.url), 'utf8');
  assert.match(source, /set_pause/);
  assert.match(source, /pauseServicePayload\(this\.config\.entity, pauseInput\.value, pauseDuration\.value\)/);
  // The pause must be visible in both layouts, like the manual override.
  assert.equal((source.match(/pauseActive\(formatOverrideExpiry\(/g) || []).length, 4, 'pause badge in every layout plus the schedule dialog');
  for (const code of ['invalid_pause_duration', 'pause_hvac_off']) {
    assert.equal(source.split(` ${code}: `).length - 1, 2, `code ${code} must be localized in both languages`);
  }
});
