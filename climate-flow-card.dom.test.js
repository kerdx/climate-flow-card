// Behavioural tests for the parts that unit helpers cannot prove: the circular
// dial under real pointer events, and the schedule dialog's range editing.
// They run in their own process under `node --test`, so the DOM globals are
// installed here before the card module is imported (it touches
// customElements at load time).
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true, url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.customElements = dom.window.customElements;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0);
// jsdom's <dialog> support has moved between versions: provide what the card
// calls if the platform does not, so these tests measure the card and not the
// DOM implementation.
const dialogProto = dom.window.HTMLDialogElement?.prototype;
if (dialogProto) {
  if (typeof dialogProto.showModal !== 'function') dialogProto.showModal = function open() { this.open = true; };
  if (typeof dialogProto.close !== 'function') dialogProto.close = function close() { this.open = false; };
}
// The vibration API is absent in jsdom; a haptic must stay a silent no-op.
const canStubVibrate = (() => {
  try {
    Object.defineProperty(globalThis.navigator, 'vibrate', { value: () => true, configurable: true, writable: true });
    return typeof globalThis.navigator.vibrate === 'function';
  } catch { return false; }
})();

const source = await import('./custom_components/climate_flow_scheduler/www/climate-flow-card.js');
const { ClimateFlowCard, dialArc, dialPoint } = source;

const DIAL_RECT = { left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0 };

const climateEntity = (overrides = {}, attributeOverrides = {}) => ({
  entity_id: 'climate.living_room',
  state: overrides.state ?? 'heat',
  attributes: {
    friendly_name: 'Living room',
    icon: 'mdi:thermostat',
    current_temperature: 19.5,
    temperature: 21,
    min_temp: 7,
    max_temp: 30,
    target_temp_step: 0.5,
    // heat_cool is part of the baseline: the dialog offers the range switch
    // only where the entity really exposes it.
    hvac_modes: ['off', 'heat', 'cool', 'auto', 'dry', 'fan_only', 'heat_cool'],
    ...attributeOverrides,
  },
});

const heatCoolEntity = (low = 18, high = 22.5) => ({
  entity_id: 'climate.living_room',
  state: 'heat_cool',
  attributes: {
    friendly_name: 'Living room',
    current_temperature: 19.5,
    min_temp: 7,
    max_temp: 30,
    target_temp_step: 0.5,
    hvac_modes: ['off', 'heat', 'cool', 'auto', 'heat_cool'],
    target_temp_low: low,
    target_temp_high: high,
  },
});

const program = (slots, extra = {}) => ({
  enabled: true,
  hvac_mode: null,
  away_temperature: null,
  slots,
  next_change: '2026-10-26T10:00:00',
  active_slot_id: slots[0]?.id ?? null,
  last_error: null,
  manual_override: null,
  pause: null,
  ...extra,
});

const build = ({ entity = climateEntity(), config = {}, programState } = {}) => {
  const calls = [];
  const card = new ClimateFlowCard();
  card.setConfig({ entity: 'climate.living_room', layout: 'circular', ...config });
  card._hass = {
    states: {
      'climate.living_room': entity,
      ...(programState
        ? {
            'climate_flow_scheduler.programs': {
              entity_id: 'climate_flow_scheduler.programs',
              state: 'ready',
              attributes: { scheduler_domain: 'climate_flow_scheduler', programs: { 'climate.living_room': programState } },
            },
          }
        : {}),
    },
    locale: { language: 'en' },
    config: { unit_system: { temperature: '°C' } },
    services: {
      climate: { set_temperature: {}, set_hvac_mode: {} },
      climate_flow_scheduler: { save_program: {}, resume_program: {}, set_manual_override: {}, set_pause: {} },
    },
    callService: async (domain, service, data) => { calls.push([domain, service, data]); },
  };
  card._render();
  const dial = () => card.shadowRoot.querySelector('.dial');
  const bindRect = () => { const svg = dial(); if (svg) svg.getBoundingClientRect = () => DIAL_RECT; };
  bindRect();
  return { card, calls, dial, bindRect, shadow: card.shadowRoot };
};

const pointer = (type, x, y, extra = {}) => {
  const event = new dom.window.Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y, ...extra });
  return event;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// The commit is debounced by 220 ms; waiting past it (and past the retry
// window) proves which service calls really leave the card.
const settle = () => wait(320);
const key = (name) => { const event = new dom.window.Event('keydown', { bubbles: true, cancelable: true }); event.key = name; return event; };
const editorDialog = (shadow) => shadow.querySelector('dialog');
const dialogError = (dialog) => [...dialog.querySelectorAll('.error')].pop()?.textContent || '';
const setField = (input, value) => { input.value = String(value); input.dispatchEvent(new dom.window.Event('input', { bubbles: true })); };
const toggleEvent = (element, type) => element.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
const slotFields = (dialog) => [...dialog.querySelectorAll('.slot .field input')];

// --------------------------------------------------------------------------
// Circular dial: static render
// --------------------------------------------------------------------------
test('circular dial renders the arc, the thumb and an accessible slider', () => {
  const { card, shadow, dial } = build();
  const svg = dial();
  assert.equal(svg.getAttribute('viewBox'), '0 0 200 200');
  assert.equal(svg.getAttribute('role'), 'slider');
  assert.equal(svg.getAttribute('tabindex'), '0');
  assert.equal(svg.getAttribute('aria-valuenow'), '21');
  assert.equal(svg.getAttribute('aria-valuemin'), '7');
  assert.equal(svg.getAttribute('aria-valuemax'), '30');
  assert.equal(svg.getAttribute('aria-valuetext'), 'Target 21°C');
  assert.equal(svg.getAttribute('aria-label'), 'Target temperature');
  assert.equal(svg.querySelector('.track').getAttribute('stroke-dasharray'), '376.991 753.982');
  assert.equal(svg.querySelector('.value').getAttribute('stroke-dasharray'), dialArc(0, 14 / 23).dasharray);
  assert.equal(svg.querySelector('.value').getAttribute('stroke-dashoffset'), '0');
  assert.equal(svg.querySelector('.track').getAttribute('transform'), 'rotate(135 100 100)');
  const thumb = svg.querySelectorAll('.thumb');
  assert.equal(thumb.length, 1);
  const expected = dialPoint(14 / 23);
  assert.equal(thumb[0].getAttribute('cx'), String(expected.x));
  assert.equal(thumb[0].getAttribute('cy'), String(expected.y));
  assert.equal(shadow.querySelector('.hero strong').textContent, '21');
  assert.equal(shadow.querySelector('.hero .unit').textContent, '°C');
  assert.equal(shadow.querySelector('.center .sub').textContent, '19.5 °C');
  assert.equal(shadow.querySelector('.chip.state').textContent, 'Heat');
  assert.equal(shadow.querySelector('.icon').dataset.active, 'true');
  assert.equal([...shadow.querySelectorAll('.row button')].map((b) => b.textContent).join(','), '−,+');
  assert.equal(shadow.querySelector('select.hvac-mode').value, 'heat');
  card.disconnectedCallback?.();
});

test('circular dial renders the heat_cool pair as two thumbs on one arc', () => {
  const { card, shadow, dial } = build({ entity: heatCoolEntity(18, 22.5) });
  const svg = dial();
  const arc = dialArc(11 / 23, 15.5 / 23);
  assert.equal(svg.querySelector('.value').getAttribute('stroke-dasharray'), arc.dasharray);
  assert.equal(svg.querySelector('.value').getAttribute('stroke-dashoffset'), String(arc.dashoffset));
  assert.equal(svg.querySelectorAll('.thumb').length, 2);
  assert.equal(shadow.querySelector('.hero strong').textContent, '18–22.5');
  assert.equal(svg.getAttribute('aria-label'), 'Target temperature range midpoint');
  assert.equal(svg.getAttribute('aria-valuetext'), 'Target temperature range 18 to 22.5°C');
  assert.equal(svg.getAttribute('aria-valuenow'), '20.25');
  card.disconnectedCallback?.();
});

test('step controls keep their signed step and accessible names in every layout', () => {
  for (const layout of ['pill', 'compact', 'circular']) {
    const { card, shadow } = build({ config: { layout } });
    const buttons = [...shadow.querySelectorAll('[data-delta]')];
    assert.deepEqual(buttons.map((button) => button.dataset.delta), ['-0.5', '0.5'], `${layout} keeps the configured step`);
    assert.deepEqual(buttons.map((button) => button.getAttribute('aria-label')), ['Decrease target temperature', 'Increase target temperature']);
    card.disconnectedCallback?.();
  }
});

// --------------------------------------------------------------------------
// Circular dial: dragging
// --------------------------------------------------------------------------
test('circular dial dragging follows the pointer and commits exactly once', async () => {
  const { card, calls, dial, bindRect } = build();
  const svg = dial();
  svg.dispatchEvent(pointer('pointerdown', 100, 100));
  window.dispatchEvent(pointer('pointermove', 101, 101)); // 1.4px: below the 6px threshold
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '21', 'a micro-move is not a drag');
  window.dispatchEvent(pointer('pointermove', 100, 20)); // straight up: middle of the sweep
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '18.5');
  assert.equal(svg.getAttribute('aria-valuenow'), '18.5', 'aria follows the finger');
  assert.equal(svg.querySelector('.value').getAttribute('stroke-dasharray'), dialArc(0, 0.5).dasharray, 'the arc follows the finger');
  const thumb = svg.querySelectorAll('.thumb')[0];
  const middle = dialPoint(0.5);
  assert.equal(thumb.getAttribute('cx'), String(middle.x), 'the thumb follows the finger');
  assert.equal(calls.length, 0, 'nothing is sent mid-drag');
  window.dispatchEvent(pointer('pointerup', 100, 20));
  assert.equal(calls.length, 0, 'the commit is debounced');
  await settle();
  assert.deepEqual(calls, [['climate', 'set_temperature', { entity_id: 'climate.living_room', temperature: 18.5 }]]);
  card.disconnectedCallback?.();
});

test('circular dial coalesces a multi-step gesture into one call', async () => {
  const { card, calls, dial, bindRect } = build();
  dial().dispatchEvent(pointer('pointerdown', 100, 100));
  for (const [x, y] of [[100, 60], [60, 30], [20, 60]]) window.dispatchEvent(pointer('pointermove', x, y));
  const shown = card.shadowRoot.querySelector('.hero strong').textContent;
  window.dispatchEvent(pointer('pointerup', 20, 60));
  await settle();
  assert.equal(calls.length, 1, 'one gesture, one service call');
  assert.equal(calls[0][2].temperature, Number(shown.replace(',', '.')), 'the call carries the value under the finger');
  card.disconnectedCallback?.();
});

test('circular dial restores the real value when the gesture is cancelled', async () => {
  const { card, calls, dial } = build();
  dial().dispatchEvent(pointer('pointerdown', 100, 100));
  window.dispatchEvent(pointer('pointermove', 100, 20));
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '18.5');
  window.dispatchEvent(pointer('pointercancel', 100, 20));
  await settle();
  assert.equal(calls.length, 0, 'an aborted gesture sends nothing');
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '21', 'the real value is back');
  assert.equal(card.shadowRoot.querySelector('.dial').getAttribute('aria-valuenow'), '21');
  card.disconnectedCallback?.();
});

test('circular dial clamps to the entity limits', async () => {
  const { card, calls, dial } = build();
  dial().dispatchEvent(pointer('pointerdown', 100, 100));
  window.dispatchEvent(pointer('pointermove', 190, 190)); // past the end of the sweep
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '30');
  window.dispatchEvent(pointer('pointerup', 190, 190));
  await settle();
  assert.deepEqual(calls, [['climate', 'set_temperature', { entity_id: 'climate.living_room', temperature: 30 }]]);
  card.disconnectedCallback?.();
});

test('circular dial moves one heat_cool bound and commits the pair', async () => {
  const { card, calls, dial } = build({ entity: heatCoolEntity(18, 22.5) });
  const svg = dial();
  // The low thumb sits at 11/23 of the sweep: grab exactly there.
  const lowPoint = dialPoint(11 / 23);
  svg.dispatchEvent(pointer('pointerdown', lowPoint.x, lowPoint.y));
  window.dispatchEvent(pointer('pointermove', 100, 20)); // straight up: middle of the range
  assert.equal(
    card.shadowRoot.querySelector('.hero strong').textContent,
    '18.5–22.5',
    'only the grabbed bound follows the finger',
  );
  assert.equal(svg.querySelectorAll('.thumb').length, 2, 'still two thumbs during the drag');
  window.dispatchEvent(pointer('pointerup', 100, 20));
  await settle();
  assert.deepEqual(
    calls,
    [['climate', 'set_temperature', { entity_id: 'climate.living_room', target_temp_low: 18.5, target_temp_high: 22.5 }]],
    'the pair goes on the wire without a scalar temperature',
  );
  card.disconnectedCallback?.();
});

test('circular dial arrow keys step, batch and keep the slider role', async () => {
  const { card, calls, dial } = build();
  const svg = dial();
  svg.dispatchEvent(key('ArrowUp'));
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '21.5', 'ArrowUp steps up');
  svg.dispatchEvent(key('ArrowDown'));
  svg.dispatchEvent(key('ArrowDown'));
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '20.5', 'ArrowDown steps down');
  await settle();
  assert.equal(calls.length, 1, 'held arrows batch into one call');
  assert.equal(calls[0][2].temperature, 20.5, 'the batched value wins');
  assert.equal(card.shadowRoot.querySelector('.dial').getAttribute('role'), 'slider', 'the rebuilt dial keeps its role');
  card.disconnectedCallback?.();
});

// --------------------------------------------------------------------------
// Circular dial: states, options and the fixed secondary-line defect
// --------------------------------------------------------------------------
test('circular dial with main_temperature current stays informational', () => {
  const { card, calls, dial, shadow } = build({ config: { main_temperature: 'current' } });
  const svg = dial();
  assert.equal(svg.getAttribute('role'), 'button', 'the dial is a details button, not a slider');
  assert.equal(svg.getAttribute('aria-valuenow'), null, 'no slider values');
  assert.equal(shadow.querySelector('.hero strong').textContent, '19.5', 'the measured value is the hero');
  assert.equal(shadow.querySelector('.center .sub').textContent, '21 °C', 'the target moves to the secondary line');
  assert.equal(svg.querySelector('.value').getAttribute('stroke-dasharray'), dialArc(0, 14 / 23).dasharray, 'the arc still describes the target');
  svg.dispatchEvent(pointer('pointerdown', 100, 100));
  window.dispatchEvent(pointer('pointermove', 100, 20));
  assert.equal(card.shadowRoot.querySelector('.hero strong').textContent, '19.5', 'a non-adjustable dial never drags');
  window.dispatchEvent(pointer('pointerup', 100, 20));
  card.disconnectedCallback?.();
});

test('the circular secondary line follows show_current_temperature_chip', () => {
  // Defect: pill and compact gate their secondary value on this option, the
  // dial used to print it unconditionally.
  const on = build();
  assert.equal(on.shadow.querySelector('.center .sub').textContent, '19.5 °C', 'on by default');
  on.card.disconnectedCallback?.();

  const off = build({ config: { show_current_temperature_chip: false } });
  assert.equal(off.shadow.querySelector('.center .sub').textContent, '', 'the option hides the secondary line');
  assert.equal(off.shadow.querySelector('.hero strong').textContent, '21', 'the hero is unaffected');
  off.card.disconnectedCallback?.();

  const swapped = build({ config: { show_current_temperature_chip: false, main_temperature: 'current' } });
  assert.equal(swapped.shadow.querySelector('.hero strong').textContent, '19.5');
  assert.equal(swapped.shadow.querySelector('.center .sub').textContent, '', 'the target line is gated too');
  swapped.card.disconnectedCallback?.();
});

test('circular dial merges the optimistic preview into its model', () => {
  const { card, dial, shadow } = build();
  card._optimistic = { entityId: 'climate.living_room', payload: { temperature: 24 } };
  card._render();
  const svg = dial();
  assert.equal(shadow.querySelector('.hero strong').textContent, '24', 'the pending value is shown');
  assert.equal(svg.querySelector('.value').getAttribute('stroke-dasharray'), dialArc(0, 17 / 23).dasharray, 'the arc follows the pending value');
  assert.equal(svg.getAttribute('aria-valuenow'), '24');
  card.disconnectedCallback?.();
});

test('circular dial degrades gracefully without a usable target', () => {
  const unavailable = build({ entity: { entity_id: 'climate.living_room', state: 'unavailable', attributes: {} } });
  assert.equal(unavailable.shadow.querySelector('.empty').textContent, 'Entity unavailable');
  assert.equal(unavailable.shadow.querySelector('.dial').style.display, 'none', 'no dial without a state');
  assert.equal(unavailable.shadow.querySelector('.badge').textContent, 'Unavailable');
  assert.ok([...unavailable.shadow.querySelectorAll('.row')].every((row) => row.hidden));
  unavailable.card.disconnectedCallback?.();

  const noTarget = build({
    entity: { entity_id: 'climate.living_room', state: 'idle', attributes: { hvac_modes: ['off', 'heat'], min_temp: 7, max_temp: 30 } },
  });
  assert.notEqual(noTarget.shadow.querySelector('.dial').getAttribute('role'), 'slider', 'no slider without a target');
  assert.equal(noTarget.shadow.querySelector('.empty').textContent, 'Target unavailable');
  noTarget.card.disconnectedCallback?.();
});

test('circular dial honours the motion, surface, accent and control options', () => {
  const { card, shadow, dial } = build({
    config: { animations: false, haptics: false, surface: 'blend', accent_color: '#ff0000', show_step_controls: false, show_mode_buttons: false },
  });
  const card_ = shadow.querySelector('ha-card');
  assert.equal(card_.dataset.motion, 'off');
  assert.equal(card_.dataset.surface, 'blend');
  assert.equal(card_.style.getPropertyValue('--climate-flow-accent-color'), '#ff0000');
  assert.equal([...shadow.querySelectorAll('.row button')].length, 0, 'no +/- controls when hidden');
  assert.equal(shadow.querySelector('select.hvac-mode'), null, 'no mode select when hidden');
  assert.ok([...shadow.querySelectorAll('.row')].every((row) => row.hidden), 'the empty row is hidden');
  if (canStubVibrate) assert.equal(source.fireHaptic({ haptics: false }), false, 'haptics stay off when configured off');
  card.disconnectedCallback?.();
});

test('circular dial animates the hero only when the value changes', () => {
  const { card, shadow } = build();
  assert.ok(shadow.querySelector('.hero').className.includes('bump'), 'the first paint animates in');
  card._render();
  assert.ok(!shadow.querySelector('.hero').className.includes('bump'), 'an unchanged value does not re-animate');
  card._optimistic = { entityId: 'climate.living_room', payload: { temperature: 23 } };
  card._render();
  assert.ok(shadow.querySelector('.hero').className.includes('bump'), 'a new value re-animates');
  card.disconnectedCallback?.();
});

// --------------------------------------------------------------------------
// Schedule dialog: range editing
// --------------------------------------------------------------------------
test('an unchanged hass tick skips the rebuild and keeps the live element', () => {
  const { card, shadow } = build();
  card.hass = card._hass; // the real first tick seals the gate
  const hero = shadow.querySelector('.hero');
  card.hass = { ...card._hass }; // a fresh object with the same contents
  assert.equal(shadow.querySelector('.hero'), hero, 'no rebuild for a tick that changes nothing');
  card.disconnectedCallback?.();
});

test('a changed target, a sensor update or an aged timestamp reopens the gate', () => {
  const { card, shadow } = build();
  // A new target repaints even though the tick came from elsewhere.
  card._hass.states['climate.living_room'] = climateEntity({}, { temperature: 24 });
  card.hass = card._hass;
  assert.equal(shadow.querySelector('.hero strong').textContent, '24', 'the new target is on screen');

  // A programs-sensor update repaints while the climate state stands still.
  const beforeSensor = shadow.querySelector('ha-card');
  card._hass.states['climate_flow_scheduler.programs'] = {
    entity_id: 'climate_flow_scheduler.programs',
    state: 'ready',
    attributes: { scheduler_domain: 'climate_flow_scheduler', programs: { 'climate.living_room': program([{ id: 'morning', days: [1], start: '08:00', end: '10:00', temperature: 21 }]) } },
  };
  card.hass = card._hass;
  assert.notEqual(shadow.querySelector('ha-card'), beforeSensor, 'a sensor update repaints');

  // The relative chip ages with the timestamps: same state, new last_changed.
  const beforeAging = shadow.querySelector('ha-card');
  card._hass.states['climate.living_room'].last_changed = new Date(Date.now() + 60000).toISOString();
  card.hass = card._hass;
  assert.notEqual(shadow.querySelector('ha-card'), beforeAging, 'an aged timestamp repaints');
  card.disconnectedCallback?.();
});

test('the relative-time chip refreshes itself without a Home Assistant state change', async () => {
  const realNow = Date.now;
  Date.now = () => realNow();
  const card = new ClimateFlowCard();
  try {
    card.setConfig({ entity: 'climate.living_room', layout: 'pill' });
    const entity = climateEntity();
    entity.last_changed = new Date(Date.now() - 30_000).toISOString();
    document.body.append(card);
    card.hass = {
      states: { 'climate.living_room': entity },
      locale: { language: 'en' },
      config: { unit_system: { temperature: '°C' } },
      callService: async () => {},
    };
    const chip = card.shadowRoot.querySelector('.status-line .relative');
    assert.ok(chip);
    const before = chip.textContent;
    await wait(700);
    assert.notEqual(chip.textContent, before, 'the visible label advances without another hass tick');
  } finally {
    card.remove();
    Date.now = realNow;
  }
});

test('the render gate reopens on a new config', () => {
  const { card, shadow } = build();
  const hero = shadow.querySelector('.hero');
  card.hass = { ...card._hass };
  card.setConfig({ entity: 'climate.living_room', layout: 'circular', name: 'Renamed' });
  assert.notEqual(shadow.querySelector('.hero'), hero, 'a new config repaints immediately');
  assert.equal(shadow.querySelector('ha-card').textContent.includes('Renamed'), true, 'the new title is shown');
  card.hass = { ...card._hass };
  assert.ok(shadow.querySelector('.hero'), 'and the gate re-seals for the following ticks');
  card.disconnectedCallback?.();
});

test('schedule dialog opens a single slot with one temperature and a range switch', () => {
  const state = program([{ id: 'morning', days: [1, 2, 3], start: '08:00', end: '10:00', temperature: 21 }]);
  const { card, shadow } = build({ programState: state });
  card._openSchedule();
  const dialog = editorDialog(shadow);
  assert.ok(dialog, 'the dialog renders');
  const toggle = dialog.querySelector('.range-toggle input');
  assert.ok(toggle, 'the switch is offered because the entity exposes heat_cool');
  assert.equal(toggle.checked, false, 'a single slot starts single');
  const fields = slotFields(dialog);
  assert.equal(fields.length, 3, 'start, end and one temperature');
  assert.equal(fields[2].value, '21');
  assert.ok(fields[2].closest('.temperature-field'), 'the target uses the premium temperature field');
  assert.equal(fields[2].closest('.temperature-value').querySelector('.temperature-unit').textContent, '°C');
  assert.equal(fields[2].closest('.temperature-value').querySelector('.temperature-unit').getAttribute('aria-hidden'), 'true');
  const awayInput = dialog.querySelector('.field.outside .temperature-value input');
  assert.ok(awayInput, 'the outside-schedule target uses the same field treatment');
  assert.equal(awayInput.getAttribute('aria-label'), 'Outside schedule temperature');
  assert.equal(dialog.querySelector('.program-settings .switch input[type="checkbox"]').checked, true);
  assert.ok(dialog.querySelector('.program-settings .field.hvac select[aria-label="HVAC mode"]'));
  assert.ok(dialog.querySelector('.slot .slot-head h3'));
  assert.ok(!fields.some((input) => input.getAttribute('aria-label') === 'Low temperature'));
  card.disconnectedCallback?.();
});

test('schedule dialog format next_change instead of showing a raw timestamp', () => {
  // Defect: the status chip used to print the sensor's ISO boundary verbatim.
  const state = program([{ id: 'morning', days: [1], start: '08:00', end: '10:00', temperature: 21 }]);
  const { card, shadow } = build({ programState: state });
  card._openSchedule();
  const chip = editorDialog(shadow).querySelector('.statusline .chip');
  assert.ok(chip, 'the next-change chip exists');
  assert.ok(!chip.textContent.includes('T'), `never the raw ISO string: ${chip.textContent}`);
  assert.ok(!/^\d{4}-\d{2}-\d{2}/.test(chip.textContent), `never an ISO date: ${chip.textContent}`);
  assert.ok(/\d{1,2}[:/]/.test(chip.textContent), `a local date/time is shown: ${chip.textContent}`);
  card.disconnectedCallback?.();
});

test('schedule dialog range toggle swaps the shape and round-trips back', () => {
  const state = program([{ id: 'morning', days: [1], start: '08:00', end: '10:00', temperature: 21 }]);
  const { card, shadow } = build({ programState: state });
  card._openSchedule();
  const dialog = editorDialog(shadow);
  const toggle = dialog.querySelector('.range-toggle input');
  toggle.checked = true;
  toggleEvent(toggle, 'change');
  let fields = slotFields(dialog);
  assert.equal(fields.length, 4, 'start, end and two bounds');
  assert.equal(fields[2].getAttribute('aria-label'), 'Low temperature');
  assert.equal(fields[3].getAttribute('aria-label'), 'High temperature');
  assert.equal(fields[2].value, '21');
  assert.equal(fields[3].value, '21.5', 'seeded one step above the single value');
  assert.equal(dialog.querySelector('.slot .field input[aria-label="Target"]'), null, 'the single field is gone');
  setField(fields[2], '19.5');
  toggle.checked = false;
  toggleEvent(toggle, 'change');
  fields = slotFields(dialog);
  assert.equal(fields.length, 3, 'back to one temperature');
  assert.equal(fields[2].value, '19.5', 'the edited low bound becomes the target');
  card.disconnectedCallback?.();
});

test('schedule dialog refuses an inverted pair before any service call', async () => {
  const state = program([{ id: 'morning', days: [1], start: '08:00', end: '10:00', temperature: 21 }]);
  const { card, calls, shadow } = build({ programState: state });
  card._openSchedule();
  const dialog = editorDialog(shadow);
  const toggle = dialog.querySelector('.range-toggle input');
  toggle.checked = true;
  toggleEvent(toggle, 'change');
  const fields = slotFields(dialog);
  setField(fields[2], '24');
  setField(fields[3], '22');
  dialog.querySelector('button.primary').click();
  await wait(0);
  assert.match(dialogError(dialog), /low temperature must stay below/i);
  assert.equal(calls.length, 0, 'an invalid draft never reaches the service');
  assert.notEqual(dialog.open, false, 'the dialog stays open on a validation error');
  card.disconnectedCallback?.();
});

test('schedule dialog saves a heat_cool program with the pair payload', async () => {
  const state = program([{ id: 'morning', days: [1, 2, 3], start: '08:00', end: '10:00', temperature: 21 }]);
  const { card, calls, shadow } = build({ programState: state });
  card._openSchedule();
  const dialog = editorDialog(shadow);
  const toggle = dialog.querySelector('.range-toggle input');
  toggle.checked = true;
  toggleEvent(toggle, 'change');
  const fields = slotFields(dialog);
  setField(fields[2], '18');
  setField(fields[3], '22.5');
  const modeSelect = dialog.querySelector('select[aria-label="HVAC mode"]');
  assert.ok([...modeSelect.options].map((option) => option.value).includes('heat_cool'), 'heat_cool is offered for a capable entity');
  modeSelect.value = 'heat_cool';
  toggleEvent(modeSelect, 'change');
  dialog.querySelector('button.primary').click();
  await wait(0);
  assert.equal(calls.length, 1, 'one save call');
  const [domain, service, data] = calls[0];
  assert.equal(domain, 'climate_flow_scheduler');
  assert.equal(service, 'save_program');
  assert.equal(data.hvac_mode, 'heat_cool');
  assert.equal(data.slots.length, 1);
  const saved = data.slots[0];
  assert.equal(saved.target_temp_low, 18);
  assert.equal(saved.target_temp_high, 22.5);
  assert.equal('temperature' in saved, false, 'a range slot never carries temperature');
  assert.equal(saved.days.join(','), '1,2,3');
  assert.equal(saved.start, '08:00');
  assert.equal(saved.end, '10:00');
  card.disconnectedCallback?.();
});

test('schedule dialog enforces the mode/slot pairing before saving', async () => {
  const single = program([{ id: 'morning', days: [1], start: '08:00', end: '10:00', temperature: 21 }]);
  const { card, calls, shadow } = build({ programState: single });
  card._openSchedule();
  const dialog = editorDialog(shadow);
  const modeSelect = dialog.querySelector('select[aria-label="HVAC mode"]');
  modeSelect.value = 'heat_cool';
  toggleEvent(modeSelect, 'change');
  dialog.querySelector('button.primary').click();
  await wait(0);
  assert.match(dialogError(dialog), /needs a temperature range in every slot/, 'heat_cool demands pairs');
  assert.equal(calls.length, 0);

  const toggle = dialog.querySelector('.range-toggle input');
  toggle.checked = true;
  toggleEvent(toggle, 'change');
  modeSelect.value = 'heat';
  toggleEvent(modeSelect, 'change');
  dialog.querySelector('button.primary').click();
  await wait(0);
  assert.match(dialogError(dialog), /needs heat_cool: change the program mode/, 'a range under a scalar mode is refused');
  assert.equal(calls.length, 0);

  modeSelect.value = 'heat_cool';
  toggleEvent(modeSelect, 'change');
  dialog.querySelector('button.primary').click();
  await wait(0);
  assert.equal(calls.length, 1, 'heat_cool with pairs saves');
  card.disconnectedCallback?.();
});

test('schedule dialog gates the range switch by capability and keeps dual slots editable', async () => {
  const single = program([{ id: 'morning', days: [1], start: '08:00', end: '10:00', temperature: 21 }]);
  const incapable = climateEntity({}, { hvac_modes: ['off', 'heat', 'cool'] });
  const noSwitch = build({ entity: incapable, programState: single });
  noSwitch.card._openSchedule();
  assert.equal(editorDialog(noSwitch.shadow).querySelector('.range-toggle'), null, 'no switch where heat_cool cannot exist');
  noSwitch.card.disconnectedCallback?.();

  const dual = program([{ id: 'day', days: [1], start: '08:00', end: '18:00', target_temp_low: 18, target_temp_high: 22.5 }], { hvac_mode: 'heat_cool' });
  const { card, calls, shadow } = build({ entity: incapable, programState: dual });
  card._openSchedule();
  const dialog = editorDialog(shadow);
  const toggle = dialog.querySelector('.range-toggle input');
  assert.ok(toggle && toggle.checked, 'a loaded dual slot keeps its switch');
  const fields = slotFields(dialog);
  assert.equal(fields.length, 4, 'the pair edits');
  assert.equal(fields[2].value, '18');
  assert.equal(fields[3].value, '22.5');
  // A clean round-trip: save sends back exactly what was loaded.
  dialog.querySelector('button.primary').click();
  await wait(0);
  assert.equal(calls.length, 1, 'an unchanged program saves');
  const saved = calls[0][2].slots[0];
  assert.equal(saved.target_temp_low, 18);
  assert.equal(saved.target_temp_high, 22.5);
  assert.equal('temperature' in saved, false);
  assert.equal(calls[0][2].hvac_mode, 'heat_cool', 'the mode round-trips too');
  card.disconnectedCallback?.();
});

test('buttons have theme-aware hover and pressed feedback in cards, editor and dialogs', () => {
  const activeRule = 'button:not(:disabled):not([role="slider"]):active';
  const hoverTint = 'currentColor 8%';
  const activeTint = 'currentColor 16%';
  for (const layout of ['pill', 'compact', 'circular']) {
    const { card, shadow } = build({ config: { layout } });
    const css = shadow.querySelector('style').textContent;
    assert.ok(css.includes(activeRule), `${layout} keeps a visible pressed state`);
    assert.ok(css.includes(hoverTint), `${layout} has a subtle mouse-hover state`);
    assert.ok(css.includes(activeTint), `${layout} has a stronger pressed tint`);
    assert.ok(css.includes('button:disabled{opacity:.45;cursor:default}'), 'disabled controls stay visibly disabled');
    card.disconnectedCallback?.();
  }

  const editor = document.createElement(source.CLIMATE_FLOW_CARD_EDITOR_TAG);
  editor.setConfig({ entity: 'climate.living_room' });
  const editorCss = editor.shadowRoot.querySelector('style').textContent;
  assert.ok(editorCss.includes(hoverTint), 'editor controls use the shared hover state');
  assert.ok(editorCss.includes(activeTint), 'editor controls use the shared pressed state');
  editor.remove();

  const scheduled = build({ programState: program([{ id: 'morning', days: [1], start: '08:00', end: '10:00', temperature: 21 }]) });
  scheduled.card._openSchedule();
  const scheduleCss = editorDialog(scheduled.shadow).querySelector('style').textContent;
  assert.ok(scheduleCss.includes(hoverTint), 'schedule buttons and day pills respond to hover');
  assert.ok(scheduleCss.includes('.days label:active .day'), 'schedule day pills respond while pressed');
  assert.ok(scheduleCss.includes('.program-settings{display:grid'), 'program controls have a clear responsive settings group');
  assert.ok(scheduleCss.includes('.slot::before'), 'time slots receive a subtle accent detail');
  assert.ok(scheduleCss.includes('prefers-reduced-motion:reduce'), 'the polish respects reduced-motion preferences');
  assert.ok(scheduleCss.includes('var(--climate-flow-accent-color,var(--primary-color))'), 'the dialog follows the card and HA theme accent');
  scheduled.card.disconnectedCallback?.();

  const override = build();
  override.card._requestManualOverride(20, 0.5);
  const overrideCss = [...override.shadow.querySelectorAll('dialog style')].at(-1).textContent;
  assert.ok(overrideCss.includes(hoverTint), 'override buttons use the shared hover state');
  assert.ok(overrideCss.includes(activeTint), 'override buttons use the shared pressed state');
  override.card.disconnectedCallback?.();
});
