export const numeric = (v) => {
  if (v === null || v === undefined || (typeof v === 'string' && (!v.trim() || ['unknown', 'unavailable'].includes(v.trim().toLowerCase())))) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
// Card UI strings. The active language follows hass.locale.language; languages
// other than Italian fall back to English.
const STRINGS = {
  en: {
    unavailable: 'Unavailable',
    entityUnavailable: 'Entity unavailable',
    currentTemperature: (value) => `Current temperature ${value}`,
    decrease: 'Decrease target temperature',
    increase: 'Increase target temperature',
    target: (value, unit) => `Target ${value}${unit}`,
    targetRange: (low, high, unit) => `Target temperature range ${low} to ${high}${unit}`,
    targetUnavailable: 'Target unavailable',
    openDetails: (label) => `${label}. Open details`,
    toggleHeating: 'Tap card background to toggle heating',
    actionMoreInfo: 'Tap card background to open the entity details',
    actionNone: 'Climate card, no background action',
    temperatureControls: 'Temperature controls',
    openSchedule: 'Open schedule details',
    midpoint: 'Target temperature range midpoint',
    targetLabel: 'Target temperature',
    overrideActive: (expiry) => `Manual override until ${expiry}`,
    resumeSchedule: 'Resume schedule now',
    pause: 'Vacation pause',
    pauseActive: (until) => `Vacation pause until ${until}`,
    pauseTarget: 'Pause target',
    pauseDuration: 'Pause length',
    pauseStart: 'Start pause',
    pauseInvalid: 'The pause target must be a number.',
    pause1d: '1 day',
    pause3d: '3 days',
    pause7d: '7 days',
    pause14d: '14 days',
    pause30d: '30 days',
    overrideError: (message) => `Could not apply override: ${message}`,
    serviceError: (message) => `Service failed: ${message}`,
    dualOverrideUnsupported: 'Temporary scheduled overrides support a single target only; no change was sent.',
    overrideChoice: 'Manual override duration', overrideCancel: 'Cancel',
    override30m: '30 minutes', override1h: '1 hour', override2h: '2 hours', overrideNext: 'Until next schedule change',
    hvacMode: 'HVAC mode',
    dontChange: 'Do not change',
    badMode: 'Unsupported HVAC mode.',
    weeklySchedule: 'Weekly schedule',
    scheduleAria: 'Weekly climate schedule',
    auxiliaryControls: 'Device settings',
    auxiliaryAria: 'Auxiliary climate controls',
    openAuxiliary: 'Open device settings',
    closeAuxiliary: 'Close device settings',
    auxiliaryHint: 'Changes are applied immediately to the selected auxiliary entities.',
    auxiliaryUnavailable: 'This entity is unavailable.',
    close: 'Close',
    closeSchedule: 'Close schedule editor',
    backendMissing: 'Climate Flow Scheduler is not installed. Install and configure it to edit a program (integration domain: climate_flow_scheduler).',
    openLegacy: 'Open legacy schedule',
    nextChange: 'Next change: ',
    none: 'none',
    active: (id) => ` · Active: ${id}`,
    enabled: 'Enabled',
    outsideSchedule: 'Outside schedule',
    outsideScheduleAria: 'Outside schedule temperature',
    outsideScheduleTitle: 'Applied outside the scheduled slots; leave empty to keep the last target.',
    slot: (index) => `Slot ${index}`,
    remove: 'Remove',
    removeSlot: (index) => `Remove slot ${index}`,
    start: 'Start',
    end: 'End',
    targetField: 'Target',
    targetLowField: 'Low temperature',
    targetHighField: 'High temperature',
    rangeToggle: 'Range',
    rangeInvalid: 'The low temperature must stay below the high temperature.',
    heat_coolNeedsRange: 'heat_cool needs a temperature range in every slot.',
    dualSlotUnsupported: 'A slot with a temperature range needs heat_cool: change the program mode or use one temperature.',
    mixedModeRequired: 'Mixed single-target and range slots need a program HVAC mode for the single-target slots.',
    mixedHeatCoolRequired: 'The climate entity must support heat_cool to use range slots in a mixed program.',
    awayHeatCool: 'An outside-schedule temperature is a single target and cannot be used with heat_cool.',
    addSlot: '+ Add slot',
    deleteProgram: 'Delete program',
    saveProgram: 'Save program',
    // Full day names feed the accessible labels; the visible pill text comes
    // from dayPills, whose two-letter labels stay unique in this language.
    dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    dayPills: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    invalidSchedule: 'Invalid schedule.',
    needSlot: 'An enabled schedule needs at least one slot.',
    awayNumber: 'The outside-schedule temperature must be a number.',
    slotInvalid: 'Each slot needs days, valid times, and a target; start and end must differ.',
    fields: {
      entity: 'Climate entity', name: 'Name', icon: 'Icon', layout: 'Layout', step: 'Step',
      show_state_chip: 'Show state and relative time', show_current_temperature_chip: 'Show current temperature',
      show_humidity_chip: 'Show humidity', show_unavailable_badge: 'Show unavailable badge',
       show_mode_buttons: 'Show HVAC mode selector', show_step_controls: 'Show +/- controls', show_schedule_button: 'Show schedule button',
      calibration_entity: 'Temperature calibration', deadzone_entity: 'Temperature deadzone',
      sensor_source_entity: 'Sensor source', child_lock_entity: 'Child lock',
      accent_color: 'Accent colour', surface: 'Card surface',
      language: 'Language', entity_picture: 'Entity picture',
      show_entity_picture: 'Show entity picture', main_temperature: 'Main temperature',
      tap_action: 'Tap action', hold_action: 'Hold action', double_tap_action: 'Double tap action',
      haptics: 'Haptics', haptics_style: 'Haptic style', animations: 'Animations', animation_duration: 'Animation duration',
    },
    modes: { heat: 'Heat', cool: 'Cool', off: 'Off', auto: 'Auto', heat_cool: 'Heat / cool', dry: 'Dry', fan_only: 'Fan only' },
    statuses: { heating: 'Heating', cooling: 'Cooling', drying: 'Drying', fan: 'Fan', idle: 'Idle', off: 'Off', preheating: 'Preheating', defrosting: 'Defrosting', heat: 'Heat', cool: 'Cool', auto: 'Auto', heat_cool: 'Heat / cool', dry: 'Dry', fan_only: 'Fan only' },
    // Backend last_error carries {code, context, message}; keys are the
    // machine-readable codes from the scheduler backend, {placeholders}
    // are substituted from the error context (plus its message).
    errors: {
    invalid_program: '{message}',
      invalid_override_duration: 'Choose a valid override duration.',
      no_next_change: 'There is no upcoming schedule boundary.',
      override_hvac_off: 'Manual overrides are unavailable when the program sets HVAC off.',
      invalid_pause_duration: 'Choose a valid pause length.',
      pause_hvac_off: 'A vacation pause is unavailable when the program sets HVAC off.',
      invalid_override_step: 'The override step must be a finite positive number.',
      invalid_time: 'Times must use the HH:MM 24-hour format.',
      invalid_temperature: 'Temperatures must be finite numbers.',
      invalid_hvac_mode: "hvac_mode must be one of off, heat, cool, auto, dry, fan_only, or heat_cool.",
      unsupported_hvac_mode: 'HVAC mode {mode} is not available for this climate entity.',
      entity_validation_failed: 'The climate entity does not accept this program: {message}',
      entity_unavailable: 'The climate entity is unavailable; the target stays pending.',
      service_call_failed: 'The climate service call failed: {message}',
      no_program: 'No schedule exists for this climate entity.',
      unexpected_failure: 'Scheduler error: {message}',
      invalid_enabled: 'enabled must be boolean.',
      invalid_slots: 'slots must be a list.',
      too_many_slots: 'A program may contain at most {max} slots.',
      empty_enabled_program: 'An enabled program needs at least one slot.',
      invalid_away_temperature: 'The outside-schedule temperature must be a finite number.',
      invalid_slot_schema: 'Each slot needs id, days, start, end, and temperature.',
      invalid_slot_id: 'Slot id must start alphanumeric and use letters, digits, dots, underscores, or hyphens.',
      duplicate_slot_id: 'Duplicate slot id: {id}.',
      invalid_days: 'days must be a non-empty list of ISO weekdays 1..7.',
      duplicate_days: 'days cannot contain duplicates.',
      same_start_end: 'Start and end must differ.',
      slots_overlap: 'Slots {a} and {b} overlap.',
      climate_range_unavailable: 'The climate temperature range or step is unavailable.',
      climate_range_invalid: 'The climate temperature range or step is invalid.',
      target_outside_limits: 'Target {value} is outside the climate limits.',
      target_off_step: 'Target {value} is not aligned to the climate temperature step.',
      heat_cool_unsupported: 'A single target cannot be applied while the climate runs heat_cool; both target temperatures are required.',
      heat_cool_dual_required: 'A heat_cool program needs both temperatures in every slot.',
      dual_range_invalid: 'The low target {low} must stay below the high target {high}.',
      dual_slot_unsupported: 'A slot with two target temperatures needs heat_cool: set the program mode to heat_cool or use one temperature.',
      mixed_slots_mode_required: 'A program with single and range slots needs hvac_mode for its single-target slots.',
    },
    sections: {
      identity: 'Identity and appearance',
      chips: 'Visible elements',
      controls: 'Controls and steps',
      auxiliary: 'Auxiliary controls',
    },
    themeColor: 'Theme',
    help: {
      entity: 'Climate entity controlled by this card.',
      name: 'Card title; defaults to the entity name.',
      icon: 'Overrides the circular status icon.',
      layout: 'pill is the horizontal pill card; compact is the two-row layout; circular is the round dial.',
      step: 'Increment used by the +/- controls. Leave empty to follow the thermostat target_temp_step (0.5 as fallback).',
      show_state_chip: 'HVAC state and relative time in the status line.',
      show_current_temperature_chip: 'Measured temperature chip.',
      show_humidity_chip: 'Room humidity in the status line when the entity provides it.',
      show_unavailable_badge: 'Indicator when the entity is unavailable.',
      show_mode_buttons: 'HVAC mode dropdown, shown in both layouts next to the temperature controls.',
      show_step_controls: 'Show the decrease/increase arrows around the setpoint.',
       show_schedule_button: 'Show the standalone calendar pill that opens the weekly scheduler.',
      accent_color: 'Overrides the accent colour used by the icon, chips, slider and calendar button. Empty follows the theme colour.',
      surface: 'Card background: default follows the theme, elevated adds contrast and depth, blend drops the background for dark dashboards.',
      language: 'Card language; auto follows the Home Assistant interface language.',
      entity_picture: 'Picture URL used instead of the icon; the entity picture is used when this is empty.',
      show_entity_picture: 'Show the picture in place of the circular icon.',
      main_temperature: 'Which temperature takes the prominent slot; the other one moves to the secondary chip.',
      tap_action: 'What a tap on the card background does.',
      hold_action: 'What a long press on the card background does.',
      double_tap_action: 'What a double tap on the card background does.',
      haptics: 'Vibrate briefly on a temperature step or a card action; browsers without vibration support stay silent.',
      haptics_style: 'Vibration pattern: light, medium or heavy.',
      animations: 'Play the value and button animations; switch it off for a completely static card.',
      animation_duration: 'Duration of the value animation in milliseconds (0 falls back to the default).',
      calibration_entity: 'Optional number entity for temperature calibration; it appears in a separate device-settings panel.',
      deadzone_entity: 'Optional number entity for the thermostat deadzone.',
      sensor_source_entity: 'Optional select entity used to choose the thermostat sensor source.',
      child_lock_entity: 'Optional switch entity for the thermostat child lock.',
    },
  },
  it: {
    unavailable: 'Non disponibile',
    entityUnavailable: 'Entità non disponibile',
    currentTemperature: (value) => `Temperatura attuale ${value}`,
    decrease: 'Abbassa la temperatura target',
    increase: 'Alza la temperatura target',
    target: (value, unit) => `Target ${value}${unit}`,
    targetRange: (low, high, unit) => `Intervallo temperatura target da ${low} a ${high}${unit}`,
    targetUnavailable: 'Target non disponibile',
    openDetails: (label) => `${label}. Apri dettagli`,
    toggleHeating: 'Tocca lo sfondo della scheda per alternare riscaldamento e spento',
    actionMoreInfo: 'Tocca lo sfondo della scheda per aprire i dettagli',
    actionNone: 'Card climate, nessuna azione sullo sfondo',
    temperatureControls: 'Controlli temperatura',
    openSchedule: 'Apri la pianificazione',
    midpoint: 'Punto medio intervallo temperatura target',
    targetLabel: 'Temperatura target',
    overrideActive: (expiry) => `Override manuale fino alle ${expiry}`,
    resumeSchedule: 'Riprendi subito la pianificazione',
    pause: 'Pausa vacanza',
    pauseActive: (until) => `Pausa vacanza fino al ${until}`,
    pauseTarget: 'Target della pausa',
    pauseDuration: 'Durata della pausa',
    pauseStart: 'Avvia pausa',
    pauseInvalid: 'Il target della pausa deve essere un numero.',
    pause1d: '1 giorno',
    pause3d: '3 giorni',
    pause7d: '7 giorni',
    pause14d: '14 giorni',
    pause30d: '30 giorni',
    overrideError: (message) => `Impossibile applicare l’override: ${message}`,
    serviceError: (message) => `Servizio non riuscito: ${message}`,
    dualOverrideUnsupported: 'Gli override temporanei supportano un solo target; non è stata inviata alcuna modifica.',
    overrideChoice: 'Durata dell’override manuale', overrideCancel: 'Annulla',
    override30m: '30 minuti', override1h: '1 ora', override2h: '2 ore', overrideNext: 'Fino al prossimo cambio programma',
    hvacMode: 'Modalità HVAC',
    dontChange: 'Non cambiare',
    badMode: 'Modalità HVAC non supportata.',
    weeklySchedule: 'Pianificazione settimanale',
    scheduleAria: 'Pianificazione climate settimanale',
    auxiliaryControls: 'Impostazioni dispositivo',
    auxiliaryAria: 'Controlli ausiliari climate',
    openAuxiliary: 'Apri impostazioni dispositivo',
    closeAuxiliary: 'Chiudi impostazioni dispositivo',
    auxiliaryHint: 'Le modifiche vengono applicate subito alle entità ausiliarie selezionate.',
    auxiliaryUnavailable: 'Questa entità non è disponibile.',
    close: 'Chiudi',
    closeSchedule: 'Chiudi editor pianificazione',
    backendMissing: 'Climate Flow Scheduler non è installato. Installa e configura l’integrazione per modificare un programma (dominio: climate_flow_scheduler).',
    openLegacy: 'Apri pianificazione legacy',
    nextChange: 'Prossimo cambio: ',
    none: 'nessuno',
    active: (id) => ` · Attiva: ${id}`,
    enabled: 'Abilitata',
    outsideSchedule: 'Fuori orario',
    outsideScheduleAria: 'Temperatura fuori orario',
    outsideScheduleTitle: 'Applicata fuori dagli orari programmati; lascia vuoto per mantenere l\u2019ultimo target.',
    slot: (index) => `Fascia ${index}`,
    remove: 'Rimuovi',
    removeSlot: (index) => `Rimuovi fascia ${index}`,
    start: 'Inizio',
    end: 'Fine',
    targetField: 'Target',
    targetLowField: 'Temperatura bassa',
    targetHighField: 'Temperatura alta',
    rangeToggle: 'Intervallo',
    rangeInvalid: 'La temperatura bassa deve restare sotto quella alta.',
    heat_coolNeedsRange: 'heat_cool richiede un intervallo di temperatura in ogni fascia.',
    dualSlotUnsupported: 'Una fascia con intervallo richiede heat_cool: cambia la modalità del programma oppure usa una sola temperatura.',
    mixedModeRequired: 'Un programma con fasce singole e a intervallo richiede una modalità HVAC per le fasce a target singolo.',
    mixedHeatCoolRequired: 'L’entità climate deve supportare heat_cool per usare fasce a intervallo in un programma misto.',
    awayHeatCool: 'La temperatura fuori orario è un target singolo e non può essere usata con heat_cool.',
    addSlot: '+ Aggiungi fascia',
    deleteProgram: 'Elimina programma',
    saveProgram: 'Salva programma',
    // I nomi completi alimentano gli aria-label; il testo visivo del pill
    // viene da dayPills, le cui etichette di due lettere restano univoche.
    dayNames: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
    dayPills: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
    invalidSchedule: 'Pianificazione non valida.',
    needSlot: 'Una pianificazione abilitata richiede almeno una fascia.',
    awayNumber: 'La temperatura fuori orario deve essere un numero.',
    slotInvalid: 'Ogni fascia richiede giorni, orari validi e un target; inizio e fine devono essere diversi.',
    fields: {
      entity: 'Entità climate', name: 'Nome', icon: 'Icona', layout: 'Layout', step: 'Step (incremento)',
      show_state_chip: 'Mostra stato e tempo relativo', show_current_temperature_chip: 'Mostra temperatura attuale',
      show_humidity_chip: 'Mostra umidità', show_unavailable_badge: 'Mostra badge non disponibile',
       show_mode_buttons: 'Mostra selettore modalità HVAC', show_step_controls: 'Mostra controlli +/−', show_schedule_button: 'Mostra pulsante pianificazione',
      calibration_entity: 'Calibrazione temperatura', deadzone_entity: 'Deadzone temperatura',
      sensor_source_entity: 'Sorgente del sensore', child_lock_entity: 'Blocco bambini',
      accent_color: 'Colore accento', surface: 'Sfondo card',
      language: 'Lingua', entity_picture: 'Foto entità',
      show_entity_picture: 'Mostra foto entità', main_temperature: 'Temperatura principale',
      tap_action: 'Azione al tocco', hold_action: 'Azione alla pressione lunga', double_tap_action: 'Azione al doppio tocco',
      haptics: 'Feedback tattile', haptics_style: 'Stile feedback', animations: 'Animazioni', animation_duration: 'Durata animazione',
    },
    modes: { heat: 'Caldo', cool: 'Freddo', off: 'Spento', auto: 'Automatico', heat_cool: 'Caldo / freddo', dry: 'Deumidificazione', fan_only: 'Solo ventilazione' },
    statuses: { heating: 'Riscaldamento', cooling: 'Raffreddamento', drying: 'Deumidificazione', fan: 'Ventilazione', idle: 'Inattivo', off: 'Spento', preheating: 'Preriscaldamento', defrosting: 'Sbrinamento', heat: 'Caldo', cool: 'Freddo', auto: 'Automatico', heat_cool: 'Caldo / freddo', dry: 'Deumidificazione', fan_only: 'Solo ventilazione' },
    errors: {
      invalid_program: '{message}',
      invalid_override_duration: 'Scegli una durata di override valida.',
      no_next_change: 'Non è presente un prossimo confine della pianificazione.',
      override_hvac_off: 'Gli override manuali non sono disponibili quando il programma imposta HVAC su spento.',
      invalid_pause_duration: 'Scegli una durata di pausa valida.',
      pause_hvac_off: 'La pausa vacanza non è disponibile quando il programma imposta HVAC su spento.',
      invalid_override_step: 'Il passo dell’override deve essere un numero finito positivo.',
      invalid_time: 'Gli orari devono usare il formato 24 ore HH:MM.',
      invalid_temperature: 'Le temperature devono essere numeri finiti.',
      invalid_hvac_mode: "hvac_mode deve essere uno di off, heat, cool, auto, dry, fan_only o heat_cool.",
      unsupported_hvac_mode: 'La modalità HVAC {mode} non è disponibile per questa entità climate.',
      entity_validation_failed: 'L\u2019entità climate non accetta questo programma: {message}',
      entity_unavailable: 'L\u2019entità climate non è disponibile; il target resta in attesa.',
      service_call_failed: 'La chiamata al servizio climate è fallita: {message}',
      no_program: 'Non esiste una pianificazione per questa entità climate.',
      unexpected_failure: 'Errore dello scheduler: {message}',
      invalid_enabled: 'enabled deve essere booleano.',
      invalid_slots: 'slots deve essere una lista.',
      too_many_slots: 'Un programma può contenere al massimo {max} fasce.',
      empty_enabled_program: 'Un programma abilitato richiede almeno una fascia.',
      invalid_away_temperature: 'La temperatura fuori orario deve essere un numero finito.',
      invalid_slot_schema: 'Ogni fascia richiede id, days, start, end e temperature.',
      invalid_slot_id: 'L\u2019id della fascia deve iniziare con un carattere alfanumerico e usare lettere, cifre, punti, underscore o trattini.',
      duplicate_slot_id: 'Id fascia duplicato: {id}.',
      invalid_days: 'days deve essere una lista non vuota di giorni ISO 1..7.',
      duplicate_days: 'days non può contenere duplicati.',
      same_start_end: 'Inizio e fine devono differire.',
      slots_overlap: 'Le fasce {a} e {b} si sovrappongono.',
      climate_range_unavailable: 'L\u2019intervallo o il passo temperatura del climate non è disponibile.',
      climate_range_invalid: 'L\u2019intervallo o il passo temperatura del climate non è valido.',
      target_outside_limits: 'Il target {value} è fuori dai limiti del climate.',
      target_off_step: 'Il target {value} non è allineato al passo temperatura del climate.',
      heat_cool_unsupported: 'Non si può applicare un singolo target mentre il clima è in heat_cool: sono richieste entrambe le temperature.',
      heat_cool_dual_required: 'Un programma heat_cool richiede entrambe le temperature in ogni fascia.',
      dual_range_invalid: 'Il limite basso {low} deve restare sotto il limite alto {high}.',
      dual_slot_unsupported: 'Una fascia con due temperature richiede heat_cool: imposta la modalità del programma su heat_cool oppure usa una sola temperatura.',
      mixed_slots_mode_required: 'Un programma con fasce singole e a intervallo richiede hvac_mode per le fasce a target singolo.',
    },
    sections: {
      identity: 'Identità e aspetto',
      chips: 'Elementi visibili',
      controls: 'Controlli e passi',
      auxiliary: 'Controlli ausiliari',
    },
    themeColor: 'Tema',
    help: {
      entity: 'Entità climate controllata da questa card.',
      name: 'Titolo della card; se vuoto usa il nome dell\u2019entità.',
      icon: 'Sostituisce l\u2019icona circolare di stato.',
      layout: 'pill è la card a pillole orizzontale; compact è il layout a due righe; circular è il quadrante rotondo.',
      step: 'Passo dei pulsanti +/-. Vuoto per seguire il target_temp_step del termostato (0.5 come fallback).',
      show_state_chip: 'Stato HVAC e tempo relativo nella riga di stato.',
      show_current_temperature_chip: 'Chip della temperatura misurata.',
      show_humidity_chip: 'Umidità nella riga di stato quando l\u2019entità la fornisce.',
      show_unavailable_badge: 'Indicatore quando l\u2019entità non è disponibile.',
      show_mode_buttons: 'Menu a tendina delle modalità HVAC, mostrato in entrambi i layout accanto ai controlli temperatura.',
      show_step_controls: 'Mostra le frecce diminuisci/aumenta attorno al setpoint.',
       show_schedule_button: 'Mostra la pillola calendario che apre la pianificazione settimanale.',
      accent_color: 'Sovrascrive il colore accento di icona, chip, cursore e pulsante calendario. Vuoto segue il colore del tema.',
      surface: 'Sfondo della card: default segue il tema, elevated aggiunge contrasto e profondità, blend elimina lo sfondo per le dashboard scure.',
      language: 'Lingua della card; auto segue la lingua dell’interfaccia di Home Assistant.',
      entity_picture: 'URL della foto usata al posto dell’icona; se vuoto usa la foto dell’entità.',
      show_entity_picture: 'Mostra la foto al posto dell’icona circolare.',
      main_temperature: 'Quale temperatura occupa lo slot principale; l’altra passa alla chip secondaria.',
      tap_action: 'Cosa fa un tocco sullo sfondo della card.',
      hold_action: 'Cosa fa una pressione lunga sullo sfondo della card.',
      double_tap_action: 'Cosa fa un doppio tocco sullo sfondo della card.',
      haptics: 'Breve vibrazione a ogni passo temperatura o azione della card; i browser senza vibrazione restano silenti.',
      haptics_style: 'Schema di vibrazione: light, medium o heavy.',
      animations: 'Riproduce le animazioni di valore e pulsanti; disattivalo per una card completamente statica.',
      animation_duration: 'Durata dell’animazione del valore in millisecondi (0 usa il default).',
      calibration_entity: 'Entità number opzionale per la calibrazione temperatura; viene mostrata in un pannello separato.',
      deadzone_entity: 'Entità number opzionale per la deadzone del termostato.',
      sensor_source_entity: 'Entità select opzionale per scegliere la sorgente del sensore del termostato.',
      child_lock_entity: 'Entità switch opzionale per il blocco bambini del termostato.',
    },
  },
};
// Modes a program may set; heat_cool is included now that a slot can carry
// both target temperatures (the backend requires dual slots in that case).
const SCHEDULABLE_MODES = ['off', 'heat', 'cool', 'auto', 'dry', 'fan_only', 'heat_cool'];
export const resolveLanguage = (language) => (typeof language === 'string' && language.trim().toLowerCase().startsWith('it') ? 'it' : 'en');
export const cardStrings = (language) => STRINGS[resolveLanguage(language)];
export const fieldLabel = (strings, name) => strings.fields[name] || String(name ?? '').replaceAll('_', ' ');
export const errorLabel = (strings, error) => {
  if (error == null || error === '') return '';
  const dict = typeof error === 'object' ? error : null;
  const code = dict?.code != null ? String(dict.code) : null;
  const message = dict?.message ?? String(error);
  const template = code ? strings?.errors?.[code] : null;
  if (!template) return message || String(error);
  // Placeholders resolve from the error context first, then fall back to the
  // stored raw message so a template with {message} always has a value.
  const values = { ...(dict?.context || {}), message };
  return String(template).replace(/\{(\w+)\}/g, (token, key) => (values[key] != null ? String(values[key]) : token));
};
export const modeLabel = (mode, strings = STRINGS.en) => strings.modes[mode] || String(mode ?? '').replaceAll('_', ' ');
export const effectiveStep = (entity, fallback = 0.5, override = null) => {
  // An explicitly configured step wins over the entity's declared step, so a
  // card can offer 0.5 increments on an entity that declares 1.
  const overrideValue = numeric(override);
  if (overrideValue !== null) return overrideValue > 0 ? overrideValue : null;
  const attributes = entity?.attributes || {};
  const raw = attributes.target_temp_step;
  if (raw !== undefined && raw !== null && !(typeof raw === 'string' && ['unknown', 'unavailable'].includes(raw.trim().toLowerCase()))) {
    const declared = numeric(raw);
    return declared !== null && declared > 0 ? declared : null;
  }
  return numeric(fallback);
};

export const scheduleDraft = (program) => ({ enabled: Boolean(program?.enabled), awayTemperature: program?.away_temperature ?? null, hvacMode: program?.hvac_mode ?? null, slots: (Array.isArray(program?.slots) ? program.slots : []).map((slot) => ({
  id: String(slot.id ?? ''), days: Array.isArray(slot.days) ? slot.days.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7) : [],
  start: String(slot.start ?? '08:00'), end: String(slot.end ?? '09:00'), temperature: slot.temperature ?? null,
  // `range` is the editor's switch between the two slot shapes the backend
  // accepts: exactly one target form per slot, never both.
  range: slot.target_temp_low !== undefined && slot.target_temp_high !== undefined,
  targetTempLow: slot.target_temp_low ?? null, targetTempHigh: slot.target_temp_high ?? null,
})) });
// Seed a heat_cool pair from the single value a slot already has: on the
// entity grid, inside its limits, low strictly below high.
export const seedRange = (base, step, min, max) => {
  const increment = numeric(step) !== null && numeric(step) > 0 ? numeric(step) : 0.5;
  const floor = numeric(min), ceiling = numeric(max);
  let low = numeric(base);
  if (low === null) low = floor !== null ? floor : 0;
  if (floor !== null) low = Math.max(low, floor);
  if (ceiling !== null) low = Math.min(low, Math.max(floor ?? ceiling, ceiling - increment));
  const high = ceiling !== null ? Math.min(low + increment, ceiling) : low + increment;
  return { low, high };
};
// The one place that picks which target form goes on the wire for a slot.
export const draftSlotPayload = (slot) => {
  const base = { id: slot.id, days: [...(slot.days || [])].sort((a, b) => a - b), start: slot.start, end: slot.end };
  return slot.range
    ? { ...base, target_temp_low: Number(slot.targetTempLow), target_temp_high: Number(slot.targetTempHigh) }
    : { ...base, temperature: Number(slot.temperature) };
};
export const validateScheduleDraft = (draft, strings = STRINGS.en, entity = undefined) => {
  if (!draft || typeof draft.enabled !== 'boolean' || !Array.isArray(draft.slots)) return strings.invalidSchedule;
  if (draft.enabled && draft.slots.length === 0) return strings.needSlot;
  const away = draft.awayTemperature;
  if (away !== null && away !== undefined && String(away).trim() !== '' && numeric(away) === null) return strings.awayNumber;
  const hasAwayTarget = away !== null && away !== undefined && String(away).trim() !== '';
  const mode = draft.hvacMode;
  if (mode !== null && mode !== undefined && mode !== '' && !SCHEDULABLE_MODES.includes(mode)) return strings.badMode;
  for (const slot of draft.slots) {
    if (!slot.id || !Array.isArray(slot.days) || !slot.days.length || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.end) || slot.start === slot.end) return strings.slotInvalid;
    if (slot.range) {
      const low = numeric(slot.targetTempLow), high = numeric(slot.targetTempHigh);
      if (slot.targetTempLow === '' || slot.targetTempHigh === '' || low === null || high === null || low >= high) return strings.rangeInvalid;
    } else if (slot.temperature === '' || numeric(slot.temperature) === null) {
      return strings.slotInvalid;
    }
  }
  // Shape rules mirroring the backend: heat_cool has no single temperature to
  // send. Mixed schedules use hvac_mode for scalar slots and temporarily
  // switch range slots to heat_cool.
  const hasRange = draft.slots.some((slot) => slot.range);
  const hasSingle = draft.slots.some((slot) => !slot.range);
  const mixedTargets = hasRange && hasSingle;
  if (mode === 'heat_cool' && hasSingle) return strings.heat_coolNeedsRange;
  if (draft.enabled && mode === 'heat_cool' && hasAwayTarget) return strings.awayHeatCool;
  if (draft.enabled && mixedTargets && !mode) return strings.mixedModeRequired;
  if (entity && draft.enabled && validState(entity.state)) {
    const effectiveMode = mode || entity.state;
    if (effectiveMode === 'heat_cool') {
      if (hasSingle) return strings.heat_coolNeedsRange;
      if (hasAwayTarget) return strings.awayHeatCool;
    } else if (effectiveMode !== 'off') {
      if (mixedTargets) {
        const supportedModes = modes(entity);
        if (supportedModes.length && !supportedModes.includes('heat_cool')) return strings.mixedHeatCoolRequired;
      } else if (hasRange) return strings.dualSlotUnsupported;
    }
  }
  return null;
};

export const targetModel = (entity) => {
  const a = entity?.attributes || {}, min = numeric(a.min_temp), max = numeric(a.max_temp);
  const low = numeric(a.target_temp_low), high = numeric(a.target_temp_high);
  const dual = entity?.state === 'heat_cool' && low !== null && high !== null && low <= high;
  const single = entity?.state === 'heat_cool' ? null : numeric(a.temperature);
  const value = dual ? (low + high) / 2 : single;
  const stateAvailable = typeof entity?.state === 'string' && validState(entity.state);
  const limitsValid = min !== null && max !== null && min <= max;
  const gap = dual ? high - low : 0;
  const controllable = stateAvailable && value !== null && limitsValid && (!dual || (gap <= max - min && low >= min && high <= max));
  return { dual, low, high, value, min, max, available: stateAvailable && value !== null, controllable,
    sliderMin: controllable ? (dual ? min + gap / 2 : min) : null,
    sliderMax: controllable ? (dual ? max - gap / 2 : max) : null };
};
const validState = (state) => Boolean(state && !['unknown', 'unavailable'].includes(state));

export const clampTarget = (value, entity, fallbackStep, overrideStep = null) => {
  const n = numeric(value), a = entity?.attributes || {}, min = numeric(a.min_temp), max = numeric(a.max_temp);
  const increment = effectiveStep(entity, fallbackStep, overrideStep);
  if (n === null || min === null || max === null || min > max || increment === null || increment <= 0) return null;
  const scale = Math.max(1, Math.abs(min), Math.abs(max), Math.abs(increment));
  const tolerance = Number.EPSILON * scale * 8;
  const ratio = (max - min) / increment;
  const ratioTolerance = tolerance / increment;
  const adjustedRatio = ratio + ratioTolerance;
  if (!Number.isFinite(ratio) || !Number.isFinite(ratioTolerance) || !Number.isFinite(adjustedRatio) || adjustedRatio > Number.MAX_SAFE_INTEGER) return null;
  let maxIndex = Math.floor(adjustedRatio);
  const gridValue = (i) => Number((min + i * increment).toPrecision(15));
  let corrections = 0;
  while (maxIndex >= 0 && gridValue(maxIndex) > max) {
    if (++corrections > 2) return null;
    maxIndex -= 1;
  }
  if (maxIndex < 0) return null;
  const index = Math.max(0, Math.min(maxIndex, Math.round((n - min) / increment)));
  const snapped = gridValue(index);
  return snapped >= min && snapped <= max ? snapped : null;
};

export const temperaturePayload = (entity, value, step, overrideStep = null) => {
  const requested = numeric(value);
  if (requested === null || !entity || !validState(entity.state)) return null;
  const attrs = entity?.attributes || {};
  if (entity.state === 'heat_cool') {
    if (numeric(attrs.target_temp_low) === null || numeric(attrs.target_temp_high) === null || numeric(attrs.target_temp_low) > numeric(attrs.target_temp_high)) return null;
    const low = numeric(attrs.target_temp_low), high = numeric(attrs.target_temp_high);
    const min = numeric(attrs.min_temp), max = numeric(attrs.max_temp);
    if (min === null || max === null || min > max || high - low > max - min) return null;
    const increment = effectiveStep(entity, step, overrideStep);
    if (increment === null || increment <= 0) return null;
    const delta = requested - (low + high) / 2;
    const minShiftIndex = Math.ceil((min - low) / increment - 1e-10);
    const maxShiftIndex = Math.floor((max - high) / increment + 1e-10);
    if (minShiftIndex > maxShiftIndex) return null;
    const shiftIndex = Math.max(minShiftIndex, Math.min(maxShiftIndex, Math.round(delta / increment)));
    const shift = Number((shiftIndex * increment).toFixed(8));
    return { target_temp_low: Number((low + shift).toFixed(8)), target_temp_high: Number((high + shift).toFixed(8)) };
  }
  const target = clampTarget(requested, entity, step, overrideStep);
  return target === null ? null : { temperature: target };
};

export const hvacToggleMode = (entity) => { if (!entity || !validState(entity.state)) return null; const mode = entity.state === 'off' ? 'heat' : 'off'; return modes(entity).includes(mode) ? mode : null; };

const valid = (v) => v !== undefined && v !== null && v !== '' && v !== 'unknown' && v !== 'unavailable';
export const normalizeLayout = (value) => {
  if (value === undefined || value === null || value === '') return 'pill';
  return value === 'pill' || value === 'compact' || value === 'circular' ? value : null;
};
// Card chrome: an optional accent override plus a surface variant. Both are
// normalised so a hand-written config degrades to the theme instead of
// breaking the render, and both are validated eagerly in setConfig.
export const CARD_SURFACES = ['default', 'elevated', 'blend'];
export const normalizeAccentColor = (value) => (typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()) ? value.trim().toLowerCase() : null);
export const normalizeSurface = (value) => (CARD_SURFACES.includes(value) ? value : 'default');
// The compact slider paints its track with a gradient, so the current value
// has to reach the CSS as a percentage of the entity's own range.
export const sliderFillPercent = (slider) => {
  const min = Number(slider?.min), max = Number(slider?.max), value = Number(slider?.value);
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(value) || max <= min) return 100;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};
export const paintSliderFill = (slider) => {
  if (slider?.style?.setProperty) slider.style.setProperty('--fill', `${sliderFillPercent(slider)}%`);
  return slider;
};
// Card actions: what a tap, a long press and a double tap do on the card
// background. `toggle` is the historic behaviour (switch heating on/off),
// `more-info` opens the entity details, `none` leaves the gesture inert.
export const CARD_ACTIONS = ['toggle', 'more-info', 'none'];
export const normalizeCardAction = (value, fallback) => (CARD_ACTIONS.includes(value) ? value : fallback);
// Per-mode accents, so a card reads as heating or cooling at a glance. An
// explicit accent_color always wins; a missing entry means "use the theme".
export const MODE_ACCENTS = { heat: '#f59f42', cool: '#71c0ff', dry: '#7fd0c8', auto: '#c5a66f', fan_only: '#83d39c' };
export const modeAccentColor = (state) => {
  const accent = typeof state === 'string' ? MODE_ACCENTS[state] : undefined;
  return typeof accent === 'string' && /^#[0-9a-f]{6}$/i.test(accent) ? accent.toLowerCase() : null;
};
// Card language: `auto` follows the Home Assistant interface language.
export const cardLanguage = (config, hassLocale) => (config?.language && config.language !== 'auto' ? config.language : hassLocale);
// Which temperature owns the prominent slot of a layout; the other one falls
// back to the secondary chip. Every layout renders the same decision.
export const mainTemperatureKind = (value) => (value === 'current' ? 'current' : 'target');
// The hero slot prefers the configured temperature and falls back to the other
// one when its value is missing (no current reading, no target), so the card
// never shows an empty hero next to a chip that could have filled it. The chip
// then carries whichever value the hero is not showing.
export const heroTemperaturePlan = (options = {}) => {
  const { hasTarget = false, hasCurrent = false, main = 'target' } = options;
  const want = mainTemperatureKind(main);
  const other = want === 'current' ? 'target' : 'current';
  const available = { target: Boolean(hasTarget), current: Boolean(hasCurrent) };
  const hero = available[want] ? want : available[other] ? other : null;
  const chip = hero === 'target' ? 'current' : 'target';
  return { hero, chip: available[chip] ? chip : null };
};
// Haptics: a short vibration per step or action, only when the browser
// exposes one (silent no-op elsewhere, so nothing needs feature detection at
// the call site).
export const HAPTIC_STYLES = ['light', 'medium', 'heavy'];
export const HAPTIC_PATTERNS = { light: [8], medium: [16], heavy: [26] };
export const hapticPattern = (style) => HAPTIC_PATTERNS[style] || HAPTIC_PATTERNS.medium;
export const normalizeHapticStyle = (value) => (HAPTIC_STYLES.includes(value) ? value : 'medium');
export const vibrateSupported = () => typeof globalThis.navigator?.vibrate === 'function';
export const fireHaptic = (config, style) => {
  if (!config || config.haptics === false) return false;
  if (!vibrateSupported()) return false;
  try { return globalThis.navigator.vibrate(hapticPattern(style || normalizeHapticStyle(config.haptics_style))) !== false; }
  catch { return false; }
};
// Motion: animations can be switched off wholesale, and the duration feeds the
// CSS custom property instead of being hardcoded per rule.
export const ANIMATION_DURATION_DEFAULT = 220;
export const normalizeAnimationDuration = (value) => {
  const parsed = numeric(value);
  return parsed !== null && parsed > 0 ? Math.min(2000, Math.round(parsed)) : ANIMATION_DURATION_DEFAULT;
};
// Commit batching: a slider or a drag can request several values in a row, so
// the service call waits for a short pause (and is retried before the
// optimistic value rolls back, unlike a single button press).
export const COMMIT_DEBOUNCE_MS = 220;
export const COMMIT_RETRY_MS = 400;
export const COMMIT_RETRIES = 2;
// Drag: a horizontal gesture must travel DRAG_THRESHOLD_PX before it stops
// being a tap, and every DRAG_STEP_PX moves the target by one step so the
// value snaps instead of wobbling.
export const DRAG_THRESHOLD_PX = 6;
export const DRAG_STEP_PX = 12;
export const dragStepValue = (origin, deltaPx, step) => {
  const base = numeric(origin), increment = numeric(step), delta = numeric(deltaPx);
  if (base === null || increment === null || increment <= 0 || delta === null) return null;
  return base + Math.round(delta / DRAG_STEP_PX) * increment;
};
// Circular dial: a 270° sweep on a 200x200 viewBox, leaving the gap at the
// bottom. Angles follow the SVG convention (0° at 3 o'clock, y grows down), so
// the sweep runs from 135° (bottom-left) clockwise to 405° (bottom-right).
export const DIAL_SIZE = 200;
export const DIAL_RADIUS = 80;
export const DIAL_START_ANGLE = 135;
export const DIAL_SWEEP = 270;
export const DIAL_DRAG_THRESHOLD_PX = 6;
// Value → [0,1] position on the sweep, tolerant of a missing or inverted range.
export const dialFraction = (value, min, max) => {
  const v = numeric(value), lo = numeric(min), hi = numeric(max);
  if (v === null || lo === null || hi === null || hi <= lo) return 0;
  return Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
};
export const dialAngle = (fraction) => {
  const f = numeric(fraction);
  return DIAL_START_ANGLE + Math.min(1, Math.max(0, f === null ? 0 : f)) * DIAL_SWEEP;
};
export const dialPoint = (fraction, radius = DIAL_RADIUS, center = DIAL_SIZE / 2) => {
  const radians = dialAngle(fraction) * Math.PI / 180;
  return {
    x: Number((center + radius * Math.cos(radians)).toFixed(3)),
    y: Number((center + radius * Math.sin(radians)).toFixed(3)),
  };
};
export const dialFractionFromAngle = (angleDegrees) => {
  const raw = numeric(angleDegrees);
  if (raw === null) return null;
  const offset = ((raw - DIAL_START_ANGLE) % 360 + 360) % 360;
  if (offset <= DIAL_SWEEP) return offset / DIAL_SWEEP;
  // Inside the bottom gap: snap to the nearer end rather than wrapping.
  return offset - DIAL_SWEEP < 360 - offset ? 1 : 0;
};
// Pointer position (viewport coordinates) → the raw value under the finger.
// The dial maps its whole min..max range onto the sweep, so both a single
// target and each side of a heat_cool range read from the same scale.
export const dialValueFromPointer = (clientX, clientY, rect, min, max) => {
  const x = numeric(clientX), y = numeric(clientY), lo = numeric(min), hi = numeric(max);
  if (x === null || y === null || lo === null || hi === null || hi <= lo) return null;
  if (!rect || !(rect.width > 0) || !(rect.height > 0)) return null;
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const fraction = dialFractionFromAngle(Math.atan2(y - cy, x - cx) * 180 / Math.PI);
  if (fraction === null) return null;
  return lo + fraction * (hi - lo);
};
// One side of a heat_cool range: snapped to the step, kept inside the entity
// limits and always one step away from the other side.
export const dialBoundValue = (value, bound, entity, step) => {
  const attributes = entity?.attributes || {};
  const min = numeric(attributes.min_temp), max = numeric(attributes.max_temp);
  const low = numeric(attributes.target_temp_low), high = numeric(attributes.target_temp_high);
  const increment = numeric(step); const v = numeric(value);
  if (v === null) return null;
  const snap = increment !== null && increment > 0 ? Math.round(v / increment) * increment : v;
  const clampedMin = min === null ? -Infinity : min, clampedMax = max === null ? Infinity : max;
  if (bound === 'low') {
    const limitedByHigh = high === null ? snap : Math.min(snap, high - (increment && increment > 0 ? increment : 0));
    return Number(Math.min(clampedMax, Math.max(clampedMin, limitedByHigh)).toFixed(4));
  }
  const limitedByLow = low === null ? snap : Math.max(snap, low + (increment && increment > 0 ? increment : 0));
  return Number(Math.min(clampedMax, Math.max(clampedMin, limitedByLow)).toFixed(4));
};
// Dash values for the value arc: `start`..`end` in sweep fractions, expressed
// as a dash pattern on the rotated circle (the track uses the same rotation).
export const dialArc = (startFraction, endFraction) => {
  const circumference = 2 * Math.PI * DIAL_RADIUS;
  const track = circumference * (DIAL_SWEEP / 360);
  const from = dialFraction(startFraction, 0, 1);
  const to = dialFraction(endFraction, 0, 1);
  const length = Math.max(0, (to - from) * track);
  return {
    track: Number(track.toFixed(3)),
    dasharray: `${length.toFixed(3)} ${circumference.toFixed(3)}`,
    // `|| 0` keeps a zero offset at +0: SameValue(-0, 0) is false, and the
    // tests compare this number exactly.
    dashoffset: Number((-from * track).toFixed(3)) || 0,
  };
};
export const isClimateActive = (entityOrState) => {
  const state = typeof entityOrState === 'string' ? entityOrState : entityOrState?.state;
  if (typeof state !== 'string') return false;
  const trimmed = state.trim();
  if (!trimmed || trimmed === 'unknown' || trimmed === 'unavailable' || trimmed === 'off') return false;
  return true;
};
export const isScheduleEnabled = (program) => Boolean(program?.enabled);
export const awayTemperaturePayload = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  return numeric(value);
};
export const climateStatusKey = (entity) => {
  const action = entity?.attributes?.hvac_action;
  if (typeof action === 'string' && action.trim() && valid(action.trim())) return action.trim();
  return typeof entity?.state === 'string' ? entity.state : '';
};
export const statusLabel = (status, strings = STRINGS.en) => {
  if (typeof status !== 'string') return '';
  const key = status.trim();
  if (!key) return '';
  if (strings.statuses[key]) return strings.statuses[key];
  const human = key.replaceAll('_', ' ').trim();
  return human ? human.charAt(0).toUpperCase() + human.slice(1) : '';
};
export const pickEntityTimestamp = (entity) => {
  for (const candidate of [entity?.last_changed, entity?.last_updated]) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue;
    if (Number.isFinite(Date.parse(candidate))) return candidate;
  }
  return null;
};
export const formatNumber = (value, locale) => {
  const n = typeof value === 'number' ? value : numeric(value);
  if (n === null || !Number.isFinite(n)) return '';
  try {
    const tag = typeof locale === 'string' && locale.trim() ? locale.trim() : undefined;
    if (typeof globalThis.Intl?.NumberFormat === 'function') {
      return new globalThis.Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(n);
    }
  } catch {}
  return String(n);
};
export const formatRelativeTime = (timestamp, nowMs = Date.now(), locale) => {
  const time = typeof timestamp === 'number' ? timestamp : typeof timestamp === 'string' ? Date.parse(timestamp) : NaN;
  const now = typeof nowMs === 'number' && Number.isFinite(nowMs) ? nowMs : Date.now();
  if (!Number.isFinite(time) || !Number.isFinite(now)) return '';
  let diffSeconds = Math.round((now - time) / 1000);
  if (diffSeconds < 0) diffSeconds = 0;
  const tag = typeof locale === 'string' && locale.trim() ? locale.trim() : null;
  if (tag) {
    try {
      const RelativeTimeFormat = globalThis.Intl?.RelativeTimeFormat;
      if (typeof RelativeTimeFormat === 'function') {
        const rtf = new RelativeTimeFormat(tag, { numeric: 'auto' });
        if (diffSeconds < 5) return rtf.format(0, 'second');
        if (diffSeconds < 60) return rtf.format(-diffSeconds, 'second');
        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60) return rtf.format(-minutes, 'minute');
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return rtf.format(-hours, 'hour');
        return rtf.format(-Math.floor(hours / 24), 'day');
      }
    } catch {}
  }
  if (diffSeconds < 45) return 'just now';
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
};
export const relativeRefreshDelay = (timestamp, nowMs = Date.now(), locale) => {
  const time = typeof timestamp === 'number' ? timestamp : typeof timestamp === 'string' ? Date.parse(timestamp) : NaN;
  const now = typeof nowMs === 'number' && Number.isFinite(nowMs) ? nowMs : Date.now();
  if (!Number.isFinite(time) || !Number.isFinite(now)) return null;
  let usesIntl = false;
  const tag = typeof locale === 'string' && locale.trim() ? locale.trim() : null;
  if (tag) {
    try {
      const RelativeTimeFormat = globalThis.Intl?.RelativeTimeFormat;
      if (typeof RelativeTimeFormat === 'function') {
        new RelativeTimeFormat(tag, { numeric: 'auto' });
        usesIntl = true;
      }
    } catch {}
  }
  if (time > now) return Math.min(2_147_483_647, time - now + (usesIntl ? 4_500 : 44_500));
  const elapsed = (now - time) / 1000;
  const rounded = Math.round(elapsed);
  let nextChange;
  if (usesIntl && rounded < 5) nextChange = 4.5;
  else if (usesIntl && rounded < 60) nextChange = rounded + 0.5;
  else if (!usesIntl && rounded < 45) nextChange = 44.5;
  else if (rounded < 3600) nextChange = (Math.floor(rounded / 60) + 1) * 60 - 0.5;
  else if (rounded < 86_400) nextChange = (Math.floor(rounded / 3_600) + 1) * 3_600 - 0.5;
  else nextChange = (Math.floor(rounded / 86_400) + 1) * 86_400 - 0.5;
  return Math.min(2_147_483_647, Math.max(250, Math.ceil((nextChange - elapsed) * 1000)));
};
export const pillStatusParts = (options = {}) => {
  const { statusText = '', humidityValue = null, relativeText = '', showStateChip = true, showHumidityChip = false, locale } = options;
  const parts = [];
  if (showStateChip && typeof statusText === 'string' && statusText) parts.push(String(statusText));
  if (showHumidityChip && numeric(humidityValue) !== null) parts.push(`${formatNumber(numeric(humidityValue), locale)}%`);
  if (showStateChip && relativeText) parts.push(String(relativeText));
  return parts;
};
export const currentTemperatureDisplay = (value, unit, locale) => {
  const formatted = formatNumber(value, locale);
  return formatted ? `${formatted} ${unit}` : '';
};
const modes = (entity) => Array.isArray(entity?.attributes?.hvac_modes) ? entity.attributes.hvac_modes : [];
export const manualOverrideServicePayload = (entityId, temperature, duration, step = null) => {
  if (typeof temperature !== 'number' || !Number.isFinite(temperature) || !['30m', '1h', '2h', 'next_change'].includes(duration)) return null;
  if (step !== null && (typeof step !== 'number' || !Number.isFinite(step) || step <= 0)) return null;
  return { climate_entity: entityId, temperature, duration, ...(step === null ? {} : { step }) };
};
export const overrideDurationChoices = (strings) => [
  ['30m', strings.override30m], ['1h', strings.override1h], ['2h', strings.override2h], ['next_change', strings.overrideNext],
];
export const formatOverrideExpiry = (expiry, locale) => {
  const date = new Date(expiry);
  return Number.isNaN(date.getTime()) ? String(expiry ?? '') : date.toLocaleString(locale);
};
export const overrideFocusSelector = (slider, delta) => slider ? '.slider' : delta !== null ? `[data-delta="${delta}"]` : '.setpoint, .target, button, input, select';
// Vacation pause: the backend holds one target for a number of days, then the
// weekly program resumes on its own. Durations mirror the service schema.
export const PAUSE_DURATIONS = ['1d', '3d', '7d', '14d', '30d'];
export const pauseServicePayload = (entityId, temperature, duration) => {
  const target = typeof temperature === 'number' ? temperature : numeric(temperature);
  if (target === null || !PAUSE_DURATIONS.includes(duration)) return null;
  return { climate_entity: entityId, temperature: target, duration };
};
export const pauseDurationChoices = (strings) => PAUSE_DURATIONS.map((value) => [value, strings?.[`pause${value}`] ?? value]);
export const activePause = (pause, nowMs = Date.now()) => {
  // The diagnostic sensor keeps an expired pause until the next evaluation;
  // only an unexpired one may be shown as active.
  if (!pause || typeof pause !== 'object') return null;
  const until = typeof pause.until === 'string' ? Date.parse(pause.until) : NaN;
  const now = typeof nowMs === 'number' && Number.isFinite(nowMs) ? nowMs : Date.now();
  return Number.isFinite(until) && until > now ? pause : null;
};
export const schedulableModes = (entity) => {
  const available = modes(entity);
  const supported = available.length ? available : SCHEDULABLE_MODES;
  return SCHEDULABLE_MODES.filter((mode) => supported.includes(mode));
};
const HTMLElementBase = globalThis.HTMLElement ?? class {};

// Preset for freshly created cards: it deliberately omits `step`, because a
// configured step is an explicit override. Without it the card follows the
// entity's target_temp_step and keeps 0.5 only as the runtime fallback for an
// entity that declares no step.
export const defaultCardConfig = (entity = 'climate.example') => ({
  entity, layout: 'pill',
  show_state_chip: true, show_current_temperature_chip: true, show_humidity_chip: false,
  show_unavailable_badge: true, show_mode_buttons: true, show_step_controls: true, show_schedule_button: true,
});
// Home Assistant expects a suggestion object ({ config }), not a bare card
// configuration: the card picker reads suggestion.config.
export const getEntitySuggestion = (_hass, entityId) => typeof entityId === 'string' && entityId.startsWith('climate.')
  ? { config: { type: 'custom:climate-flow-card', ...defaultCardConfig(entityId) } }
  : null;
// Defaults for the options that carry no key in defaultCardConfig. The editor
// resolves a missing key through cardDefault, so it can show the real value
// without ever writing it back to the YAML.
export const CARD_OPTION_DEFAULTS = {
  language: 'auto', main_temperature: 'target', surface: 'default', show_entity_picture: false,
  tap_action: 'toggle', hold_action: 'none', double_tap_action: 'none',
  haptics: true, haptics_style: 'medium', animations: true, animation_duration: ANIMATION_DURATION_DEFAULT,
};
const AUXILIARY_ENTITY_DOMAINS = {
  calibration_entity: ['number'],
  deadzone_entity: ['number'],
  sensor_source_entity: ['select'],
  child_lock_entity: ['switch'],
};
const entityMatchesDomains = (entityId, domains) => typeof entityId === 'string'
  && domains.some((domain) => entityId.startsWith(`${domain}.`) && entityId.length > domain.length + 1);
const hasConfiguredAuxiliaryEntities = (config) => Object.keys(AUXILIARY_ENTITY_DOMAINS)
  .some((key) => typeof config?.[key] === 'string' && config[key].trim());
export const cardDefault = (name, entity) => {
  const base = defaultCardConfig(entity);
  return Object.hasOwn(base, name) ? base[name] : CARD_OPTION_DEFAULTS[name];
};
// The editor keeps the user's YAML clean: any value equal to its default is
// dropped, empty optional values are dropped too, and `entity` is never
// removable (a config without it would be rejected by setConfig).
export const stripCardDefaults = (config) => {
  const next = { ...config };
  for (const key of Object.keys(next)) {
    if (key === 'entity' || key === 'type') continue;
    const fallback = cardDefault(key, next.entity);
    if (fallback === undefined) {
      if (next[key] === '' || next[key] === null || next[key] === undefined) delete next[key];
      continue;
    }
    if (next[key] === fallback) delete next[key];
  }
  return next;
};

const field = (name, selector) => ({ name, selector });
const grid = (name, schema) => ({ type: 'grid', name, schema });
const expandable = (name, schema, collapsed = true) => ({ type: 'expandable', name, collapsed, schema });
export const configSchema = [
  grid('identity', [
    field('entity', { entity: { filter: { domain: ['climate'] } } }),
    field('name', { text: {} }),
    field('icon', { icon: {} }),
    field('layout', { select: { mode: 'dropdown', options: ['pill', 'compact', 'circular'] } }),
    field('accent_color', { color: {} }),
    field('surface', { select: { mode: 'dropdown', options: CARD_SURFACES } }),
    field('language', { select: { mode: 'dropdown', options: ['auto', 'en', 'it'] } }),
    field('entity_picture', { text: {} }),
  ]),
  grid('chips', [
    ...['show_state_chip', 'show_current_temperature_chip', 'show_humidity_chip', 'show_unavailable_badge', 'show_entity_picture'].map((name) => field(name, { boolean: {} })),
    field('main_temperature', { select: { mode: 'dropdown', options: ['target', 'current'] } }),
  ]),
  // Advanced controls are grouped separately: new presets omit step so the
  // entity's declared target_temp_step is respected by default.
  expandable('controls', [
    ...['show_mode_buttons', 'show_step_controls', 'show_schedule_button'].map((name) => field(name, { boolean: {} })),
    field('step', { number: { min: 0.01, max: 10, step: 0.01, mode: 'box' } }),
    field('tap_action', { select: { mode: 'dropdown', options: CARD_ACTIONS } }),
    field('hold_action', { select: { mode: 'dropdown', options: CARD_ACTIONS } }),
    field('double_tap_action', { select: { mode: 'dropdown', options: CARD_ACTIONS } }),
    field('haptics', { boolean: {} }),
    field('haptics_style', { select: { mode: 'dropdown', options: HAPTIC_STYLES } }),
    field('animations', { boolean: {} }),
    field('animation_duration', { number: { min: 0, max: 2000, step: 10, mode: 'box' } }),
  ]),
  expandable('auxiliary', [
    field('calibration_entity', { entity: { filter: { domain: AUXILIARY_ENTITY_DOMAINS.calibration_entity } } }),
    field('deadzone_entity', { entity: { filter: { domain: AUXILIARY_ENTITY_DOMAINS.deadzone_entity } } }),
    field('sensor_source_entity', { entity: { filter: { domain: AUXILIARY_ENTITY_DOMAINS.sensor_source_entity } } }),
    field('child_lock_entity', { entity: { filter: { domain: AUXILIARY_ENTITY_DOMAINS.child_lock_entity } } }),
  ]),
];
export const configSchemaFields = () => {
  const flatten = (items) => items.flatMap((item) => (Array.isArray(item?.schema) ? flatten(item.schema) : [item]));
  return flatten(configSchema).filter((item) => item.name);
};

export const sameCardConfig = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[key] !== b[key]) return false;
  return true;
};

// Buttons share a small theme-aware state layer so hover and press feedback is
// visible in every layout, editor and dialog without replacing semantic fills.
const BUTTON_FEEDBACK_CSS = `
  button:not(:disabled):not([role="slider"]){cursor:pointer;transition:background-color .14s ease,border-color .14s ease,color .14s ease,box-shadow .14s ease}
  @media (hover:hover) and (pointer:fine){button:not(:disabled):not([role="slider"]):hover{box-shadow:inset 0 0 0 999px color-mix(in srgb,currentColor 8%,transparent)}}
  button:not(:disabled):not([role="slider"]):active,.days label:active .day,.range-toggle:active .day{box-shadow:inset 0 0 0 999px color-mix(in srgb,currentColor 16%,transparent);transition-duration:0s}
  .days .day,.range-toggle .day{transition:background .15s ease,color .15s ease,box-shadow .14s ease}
  @media (hover:hover) and (pointer:fine){.days label:hover .day,.range-toggle:hover .day{box-shadow:inset 0 0 0 999px color-mix(in srgb,currentColor 8%,transparent)}}
  button:disabled{opacity:.45;cursor:default}
  button:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px}
  @media (prefers-reduced-motion:reduce){button,.days .day,.range-toggle .day{transition:none!important}}
`;

// Editor chrome: section cards with a label/description row and the control
// on the right, the same vocabulary as the Home Assistant sections UI.
const EDITOR_CSS = `
  :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,inherit)}
  .ed{display:flex;flex-direction:column;gap:12px;padding:4px 2px 8px}
  .ed-sec{background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:16px;padding:10px 16px 14px}
  .ed-sec h3{margin:8px 0 2px;font-size:14px;font-weight:600}
  .ed-row{display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap;padding:9px 0;border-top:1px solid var(--divider-color)}
  .ed-sec h3 + .ed-row{border-top:0}
  .ed-txt{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 180px}
  .ed-lbl{font-size:14px;font-weight:500}
  .ed-help{font-size:12px;color:var(--secondary-text-color);line-height:1.35}
  .ed-input{flex:1 1 160px;max-width:260px;min-width:0;font:inherit;font-size:14px;color:var(--primary-text-color);background:var(--card-background-color,var(--ha-card-background));border:1px solid var(--divider-color);border-radius:10px;padding:9px 10px}
  .ed-input::placeholder{color:var(--secondary-text-color)}
  .ed-input:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px;border-color:transparent}
  ha-entity-picker{flex:1 1 200px;max-width:320px;min-width:0}
  .sw{appearance:none;-webkit-appearance:none;flex:0 0 auto;position:relative;width:42px;height:24px;border-radius:999px;background:var(--divider-color);border:0;margin:0;cursor:pointer;transition:background .2s}
  .sw::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:var(--text-primary-color,#fff);transition:transform .2s}
  .sw:checked{background:var(--climate-flow-accent-color,var(--primary-color))}
  .sw:checked::after{transform:translateX(18px)}
  .sw:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .ed-seg{display:inline-flex;gap:3px;background:var(--card-background-color,var(--ha-card-background));border:1px solid var(--divider-color);border-radius:999px;padding:3px;flex:0 0 auto}
  .ed-seg button{font:inherit;font-size:13px;font-weight:600;color:var(--secondary-text-color);background:transparent;border:0;border-radius:999px;padding:6px 16px;cursor:pointer}
  .ed-seg button[aria-pressed="true"]{background:var(--climate-flow-accent-color,var(--primary-color));color:var(--text-primary-color,#fff)}
  .ed-seg button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .ed-color{display:flex;align-items:center;gap:10px;flex:0 0 auto}
  .ed-color input[type=color]{width:46px;height:32px;padding:2px;border:1px solid var(--divider-color);border-radius:10px;background:var(--card-background-color,var(--ha-card-background));cursor:pointer}
  .ed-color input[type=color]:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
  .ed-color button{font:inherit;font-size:12px;font-weight:600;padding:7px 12px;border-radius:999px;border:1px solid var(--divider-color);background:var(--card-background-color,var(--ha-card-background));color:var(--primary-text-color);cursor:pointer}
  .ed-color button:disabled{opacity:.45;cursor:default}
  .ed-color button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .preview{pointer-events:none}
  @media(max-width:520px){.ed-row{flex-direction:column;align-items:stretch}.ed-input,ha-entity-picker{max-width:none}}
  ${BUTTON_FEEDBACK_CSS}
`;

export class ClimateFlowCardEditor extends HTMLElementBase {
  set hass(value) {
    this._hass = value;
    // Forward to the live controls instead of rebuilding them: recreating the
    // form on every hass tick (or config echo) dropped keyboard focus, so
    // typing a name required one click per letter.
    if (this._entityPicker) this._entityPicker.hass = value;
    for (const picker of this._entityPickers?.values?.() || []) if (picker !== this._entityPicker) picker.hass = value;
    if (this._preview) this._preview.hass = value;
  }
  setConfig(config) {
    // The editor keeps the user's YAML as it is: defaults are resolved per
    // control through _value instead of being copied into the config we emit
    // back, so only what the user actually changes reaches the YAML.
    const raw = { ...(config || {}) };
    // A null/empty step is "follow the entity": keep it out of the config so
    // the card never receives a value it would reject.
    if (raw.step === null || raw.step === undefined || (typeof raw.step === 'string' && !raw.step.trim())) delete raw.step;
    this._config = stripCardDefaults(raw);
    this._render();
  }
  _value(name, options) {
    if (name in this._config) return this._config[name];
    const fallback = cardDefault(name, this._config?.entity);
    if (fallback !== undefined) return fallback;
    return options ? options[0] : undefined;
  }
  connectedCallback() { this._widenDialog(true); }
  disconnectedCallback() { this._widenDialog(false); }
  // The editor follows the Home Assistant interface language: the card-level
  // `language` option is a display setting of the card itself.
  _strings() { return cardStrings(this._hass?.locale?.language); }
  // The Home Assistant edit dialog splits its width between the form and HA's
  // own preview: its title click toggles `large`, which removes the 1000px cap
  // (2025.1) or switches the dialog to full width (current). Opening our editor
  // requests that wide mode; closing restores whatever the dialog had.
  _widenDialog(enter) {
    try {
      if (enter) {
        const dialog = this._findEditDialog();
        if (dialog && 'large' in dialog && dialog.large === false) { dialog.large = true; this._widenedDialog = dialog; }
      } else if (this._widenedDialog) {
        this._widenedDialog.large = false;
        this._widenedDialog = null;
      }
    } catch { this._widenedDialog = null; }
  }
  _findEditDialog() {
    let node = this;
    for (let i = 0; i < 24 && node; i += 1) {
      if (typeof node.tagName === 'string' && node.tagName.toLowerCase() === 'hui-dialog-edit-card') return node;
      const root = typeof node.getRootNode === 'function' ? node.getRootNode() : null;
      if (root && root.host) node = root.host;
      else if (node.parentElement) node = node.parentElement;
      else break;
    }
    try { return globalThis.document?.querySelector?.('hui-dialog-edit-card') || null; } catch { return null; }
  }
  _render() {
    if (!this.attachShadow) return;
    if (!this._panel) {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._build();
    }
    this._syncFields();
    this._syncPreview();
  }
  _build() {
    const strings = this._strings();
    const style = document.createElement('style');
    style.textContent = EDITOR_CSS;
    const panel = document.createElement('div');
    panel.className = 'ed';
    for (const section of configSchema) panel.append(this._buildSection(section, strings));
    // Live preview: the same card component fed with the edited config and the
    // real hass object, inert because clicks are disabled on the box.
    const previewBox = document.createElement('div');
    previewBox.className = 'preview';
    const preview = document.createElement('climate-flow-card');
    try { preview.setConfig({ ...this._config }); } catch { /* a transient invalid config waits for the next edit */ }
    this._previewData = { ...this._config };
    previewBox.append(preview);
    this.shadowRoot.append(style, panel, previewBox);
    this._panel = panel;
    this._preview = preview;
  }
  _buildSection(section, strings) {
    const box = document.createElement('section');
    box.className = 'ed-sec';
    const title = document.createElement('h3');
    title.textContent = strings.sections[section.name] || section.name;
    box.append(title);
    for (const item of section.schema || []) box.append(this._buildField(item, strings));
    return box;
  }
  _row(strings, name) {
    const row = document.createElement('div');
    row.className = 'ed-row';
    const text = document.createElement('span');
    text.className = 'ed-txt';
    const label = document.createElement('span');
    label.className = 'ed-lbl';
    label.textContent = fieldLabel(strings, name);
    text.append(label);
    const help = strings.help[name] || '';
    if (help) { const hint = document.createElement('span'); hint.className = 'ed-help'; hint.textContent = help; text.append(hint); }
    row.append(text);
    return row;
  }
  _buildField(item, strings) {
    const selector = item.selector || {};
    if (selector.entity) return this._buildEntity(item, strings);
    if (selector.boolean) return this._buildSwitch(item, strings);
    if (selector.number) return this._buildStep(item, strings);
    if (selector.select) return this._buildSegmented(item, strings, selector.select.options || []);
    if (selector.color) return this._buildColor(item, strings);
    return this._buildText(item, strings);
  }
  _buildEntity(item, strings) {
    const row = this._row(strings, item.name);
    const domains = item.selector?.entity?.filter?.domain || ['climate'];
    let control;
    if (globalThis.customElements?.get?.('ha-entity-picker')) {
      control = document.createElement('ha-entity-picker');
      control.hass = this._hass;
      control.value = this._value(item.name) || '';
      control.includeDomains = domains;
      control.setAttribute('aria-label', fieldLabel(strings, item.name));
      control.addEventListener('value-changed', (event) => {
        event.stopPropagation();
        const value = event.detail?.value;
        if (entityMatchesDomains(value, domains)) this._setField(item.name, value);
        else if (!value && Object.hasOwn(AUXILIARY_ENTITY_DOMAINS, item.name)) this._setField(item.name, undefined);
      });
      this._entityPickers = this._entityPickers || new Map();
      this._entityPickers.set(item.name, control);
      if (domains.includes('climate')) this._entityPicker = control;
    } else {
      control = document.createElement('input');
      control.type = 'text';
      control.className = 'ed-input';
      control.placeholder = `${domains[0]}.entity`;
      control.value = this._value(item.name) || '';
      control.setAttribute('aria-label', fieldLabel(strings, item.name));
      // Free text is accepted while typing but only an id in the allowed
      // domain is stored.
      control.addEventListener('input', () => {
        const value = control.value.trim();
        if (entityMatchesDomains(value, domains)) this._setField(item.name, value);
        else if (!value && Object.hasOwn(AUXILIARY_ENTITY_DOMAINS, item.name)) this._setField(item.name, undefined);
      });
    }
    row.append(control);
    row._fieldControl = control;
    this._fields = this._fields || new Map();
    this._fields.set(item.name, row);
    return row;
  }
  _buildSwitch(item, strings) {
    const row = this._row(strings, item.name);
    row.className = 'ed-row';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'sw';
    input.setAttribute('role', 'switch');
    input.checked = Boolean(this._value(item.name));
    input.setAttribute('aria-label', fieldLabel(strings, item.name));
    input.addEventListener('change', () => this._setField(item.name, input.checked));
    row.append(input);
    row._fieldControl = input;
    this._fields = this._fields || new Map();
    this._fields.set(item.name, row);
    return row;
  }
  _buildText(item, strings) {
    const row = this._row(strings, item.name);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ed-input';
    if (item.name === 'icon') input.placeholder = 'mdi:thermostat';
    input.value = this._value(item.name) ?? '';
    input.setAttribute('aria-label', fieldLabel(strings, item.name));
    input.addEventListener('input', () => {
      const value = input.value.trim();
      // An emptied text field drops the key instead of storing ''.
      if (!value) { if (item.name in this._config) this._setField(item.name, undefined); return; }
      this._setField(item.name, value);
    });
    row.append(input);
    row._fieldControl = input;
    this._fields = this._fields || new Map();
    this._fields.set(item.name, row);
    return row;
  }
  _buildStep(item, strings) {
    const row = this._row(strings, item.name);
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'ed-input';
    input.min = String(item.selector.number.min ?? 0.01);
    input.step = String(item.selector.number.step ?? 0.01);
    input.placeholder = 'auto';
    input.value = this._value(item.name) ?? '';
    input.setAttribute('aria-label', fieldLabel(strings, item.name));
    input.addEventListener('input', () => {
      const value = numeric(input.value);
      // Empty clears the override; an invalid or zero value is kept out of the
      // config (the card would reject it), the last good value stays active.
      if (value === null) { if (input.value.trim() === '' && item.name in this._config) this._setField(item.name, undefined); return; }
      if (value <= 0) return;
      this._setField(item.name, value);
    });
    row.append(input);
    row._fieldControl = input;
    this._fields = this._fields || new Map();
    this._fields.set(item.name, row);
    return row;
  }
  _buildSegmented(item, strings, options) {
    const row = this._row(strings, item.name);
    const group = document.createElement('div');
    group.className = 'ed-seg';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', fieldLabel(strings, item.name));
    // An unset choice reads as the first option, which is always the default
    // (layout ships a value, surface ships none and starts on "default").
    group._options = options;
    const current = this._value(item.name, options);
    for (const option of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(option);
      button.setAttribute('aria-pressed', String(current === option));
      button.addEventListener('click', () => this._setField(item.name, option));
      group.append(button);
    }
    row.append(group);
    row._fieldControl = group;
    this._fields = this._fields || new Map();
    this._fields.set(item.name, row);
    return row;
  }
  _buildColor(item, strings) {
    const row = this._row(strings, item.name);
    const wrap = document.createElement('span');
    wrap.className = 'ed-color';
    const input = document.createElement('input');
    input.type = 'color';
    const current = normalizeAccentColor(this._value(item.name));
    input.value = current || this._themeAccent();
    input.setAttribute('aria-label', fieldLabel(strings, item.name));
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = strings.themeColor || 'Theme';
    reset.disabled = !current;
    input.addEventListener('input', () => this._setField(item.name, normalizeAccentColor(input.value)));
    reset.addEventListener('click', () => { this._setField(item.name, undefined); input.value = this._themeAccent(); reset.disabled = true; });
    wrap.append(input, reset);
    row.append(wrap);
    row._fieldControl = input;
    row._colorReset = reset;
    this._fields = this._fields || new Map();
    this._fields.set(item.name, row);
    return row;
  }
  _themeAccent() {
    // Seed the picker with the active theme accent so the first pick starts
    // from what the card already looks like.
    try {
      const value = typeof getComputedStyle === 'function' ? getComputedStyle(this).getPropertyValue('--primary-color') : '';
      return normalizeAccentColor(value) || '#00a5a5';
    } catch { return '#00a5a5'; }
  }
  _setField(name, value) {
    // Anything equal to its default is dropped, so the emitted YAML only ever
    // carries what the user actually changed (and legacy configs written by an
    // older version are cleaned up on the first edit).
    const draft = { ...this._config };
    if (value === undefined || value === null || value === '') delete draft[name];
    else draft[name] = value;
    const next = stripCardDefaults(draft);
    if (sameCardConfig(this._config, next)) return;
    this._config = next;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...this._config } }, ['bub' + 'bles']: true, composed: true }));
    this._syncFields();
    this._syncPreview();
  }
  _syncFields() {
    if (!this._fields) return;
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    for (const [name, row] of this._fields) {
      const control = row._fieldControl;
      if (!control) continue;
      if (control.tagName === 'INPUT' && control.type === 'checkbox') {
        // The raw config only carries non-default values, so a toggle must
        // resolve through _value or every default reads as switched off.
        const checked = Boolean(this._value(name));
        if (control.checked !== checked) control.checked = checked;
      } else if (control.type === 'color') {
        const accent = normalizeAccentColor(this._value(name));
        if (accent) control.value = accent;
        if (row._colorReset) row._colorReset.disabled = !accent;
      } else if (control.classList?.contains('ed-seg')) {
        const current = this._value(name, control._options || []);
        for (const button of control.children) button.setAttribute('aria-pressed', String(current === button.textContent));
      } else if (control !== active) {
        const value = this._value(name) ?? '';
        if (String(control.value ?? '') !== String(value)) control.value = value;
      }
    }
  }
  _syncPreview() {
    if (!this._preview) return;
    if (!sameCardConfig(this._previewData, this._config)) {
      try { this._preview.setConfig({ ...this._config }); this._previewData = { ...this._config }; } catch { /* keep the last renderable preview */ }
    }
    if (this._hass) this._preview.hass = this._hass;
  }
}

export class ClimateFlowCard extends HTMLElementBase {
  static getConfigElement() { return document.createElement('climate-flow-card-editor'); }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states || {}).find((id) => id.startsWith('climate.')) || 'climate.example';
    return defaultCardConfig(entity);
  }
  setConfig(config) {
    if (!config?.entity || !/^climate\./.test(config.entity)) throw new Error('Specify a climate entity (climate.*).');
    const layout = normalizeLayout(config.layout);
    if (!layout) throw new Error('Supported layouts are "pill", "compact" and "circular".');
    // Cosmetic chrome is validated up front: a typo in YAML would otherwise be
    // silently ignored, and the editor can only produce values we accept.
    if (config.accent_color !== undefined && config.accent_color !== null && config.accent_color !== '' && !normalizeAccentColor(config.accent_color)) throw new Error('accent_color must be a hex colour like "#3f9cf4".');
    if (config.surface !== undefined && config.surface !== null && config.surface !== '' && !CARD_SURFACES.includes(config.surface)) throw new Error(`surface must be one of ${CARD_SURFACES.join(', ')}.`);
    for (const key of ['tap_action', 'hold_action', 'double_tap_action']) {
      const value = config[key];
      if (value !== undefined && value !== null && value !== '' && !CARD_ACTIONS.includes(value)) throw new Error(`${key} must be one of ${CARD_ACTIONS.join(', ')}.`);
    }
    if (config.main_temperature !== undefined && config.main_temperature !== null && config.main_temperature !== '' && !['target', 'current'].includes(config.main_temperature)) throw new Error('main_temperature must be "target" or "current".');
    if (config.language !== undefined && config.language !== null && config.language !== '' && !['auto', 'en', 'it'].includes(config.language)) throw new Error('language must be "auto", "en" or "it".');
    const auxiliaryEntityConfig = {};
    for (const [key, domains] of Object.entries(AUXILIARY_ENTITY_DOMAINS)) {
      const entityId = config[key];
      if (entityId === undefined || entityId === null || (typeof entityId === 'string' && !entityId.trim())) continue;
      if (!entityMatchesDomains(entityId, domains)) throw new Error(`${key} must refer to a ${domains.join(' or ')} entity.`);
      auxiliaryEntityConfig[key] = entityId.trim();
    }
    // An empty step (null, '' or whitespace) means "follow the entity": the
    // editor emits null when the box is cleared, and throwing there would make
    // every toggle in the card editor look broken.
    const stepAbsent = config.step === undefined || config.step === null || (typeof config.step === 'string' && !config.step.trim());
    if (!stepAbsent && (numeric(config.step) === null || numeric(config.step) <= 0)) throw new Error('step must be a number greater than zero.');
    this._stepOverride = stepAbsent ? null : numeric(config.step);
    this.config = { layout: 'pill', show_state_chip: true, show_current_temperature_chip: true, show_humidity_chip: false,
      show_unavailable_badge: true, show_mode_buttons: true, show_step_controls: true, show_schedule_button: true, step: 0.5, ...config, ...auxiliaryEntityConfig, layout };
    if (stepAbsent) this.config.step = 0.5;
    // Chrome is stored normalised (lower-case hex, known surface) so the render
    // never re-validates, and an emptied editor field is dropped instead of
    // being kept as an unusable value.
    const accent = normalizeAccentColor(this.config.accent_color);
    if (accent) this.config.accent_color = accent;
    else delete this.config.accent_color;
    if (this.config.surface !== undefined && this.config.surface !== null && this.config.surface !== '') this.config.surface = normalizeSurface(this.config.surface);
    else delete this.config.surface;
    // Interaction and display options are normalised the same way, so the
    // render can read them without re-checking what the YAML contained.
    this.config.tap_action = normalizeCardAction(this.config.tap_action, 'toggle');
    this.config.hold_action = normalizeCardAction(this.config.hold_action, 'none');
    this.config.double_tap_action = normalizeCardAction(this.config.double_tap_action, 'none');
    this.config.main_temperature = mainTemperatureKind(this.config.main_temperature);
    if (typeof this.config.entity_picture === 'string') {
      const picture = this.config.entity_picture.trim();
      if (picture) this.config.entity_picture = picture;
      else delete this.config.entity_picture;
    } else delete this.config.entity_picture;
    // Feedback and motion options: booleans default to on, the style and the
    // duration are normalised so the render never validates them again.
    for (const key of ['haptics', 'animations']) {
      const value = this.config[key];
      if (value !== undefined && value !== null && value !== '' && typeof value !== 'boolean') throw new Error(`${key} must be true or false.`);
      this.config[key] = value !== false;
    }
    if (this.config.haptics_style !== undefined && this.config.haptics_style !== null && this.config.haptics_style !== '' && !HAPTIC_STYLES.includes(this.config.haptics_style)) throw new Error(`haptics_style must be one of ${HAPTIC_STYLES.join(', ')}.`);
    this.config.haptics_style = normalizeHapticStyle(this.config.haptics_style);
    const animationDurationAbsent = this.config.animation_duration === undefined || this.config.animation_duration === null || this.config.animation_duration === '';
    if (animationDurationAbsent) delete this.config.animation_duration;
    else if (numeric(this.config.animation_duration) === null || numeric(this.config.animation_duration) <= 0) throw new Error('animation_duration must be a number of milliseconds greater than zero.');
    else this.config.animation_duration = normalizeAnimationDuration(this.config.animation_duration);
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    // A new config opens the render gate again: repaint now and re-seal it
    // with the signature of the freshly rendered world.
    this._renderedSignature = null;
    this._renderPreservingDeltaFocus();
    this._renderedSignature = this._renderSignature();
    this._scheduleRelativeRefresh();
  }
  set hass(hass) {
    this._hass = hass;
    this._reconcileOptimistic();
    this._syncAuxiliaryDialog();
    // HA hands a tick to every card on the dashboard for any state change;
    // rebuilding the whole tree for an update that changes nothing steals
    // focus and wastes work. The signature covers everything the DOM can
    // show, so the rebuild waits for a real difference. Dialog edits, the
    // +/- deltas and the optimistic preview repaint through their own paths
    // and never pass through this gate.
    const signature = this._renderSignature();
    if (signature === this._renderedSignature && this.shadowRoot) {
      this._scheduleRelativeRefresh();
      return;
    }
    this._renderedSignature = signature;
    this._renderPreservingDeltaFocus();
    this._scheduleRelativeRefresh();
  }
  connectedCallback() { this._scheduleRelativeRefresh(); }
    disconnectedCallback() { clearTimeout(this._optimisticTimer); this._optimisticTimer = null; this._optimistic = null; clearTimeout(this._relativeTimer); this._relativeTimer = null; this._relativeRefreshKey = null; clearTimeout(this._pillStepFeedbackTimer); this._pillStepFeedbackTimer = null; this._pillStepFeedbackDelta = null; clearTimeout(this._cardSurfaceFeedbackTimer); this._cardSurfaceFeedbackTimer = null; this._cardPressFeedback = false; clearTimeout(this._tapTimer); this._tapTimer = null; clearTimeout(this._holdTimer); this._holdTimer = null; clearTimeout(this._commitTimer); this._commitTimer = null; this._holdFired = false; this._lastTapAt = 0; this._detachDialDrag(); this._detachHeroDrag(); this._dragConsumed = false; }
  getCardSize() { const layout = this.config?.layout; return layout === 'circular' ? 3 : layout === 'compact' ? 2 : 1; }
  _service(domain, service, data) {
    if (!this._hass) return Promise.resolve();
    return Promise.resolve().then(() => this._hass.callService(domain, service, data)).catch((error) => {
      this._showServiceError(error);
      return undefined;
    });
  }
  _strings() { return cardStrings(cardLanguage(this.config, this._hass?.locale?.language)); }
  _actionLabel(strings) {
    const action = this.config?.tap_action;
    return action === 'more-info' ? strings.actionMoreInfo : action === 'none' ? strings.actionNone : strings.toggleHeating;
  }
  _runCardAction(action) {
    // The only action that needs no entity lookup is `none`; `toggle` falls
    // back silently when the entity cannot be toggled (e.g. heat-only).
    if (action === 'none') return;
    fireHaptic(this.config, 'light');
    if (action === 'more-info') {
      this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: this.config.entity }, ['bub' + 'bles']: true, composed: true }));
      return;
    }
    const mode = hvacToggleMode(this._hass?.states?.[this.config.entity]);
    if (mode) this._service('climate', 'set_hvac_mode', { entity_id: this.config.entity, hvac_mode: mode });
  }
  _showServiceError(error) {
    const t = this._strings();
    const dialogError = this.shadowRoot?.querySelector('.aux-dialog[open] .aux-error');
    if (dialogError) { dialogError.textContent = t.serviceError(errorLabel(t, error)); return; }
    let alert = this.shadowRoot?.querySelector('.card-service-error');
    if (!alert && this.shadowRoot) {
      alert = document.createElement('div'); alert.className = 'card-service-error'; alert.setAttribute('role', 'alert'); alert.setAttribute('aria-live', 'assertive');
      alert.style.cssText = 'color:var(--error-color);padding:6px 10px;font-size:12px'; this.shadowRoot.append(alert);
    }
    if (alert) alert.textContent = t.serviceError(errorLabel(t, error));
  }
  _statusDisplay(entity, strings = STRINGS.en) {
    const key = climateStatusKey(entity);
    const hass = this._hass;
    try {
      const action = entity?.attributes?.hvac_action;
      if (typeof action === 'string' && action.trim() && valid(action.trim()) && typeof hass?.formatEntityAttributeValue === 'function') {
        const formatted = hass.formatEntityAttributeValue(entity, 'hvac_action');
        if (typeof formatted === 'string' && formatted.trim()) return formatted;
      }
    } catch {}
    try {
      if (typeof hass?.formatEntityState === 'function' && entity) {
        const formatted = hass.formatEntityState({ ...entity, state: String(key || entity.state || '') });
        if (typeof formatted === 'string' && formatted.trim()) return formatted;
      }
    } catch {}
    return statusLabel(key || entity?.state, strings);
  }
  _relativeDisplay(entity) {
    const timestamp = pickEntityTimestamp(entity);
    if (!timestamp) return '';
    try {
      return formatRelativeTime(timestamp, Date.now(), this._hass?.locale?.language);
    } catch { return ''; }
  }
  _refreshRelativeDisplay() {
    const chip = this.shadowRoot?.querySelector('.status-line .relative');
    if (chip) chip.textContent = this._relativeDisplay(this._hass?.states?.[this.config?.entity]);
  }
  _scheduleRelativeRefresh() {
    if (!this.isConnected) {
      clearTimeout(this._relativeTimer);
      this._relativeTimer = null;
      this._relativeRefreshKey = null;
      return;
    }
    const chip = this.shadowRoot?.querySelector('.status-line .relative');
    const timestamp = pickEntityTimestamp(this._hass?.states?.[this.config?.entity]);
    const locale = this._hass?.locale?.language;
    if (!chip || !timestamp) {
      clearTimeout(this._relativeTimer);
      this._relativeTimer = null;
      this._relativeRefreshKey = null;
      return;
    }
    const key = `${timestamp}\u0000${locale || ''}`;
    if (this._relativeTimer && this._relativeRefreshKey === key) return;
    clearTimeout(this._relativeTimer);
    this._relativeTimer = null;
    const delay = relativeRefreshDelay(timestamp, Date.now(), locale);
    if (delay === null) { this._relativeRefreshKey = null; return; }
    this._relativeRefreshKey = key;
    this._relativeTimer = setTimeout(() => {
      this._relativeTimer = null;
      this._relativeRefreshKey = null;
      this._refreshRelativeDisplay();
      this._scheduleRelativeRefresh();
    }, delay);
  }
  _renderSignature() {
    // Everything the DOM can reflect: the climate entity (its state, every
    // attribute the card reads and the timestamps that age the relative
    // chip), the programs sensor, and the locale/unit environment. The HA
    // formatters are captured by presence: a hass that gains one repaints.
    const entity = this._hass?.states?.[this.config?.entity];
    const sensor = this._scheduleSensor();
    return JSON.stringify([
      entity?.entity_id, entity?.state, entity?.last_changed, entity?.last_updated,
      entity?.attributes,
      sensor?.entity_id, sensor?.state, sensor?.last_changed, sensor?.attributes,
      this._hass?.locale?.language, this._hass?.config?.unit_system?.temperature,
      typeof this._hass?.formatEntityState, typeof this._hass?.formatEntityAttributeValue,
    ]);
  }
  _render() {
    if (!this.shadowRoot || !this.config) return;
    if ((this._scheduleOpen || this._overrideDialogOpen || this._auxiliaryOpen) && this.shadowRoot.querySelector('dialog[open]')) return;
    if ((this.config.layout ?? 'pill') === 'circular') this._renderCircular();
    else if ((this.config.layout ?? 'pill') === 'compact') this._renderCompact();
    else this._renderPill();
    this._applyCardChrome();
  }
  _applyCardChrome() {
    // Accent and surface are card-wide: they live on ha-card so every rule
    // reading the accent variable (icon, chips, slider, calendar button)
    // picks the configured value up in both layouts without duplication.
    const card = this.shadowRoot?.querySelector?.('ha-card');
    if (!card) return;
    // Accent precedence: the explicit choice, then the active mode's colour,
    // then the theme. It is read fresh on every render, so switching from heat
    // to off drops back to the theme accent by itself.
    const accent = normalizeAccentColor(this.config?.accent_color) || modeAccentColor(this._hass?.states?.[this.config?.entity]?.state);
    if (accent) card.style.setProperty('--climate-flow-accent-color', accent);
    else card.style.removeProperty('--climate-flow-accent-color');
    card.dataset.surface = normalizeSurface(this.config?.surface);
    card.dataset.motion = this.config?.animations === false ? 'off' : 'on';
    card.style.setProperty('--cf-motion', `${normalizeAnimationDuration(this.config?.animation_duration)}ms`);
  }
  _paintIcon(box, glyph, picture) {
    // The entity picture replaces the glyph without removing the ha-icon node
    // the render already resolved; without a picture the glyph comes back.
    if (!box || !glyph) return;
    const existing = box.querySelector('img');
    if (!picture) { existing?.remove(); glyph.hidden = false; return; }
    if (!existing || existing.getAttribute('src') !== picture) {
      const image = document.createElement('img');
      image.alt = '';
      image.src = picture;
      existing?.remove();
      box.append(image);
    }
    glyph.hidden = true;
  }
  _renderPill() {
    const c = this.config, e = this._displayEntity(this._hass?.states?.[c.entity]), a = e?.attributes || {};
    const unavailable = !e || !valid(e.state);
    const active = !unavailable && isClimateActive(e);
    const currentValue = numeric(a.current_temperature);
    const model = targetModel(e);
    const unit = this._hass?.config?.unit_system?.temperature || '°C';
    const target = model.value;
    const title = c.name || a.friendly_name || c.entity;
    const hasTarget = !unavailable && model.available;
    const step = effectiveStep(e, c.step, this._stepOverride);
    const adjustable = hasTarget && model.controllable && step !== null && step > 0;
    const locale = this._hass?.locale?.language;
    const t = this._strings();
    const statusText = unavailable ? '' : this._statusDisplay(e, t);
    const relativeText = unavailable ? '' : this._relativeDisplay(e);
    const humidityValue = numeric(a.current_humidity);
    const scheduleActive = isScheduleEnabled(this._scheduleProgram());
    const modeList = modes(e).filter((m) => valid(m));
    // main_temperature picks the prominent slot (the setpoint here) and the
    // chip always carries the other value; the default keeps today's look.
    const picture = c.show_entity_picture ? String(c.entity_picture || a.entity_picture || '') : '';
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;container-type:inline-size;container-name:climate-flow-card;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,inherit)}
       ha-card{--cf-accent:var(--climate-flow-accent-color,var(--primary-color));--climate-flow-pill-background:var(--ha-card-background,var(--card-background-color));border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:var(--climate-flow-border-radius,18px);background:var(--climate-flow-pill-background);padding:7px 8px;box-sizing:border-box;min-height:64px;display:block;overflow:hidden;cursor:pointer;box-shadow:0 4px 14px -12px rgba(0,0,0,.55);transition:background-color .16s ease}ha-card:focus-visible{outline:2px solid var(--cf-accent);outline-offset:2px}
       ha-card[data-surface="elevated"]{--climate-flow-pill-background:color-mix(in srgb,var(--ha-card-background,var(--card-background-color)) 84%,var(--text-primary-color) 16%);background:var(--climate-flow-pill-background);border-color:color-mix(in srgb,var(--divider-color) 45%,transparent);box-shadow:0 18px 38px -26px rgba(0,0,0,.95)}
       ha-card[data-surface="blend"]{--climate-flow-pill-background:transparent;background:var(--climate-flow-pill-background);border-color:transparent;box-shadow:none}
       .pill{display:grid;grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"identity current schedule" "controls controls controls";align-items:center;gap:6px;min-width:0}
       .identity{grid-area:identity;display:flex;align-items:center;gap:6px;min-width:0}
      .icon{width:34px;height:34px;flex:0 0 34px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color);border:1px solid var(--divider-color)}
      .icon[data-active="true"]{background:var(--climate-flow-accent-color,var(--primary-color));color:var(--text-primary-color,#fff);border-color:transparent}
      .icon ha-icon{--mdc-icon-size:19px}
      .icon img{width:100%;height:100%;object-fit:cover;border-radius:50%}.icon ha-icon[hidden]{display:none}
       .meta{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:2px;overflow:hidden}
       .title{font-size:14px;line-height:1.2;font-weight:600;letter-spacing:-.01em;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .status{font-size:11px;line-height:1.25;color:var(--secondary-text-color);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .status[data-show-state-indicator="true"]::before{content:'';display:inline-block;width:6px;height:6px;margin:0 6px 1px 1px;border-radius:50%;background:var(--secondary-text-color);vertical-align:middle}
        .status[data-climate-state="active"][data-show-state-indicator="true"]::before{background:var(--cf-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--cf-accent) 15%,transparent)}
        .status[data-climate-state="unavailable"]{color:var(--error-color)}.status[data-climate-state="unavailable"]::before{background:var(--error-color)}
       .status-line{display:flex;min-width:0;gap:0;white-space:nowrap;overflow:hidden}
       .status-line span{min-width:0;overflow:hidden;text-overflow:ellipsis}
       .status-line span+span:before{content:' · ';white-space:pre;color:var(--secondary-text-color)}
       .status-line .relative{flex:0 0 auto;overflow:visible}.override-badge{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--primary-color);font-weight:600}
       .current{grid-area:current;flex:0 1 auto;display:inline-flex;align-items:center;gap:4px;min-width:0;max-width:none;font-size:11px;font-weight:600;padding:6px 8px;border-radius:999px;background:var(--secondary-background-color);color:var(--primary-text-color);white-space:nowrap;font-variant-numeric:tabular-nums}
      .current[data-active="true"]{background:var(--climate-flow-accent-color,var(--primary-color));color:var(--text-primary-color,#fff)}
       .current ha-icon{--mdc-icon-size:13px;display:block;flex:0 0 auto;color:currentColor;opacity:.85}
       .current span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
       .pill [hidden]{display:none!important}
        .controls{grid-area:controls;justify-self:center;width:max-content;flex:0 1 auto;min-width:0;display:flex;align-items:center;gap:0;box-sizing:border-box;background:var(--secondary-background-color);border-radius:999px;padding:2px;max-width:100%;overflow-x:auto;overflow-y:hidden;overscroll-behavior-inline:contain;scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--secondary-text-color) 42%,transparent) transparent;-webkit-overflow-scrolling:touch}
        .controls::-webkit-scrollbar{height:4px}.controls::-webkit-scrollbar-track{background:transparent}.controls::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--secondary-text-color) 42%,transparent);border-radius:999px}
        .controls button{font:inherit;font-size:13px;color:var(--primary-text-color);background:transparent;border:0;border-radius:999px;padding:6px 7px;cursor:pointer;white-space:nowrap;flex:0 0 auto}
       .controls button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .controls button:disabled{opacity:.45;cursor:default;background:var(--secondary-background-color)}
        .controls .setpoint{font-weight:700;min-width:48px;text-align:center;background:transparent;font-size:14px;padding:6px 2px;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
        .controls select{font:inherit;font-size:12px;color:var(--primary-text-color);background:transparent;border:0;border-radius:999px;padding:6px 4px;cursor:pointer;min-width:48px;max-width:72px;overflow:hidden;text-overflow:ellipsis}
        .controls select:focus-visible{outline:2px solid var(--primary-color);outline-offset:0}
       .controls .setpoint:focus-visible{outline-offset:0;border-radius:10px}
       .controls .setpoint{touch-action:pan-y}[role="slider"]{cursor:ew-resize}
       @keyframes cf-bump{0%{transform:translateY(3px) scale(.95);opacity:.6}60%{transform:translateY(-1px) scale(1.01);opacity:1}100%{transform:none;opacity:1}}
       .bump{animation:cf-bump var(--cf-motion,220ms) cubic-bezier(.2,.7,.3,1)}
       [data-motion="off"] *{animation:none!important;transition:none!important}
        [data-motion="on"] button:not([role="slider"]):active{transform:scale(.95)}
        .actions{grid-area:schedule;display:flex;align-items:center;gap:5px;flex:0 0 auto}.schedule,.auxiliary{display:grid;place-items:center;flex:0 0 auto;padding:6px 8px;font:inherit;color:var(--primary-text-color);background:var(--secondary-background-color);border:0;border-radius:999px;cursor:pointer}
        .schedule[data-active="true"]{background:var(--climate-flow-accent-color,var(--primary-color));color:var(--text-primary-color,#fff)}
        .schedule:focus-visible,.auxiliary:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.schedule ha-icon,.auxiliary ha-icon{--mdc-icon-size:18px;display:block}
            @container climate-flow-card (max-width:320px){ha-card{padding:6px}.pill{gap:5px}.identity{gap:5px}.icon{width:30px;height:30px;flex-basis:30px}.icon ha-icon{--mdc-icon-size:17px}.current{gap:3px;padding:5px 6px}.current ha-icon{--mdc-icon-size:12px}.controls button{padding:5px}.controls .setpoint{min-width:42px;padding-inline:1px}.schedule,.auxiliary{padding:5px 6px}}
            @container climate-flow-card (min-width:481px){ha-card{padding:8px 10px}.pill{display:flex;gap:10px}.identity{flex:1 1 0;gap:10px}.icon{width:40px;height:40px;flex-basis:40px}.icon ha-icon{--mdc-icon-size:22px}.title{font-size:15px}.status{font-size:12px}.current{max-width:none;gap:5px;font-size:12px;padding:8px 11px}.current ha-icon{--mdc-icon-size:15px}.controls{width:auto;justify-self:auto;max-width:42%}.controls button{font-size:14px;padding:7px 10px}.controls .setpoint{min-width:58px;font-size:15px;padding:7px 2px}.controls select{font-size:13px;min-width:54px;max-width:96px;padding:7px 5px}.schedule,.auxiliary{padding:8px 11px}}
        ${BUTTON_FEEDBACK_CSS}
        .controls button[data-delta]{transition:background-color .12s ease,transform .12s ease}
         @media (hover:hover) and (pointer:fine){.controls button[data-delta]:not(:disabled):hover{background:var(--divider-color);color:var(--primary-text-color);box-shadow:none}}
         .controls button[data-delta].step-feedback:not(:disabled),.controls button[data-delta]:not(:disabled):active{background:var(--divider-color);color:var(--primary-text-color);box-shadow:none;transform:scale(.96)}
         @media(prefers-reduced-motion:reduce){.controls button[data-delta]{transition:none!important}}
          @media (hover:hover) and (pointer:fine){ha-card:not([data-surface="blend"]):hover{background-color:color-mix(in srgb,var(--cf-accent) 5%,var(--climate-flow-pill-background))}ha-card[data-surface="blend"]:hover{background-color:color-mix(in srgb,var(--cf-accent) 5%,transparent)}}
          ha-card:not([data-surface="blend"]).card-press-feedback{background-color:color-mix(in srgb,var(--cf-accent) 9%,var(--climate-flow-pill-background))}
          ha-card[data-surface="blend"].card-press-feedback{background-color:color-mix(in srgb,var(--cf-accent) 9%,transparent)}
         @media(prefers-reduced-motion:reduce){ha-card{transition:none!important}}
         ha-card[data-motion="off"]{transition:none!important}
         </style><ha-card tabindex="0" role="group" aria-label="Tap card background to toggle heating"><div class="pill"><div class="identity"><span class="icon"><ha-icon></ha-icon></span><div class="meta"><span class="title"></span><span class="status"></span></div></div><span class="current"><ha-icon></ha-icon><span></span></span><div class="controls"></div><div class="actions"><button class="schedule" aria-label="Open schedule details" title="Open schedule details"><ha-icon icon="mdi:calendar-clock"></ha-icon></button></div></div></ha-card>`;
    const root = this.shadowRoot;
    const pillCard = root.querySelector('ha-card');
    this._bindCardToggle(pillCard);
    this._bindCardSurfaceFeedback(pillCard);
    root.querySelector('ha-card').setAttribute('aria-label', this._actionLabel(t));
    const icon = root.querySelector('.icon');
    icon.dataset.active = active ? 'true' : 'false';
    root.querySelector('.icon ha-icon').setAttribute('icon', String(c.icon || a.icon || 'mdi:thermostat'));
    root.querySelector('.icon ha-icon').setAttribute('aria-hidden', 'true');
    this._paintIcon(icon, root.querySelector('.icon ha-icon'), picture);
    root.querySelector('.title').textContent = String(title);
    const statusEl = root.querySelector('.status');
    statusEl.dataset.climateState = unavailable ? 'unavailable' : active ? 'active' : 'idle';
    statusEl.dataset.showStateIndicator = String(c.show_state_chip || unavailable);
    if (unavailable) {
      if (c.show_unavailable_badge) statusEl.textContent = t.unavailable;
      else statusEl.hidden = true;
    } else {
      const parts = pillStatusParts({ statusText, humidityValue, relativeText, showStateChip: c.show_state_chip, showHumidityChip: c.show_humidity_chip, locale });
       if (parts.length) {
         const statusLine = document.createElement('span'); statusLine.className = 'status-line';
         parts.forEach((part) => { const item = document.createElement('span'); item.textContent = part; if (part === relativeText && c.show_state_chip) item.className = 'relative'; statusLine.append(item); });
         statusEl.append(statusLine);
       }
      else statusEl.hidden = true;
    }
    const currentEl = root.querySelector('.current');
    const currentIcon = currentEl.querySelector('ha-icon');
    currentIcon.setAttribute('icon', 'mdi:home-thermometer');
    currentIcon.setAttribute('aria-hidden', 'true');
    currentEl.dataset.active = String(active && !unavailable);
    const currentText = currentEl.querySelector('span');
    const targetDisplay = formatNumber(target, locale);
    const lowDisplay = formatNumber(model.low, locale);
    const highDisplay = formatNumber(model.high, locale);
    const targetLabel = model.dual ? `${lowDisplay}–${highDisplay} ${unit}` : `${targetDisplay} ${unit}`;
    const targetAccessible = model.dual ? t.targetRange(lowDisplay, highDisplay, unit) : t.target(targetDisplay, unit);
    const currentDisplay = currentTemperatureDisplay(currentValue, unit, locale);
    const plan = heroTemperaturePlan({ dual: model.dual, hasTarget, hasCurrent: currentValue !== null, main: mainTemperatureKind(c.main_temperature) });
    const chipDisplay = plan.chip === 'target' ? (hasTarget ? targetLabel : '') : currentDisplay;
    if (c.show_current_temperature_chip && !unavailable && chipDisplay) {
      currentText.textContent = chipDisplay;
      currentEl.setAttribute('role', 'img');
      currentEl.setAttribute('aria-label', plan.chip === 'target' ? targetAccessible : t.currentTemperature(chipDisplay));
    } else currentEl.hidden = true;
    const controls = root.querySelector('.controls');
    const schedule = root.querySelector('.schedule');
    schedule.dataset.active = scheduleActive ? 'true' : 'false';
    schedule.setAttribute('aria-label', t.openSchedule);
    schedule.title = t.openSchedule;
    schedule.hidden = !c.show_schedule_button || unavailable;
    schedule.addEventListener('click', () => this._openSchedule());
    const actions = root.querySelector('.actions');
    this._addAuxiliaryButton(actions);
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', t.temperatureControls);
    controls.tabIndex = 0;
    if (unavailable) controls.hidden = true;
    else {
      if (c.show_step_controls && adjustable) { const minus = document.createElement('button'); minus.dataset.delta = String(-step); minus.setAttribute('aria-label', t.decrease); minus.textContent = '−'; if (this._pillStepFeedbackDelta === Number(minus.dataset.delta)) minus.classList.add('step-feedback'); controls.append(minus); }
      const setpoint = document.createElement('button');
      setpoint.className = 'setpoint';
      // The hero is adjustable only while it carries the target: with
      // main_temperature=current it is a readout that opens the details.
      const heroAdjustable = adjustable && plan.hero === 'target';
      if (plan.hero === 'target' && hasTarget) {
        setpoint.textContent = targetLabel;
        setpoint.title = targetAccessible;
        setpoint.setAttribute('aria-label', heroAdjustable ? (model.dual ? t.midpoint : t.targetLabel) : t.openDetails(targetAccessible));
        if (heroAdjustable) {
          setpoint.setAttribute('aria-valuetext', targetAccessible);
          setpoint.setAttribute('aria-valuenow', String(model.value));
          if (model.min !== null) setpoint.setAttribute('aria-valuemin', String(model.min));
          if (model.max !== null) setpoint.setAttribute('aria-valuemax', String(model.max));
        }
      } else if (plan.hero === 'current' && currentDisplay) {
        const accessible = t.currentTemperature(currentDisplay);
        setpoint.textContent = currentDisplay;
        setpoint.title = accessible;
        setpoint.setAttribute('aria-label', t.openDetails(accessible));
      } else {
        setpoint.textContent = '—';
        setpoint.setAttribute('aria-label', t.targetUnavailable);
        setpoint.disabled = true;
      }
      this._markHeroControl(setpoint, heroAdjustable);
      controls.append(setpoint);
      if (c.show_step_controls && adjustable) { const plus = document.createElement('button'); plus.dataset.delta = String(step); plus.setAttribute('aria-label', t.increase); plus.textContent = '+'; if (this._pillStepFeedbackDelta === Number(plus.dataset.delta)) plus.classList.add('step-feedback'); controls.append(plus); }
      // HVAC modes were compact-only, so the show_mode_buttons option silently
      // did nothing in the default pill layout.
      if (c.show_mode_buttons && modeList.length) { const select=document.createElement('select'); select.className='hvac-mode'; select.setAttribute('aria-label',t.hvacMode); for(const m of modeList){const option=document.createElement('option');option.value=String(m);option.textContent=modeLabel(m,t);select.append(option)} select.value=modeList.includes(e.state)?e.state:modeList[0]; controls.append(select); select.addEventListener('change',(ev)=>{ if (modes(e).includes(ev.target.value)) this._service('climate','set_hvac_mode',{entity_id:c.entity,hvac_mode:ev.target.value}); }); }
      const program = this._scheduleProgram();
      const override = program?.manual_override;
      if (override) { const badge=document.createElement('span'); badge.className='override-badge'; badge.textContent=t.overrideActive(formatOverrideExpiry(override.expires_at,locale)); const status=root.querySelector('.status'); status.hidden=false; status.append(badge); const resume=document.createElement('button'); resume.textContent=t.resumeSchedule; resume.setAttribute('aria-label',t.resumeSchedule); resume.addEventListener('click',()=>this._service('climate_flow_scheduler','resume_program',{climate_entity:c.entity})); controls.append(resume); }
      const pause = override ? null : activePause(program?.pause);
      if (pause) { const badge=document.createElement('span'); badge.className='override-badge'; badge.textContent=t.pauseActive(formatOverrideExpiry(pause.until,locale)); const status=root.querySelector('.status'); status.hidden=false; status.append(badge); const resume=document.createElement('button'); resume.textContent=t.resumeSchedule; resume.setAttribute('aria-label',t.resumeSchedule); resume.addEventListener('click',()=>this._service('climate_flow_scheduler','resume_program',{climate_entity:c.entity})); controls.append(resume); }
      if (!controls.children.length) controls.hidden = true;
      this._bindHeroControls(setpoint, { entity: c.entity, adjustable: heroAdjustable });
      this._markHeroMotion(setpoint);
      controls.querySelectorAll('[data-delta]').forEach((b) => b.addEventListener('click', () => { const delta = Number(b.dataset.delta); this._flashPillStepButton(delta); fireHaptic(c, 'medium'); this._setTemperature(target + delta, e); }));
    }
  }
  _renderCompact() {
    const c = this.config, e = this._displayEntity(this._hass?.states?.[c.entity]), a = e?.attributes || {};
    const unavailable = !e || !valid(e.state);
    const active = !unavailable && isClimateActive(e);
    const currentValue = numeric(a.current_temperature);
    const model = targetModel(e);
    const unit = this._hass?.config?.unit_system?.temperature || '°C';
    const current = currentValue !== null ? `${currentValue}${unit}` : '—';
    const target = model.value;
    const title = c.name || a.friendly_name || c.entity;
    const modeList = modes(e).filter((m) => valid(m));
    const hasTarget = !unavailable && model.available;
    const step = effectiveStep(e, c.step, this._stepOverride);
    const t = this._strings();
    const scheduleActive = isScheduleEnabled(this._scheduleProgram());
    // main_temperature picks the hero number; the other value moves to the chip.
    const plan = heroTemperaturePlan({ dual: model.dual, hasTarget, hasCurrent: currentValue !== null, main: mainTemperatureKind(c.main_temperature) });
    const picture = c.show_entity_picture ? String(c.entity_picture || a.entity_picture || '') : '';
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;container-type:inline-size;container-name:climate-flow-card;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,inherit)}
       ha-card{--cf-accent:var(--climate-flow-accent-color,var(--primary-color));--cf-card-surface:var(--ha-card-background,var(--card-background-color));position:relative;overflow:hidden;border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:var(--climate-flow-border-radius,20px);background:var(--cf-card-surface);padding:12px 12px 13px;box-sizing:border-box;min-height:106px;display:grid;grid-template-rows:auto auto;gap:10px;box-shadow:0 16px 34px -26px rgba(0,0,0,.95);cursor:pointer;transition:background-color .16s ease}
      ha-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cf-accent),transparent 70%)}
      ha-card:focus-visible{outline:2px solid var(--cf-accent);outline-offset:2px}
       ha-card[data-surface="elevated"]{--cf-card-surface:color-mix(in srgb,var(--ha-card-background,var(--card-background-color)) 84%,var(--text-primary-color) 16%);background:var(--cf-card-surface);border-color:color-mix(in srgb,var(--divider-color) 45%,transparent);box-shadow:0 22px 46px -30px rgba(0,0,0,.95)}
       ha-card[data-surface="blend"]{--cf-card-surface:transparent;background:var(--cf-card-surface);border-color:transparent;box-shadow:none}
       .head,.body{display:flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;overflow:hidden}
        .body{overflow-x:auto;overflow-y:hidden;gap:6px;padding-bottom:2px;scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--secondary-text-color) 42%,transparent) transparent;-webkit-overflow-scrolling:touch;overscroll-behavior-inline:contain}
        .body::-webkit-scrollbar{height:4px}.body::-webkit-scrollbar-track{background:transparent}.body::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--secondary-text-color) 42%,transparent);border-radius:999px}
       .icon{width:34px;height:34px;flex:0 0 34px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--cf-accent) 16%,transparent);color:var(--cf-accent);border:1px solid color-mix(in srgb,var(--cf-accent) 32%,transparent)}
      .icon[data-active="true"]{background:var(--cf-accent);color:var(--text-primary-color,#fff);border-color:transparent;box-shadow:0 0 0 4px color-mix(in srgb,var(--cf-accent) 20%,transparent)}
       .icon ha-icon{--mdc-icon-size:19px}.icon img{width:100%;height:100%;object-fit:cover;border-radius:50%}.icon ha-icon[hidden]{display:none}.title{font-size:15px;font-weight:600;letter-spacing:-.01em;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}.chips{display:flex;gap:5px;flex:0 1 auto;min-width:0;overflow:hidden}.chip{font-size:11px;font-weight:600;padding:4px 7px;border-radius:999px;background:var(--secondary-background-color);color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:74px;flex:0 1 auto;border:1px solid transparent}
      .chip.state{background:color-mix(in srgb,var(--cf-accent) 15%,transparent);color:var(--cf-accent);border-color:color-mix(in srgb,var(--cf-accent) 30%,transparent)}
        .target{font-size:27px;line-height:1.05;color:var(--primary-text-color);font-weight:700;letter-spacing:-.03em;flex:0 0 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:3px;touch-action:pan-y}.target strong{font:inherit}.target .unit{font-size:13px;font-weight:600;letter-spacing:0;color:var(--secondary-text-color)}
      [role="slider"]{cursor:ew-resize}
      @keyframes cf-bump{0%{transform:translateY(3px) scale(.95);opacity:.6}60%{transform:translateY(-1px) scale(1.01);opacity:1}100%{transform:none;opacity:1}}
      .bump{animation:cf-bump var(--cf-motion,220ms) cubic-bezier(.2,.7,.3,1)}
      [data-motion="off"] *{animation:none!important;transition:none!important}
       [data-motion="on"] button:not([role="slider"]):active{transform:scale(.95)}
      input[type=range]{-webkit-appearance:none;appearance:none;width:auto;flex:1 1 70px;min-width:60px;height:24px;background:transparent;margin:0;cursor:pointer}
      input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(to right,var(--cf-accent) var(--fill,50%),var(--divider-color) var(--fill,50%))}
      input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;margin-top:-5px;border-radius:50%;background:var(--text-primary-color,#fff);border:2px solid var(--cf-accent);box-shadow:0 2px 6px rgba(0,0,0,.4)}
      input[type=range]::-moz-range-track{height:6px;border-radius:999px;background:linear-gradient(to right,var(--cf-accent) var(--fill,50%),var(--divider-color) var(--fill,50%))}
      input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--text-primary-color,#fff);border:2px solid var(--cf-accent)}
       .body button{padding:6px 8px;flex:0 0 auto;border-radius:999px;background:var(--secondary-background-color);border:1px solid var(--divider-color);font:inherit;font-size:13px;font-weight:600;white-space:nowrap}.body button[data-delta]{display:grid;place-items:center;width:34px;height:34px;padding:0;border-radius:12px;border:1px solid color-mix(in srgb,var(--cf-accent) 28%,var(--divider-color));background:linear-gradient(180deg,color-mix(in srgb,var(--cf-accent) 12%,var(--secondary-background-color)),var(--secondary-background-color));color:var(--cf-accent);font-size:18px;font-weight:700;line-height:1;box-shadow:inset 0 1px 0 color-mix(in srgb,var(--text-primary-color,#fff) 12%,transparent),0 2px 6px rgba(0,0,0,.14);transition:background-color .16s,border-color .16s,box-shadow .16s}.body button[data-delta]:hover{background:color-mix(in srgb,var(--cf-accent) 20%,var(--secondary-background-color));border-color:color-mix(in srgb,var(--cf-accent) 55%,var(--divider-color));box-shadow:0 4px 10px color-mix(in srgb,var(--cf-accent) 20%,transparent)}
       .body select{flex:0 0 auto;width:auto;min-width:68px;max-width:112px;overflow:hidden;text-overflow:ellipsis;font:inherit;font-size:12px;font-weight:600;color:var(--cf-accent);background:color-mix(in srgb,var(--cf-accent) 12%,transparent);border:1px solid color-mix(in srgb,var(--cf-accent) 30%,transparent);border-radius:12px;padding:7px 8px;cursor:pointer}
        button{font:inherit;color:var(--primary-text-color);background:var(--secondary-background-color);border:0;border-radius:999px;padding:6px 9px;cursor:pointer}.head .actions{display:flex;align-items:center;gap:5px;flex:0 0 auto}.head .schedule,.head .auxiliary{display:grid;place-items:center;flex:0 0 auto;padding:6px 8px}.head .schedule[data-active="true"]{background:var(--climate-flow-accent-color,var(--primary-color));color:var(--text-primary-color,#fff)}.head .schedule ha-icon,.head .auxiliary ha-icon{--mdc-icon-size:18px;display:block}button:focus-visible,input:focus-visible{outline:2px solid var(--cf-accent);outline-offset:2px}.selected{background:var(--cf-accent);color:var(--text-primary-color,#fff)}
      select:focus-visible{outline:2px solid var(--cf-accent);outline-offset:2px}.badge{color:var(--error-color);font-size:11px;white-space:nowrap;flex:0 0 auto}.empty{color:var(--secondary-text-color);overflow:hidden;text-overflow:ellipsis}
         @container climate-flow-card (max-width:320px){ha-card{padding:10px 9px}.head,.body{gap:5px}.icon{width:32px;height:32px;flex-basis:32px}.icon ha-icon{--mdc-icon-size:18px}.chips{gap:4px}.chip{max-width:64px;padding:4px 6px}.target{font-size:25px}.body button[data-delta]{width:32px;height:32px}.body select{min-width:62px;max-width:98px}}
         @container climate-flow-card (min-width:421px){ha-card{padding:14px 16px;gap:12px}.head,.body{gap:10px}.body{gap:8px}.icon{width:36px;height:36px;flex-basis:36px}.icon ha-icon{--mdc-icon-size:20px}.chips{gap:6px}.chip{max-width:110px;padding:5px 9px}.target{font-size:34px}.target .unit{font-size:14px}.body button{padding:7px 11px}.body button[data-delta]{width:38px;height:38px;font-size:19px;border-radius:13px}.body select{min-width:78px;max-width:130px;padding:8px 10px;font-size:13px}.head .schedule,.head .auxiliary{padding:8px 10px}}
        ${BUTTON_FEEDBACK_CSS}
       @media (hover:hover) and (pointer:fine){ha-card:not([data-surface="blend"]):hover{background-color:color-mix(in srgb,var(--cf-accent) 5%,var(--cf-card-surface))}ha-card[data-surface="blend"]:hover{background-color:color-mix(in srgb,var(--cf-accent) 5%,transparent)}}
       ha-card:not([data-surface="blend"]).card-press-feedback{background-color:color-mix(in srgb,var(--cf-accent) 9%,var(--cf-card-surface))}
       ha-card[data-surface="blend"].card-press-feedback{background-color:color-mix(in srgb,var(--cf-accent) 9%,transparent)}
       @media(prefers-reduced-motion:reduce){ha-card{transition:none!important}}
       ha-card[data-motion="off"]{transition:none!important}
      </style><ha-card tabindex="0" role="group" aria-label="Tap card background to toggle heating"><div class="head"><span class="icon"><ha-icon></ha-icon></span><span class="title"></span><span class="chips"></span><div class="actions"><button class="schedule" aria-label="Open schedule details" title="Open schedule details"><ha-icon icon="mdi:calendar-clock"></ha-icon></button></div></div>
       <div class="body"></div></ha-card>`;
    const root = this.shadowRoot;
    const compactCard = root.querySelector('ha-card');
    this._bindCardToggle(compactCard);
    this._bindCardSurfaceFeedback(compactCard);
    root.querySelector('ha-card').setAttribute('aria-label', this._actionLabel(t));
    root.querySelector('.icon ha-icon').setAttribute('icon', String(c.icon || a.icon || 'mdi:thermostat'));
    root.querySelector('.icon').dataset.active = String(active);
    this._paintIcon(root.querySelector('.icon'), root.querySelector('.icon ha-icon'), picture);
    root.querySelector('.title').textContent = String(title);
    const chips = root.querySelector('.chips');
    const addChip = (show, text, modifier = '') => { if (show && text) { const span = document.createElement('span'); span.className = modifier ? `chip ${modifier}` : 'chip'; span.textContent = String(text); chips.append(span); } };
    addChip(c.show_state_chip && !unavailable, modeLabel(e?.state, t), 'state');
    addChip(c.show_current_temperature_chip && !unavailable, plan.chip === 'target' ? (hasTarget ? (model.dual ? `${model.low}–${model.high}${unit}` : `${target}${unit}`) : '') : (currentValue !== null ? `${currentValue}${unit}` : ''));
    addChip(c.show_humidity_chip && !unavailable, numeric(a.current_humidity) !== null ? `${numeric(a.current_humidity)}%` : '');
    if (c.show_unavailable_badge && unavailable) { const b=document.createElement('span'); b.className='badge'; b.textContent=t.unavailable; chips.append(b); }
    const schedule = root.querySelector('.schedule');
    schedule.setAttribute('aria-label', t.openSchedule);
    schedule.title = t.openSchedule;
    schedule.dataset.active = scheduleActive ? 'true' : 'false';
    schedule.hidden = !c.show_schedule_button;
    this._addAuxiliaryButton(root.querySelector('.actions'));
    const body = root.querySelector('.body');
    if (unavailable) { const message=document.createElement('span'); message.className='empty'; message.textContent=t.entityUnavailable; body.append(message); }
    else {
      const showHero = (plan.hero === 'target' && hasTarget) || (plan.hero === 'current' && currentValue !== null);
      const targetText=document.createElement('span'); targetText.className='target'; targetText.textContent=showHero ? '' : t.targetUnavailable;
      if (showHero) {
        const heroIsTarget = plan.hero === 'target';
        targetText.title = heroIsTarget ? (model.dual ? t.targetRange(model.low, model.high, unit) : t.target(target, unit)) : t.currentTemperature(`${currentValue}${unit}`);
        const value=document.createElement('strong');
        // The number is the hero of this layout, so the unit is its own span
        // and can sit smaller and secondary next to it.
        const unitText=document.createElement('span'); unitText.className='unit'; unitText.textContent=unit;
        if (heroIsTarget && model.dual) {
          value.textContent=`${model.low}–${model.high}`;
          targetText.setAttribute('aria-label', t.targetRange(model.low, model.high, unit));
        } else if (heroIsTarget) {
          value.textContent=`${target}`;
          targetText.setAttribute('aria-label', t.target(target, unit));
        } else {
          value.textContent=`${currentValue}`;
          targetText.setAttribute('aria-label', t.currentTemperature(`${currentValue}${unit}`));
        }
        targetText.append(value, unitText);
      }
      // The hero is adjustable only while it carries the target; otherwise it
      // stays a button that opens the entity details (it used to fall through
      // to the background toggle).
      const heroAdjustable = hasTarget && model.controllable && step !== null && step > 0 && plan.hero === 'target';
      const descriptive = targetText.getAttribute('aria-label') || t.targetUnavailable;
      this._markHeroControl(targetText, heroAdjustable);
      targetText.setAttribute('aria-label', heroAdjustable ? (model.dual ? t.midpoint : t.targetLabel) : descriptive);
      if (heroAdjustable) {
        targetText.setAttribute('aria-valuetext', descriptive);
        targetText.setAttribute('aria-valuenow', String(model.value));
        if (model.min !== null) targetText.setAttribute('aria-valuemin', String(model.min));
        if (model.max !== null) targetText.setAttribute('aria-valuemax', String(model.max));
      }
      this._bindHeroControls(targetText, { entity: c.entity, adjustable: heroAdjustable });
      if (showHero) this._markHeroMotion(targetText);
      body.append(targetText);
      if (hasTarget && model.controllable && step !== null && step > 0) {
         if (c.show_step_controls) for (const [d,label,text] of [[-step,t.decrease,'−'],[step,t.increase,'+']]) { const button=document.createElement('button'); button.dataset.delta=String(d); button.setAttribute('aria-label',label); button.textContent=text; body.append(button); }
         const slider=document.createElement('input'); slider.className='slider'; slider.type='range'; slider.setAttribute('aria-label',model.dual?t.midpoint:t.targetLabel);
         slider.min=String(model.sliderMin); slider.max=String(model.sliderMax); slider.step=String(step); slider.value=String(target); body.append(slider); paintSliderFill(slider);
      }
      if (c.show_mode_buttons && modeList.length) { const select=document.createElement('select'); select.className='hvac-mode'; select.setAttribute('aria-label',t.hvacMode); for(const m of modeList){const option=document.createElement('option');option.value=String(m);option.textContent=modeLabel(m,t);select.append(option)} select.value=modeList.includes(e.state)?e.state:modeList[0]; body.append(select); }
      const program = this._scheduleProgram();
      const override = program?.manual_override;
      if (override) { const badge=document.createElement('span'); badge.className='badge'; badge.textContent=t.overrideActive(formatOverrideExpiry(override.expires_at,this._hass?.locale?.language)); body.append(badge); const resume=document.createElement('button'); resume.textContent=t.resumeSchedule; resume.setAttribute('aria-label',t.resumeSchedule); resume.addEventListener('click',()=>this._service('climate_flow_scheduler','resume_program',{climate_entity:c.entity})); body.append(resume); }
      const pause = override ? null : activePause(program?.pause);
      if (pause) { const badge=document.createElement('span'); badge.className='badge'; badge.textContent=t.pauseActive(formatOverrideExpiry(pause.until,this._hass?.locale?.language)); body.append(badge); const resume=document.createElement('button'); resume.textContent=t.resumeSchedule; resume.setAttribute('aria-label',t.resumeSchedule); resume.addEventListener('click',()=>this._service('climate_flow_scheduler','resume_program',{climate_entity:c.entity})); body.append(resume); }
    }
    this.shadowRoot.querySelector('.slider')?.addEventListener('change', (ev) => { fireHaptic(c, 'medium'); this._setTemperature(ev.target.value, e, { debounce: true }); });
    this.shadowRoot.querySelector('.slider')?.addEventListener('input', (ev) => paintSliderFill(ev.target));
    root.querySelectorAll('[data-delta]').forEach((b) => b.addEventListener('click', () => { fireHaptic(c, 'medium'); this._setTemperature(target + Number(b.dataset.delta), e); }));
    root.querySelector('select.hvac-mode')?.addEventListener('change', (ev) => { if (!unavailable && modes(e).includes(ev.target.value)) this._service('climate', 'set_hvac_mode', { entity_id: c.entity, hvac_mode: ev.target.value }); });
    schedule.addEventListener('click', () => this._openSchedule());
  }
  _scheduleSensor() {
    return Object.values(this._hass?.states || {}).find((state) => state?.attributes?.scheduler_domain === 'climate_flow_scheduler') || null;
  }
  _dialGeometry(model) {
    // One shared description of the dial: the value arc plus every thumb, so
    // the first render and the drag patches can never drift apart.
    if (!model || !model.available) return { arc: dialArc(0, 0), thumbs: [], fractions: [] };
    if (model.dual) {
      const from = dialFraction(model.low, model.min, model.max);
      const to = dialFraction(model.high, model.min, model.max);
      return { arc: dialArc(from, to), thumbs: [dialPoint(from), dialPoint(to)], fractions: [from, to] };
    }
    const fraction = dialFraction(model.value, model.min, model.max);
    return { arc: dialArc(0, fraction), thumbs: [dialPoint(fraction)], fractions: [fraction] };
  }
  _renderCircular() {
    const c = this.config;
    // The optimistic preview must land inside the model the dial is built
    // from: computing it after targetModel() made the arc ignore a pending
    // value on the very frame it is shown.
    const optimistic = this._optimistic && this._optimistic.entityId === c.entity ? this._optimistic : null;
    const e0 = this._displayEntity(this._hass?.states?.[c.entity]);
    const e = optimistic ? { ...e0, attributes: { ...(e0?.attributes || {}), ...optimistic.payload } } : e0;
    const a = e?.attributes || {};
    const unavailable = !e || !valid(e.state);
    const active = !unavailable && isClimateActive(e);
    const currentValue = numeric(a.current_temperature);
    const model = targetModel(e);
    const optimisticTemperature = optimistic?.payload?.temperature ?? null;
    const unit = this._hass?.config?.unit_system?.temperature || '°C';
    const title = c.name || a.friendly_name || c.entity;
    const modeList = modes(e).filter((m) => valid(m));
    const hasTarget = !unavailable && model.available;
    const step = effectiveStep(e, c.step, this._stepOverride);
    const adjustable = hasTarget && model.controllable && step !== null && step > 0;
    const locale = this._hass?.locale?.language;
    const t = this._strings();
    const scheduleActive = isScheduleEnabled(this._scheduleProgram());
    const plan = heroTemperaturePlan({ hasTarget, hasCurrent: currentValue !== null, main: mainTemperatureKind(c.main_temperature) });
    // Same rule as the other layouts: the hero is adjustable only while it
    // carries the target. With main_temperature: current the dial keeps the
    // arc and the thumbs (they describe the target) but stops being a slider,
    // so nothing can be dragged through a number the dial does not move.
    const heroAdjustable = adjustable && plan.hero === 'target';
    const picture = c.show_entity_picture ? String(c.entity_picture || a.entity_picture || '') : '';
    const geometry = this._dialGeometry(model);
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;container-type:inline-size;container-name:climate-flow-card;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,inherit)}
       ha-card{--cf-accent:var(--climate-flow-accent-color,var(--primary-color));--cf-card-surface:var(--ha-card-background,var(--card-background-color));position:relative;overflow:hidden;border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:var(--climate-flow-border-radius,24px);background:var(--cf-card-surface);padding:12px 12px 14px;box-sizing:border-box;display:grid;grid-template-rows:auto auto auto;gap:8px;box-shadow:0 18px 40px -28px rgba(0,0,0,.95);cursor:pointer;transition:background-color .16s ease}
      ha-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cf-accent),transparent 70%)}
      ha-card:focus-visible{outline:2px solid var(--cf-accent);outline-offset:2px}
       ha-card[data-surface="elevated"]{--cf-card-surface:color-mix(in srgb,var(--ha-card-background,var(--card-background-color)) 84%,var(--text-primary-color) 16%);background:var(--cf-card-surface);border-color:color-mix(in srgb,var(--divider-color) 45%,transparent);box-shadow:0 24px 48px -30px rgba(0,0,0,.95)}
       ha-card[data-surface="blend"]{--cf-card-surface:transparent;background:var(--cf-card-surface);border-color:transparent;box-shadow:none}
       .head{display:flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;overflow:hidden}
      .icon{width:34px;height:34px;flex:0 0 34px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--cf-accent) 16%,transparent);color:var(--cf-accent);border:1px solid color-mix(in srgb,var(--cf-accent) 32%,transparent)}
      .icon[data-active="true"]{background:var(--cf-accent);color:var(--text-primary-color,#fff);border-color:transparent;box-shadow:0 0 0 4px color-mix(in srgb,var(--cf-accent) 20%,transparent)}
      .icon ha-icon{--mdc-icon-size:19px}.icon img{width:100%;height:100%;object-fit:cover;border-radius:50%}.icon ha-icon[hidden]{display:none}
      .title{font-size:15px;font-weight:600;letter-spacing:-.01em;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
      .chips{display:flex;gap:6px;flex:0 1 auto;min-width:0;overflow:hidden}.chip{font-size:11px;font-weight:600;padding:5px 9px;border-radius:999px;background:var(--secondary-background-color);color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;flex:0 1 auto;border:1px solid transparent}
       .chip.state{background:color-mix(in srgb,var(--cf-accent) 15%,transparent);color:var(--cf-accent);border-color:color-mix(in srgb,var(--cf-accent) 30%,transparent)}
        .actions{display:flex;align-items:center;gap:5px;flex:0 0 auto}.schedule,.auxiliary{display:grid;place-items:center;flex:0 0 auto;padding:6px 8px;border:0;border-radius:999px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer}
       .schedule[data-active="true"]{background:var(--climate-flow-accent-color,var(--primary-color));color:var(--text-primary-color,#fff)}.schedule ha-icon,.auxiliary ha-icon{--mdc-icon-size:18px;display:block}.schedule:focus-visible,.auxiliary:focus-visible{outline:2px solid var(--cf-accent);outline-offset:2px}
      .stage{position:relative;display:grid;place-items:center;min-width:0}
       .dial{width:min(100%,196px);height:auto;aspect-ratio:1;display:block;touch-action:none;cursor:grab}.dial:focus-visible{outline:2px solid var(--cf-accent);outline-offset:4px;border-radius:50%}
      .track,.value{fill:none;stroke-width:14;stroke-linecap:round}.track{stroke:var(--divider-color)}
      .value{stroke:var(--cf-accent)}
      .thumb{fill:var(--text-primary-color,#fff);stroke:var(--cf-accent);stroke-width:4}
      .center{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:2px;pointer-events:none;text-align:center}
       .hero{display:flex;align-items:baseline;justify-content:center;gap:3px;font-size:30px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.05}
       .hero strong{font:inherit}.hero .unit{font-size:14px;font-weight:600;letter-spacing:0;color:var(--secondary-text-color)}
       .sub{font-size:11px;color:var(--secondary-text-color);white-space:nowrap}
       .row{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;min-width:0;white-space:normal;overflow:visible}
       .row button{padding:6px 9px;border-radius:999px;background:var(--secondary-background-color);border:1px solid var(--divider-color);font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}.row button[data-delta]{display:grid;place-items:center;width:34px;height:34px;padding:0;border-radius:12px;border:1px solid color-mix(in srgb,var(--cf-accent) 28%,var(--divider-color));background:linear-gradient(180deg,color-mix(in srgb,var(--cf-accent) 12%,var(--secondary-background-color)),var(--secondary-background-color));color:var(--cf-accent);font-size:18px;font-weight:700;line-height:1;box-shadow:inset 0 1px 0 color-mix(in srgb,var(--text-primary-color,#fff) 12%,transparent),0 2px 6px rgba(0,0,0,.14);transition:background-color .16s,border-color .16s,box-shadow .16s}.row button[data-delta]:hover{background:color-mix(in srgb,var(--cf-accent) 20%,var(--secondary-background-color));border-color:color-mix(in srgb,var(--cf-accent) 55%,var(--divider-color));box-shadow:0 4px 10px color-mix(in srgb,var(--cf-accent) 20%,transparent)}
       .row select{flex:0 0 auto;min-width:68px;max-width:112px;overflow:hidden;text-overflow:ellipsis;font:inherit;font-size:12px;font-weight:600;color:var(--cf-accent);background:color-mix(in srgb,var(--cf-accent) 12%,transparent);border:1px solid color-mix(in srgb,var(--cf-accent) 30%,transparent);border-radius:12px;padding:7px 8px;cursor:pointer}
      button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--cf-accent);outline-offset:2px}
      .badge{color:var(--error-color);font-size:11px;white-space:nowrap}.empty{color:var(--secondary-text-color);font-size:13px;text-align:center}
      @keyframes cf-bump{0%{transform:translateY(3px) scale(.95);opacity:.6}60%{transform:translateY(-1px) scale(1.01);opacity:1}100%{transform:none;opacity:1}}
      .bump{animation:cf-bump var(--cf-motion,220ms) cubic-bezier(.2,.7,.3,1)}
      [data-motion="off"] *{animation:none!important;transition:none!important}
       [data-motion="on"] button:not([role="slider"]):active{transform:scale(.95)}
         @container climate-flow-card (max-width:320px){ha-card{padding:10px 9px}.head{gap:5px}.chips{gap:4px}.chip{max-width:64px;padding:4px 6px}.dial{width:min(100%,180px)}.hero{font-size:27px}.row{gap:5px}.row button[data-delta]{width:32px;height:32px}.row select{min-width:62px;max-width:98px}}
         @container climate-flow-card (min-width:421px){ha-card{padding:14px 16px 16px;gap:10px}.head{gap:10px}.chips{gap:6px}.chip{max-width:110px;padding:5px 9px}.schedule,.auxiliary{padding:8px 10px}.dial{width:min(100%,240px)}.hero{font-size:38px}.hero .unit{font-size:15px}.sub{font-size:12px}.row{gap:8px}.row button{padding:7px 11px}.row button[data-delta]{width:38px;height:38px;font-size:19px;border-radius:13px}.row select{min-width:78px;max-width:130px;padding:8px 10px;font-size:13px}}
        ${BUTTON_FEEDBACK_CSS}
       @media (hover:hover) and (pointer:fine){ha-card:not([data-surface="blend"]):hover{background-color:color-mix(in srgb,var(--cf-accent) 5%,var(--cf-card-surface))}ha-card[data-surface="blend"]:hover{background-color:color-mix(in srgb,var(--cf-accent) 5%,transparent)}}
       ha-card:not([data-surface="blend"]).card-press-feedback{background-color:color-mix(in srgb,var(--cf-accent) 9%,var(--cf-card-surface))}
       ha-card[data-surface="blend"].card-press-feedback{background-color:color-mix(in srgb,var(--cf-accent) 9%,transparent)}
       @media(prefers-reduced-motion:reduce){ha-card{transition:none!important}}
       ha-card[data-motion="off"]{transition:none!important}
       </style><ha-card tabindex="0" role="group" aria-label="Tap card background to toggle heating"><div class="head"><span class="icon"><ha-icon></ha-icon></span><span class="title"></span><span class="chips"></span><div class="actions"><button class="schedule" aria-label="Open schedule details" title="Open schedule details"><ha-icon icon="mdi:calendar-clock"></ha-icon></button></div></div><div class="stage"><svg class="dial" viewBox="0 0 200 200"><circle class="track" cx="100" cy="100" r="80" transform="rotate(135 100 100)"></circle><circle class="value" cx="100" cy="100" r="80" transform="rotate(135 100 100)"></circle><g class="thumbs"></g></svg><div class="center"><span class="hero"><strong></strong><span class="unit"></span></span><span class="sub"></span></div></div><div class="row"></div></ha-card>`;
    const root = this.shadowRoot;
    const circularCard = root.querySelector('ha-card');
    this._bindCardToggle(circularCard);
    this._bindCardSurfaceFeedback(circularCard);
    root.querySelector('ha-card').setAttribute('aria-label', this._actionLabel(t));
    const iconBox = root.querySelector('.icon');
    iconBox.dataset.active = active ? 'true' : 'false';
    root.querySelector('.icon ha-icon').setAttribute('icon', String(c.icon || a.icon || 'mdi:thermostat'));
    root.querySelector('.icon ha-icon').setAttribute('aria-hidden', 'true');
    this._paintIcon(iconBox, root.querySelector('.icon ha-icon'), picture);
    root.querySelector('.title').textContent = String(title);
    const chips = root.querySelector('.chips');
    const addChip = (show, text, modifier = '') => { if (show && text) { const span = document.createElement('span'); span.className = modifier ? `chip ${modifier}` : 'chip'; span.textContent = String(text); chips.append(span); } };
    addChip(c.show_state_chip && !unavailable, modeLabel(e?.state, t), 'state');
    addChip(c.show_humidity_chip && !unavailable, numeric(a.current_humidity) !== null ? `${numeric(a.current_humidity)}%` : '');
    if (c.show_unavailable_badge && unavailable) { const b = document.createElement('span'); b.className = 'badge'; b.textContent = t.unavailable; chips.append(b); }
    const schedule = root.querySelector('.schedule');
    schedule.setAttribute('aria-label', t.openSchedule);
    schedule.title = t.openSchedule;
    schedule.dataset.active = scheduleActive ? 'true' : 'false';
    schedule.hidden = !c.show_schedule_button;
    schedule.addEventListener('click', () => this._openSchedule());
    this._addAuxiliaryButton(root.querySelector('.actions'));

    const svg = root.querySelector('.dial');
    const hero = svg;
    const valueArc = svg.querySelector('.value');
    const thumbs = svg.querySelector('.thumbs');
    const paintThumbs = (points) => { thumbs.replaceChildren(); for (const point of points) { const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); circle.setAttribute('class', 'thumb'); circle.setAttribute('cx', String(point.x)); circle.setAttribute('cy', String(point.y)); circle.setAttribute('r', '9'); thumbs.append(circle); } };
    const track = svg.querySelector('.track');
    const fullTrack = dialArc(0, 1);
    track.setAttribute('stroke-dasharray', `${fullTrack.track} ${fullTrack.track * 2}`);
    valueArc.setAttribute('stroke-dasharray', geometry.arc.dasharray);
    valueArc.setAttribute('stroke-dashoffset', String(geometry.arc.dashoffset));
    paintThumbs(geometry.thumbs);
    const stage = root.querySelector('.stage');
    if (unavailable || !hasTarget) {
      const message = document.createElement('p'); message.className = 'empty';
      message.textContent = unavailable ? t.entityUnavailable : t.targetUnavailable;
      stage.append(message);
      svg.style.display = 'none'; // `hidden` is not styled for SVG in the HTML namespace
      root.querySelector('.row').hidden = true;
    }

    const display = root.querySelector('.hero');
    const heroNumber = display.querySelector('strong');
    const heroUnit = display.querySelector('.unit');
    // The secondary line is a sibling of the hero, inside the centre overlay.
    const sub = root.querySelector('.center .sub');
    const targetLabel = model.dual ? `${formatNumber(model.low, locale)}–${formatNumber(model.high, locale)} ${unit}` : `${formatNumber(model.value, locale)} ${unit}`;
    const targetAccessible = model.dual ? t.targetRange(formatNumber(model.low, locale), formatNumber(model.high, locale), unit) : t.target(formatNumber(model.value, locale), unit);
    const currentDisplay = currentTemperatureDisplay(currentValue, unit, locale);
    if (plan.hero === 'target' && hasTarget) {
      heroNumber.textContent = model.dual ? `${formatNumber(model.low, locale)}–${formatNumber(model.high, locale)}` : formatNumber(model.value, locale);
      heroUnit.textContent = unit;
      // The secondary line is the other temperature, gated by the same switch
      // the pill and compact layouts use for their secondary value.
      sub.textContent = c.show_current_temperature_chip && plan.chip === 'current' && currentValue !== null ? currentDisplay : '';
    } else if (plan.hero === 'current' && currentDisplay) {
      heroNumber.textContent = currentDisplay.replace(` ${unit}`, '');
      heroUnit.textContent = unit;
      sub.textContent = c.show_current_temperature_chip && hasTarget ? targetLabel : '';
    } else {
      heroNumber.textContent = '—';
      heroUnit.textContent = '';
      sub.textContent = '';
    }
    if (!hasTarget && !unavailable) sub.textContent = t.targetUnavailable;
    this._markHeroMotion(display);

    if (heroAdjustable) {
      // The svg is the slider: role and values describe the target (the
      // midpoint for heat_cool, which is what the arrow keys move).
      hero.setAttribute('aria-label', model.dual ? t.midpoint : t.targetLabel);
      hero.setAttribute('aria-valuetext', targetAccessible);
      hero.setAttribute('aria-valuenow', String(model.value));
      if (model.min !== null) hero.setAttribute('aria-valuemin', String(model.min));
      if (model.max !== null) hero.setAttribute('aria-valuemax', String(model.max));
    }
    this._markHeroControl(hero, heroAdjustable);
    this._bindHeroControls(hero, { entity: c.entity, adjustable: heroAdjustable, dial: true });

    const row = root.querySelector('.row');
    if (!unavailable && hasTarget) {
      if (c.show_step_controls && adjustable) { const minus = document.createElement('button'); minus.dataset.delta = String(-step); minus.setAttribute('aria-label', t.decrease); minus.textContent = '−'; row.append(minus); }
      if (c.show_mode_buttons && modeList.length) { const select = document.createElement('select'); select.className = 'hvac-mode'; select.setAttribute('aria-label', t.hvacMode); for (const m of modeList) { const option = document.createElement('option'); option.value = String(m); option.textContent = modeLabel(m, t); select.append(option); } select.value = modeList.includes(e.state) ? e.state : modeList[0]; row.append(select); select.addEventListener('change', (ev) => { if (modes(e).includes(ev.target.value)) this._service('climate', 'set_hvac_mode', { entity_id: c.entity, hvac_mode: ev.target.value }); }); }
      if (c.show_step_controls && adjustable) { const plus = document.createElement('button'); plus.dataset.delta = String(step); plus.setAttribute('aria-label', t.increase); plus.textContent = '+'; row.append(plus); }
      const program = this._scheduleProgram();
      const override = program?.manual_override;
      if (override) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = t.overrideActive(formatOverrideExpiry(override.expires_at, locale)); row.append(badge); const resume = document.createElement('button'); resume.textContent = t.resumeSchedule; resume.setAttribute('aria-label', t.resumeSchedule); resume.addEventListener('click', () => this._service('climate_flow_scheduler', 'resume_program', { climate_entity: c.entity })); row.append(resume); }
      const pause = override ? null : activePause(program?.pause);
      if (pause) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = t.pauseActive(formatOverrideExpiry(pause.until, locale)); row.append(badge); const resume = document.createElement('button'); resume.textContent = t.resumeSchedule; resume.setAttribute('aria-label', t.resumeSchedule); resume.addEventListener('click', () => this._service('climate_flow_scheduler', 'resume_program', { climate_entity: c.entity })); row.append(resume); }
      if (!row.children.length) row.hidden = true;
    } else if (unavailable) row.hidden = true;
    row.querySelectorAll('[data-delta]').forEach((b) => b.addEventListener('click', () => { fireHaptic(c, 'medium'); this._setTemperature(model.value + Number(b.dataset.delta), e); }));
  }
  _scheduleProgram() {
    return this._scheduleSensor()?.attributes?.programs?.[this.config.entity] || null;
  }
  _addAuxiliaryButton(container) {
    if (!container || !hasConfiguredAuxiliaryEntities(this.config)) return;
    const t = this._strings();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'auxiliary';
    button.setAttribute('aria-label', t.openAuxiliary);
    button.title = t.openAuxiliary;
    const icon = document.createElement('ha-icon');
    icon.setAttribute('icon', 'mdi:tune');
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);
    button.addEventListener('click', () => this._openAuxiliary());
    container.append(button);
  }
  _openAuxiliary() {
    if (!hasConfiguredAuxiliaryEntities(this.config)) return;
    this._auxiliaryOpen = true;
    this._renderAuxiliaryDialog();
  }
  _closeAuxiliary(dialog) {
    this._auxiliaryOpen = false;
    if (dialog?.open) dialog.close();
    dialog?.remove();
    this._render();
    this.shadowRoot?.querySelector('.auxiliary')?.focus?.();
  }
  _syncAuxiliaryDialog() {
    if (!this._auxiliaryOpen) return;
    const dialog = this.shadowRoot?.querySelector('.aux-dialog');
    if (!dialog) return;
    const active = this.shadowRoot.activeElement || document.activeElement;
    for (const control of dialog.querySelectorAll('[data-aux-key]')) {
      const key = control.dataset.auxKey;
      const entity = this._hass?.states?.[this.config?.[key]];
      if (control.dataset.auxKind === 'number') {
        const min = numeric(entity?.attributes?.min);
        const max = numeric(entity?.attributes?.max);
        const step = numeric(entity?.attributes?.step);
        if (min !== null) control.min = String(min); else control.removeAttribute('min');
        if (max !== null) control.max = String(max); else control.removeAttribute('max');
        control.step = step !== null && step > 0 ? String(step) : 'any';
        control.disabled = !entity || entity.state === 'unavailable';
        if (control !== active) control.value = numeric(entity?.state) === null ? '' : String(numeric(entity.state));
      } else if (control.dataset.auxKind === 'select') {
        const values = Array.isArray(entity?.attributes?.options) ? entity.attributes.options.map(String) : [];
        if (entity?.state && !['unknown', 'unavailable'].includes(entity.state) && !values.includes(String(entity.state))) values.unshift(String(entity.state));
        if (JSON.stringify(control._auxOptions || []) !== JSON.stringify(values)) {
          control.replaceChildren();
          control._auxOptions = values;
          if (!values.length) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = this._strings().auxiliaryUnavailable;
            control.append(option);
          } else {
            for (const value of values) {
              const option = document.createElement('option');
              option.value = value;
              option.textContent = value;
              control.append(option);
            }
          }
        }
        control.disabled = !entity || entity.state === 'unavailable' || !values.length;
        if (control !== active) control.value = values.includes(String(entity?.state)) ? String(entity.state) : '';
      } else if (control.dataset.auxKind === 'switch') {
        control.disabled = !entity || !['on', 'off'].includes(entity.state);
        if (control !== active) control.checked = entity?.state === 'on';
      }
    }
  }
  _renderAuxiliaryDialog() {
    const t = this._strings();
    this.shadowRoot.querySelector('.aux-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.className = 'aux-dialog';
    dialog.setAttribute('aria-label', t.auxiliaryAria);
    dialog.innerHTML = `<style>
      dialog.aux-dialog{box-sizing:border-box;color:var(--primary-text-color);font:inherit;background:var(--card-background-color,var(--ha-card-background));border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:22px;width:min(520px,calc(100vw - 28px));max-height:86vh;overflow:auto;padding:0;box-shadow:0 24px 72px rgba(0,0,0,.42)}
      dialog.aux-dialog::backdrop{background:rgba(0,0,0,.58);backdrop-filter:blur(4px)}
      .aux-head{display:flex;align-items:center;gap:12px;padding:18px 20px 14px;border-bottom:1px solid var(--divider-color);position:sticky;top:0;background:var(--card-background-color,var(--ha-card-background));z-index:1}
      .aux-head .dlg-icon{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border-radius:13px;background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 15%,transparent);color:var(--climate-flow-accent-color,var(--primary-color))}
      .aux-head .dlg-icon ha-icon{--mdc-icon-size:22px;display:block}
      .aux-head h2{flex:1;min-width:0;margin:0;font-size:18px;font-weight:700}
      .aux-close{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--divider-color);border-radius:12px;background:var(--secondary-background-color);color:var(--primary-text-color)}
      .aux-close ha-icon{--mdc-icon-size:20px}
      .aux-body{display:flex;flex-direction:column;gap:10px;padding:16px 20px 20px}
      .aux-hint{margin:0 0 2px;color:var(--secondary-text-color);font-size:12px;line-height:1.45}
      .aux-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(130px,180px);align-items:center;gap:12px;padding:12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--secondary-background-color)}
      .aux-labels{display:flex;flex-direction:column;gap:3px;min-width:0}
      .aux-label{font-size:14px;font-weight:650}
      .aux-entity{overflow:hidden;color:var(--secondary-text-color);font-size:11px;text-overflow:ellipsis;white-space:nowrap}
      .aux-row input[type=number],.aux-row select{box-sizing:border-box;width:100%;min-width:0;min-height:40px;padding:8px 10px;border:1px solid var(--divider-color);border-radius:10px;background:var(--card-background-color,var(--ha-card-background));color:var(--primary-text-color);font:inherit;font-variant-numeric:tabular-nums}
      .aux-row input[type=checkbox]{width:42px;height:24px;justify-self:end;accent-color:var(--climate-flow-accent-color,var(--primary-color))}
      .aux-row :focus-visible,.aux-close:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px}
      .aux-error{margin:0;color:var(--error-color);font-size:13px;line-height:1.4}
      .aux-error:empty{display:none}
      @media(max-width:440px){.aux-head{padding:15px 16px 12px}.aux-body{padding:13px 16px 16px}.aux-row{grid-template-columns:minmax(0,1fr) minmax(105px,140px);gap:8px;padding:10px}}
      @media(prefers-reduced-motion:reduce){.aux-dialog *{transition:none!important}}
      ${BUTTON_FEEDBACK_CSS}
    </style><div class="aux-head"><span class="dlg-icon"><ha-icon icon="mdi:tune" aria-hidden="true"></ha-icon></span><h2>${t.auxiliaryControls}</h2><button class="aux-close" type="button" aria-label="${t.closeAuxiliary}" title="${t.close}"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="aux-body"><p class="aux-hint">${t.auxiliaryHint}</p><p class="aux-error" role="alert" aria-live="assertive"></p></div>`;
    const body = dialog.querySelector('.aux-body');
    const definitions = [
      ['calibration_entity', 'number'],
      ['deadzone_entity', 'number'],
      ['sensor_source_entity', 'select'],
      ['child_lock_entity', 'switch'],
    ];
    for (const [key, kind] of definitions) {
      const entityId = this.config[key];
      if (!entityId) continue;
      const entity = this._hass?.states?.[entityId];
      const row = document.createElement('div');
      row.className = 'aux-row';
      const labels = document.createElement('div');
      labels.className = 'aux-labels';
      const label = document.createElement('span');
      label.className = 'aux-label';
      label.textContent = fieldLabel(t, key);
      const entityName = document.createElement('span');
      entityName.className = 'aux-entity';
      entityName.textContent = String(entity?.attributes?.friendly_name || entityId);
      labels.append(label, entityName);
      const control = kind === 'switch' ? document.createElement('input') : document.createElement(kind === 'number' ? 'input' : 'select');
      control.dataset.auxKey = key;
      control.dataset.auxKind = kind;
      control.setAttribute('aria-label', fieldLabel(t, key));
      if (kind === 'number') {
        control.type = 'number';
        control.addEventListener('change', () => {
          const value = numeric(control.value);
          const currentEntity = this._hass?.states?.[this.config[key]];
          const min = numeric(currentEntity?.attributes?.min);
          const max = numeric(currentEntity?.attributes?.max);
          if (value === null || (min !== null && value < min) || (max !== null && value > max)) return;
          this._service('number', 'set_value', { entity_id: entityId, value });
        });
      } else if (kind === 'select') {
        control.addEventListener('change', () => {
          if (control.value && (control._auxOptions || []).includes(control.value)) this._service('select', 'select_option', { entity_id: entityId, option: control.value });
        });
      } else {
        control.type = 'checkbox';
        control.setAttribute('role', 'switch');
        control.addEventListener('change', () => {
          const currentEntity = this._hass?.states?.[this.config[key]];
          if (currentEntity && ['on', 'off'].includes(currentEntity.state)) this._service('switch', control.checked ? 'turn_on' : 'turn_off', { entity_id: entityId });
        });
      }
      row.append(labels, control);
      body.insertBefore(row, dialog.querySelector('.aux-error'));
    }
    dialog.querySelector('.aux-close').addEventListener('click', () => this._closeAuxiliary(dialog));
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); this._closeAuxiliary(dialog); });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) this._closeAuxiliary(dialog); });
    this.shadowRoot.append(dialog);
    this._syncAuxiliaryDialog();
    dialog.showModal();
  }
  _openSchedule() {
    const program = this._scheduleProgram();
    this._scheduleOpen = true; this._scheduleDraft = scheduleDraft(program); this._scheduleError = ''; this._renderScheduleDialog();
  }
  _closeSchedule(dialog) {
    this._scheduleOpen = false;
    if (dialog?.open) dialog.close();
    dialog?.remove();
    this._render();
  }
  _scheduleDialogStyle() {
    return `<style>
      dialog{box-sizing:border-box;color:var(--primary-text-color);font:inherit;background:linear-gradient(145deg,color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 4%,var(--card-background-color,var(--ha-card-background))),var(--card-background-color,var(--ha-card-background)) 42%);border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:26px;width:min(760px,calc(100vw - 32px));max-height:88vh;overflow:auto;padding:0;box-shadow:0 24px 72px rgba(0,0,0,.42);scrollbar-width:thin}
      dialog::backdrop{background:rgba(0,0,0,.58);backdrop-filter:blur(5px)}
      .dlg-head{display:flex;align-items:center;gap:13px;padding:20px 24px 16px;border-bottom:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);position:sticky;top:0;background:color-mix(in srgb,var(--card-background-color,var(--ha-card-background)) 94%,var(--climate-flow-accent-color,var(--primary-color)) 6%);backdrop-filter:blur(18px);z-index:3}
      .dlg-head::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--climate-flow-accent-color,var(--primary-color)),color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 20%,transparent) 72%,transparent)}
      .dlg-head .dlg-icon{width:44px;height:44px;flex:0 0 44px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(145deg,var(--climate-flow-accent-color,var(--primary-color)),color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 72%,#000));color:var(--text-primary-color,#fff);box-shadow:0 5px 14px color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 25%,transparent)}
      .dlg-head .dlg-icon ha-icon{--mdc-icon-size:23px;display:block}
      .dlg-head .dlg-titles{flex:1 1 auto;min-width:0}
      .dlg-head h2{margin:0;font-size:20px;font-weight:700;letter-spacing:-.025em;line-height:1.2}
      .dlg-head .dlg-sub{display:inline-block;max-width:100%;margin-top:4px;font-size:12px;font-weight:500;color:var(--secondary-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dlg-head .close{flex:0 0 auto;display:grid;place-items:center;width:40px;height:40px;border-radius:13px;border:1px solid color-mix(in srgb,var(--divider-color) 80%,transparent);background:var(--secondary-background-color);color:var(--secondary-text-color);cursor:pointer;transition:background-color .16s,color .16s,border-color .16s}
      .dlg-head .close:hover{background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 10%,var(--secondary-background-color));border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 32%,var(--divider-color));color:var(--primary-text-color)}
      .dlg-head .close ha-icon{--mdc-icon-size:19px;display:block}
      .dlg-head .close:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px}
      .dlg-body{display:flex;flex-direction:column;gap:14px;padding:18px 24px 22px}
      .statusline{display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px;min-height:48px;padding:10px 14px;border:1px solid color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 18%,var(--divider-color));border-radius:16px;background:linear-gradient(110deg,color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 8%,var(--secondary-background-color)),var(--secondary-background-color) 72%);font-size:12px;color:var(--secondary-text-color);margin:0}
      .statusline>span:first-child{font-weight:600}
      .statusline>span:not(:first-child){display:inline-flex;align-items:center;min-height:27px;padding:4px 9px;border:1px solid color-mix(in srgb,var(--divider-color) 75%,transparent);border-radius:999px;background:var(--card-background-color,var(--ha-card-background));color:var(--primary-text-color);font-size:11px;font-weight:600}
      .statusline .chip{margin-left:auto}
      .error{color:var(--error-color);font-size:13px;line-height:1.45;margin:0;padding:10px 12px;border:1px solid color-mix(in srgb,var(--error-color) 28%,transparent);border-radius:12px;background:color-mix(in srgb,var(--error-color) 7%,var(--card-background-color,var(--ha-card-background)))}
      .error:empty{display:none}
      .program-settings{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
      .program-settings>.switch{grid-column:1/-1}
      .switch{display:flex;align-items:center;gap:12px;min-height:52px;padding:10px 14px;border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:15px;background:var(--secondary-background-color);font-size:14px;font-weight:650;cursor:pointer;user-select:none;margin:0;transition:border-color .16s,background-color .16s}
      .switch:hover{border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 32%,var(--divider-color))}
      .switch input{appearance:none;width:44px;height:26px;flex:0 0 44px;border-radius:999px;background:var(--divider-color);position:relative;cursor:pointer;transition:background .2s;margin:0}
      .switch input::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:var(--text-primary-color,#fff);box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
      .switch input:checked{background:var(--climate-flow-accent-color,var(--primary-color))}
      .switch input:checked::after{transform:translateX(18px)}
      .switch input:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:3px}
      .field.mode{min-width:0;margin:0;padding:13px;border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:15px;background:var(--secondary-background-color)}
      .field.mode.hvac{display:block}
      .field.hvac>label{display:grid;gap:8px;width:100%;font-size:10px;font-weight:700;letter-spacing:.075em;text-transform:uppercase;color:var(--secondary-text-color)}
      .field.hvac .field-caption{font-size:10px;font-weight:700;letter-spacing:.075em;text-transform:uppercase;color:var(--secondary-text-color)}
      .field.hvac select{width:100%;min-height:42px;padding:8px 11px;border-radius:11px;background:var(--card-background-color,var(--ha-card-background));font-size:13px;font-weight:600}
      .field.outside{min-width:0;margin:0}
      .slot{position:relative;overflow:hidden;border:1px solid color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 17%,var(--divider-color));border-radius:18px;padding:16px;margin:0;background:linear-gradient(145deg,color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 3%,var(--secondary-background-color)),var(--secondary-background-color) 58%);box-shadow:0 5px 16px rgba(0,0,0,.08);transition:border-color .18s,box-shadow .18s}
      .slot::before{content:'';position:absolute;top:0;left:16px;right:16px;height:1px;background:linear-gradient(90deg,color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 54%,transparent),transparent)}
      .slot:hover{border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 34%,var(--divider-color));box-shadow:0 8px 22px rgba(0,0,0,.12)}
      .slot .slot-head{display:flex;align-items:center;gap:8px;margin-bottom:13px}
      .slot h3{flex:1 1 auto;min-width:0;margin:0;font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.08em;color:var(--climate-flow-accent-color,var(--primary-color))}
      .slot .remove{flex:0 0 auto;min-height:34px;border:1px solid color-mix(in srgb,var(--error-color) 20%,transparent);background:color-mix(in srgb,var(--error-color) 7%,var(--secondary-background-color));color:var(--error-color);font:inherit;font-size:12px;font-weight:650;cursor:pointer;padding:5px 10px;border-radius:999px;transition:background-color .16s,border-color .16s}
      .slot .remove:hover{background:color-mix(in srgb,var(--error-color) 14%,var(--secondary-background-color));border-color:color-mix(in srgb,var(--error-color) 38%,transparent)}
      .days{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 13px}
      .days label{position:relative;cursor:pointer}
      .days input{position:absolute;opacity:0;width:1px;height:1px;margin:0;inset:auto}
      .days .day{display:grid;place-items:center;min-width:38px;height:34px;padding:0 7px;border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:999px;background:var(--card-background-color,var(--ha-card-background));font-size:11px;font-weight:650;color:var(--secondary-text-color);transition:background .15s,color .15s,border-color .15s,box-shadow .15s}
      .days input:checked~.day{background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 15%,var(--card-background-color,var(--ha-card-background)));border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 34%,var(--divider-color));color:var(--climate-flow-accent-color,var(--primary-color));box-shadow:inset 0 1px 0 color-mix(in srgb,var(--text-primary-color,#fff) 10%,transparent)}
      .days label:hover .day{border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 46%,var(--divider-color));color:var(--climate-flow-accent-color,var(--primary-color))}
      .days input:focus-visible~.day{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px}
      .slot .range-toggle{position:relative;flex:0 0 auto;cursor:pointer;display:flex;align-items:center}
      .slot .range-toggle input{position:absolute;opacity:0;width:1px;height:1px;margin:0;inset:auto}
      .slot .range-toggle .day{display:grid;place-items:center;height:32px;padding:0 11px;border-radius:999px;background:var(--card-background-color,var(--ha-card-background));border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);font-size:11px;font-weight:650;color:var(--secondary-text-color);transition:background .15s,color .15s,border-color .15s,box-shadow .15s}
      .slot .range-toggle input:checked~.day{background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 15%,var(--card-background-color,var(--ha-card-background)));color:var(--climate-flow-accent-color,var(--primary-color));border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 34%,var(--divider-color))}
      .slot .range-toggle:hover .day{border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 46%,var(--divider-color))}
      .slot .range-toggle input:focus-visible~.day{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px}
      .field{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .field label{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--secondary-text-color)}
      .field input{box-sizing:border-box;font:inherit;font-size:14px;color:var(--primary-text-color);background:var(--card-background-color,var(--ha-card-background));border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:11px;padding:8px 10px;transition:border-color .16s,box-shadow .16s}
      .field input:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px;border-color:transparent}
      .field .temperature-field{box-sizing:border-box;display:flex;flex:1 1 136px;flex-direction:column;align-items:stretch;gap:7px;min-width:132px;max-width:190px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 24%,var(--divider-color));border-radius:14px;background:linear-gradient(145deg,color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 7%,var(--secondary-background-color)),var(--secondary-background-color));box-shadow:inset 0 1px 0 color-mix(in srgb,var(--text-primary-color,#fff) 10%,transparent),0 2px 7px rgba(0,0,0,.08);color:var(--primary-text-color);transition:border-color .16s,box-shadow .16s}
      .temperature-caption{font-size:10px;font-weight:700;letter-spacing:.075em;text-transform:uppercase;color:var(--secondary-text-color);line-height:1.2}
      .temperature-value{box-sizing:border-box;display:flex;align-items:center;justify-content:flex-end;gap:7px;min-width:0;min-height:38px;padding:0 10px;border:1px solid color-mix(in srgb,var(--divider-color) 78%,transparent);border-radius:10px;background:var(--card-background-color,var(--ha-card-background));box-shadow:inset 0 1px 2px rgba(0,0,0,.08);transition:border-color .16s,box-shadow .16s,background-color .16s}
      .temperature-value:focus-within{border-color:var(--climate-flow-accent-color,var(--primary-color));background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 4%,var(--card-background-color,var(--ha-card-background)));box-shadow:0 0 0 3px color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 16%,transparent),inset 0 1px 2px rgba(0,0,0,.06)}
      .field .temperature-value input{flex:1 1 auto;width:100%;min-width:0;padding:7px 0;border:0;border-radius:0;background:transparent;box-shadow:none;text-align:right;font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
      .field .temperature-value input:focus-visible{outline:none;border-color:transparent}
      .temperature-value input[type=number]{appearance:textfield;-moz-appearance:textfield}
      .temperature-value input[type=number]::-webkit-inner-spin-button,.temperature-value input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
      .temperature-unit{flex:0 0 auto;color:var(--secondary-text-color);font-size:12px;font-weight:700;white-space:nowrap}
      .temperature-step{display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;padding:0;border:1px solid color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 26%,var(--divider-color));border-radius:10px;background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 9%,var(--card-background-color,var(--ha-card-background)));color:var(--climate-flow-accent-color,var(--primary-color));font:inherit;font-size:18px;font-weight:700;line-height:1;box-shadow:inset 0 1px 0 color-mix(in srgb,var(--text-primary-color,#fff) 12%,transparent)}
      .temperature-step:hover:not(:disabled){background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 18%,var(--card-background-color,var(--ha-card-background)));border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 48%,var(--divider-color));box-shadow:0 2px 7px color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 18%,transparent)}
      .temperature-step:disabled{background:var(--secondary-background-color);box-shadow:none}
      .temperature-step:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px}
      .field.outside .temperature-field{flex:1 1 100%;flex-direction:row;align-items:center;justify-content:space-between;width:100%;max-width:none;gap:14px;padding:11px 14px}
      .field.outside .temperature-value{flex:0 1 170px;width:170px}
      .slot .field{gap:12px}
      .slot .field>label:not(.temperature-field){flex:1 1 130px;min-width:120px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;font-size:10px;font-weight:700;letter-spacing:.075em;text-transform:uppercase}
      .slot .field>label:not(.temperature-field) input{width:100%;min-height:42px;font-size:13px;font-variant-numeric:tabular-nums}
      .field select{box-sizing:border-box;font:inherit;font-size:14px;color:var(--primary-text-color);background:var(--card-background-color,var(--ha-card-background));border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:11px;padding:8px 10px;transition:border-color .16s,box-shadow .16s}
      .field select:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px;border-color:transparent}
      .field.outside label.temperature-field{color:var(--primary-text-color);font-weight:600}
      .dlg-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:2px;padding-top:14px;border-top:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent)}
      .btn{min-height:42px;font:inherit;font-size:13px;font-weight:650;color:var(--primary-text-color);background:var(--secondary-background-color);border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent);border-radius:12px;padding:9px 15px;cursor:pointer;white-space:nowrap;transition:background-color .16s,border-color .16s,box-shadow .16s,transform .16s}
      .btn:hover{border-color:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 36%,var(--divider-color))}
      .btn:focus-visible{outline:2px solid var(--climate-flow-accent-color,var(--primary-color));outline-offset:2px}
      .btn.primary{margin-left:auto;background:var(--climate-flow-accent-color,var(--primary-color));border-color:transparent;color:var(--text-primary-color,#fff);box-shadow:0 5px 14px color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 24%,transparent)}
      .btn.primary:hover{box-shadow:0 7px 18px color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 34%,transparent)}
      .btn.danger{color:var(--error-color);background:color-mix(in srgb,var(--error-color) 6%,var(--secondary-background-color));border-color:color-mix(in srgb,var(--error-color) 18%,transparent)}
      .btn.ghost{width:100%;min-height:46px;background:color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 5%,var(--secondary-background-color));border:1px dashed color-mix(in srgb,var(--climate-flow-accent-color,var(--primary-color)) 42%,var(--divider-color));color:var(--climate-flow-accent-color,var(--primary-color));font-size:13px}
      .dlg-body>.btn.ghost{margin-top:-2px}
      @media(max-width:680px){
        dialog{width:calc(100vw - 16px);max-height:calc(100vh - 16px);border-radius:21px}
        .dlg-head{gap:11px;padding:17px 16px 14px}
        .dlg-head .dlg-icon{width:40px;height:40px;flex-basis:40px;border-radius:13px}
        .dlg-head h2{font-size:18px}
        .dlg-body{gap:12px;padding:14px 16px 18px}
        .program-settings{grid-template-columns:minmax(0,1fr)}
        .program-settings>.switch{grid-column:auto}
        .slot{padding:14px}
        .slot .slot-head{gap:6px}
        .days{gap:5px}
        .days .day{min-width:36px}
        .dlg-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
        .dlg-actions .btn{min-width:0;padding:9px 8px;white-space:normal}
      }
      @media(prefers-reduced-motion:reduce){.dlg-head .close,.switch,.switch input,.switch input::after,.slot,.slot .remove,.days .day,.slot .range-toggle .day,.field input,.field select,.temperature-field,.temperature-value,.btn{transition:none!important}}
       ${BUTTON_FEEDBACK_CSS}
      </style>`;
  }
  _renderScheduleDialog() {
    const t = this._strings();
    const old = this.shadowRoot.querySelector('dialog'); old?.remove();
    const dialog = document.createElement('dialog'); dialog.setAttribute('aria-label', t.scheduleAria);
    dialog.innerHTML = `${this._scheduleDialogStyle()}<div class="dlg-head"><span class="dlg-icon"><ha-icon icon="mdi:calendar-clock"></ha-icon></span><div class="dlg-titles"><h2>${t.weeklySchedule}</h2><div class="dlg-sub"></div></div><button class="close" aria-label="${t.closeSchedule}" title="${t.close}"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="dlg-body"></div>`;
    const body = dialog.querySelector('.dlg-body');
    dialog.querySelector('.close').addEventListener('click', () => this._closeSchedule(dialog));
    dialog.querySelector('.dlg-sub').textContent = this.config.name || this.config.entity;
    const sensor = this._scheduleSensor(), program = sensor?.attributes?.programs?.[this.config.entity];
    const entity = this._hass?.states?.[this.config.entity];
    const temperatureUnit = this._hass?.config?.unit_system?.temperature || '°C';
    const adjustTemperatureInput = (input, direction, apply, slot = null, key = null) => {
      const attributes = entity?.attributes || {};
      const step = effectiveStep(entity, this.config.step, this._stepOverride);
      if (step === null || step <= 0) return false;
      const liveLow = numeric(attributes.target_temp_low), liveHigh = numeric(attributes.target_temp_high);
      const liveTarget = numeric(attributes.temperature) ?? (liveLow !== null && liveHigh !== null ? (liveLow + liveHigh) / 2 : null);
      const current = numeric(input.value) ?? (slot && key ? numeric(slot[key]) : null) ?? liveTarget ?? numeric(attributes.min_temp) ?? 20;
      let lower = numeric(attributes.min_temp) ?? Number.NEGATIVE_INFINITY;
      let upper = numeric(attributes.max_temp) ?? Number.POSITIVE_INFINITY;
      if (slot?.range && key === 'targetTempLow') {
        const high = numeric(slot.targetTempHigh);
        if (high !== null) upper = Math.min(upper, high - step);
      } else if (slot?.range && key === 'targetTempHigh') {
        const low = numeric(slot.targetTempLow);
        if (low !== null) lower = Math.max(lower, low + step);
      }
      if (lower > upper) return false;
      let next = Math.max(lower, Math.min(upper, current + direction * step));
      const snapped = clampTarget(next, entity, this.config.step, this._stepOverride);
      if (snapped !== null) next = snapped;
      next = Math.max(lower, Math.min(upper, next));
      next = Number(next.toFixed(8));
      const changed = Number.isFinite(next) && Math.abs(next - current) > Math.max(1e-9, step * 1e-9);
      if (!changed || !apply) return changed;
      input.value = String(next);
      const InputEvent = input.ownerDocument?.defaultView?.Event;
      if (InputEvent) input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      return true;
    };
    const makeTemperatureField = (label, input, labelText, slot = null, key = null) => {
      label.className = 'temperature-field';
      const caption = document.createElement('span'); caption.className = 'temperature-caption'; caption.textContent = labelText;
      const value = document.createElement('span'); value.className = 'temperature-value';
      const decrease = document.createElement('button'); decrease.type = 'button'; decrease.className = 'temperature-step'; decrease.textContent = '−'; decrease.setAttribute('aria-label', t.decrease); decrease.title = t.decrease;
      const unit = document.createElement('span'); unit.className = 'temperature-unit'; unit.setAttribute('aria-hidden', 'true'); unit.textContent = temperatureUnit;
      const increase = document.createElement('button'); increase.type = 'button'; increase.className = 'temperature-step'; increase.textContent = '+'; increase.setAttribute('aria-label', t.increase); increase.title = t.increase;
      const refreshSteppers = () => {
        decrease.disabled = !adjustTemperatureInput(input, -1, false, slot, key);
        increase.disabled = !adjustTemperatureInput(input, 1, false, slot, key);
      };
      decrease.addEventListener('click', () => { adjustTemperatureInput(input, -1, true, slot, key); refreshSteppers(); });
      increase.addEventListener('click', () => { adjustTemperatureInput(input, 1, true, slot, key); refreshSteppers(); });
      input.addEventListener('input', refreshSteppers);
      value.append(decrease, input, unit, increase); label.append(caption, value);
      refreshSteppers();
    };
    if (!sensor) {
      const p = document.createElement('p'); p.className = 'error'; p.textContent = t.backendMissing; body.append(p);
      if (typeof this.config.schedule_entity === 'string' && /^schedule\.[\w-]+$/.test(this.config.schedule_entity)) { const link = document.createElement('button'); link.className = 'btn'; link.textContent = t.openLegacy; link.addEventListener('click', () => this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: this.config.schedule_entity }, ['bub' + 'bles']: true, composed: true }))); body.append(link); }
    } else {
      const statusline = document.createElement('div'); statusline.className = 'statusline';
      const stLabel = document.createElement('span'); stLabel.textContent = t.nextChange;
      const stValue = document.createElement('span'); stValue.className = 'chip';
      // The sensor carries an ISO boundary; show it as a local date/time like
      // every other future timestamp in the card, never the raw string.
      stValue.textContent = program?.next_change ? formatOverrideExpiry(program.next_change, this._hass?.locale?.language) || t.none : t.none;
      statusline.append(stLabel, stValue);
      if (program?.active_slot_id) { const act = document.createElement('span'); act.textContent = t.active(program.active_slot_id); statusline.append(act); }
      body.append(statusline);
      if (program?.last_error) { const p = document.createElement('p'); p.className = 'error'; p.textContent = errorLabel(t, program.last_error); body.append(p); }
      // A disabled program has nothing to pause, so the section is hidden
      // instead of offering an action the backend rejects as no_program.
      const pauseError = document.createElement('p'); pauseError.className = 'error'; pauseError.setAttribute('role', 'alert'); pauseError.setAttribute('aria-live', 'assertive');
      const pause = activePause(program?.pause);
      const pauseBox = document.createElement('div'); pauseBox.className = 'field mode';
      const pauseLocale = this._hass?.locale?.language;
      const pauseAvailable = Boolean(program?.enabled);
      if (pause) {
        const pausedLabel = document.createElement('label');
        pausedLabel.textContent = t.pauseActive(formatOverrideExpiry(pause.until, pauseLocale));
        const resumePause = document.createElement('button'); resumePause.className = 'btn'; resumePause.textContent = t.resumeSchedule;
        resumePause.addEventListener('click', async () => {
          pauseError.textContent = '';
          try { await this._hass.callService('climate_flow_scheduler', 'resume_program', { climate_entity: this.config.entity }); this._closeSchedule(dialog); }
          catch (err) { pauseError.textContent = errorLabel(t, err?.message || err); }
        });
        pauseBox.append(pausedLabel, resumePause);
      } else {
        const pauseLabel = document.createElement('label');
        const pauseInput = document.createElement('input'); pauseInput.type = 'number'; pauseInput.step = 'any';
        pauseInput.setAttribute('aria-label', t.pauseTarget); pauseInput.title = t.pauseTarget;
        pauseInput.value = String(numeric(entity?.attributes?.temperature) ?? 16);
        makeTemperatureField(pauseLabel, pauseInput, t.pause);
        const pauseDuration = document.createElement('select'); pauseDuration.setAttribute('aria-label', t.pauseDuration);
        for (const [value, label] of pauseDurationChoices(t)) { const option = document.createElement('option'); option.value = value; option.textContent = label; pauseDuration.append(option); }
        const startPause = document.createElement('button'); startPause.className = 'btn'; startPause.textContent = t.pauseStart;
        startPause.addEventListener('click', async () => {
          pauseError.textContent = '';
          const data = pauseServicePayload(this.config.entity, pauseInput.value, pauseDuration.value);
          if (!data) { pauseError.textContent = t.pauseInvalid; return; }
          try { await this._hass.callService('climate_flow_scheduler', 'set_pause', data); this._closeSchedule(dialog); }
          catch (err) { pauseError.textContent = errorLabel(t, err?.message || err); }
        });
        pauseBox.append(pauseLabel, pauseDuration, startPause);
      }
      if (pauseAvailable) body.append(pauseBox, pauseError);
       const enabledLabel = document.createElement('label'), enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.checked = Boolean(this._scheduleDraft.enabled); enabledLabel.className = 'switch'; enabledLabel.append(enabled, document.createTextNode(t.enabled)); enabled.addEventListener('change', () => this._scheduleDraft.enabled = enabled.checked);
      const settings = document.createElement('div'); settings.className = 'program-settings';
      const modeField = document.createElement('div'); modeField.className = 'field mode hvac';
      const modeFieldLabel = document.createElement('label');
      const modeCaption = document.createElement('span'); modeCaption.className = 'field-caption'; modeCaption.textContent = t.hvacMode;
      const modeSelect = document.createElement('select'); modeSelect.setAttribute('aria-label', t.hvacMode);
      const modeNone = document.createElement('option'); modeNone.value = ''; modeNone.textContent = t.dontChange; modeSelect.append(modeNone);
      for (const m of schedulableModes(entity)) { const option = document.createElement('option'); option.value = m; option.textContent = modeLabel(m, t); modeSelect.append(option); }
      modeSelect.value = this._scheduleDraft.hvacMode ?? '';
      modeSelect.addEventListener('change', () => { this._scheduleDraft.hvacMode = modeSelect.value || null; });
      modeFieldLabel.append(modeCaption, modeSelect); modeField.append(modeFieldLabel);
      const awayField = document.createElement('div'); awayField.className = 'field outside';
      const awayLabel = document.createElement('label');
      const awayInput = document.createElement('input'); awayInput.type = 'number'; awayInput.step = 'any'; awayInput.value = this._scheduleDraft.awayTemperature ?? ''; awayInput.setAttribute('aria-label', t.outsideScheduleAria); awayInput.title = t.outsideScheduleTitle;
      makeTemperatureField(awayLabel, awayInput, t.outsideSchedule);
      awayInput.addEventListener('input', () => this._scheduleDraft.awayTemperature = awayInput.value);
      awayField.append(awayLabel);
      settings.append(enabledLabel, modeField, awayField); body.append(settings);
      const slots = document.createElement('div');
      // A range toggle only makes sense where heat_cool exists; an already
      // dual slot keeps it so the user can always go back to one temperature.
      const rangeCapable = schedulableModes(entity).includes('heat_cool');
      const renderSlots = () => { slots.replaceChildren(); this._scheduleDraft.slots.forEach((slot, index) => {
        const box = document.createElement('section'); box.className = 'slot';
        const slotHead = document.createElement('div'); slotHead.className = 'slot-head';
        const title = document.createElement('h3'); title.textContent = t.slot(index + 1);
        const remove = document.createElement('button'); remove.className = 'remove'; remove.textContent = t.remove; remove.setAttribute('aria-label', t.removeSlot(index + 1)); remove.addEventListener('click', () => { this._scheduleDraft.slots.splice(index, 1); renderSlots(); });
        slotHead.append(title);
        if (rangeCapable || slot.range) {
          const rangeLabel = document.createElement('label'); rangeLabel.className = 'range-toggle';
          const rangeInput = document.createElement('input'); rangeInput.type = 'checkbox'; rangeInput.checked = Boolean(slot.range); rangeInput.setAttribute('aria-label', t.rangeToggle);
          rangeInput.addEventListener('change', () => {
            if (rangeInput.checked) {
              slot.range = true;
              if (slot.targetTempLow === null || slot.targetTempHigh === null) {
                // Prefer what the entity already reports for heat_cool, then
                // one step above the single value the slot had.
                const liveLow = numeric(entity?.attributes?.target_temp_low), liveHigh = numeric(entity?.attributes?.target_temp_high);
                if (liveLow !== null && liveHigh !== null && liveLow < liveHigh) { slot.targetTempLow = liveLow; slot.targetTempHigh = liveHigh; }
                else { const seeded = seedRange(slot.temperature, effectiveStep(entity, this.config.step), entity?.attributes?.min_temp, entity?.attributes?.max_temp); slot.targetTempLow = seeded.low; slot.targetTempHigh = seeded.high; }
              }
            } else {
              // Going back takes the low bound: it is already on the entity
              // grid, so it is a valid target as it is. When the pair was
              // cleared, the single value the slot came with stays.
              slot.range = false;
              if (numeric(slot.targetTempLow) !== null) slot.temperature = numeric(slot.targetTempLow);
            }
            renderSlots();
          });
          const rangeText = document.createElement('span'); rangeText.className = 'day'; rangeText.textContent = t.rangeToggle;
          rangeLabel.append(rangeInput, rangeText); slotHead.append(rangeLabel);
        }
        slotHead.append(remove); box.append(slotHead);
        const days = document.createElement('div'); days.className = 'days'; t.dayNames.forEach((name, i) => {
          // Pill text comes from the day index (unique two-letter label); the
          // checkbox keeps the full accessible name and its ISO weekday i + 1.
          const label = document.createElement('label'), cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = slot.days.includes(i + 1); cb.setAttribute('aria-label', name); cb.addEventListener('change', () => { slot.days = cb.checked ? [...new Set([...slot.days, i + 1])] : slot.days.filter((x) => x !== i + 1); });
          const pill = document.createElement('span'); pill.className = 'day'; pill.textContent = t.dayPills[i]; label.append(cb, pill); days.append(label);
        }); box.append(days);
        const field = document.createElement('div'); field.className = 'field';
        // One target form per slot: a single value, or the heat_cool pair.
        const entries = [['start', t.start, 'time'], ['end', t.end, 'time']];
        if (slot.range) entries.push(['targetTempLow', t.targetLowField, 'number'], ['targetTempHigh', t.targetHighField, 'number']);
        else entries.push(['temperature', t.targetField, 'number']);
        for (const [key, labelText, type] of entries) {
          const label = document.createElement('label');
          const input = document.createElement('input'); input.type = type; input.value = slot[key] === null || slot[key] === undefined ? '' : String(slot[key]); if (type === 'number') input.step = 'any'; input.setAttribute('aria-label', labelText); input.addEventListener('input', () => slot[key] = input.value);
          if (type === 'number') makeTemperatureField(label, input, labelText, slot, key);
          else { label.textContent = labelText; label.append(input); }
          field.append(label);
        }
        box.append(field); slots.append(box);
      })}; renderSlots(); body.append(slots);
      const error = document.createElement('p'); error.className = 'error'; error.textContent = this._scheduleError || '';
      const add = document.createElement('button'); add.className = 'btn ghost'; add.textContent = t.addSlot; add.addEventListener('click', () => { this._scheduleDraft.slots.push({ id: globalThis.crypto?.randomUUID?.() || `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`, days: [1], start: '08:00', end: '09:00', temperature: 20, range: false, targetTempLow: null, targetTempHigh: null }); renderSlots(); });
      body.append(add); body.append(error);
      const actions = document.createElement('div'); actions.className = 'dlg-actions';
      const del = document.createElement('button'); del.className = 'btn danger'; del.textContent = t.deleteProgram; del.addEventListener('click', async () => { try { await this._hass.callService('climate_flow_scheduler', 'delete_program', { climate_entity: this.config.entity }); this._closeSchedule(dialog); } catch (err) { error.textContent = errorLabel(t, err?.message || err); } }); actions.append(del);
      const save = document.createElement('button'); save.className = 'btn primary'; save.textContent = t.saveProgram; save.addEventListener('click', async () => { const issue = validateScheduleDraft(this._scheduleDraft, t, entity); if (issue) { error.textContent = issue; return; } try { await this._hass.callService('climate_flow_scheduler', 'save_program', { climate_entity: this.config.entity, enabled: this._scheduleDraft.enabled, slots: this._scheduleDraft.slots.map(draftSlotPayload), away_temperature: awayTemperaturePayload(this._scheduleDraft.awayTemperature), hvac_mode: this._scheduleDraft.hvacMode || null }); this._closeSchedule(dialog); } catch (err) { error.textContent = errorLabel(t, err?.message || err); } }); actions.append(save);
      body.append(actions);
    }
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); this._closeSchedule(dialog); }); this.shadowRoot.append(dialog);
    if (this._scheduleOpen) dialog.showModal();
  }
  _displayEntity(entity) {
    const o=this._optimistic; if (!entity || !o || o.entityId!==this.config?.entity) return entity;
    return {...entity, attributes:{...entity.attributes,...o.payload}};
  }
  _reconcileOptimistic() {
    const o=this._optimistic, actual=this._hass?.states?.[this.config?.entity]; if (!o || !actual) return;
    const keys=Object.keys(o.payload), confirmed=keys.every(k=>numeric(actual.attributes?.[k])===numeric(o.payload[k]));
    if (confirmed || actual.state==='unknown' || actual.state==='unavailable') { clearTimeout(this._optimisticTimer); this._optimisticTimer=null; this._optimistic=null; }
  }
  _bindCardToggle(card) {
    // Only a press on the card background reaches the configured action: every
    // interactive control is excluded from the composed path.
    const eligible = (ev) => { const path=ev.composedPath?.() || [ev.target]; return !path.some(node=>node!==card && node?.matches?.('button,input,select,textarea,a,[role="slider"],[role="button"],[role="group"]')); };
    const doubleTap = this.config.double_tap_action;
    card.addEventListener('click', ev=>{
      if (!eligible(ev)) return;
      if (this._holdFired) { this._holdFired = false; return; }
      if (doubleTap === 'none') { this._runCardAction(this.config.tap_action); return; }
      // A double tap is only knowable once its window closes, so the single
      // tap waits for it instead of firing first.
      const now = Date.now();
      if (now - (this._lastTapAt || 0) <= 300) { clearTimeout(this._tapTimer); this._tapTimer=null; this._lastTapAt=0; this._runCardAction(doubleTap); return; }
      this._lastTapAt = now;
      clearTimeout(this._tapTimer);
      this._tapTimer = setTimeout(() => { this._tapTimer=null; this._lastTapAt=0; this._runCardAction(this.config.tap_action); }, 300);
    });
    card.addEventListener('keydown', ev=>{ if((ev.key==='Enter'||ev.key===' ') && ev.target===card){ev.preventDefault();card.click();} });
    const hold = this.config.hold_action;
    if (hold !== 'none') {
      const cancelHold = () => { clearTimeout(this._holdTimer); this._holdTimer=null; };
      card.addEventListener('pointerdown', (ev)=>{ if (!eligible(ev)) return; cancelHold(); this._holdTimer=setTimeout(()=>{ this._holdTimer=null; this._holdFired=true; this._runCardAction(hold); },550); });
      card.addEventListener('pointerup', cancelHold);
      card.addEventListener('pointerleave', cancelHold);
      card.addEventListener('pointercancel', cancelHold);
    }
  }
  _heroStep() { return effectiveStep(this._hass?.states?.[this.config.entity], this.config.step, this._stepOverride); }
  _heroTarget() {
    const model = targetModel(this._displayEntity(this._hass?.states?.[this.config.entity]));
    return model.available && model.controllable ? model.value : null;
  }
  _heroPayload(value) {
    const base = this._displayEntity(this._hass?.states?.[this.config.entity]);
    return temperaturePayload(base, value, this.config.step, this._stepOverride);
  }
  _markHeroControl(element, adjustable) {
    // role=slider only while the hero carries a value the user can change;
    // anything else stays an ordinary control that opens the entity details.
    element.setAttribute('role', adjustable ? 'slider' : 'button');
    if (element.tagName?.toLowerCase() !== 'button') element.setAttribute('tabindex', '0');
  }
  _markHeroMotion(element) {
    // The whole shadow tree is rebuilt on every update, so the entrance
    // animation is only started when the number really changed.
    const text = element?.textContent || '';
    const changed = this._lastHeroText !== undefined && this._lastHeroText !== text;
    this._lastHeroText = text;
    if (!changed || this.config.animations === false || this._drag) return;
    element.classList.add('bump');
    element.addEventListener('animationend', () => element.classList.remove('bump'), { once: true });
  }
  _patchHero(value) {
    // During a drag the hero must follow the pointer without rebuilding the
    // shadow tree: a rebuild would replace the node under the finger.
    const root = this.shadowRoot;
    const hero = root?.querySelector?.('.setpoint, .target');
    if (!hero) return false;
    const payload = this._heroPayload(value);
    if (!payload) return false;
    const base = this._displayEntity(this._hass?.states?.[this.config.entity]);
    const model = targetModel({ ...base, attributes: { ...base.attributes, ...payload } });
    if (!model.available) return false;
    const locale = this._hass?.locale?.language;
    const unit = this._hass?.config?.unit_system?.temperature || '°C';
    const t = this._strings();
    const low = formatNumber(model.low, locale), high = formatNumber(model.high, locale);
    const single = formatNumber(model.value, locale);
    const accessible = model.dual ? t.targetRange(low, high, unit) : t.target(single, unit);
    const strong = hero.querySelector('strong');
    if (strong) strong.textContent = model.dual ? `${low}–${high}` : single;
    else hero.textContent = model.dual ? `${low}–${high} ${unit}` : `${single} ${unit}`;
    hero.title = accessible;
    hero.setAttribute('aria-valuetext', accessible);
    hero.setAttribute('aria-valuenow', String(model.value));
    const slider = root.querySelector('.slider');
    if (slider) { slider.value = String(model.value); paintSliderFill(slider); }
    this._lastHeroText = hero.textContent;
    return true;
  }
  _bindHeroControls(element, options) {
    // Shared gestures for the hero of every layout. The dial passes its own
    // pointer starter (angle instead of vertical delta); the rest stays
    // identical so all layouts agree on batching, rollback and the
    // dragConsumed guard.
    const { entity, adjustable, dial = false } = options;
    element.addEventListener('click', () => {
      // A finished drag is not a tap: its trailing click is swallowed here.
      if (this._dragConsumed) { this._dragConsumed = false; return; }
      if (element.disabled) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entity }, ['bub' + 'bles']: true, composed: true }));
    });
    if (!adjustable) {
      // The compact hero is a span, so it needs its own Enter/Space activation.
      if (element.tagName?.toLowerCase() !== 'button') element.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.click(); } });
      return;
    }
    element.addEventListener('pointerdown', (event) => {
      if (dial) this._startDialDrag(event, { entity });
      else this._startHeroDrag(event);
    });
    element.addEventListener('keydown', (event) => {
      const sign = event.key === 'ArrowUp' || event.key === 'ArrowRight' ? 1 : (event.key === 'ArrowDown' || event.key === 'ArrowLeft' ? -1 : 0);
      const step = this._heroStep();
      if (!sign || step === null) return;
      const origin = this._heroTarget();
      if (origin === null) return;
      event.preventDefault();
      fireHaptic(this.config, 'medium');
      // Held arrow keys repeat, so the commit waits like a drag does.
      this._setTemperature(origin + sign * step, this._hass?.states?.[entity], { debounce: true });
    });
  }
  _startHeroDrag(event) {
    if (event.pointerType === 'mouse' && typeof event.button === 'number' && event.button !== 0) return;
    const origin = this._heroTarget(), step = this._heroStep();
    if (origin === null || step === null) return;
    const win = globalThis.window;
    if (!win?.addEventListener) return;
    this._dragConsumed = false;
    this._drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, origin, step, active: false, value: origin };
    const onMove = (moveEvent) => {
      const drag = this._drag;
      if (!drag || (drag.pointerId !== undefined && moveEvent.pointerId !== undefined && drag.pointerId !== moveEvent.pointerId)) return;
      const dx = moveEvent.clientX - drag.x, dy = moveEvent.clientY - drag.y;
      if (!drag.active) {
        // Below the threshold it is still a tap; a vertical move is a scroll.
        if (Math.abs(dx) < DRAG_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;
        drag.active = true;
        this._dragConsumed = true;
      }
      if (typeof moveEvent.preventDefault === 'function') moveEvent.preventDefault();
      const value = dragStepValue(drag.origin, dx, drag.step);
      if (value === null || value === drag.value) return;
      const bounded = clampTarget(value, this._hass?.states?.[this.config.entity], drag.step, this._stepOverride);
      if (bounded === null || bounded === drag.value) return;
      drag.value = bounded;
      if (this._patchHero(bounded)) fireHaptic(this.config, 'light');
    };
    const onUp = () => {
      const drag = this._drag;
      this._detachHeroDrag();
      if (!drag?.active) return;
      this._dragConsumed = true;
      const payload = this._heroPayload(drag.value);
      // Nothing to apply (out of range): put the real value back on screen.
      if (!payload) { this._renderPreservingDeltaFocus(); return; }
      this._setTemperature(drag.value, this._hass?.states?.[this.config.entity], { debounce: true });
    };
    const onCancel = () => {
      const drag = this._drag;
      this._detachHeroDrag();
      if (!drag?.active) return;
      // Aborted gesture: nothing was sent, so the display falls back to the
      // real state instead of keeping the value the finger had reached.
      this._dragConsumed = true;
      this._renderPreservingDeltaFocus();
    };
    win.addEventListener('pointermove', onMove, { passive: false });
    win.addEventListener('pointerup', onUp);
    win.addEventListener('pointercancel', onCancel);
    win.addEventListener('blur', onCancel);
    this._dragListeners = { onMove, onUp, onCancel };
  }
  _detachHeroDrag() {
    const win = globalThis.window, listeners = this._dragListeners;
    if (win && listeners) {
      win.removeEventListener('pointermove', listeners.onMove);
      win.removeEventListener('pointerup', listeners.onUp);
      win.removeEventListener('pointercancel', listeners.onCancel);
      win.removeEventListener('blur', listeners.onCancel);
    }
    this._dragListeners = null;
    this._drag = null;
  }
  _detachDialDrag() {
    const win = globalThis.window;
    const listeners = this._dragListeners;
    if (win && listeners) {
      win.removeEventListener('pointermove', listeners.onMove);
      win.removeEventListener('pointerup', listeners.onUp);
      win.removeEventListener('pointercancel', listeners.onCancel);
      win.removeEventListener('blur', listeners.onCancel);
    }
    this._dragListeners = null;
    this._dialDrag = null;
  }
  _startDialDrag(event, { entity }) {
    // Same interaction model as the hero drag (threshold, window listeners so
    // the re-render cannot orphan them, batched commit on release), but the
    // value comes from the angle under the pointer instead of a vertical
    // delta. With heat_cool the pointer grabs the nearest bound and moves it
    // alone, which is why the bounds are patched and committed individually.
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const svg = event.currentTarget;
    // The drag carries the displayed entity object (limits, step and the
    // optimistic preview all read attributes from it), not the entity id.
    const displayed = this._displayEntity(this._hass?.states?.[entity]);
    const model = targetModel(displayed);
    if (!model.available || !model.controllable) return;
    const step = this._heroStep();
    if (step === null) return;
    const rect = svg.getBoundingClientRect ? svg.getBoundingClientRect() : null;
    const origin = rect ? dialValueFromPointer(event.clientX, event.clientY, rect, model.min, model.max) : null;
    if (origin === null) return;
    const drag = {
      pointerId: event.pointerId,
      entity: displayed,
      rect,
      startClientX: event.clientX, startClientY: event.clientY,
      min: model.min, max: model.max, step,
      dual: model.dual,
      bound: model.dual ? (Math.abs(origin - model.low) <= Math.abs(model.high - origin) ? 'low' : 'high') : null,
      active: false,
      value: model.value, low: model.low, high: model.high,
    };
    this._dragConsumed = false;
    this._dialDrag = drag;
    const onDialMove = (moveEvent) => {
      if (moveEvent.pointerId !== undefined && drag.pointerId !== undefined && moveEvent.pointerId !== drag.pointerId) return;
      if (!drag.active) {
        if (Math.hypot(moveEvent.clientX - drag.startClientX, moveEvent.clientY - drag.startClientY) < DIAL_DRAG_THRESHOLD_PX) return;
        this._dialDrag.active = true;
        this._dragConsumed = true;
        svg.setAttribute('data-active', 'true');
      }
      const next = dialValueFromPointer(moveEvent.clientX, moveEvent.clientY, drag.rect, drag.min, drag.max);
      if (next === null) return;
      if (drag.bound) {
        const value = dialBoundValue(next, drag.bound, drag.entity, drag.step);
        if (value === null) return;
        const previous = drag.bound === 'low' ? drag.low : drag.high;
        if (value === previous) return;
        if (drag.bound === 'low') drag.low = value; else drag.high = value;
        drag.value = (drag.low + drag.high) / 2;
        this._patchDial({ target_temp_low: drag.low, target_temp_high: drag.high });
      } else {
        const value = clampTarget(next, drag.entity, drag.step, this._stepOverride);
        if (value === null || value === drag.value) return;
        drag.value = value;
        this._patchDial({ temperature: value });
      }
      fireHaptic(this.config, 'light');
    };
    const onDialUp = (upEvent) => {
      if (drag.pointerId === undefined || upEvent.pointerId === undefined || drag.pointerId === upEvent.pointerId) {
        if (drag.active && drag.bound) {
          this._setTemperature(null, drag.entity, { payload: { target_temp_low: drag.low, target_temp_high: drag.high }, debounce: true });
        } else if (drag.active) {
          this._setTemperature(drag.value, drag.entity, { debounce: true });
        }
      }
      svg.removeAttribute('data-active');
      this._detachDialDrag();
    };
    const onCancelDial = () => {
      if (this._dialDrag) this._dragConsumed = true;
      svg.removeAttribute('data-active');
      this._detachDialDrag();
      this._renderPreservingDeltaFocus(); // restore the real value, send nothing
    };
    const win = globalThis.window;
    win.addEventListener('pointermove', onDialMove);
    win.addEventListener('pointerup', onDialUp);
    win.addEventListener('pointercancel', onCancelDial);
    win.addEventListener('blur', onCancelDial);
    this._dragListeners = { onMove: onDialMove, onUp: onDialUp, onCancel: onCancelDial };
  }
  _patchDial(nextAttributes) {
    // Live update of the dial while dragging: value arc, thumbs and hero, but
    // never a full re-render (that would replace the svg under the finger).
    const root = this.shadowRoot;
    const svg = root?.querySelector?.('.dial');
    if (!svg) return false;
    const base = this._displayEntity(this._hass?.states?.[this.config.entity]);
    const model = targetModel({ ...base, attributes: { ...(base?.attributes || {}), ...nextAttributes } });
    if (!model.available) return false;
    const t = this._strings();
    const unit = this._hass?.config?.unit_system?.temperature || '°C';
    const locale = this._hass?.locale?.language;
    const geometry = this._dialGeometry(model);
    const valueArc = svg.querySelector('.value');
    valueArc.setAttribute('stroke-dasharray', geometry.arc.dasharray);
    valueArc.setAttribute('stroke-dashoffset', String(geometry.arc.dashoffset));
    const thumbs = svg.querySelector('.thumbs');
    const circles = thumbs.querySelectorAll('.thumb');
    if (circles.length === geometry.thumbs.length && circles.length) {
      circles.forEach((circle, index) => { circle.setAttribute('cx', String(geometry.thumbs[index].x)); circle.setAttribute('cy', String(geometry.thumbs[index].y)); });
    } else {
      thumbs.replaceChildren();
      for (const point of geometry.thumbs) { const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); circle.setAttribute('class', 'thumb'); circle.setAttribute('cx', String(point.x)); circle.setAttribute('cy', String(point.y)); circle.setAttribute('r', '9'); thumbs.append(circle); }
    }
    const hero = root.querySelector('.hero strong');
    if (hero) hero.textContent = model.dual ? `${formatNumber(model.low, locale)}–${formatNumber(model.high, locale)}` : formatNumber(model.value, locale);
    svg.setAttribute('aria-valuenow', String(model.value));
    svg.setAttribute('aria-valuetext', model.dual ? t.targetRange(formatNumber(model.low, locale), formatNumber(model.high, locale), unit) : t.target(formatNumber(model.value, locale), unit));
    return true;
  }
  _focusedDelta() {
    // Which +/- control owns focus right now. The optimistic re-render replaces
    // the whole shadow tree, which silently drops focus otherwise.
    try {
      const delta = this.shadowRoot?.activeElement?.dataset?.delta;
      return delta === undefined || delta === null || delta === '' ? null : String(delta);
    } catch { return null; }
  }
  _focusedHero() {
    // Arrow-key adjustments optimistically rebuild the card too; retain focus
    // on the adjustable hero so a held key can repeat across those renders.
    try {
      const active = this.shadowRoot?.activeElement;
      if (active?.matches?.('.setpoint[role="slider"]')) return '.setpoint[role="slider"]';
      if (active?.matches?.('.target[role="slider"]')) return '.target[role="slider"]';
      if (active?.matches?.('.dial[role="slider"]')) return '.dial[role="slider"]';
      return null;
    } catch { return null; }
  }
  _restoreDeltaFocus(delta) {
    // Give focus back to the same +/- control after the re-render; a slider or
    // anything else (no data-delta) keeps its own focus handling. Focus the
    // user already moved away is never pulled back: nothing to do without a
    // captured delta, and nothing to steal when a live control still owns it.
    if (delta === null || delta === undefined) return;
    try {
      const root = this.shadowRoot;
      if (!root?.querySelector) return;
      const active = root.activeElement;
      // A live control still holds focus (the render was a no-op, e.g. the
      // schedule dialog is open): leave it exactly where the user put it.
      if (active && active !== root && active.isConnected) return;
      // Focus already sits on another element outside the card: not ours.
      const doc = typeof document === 'undefined' ? null : document;
      const docActive = doc?.activeElement;
      if (docActive && docActive !== doc.body && docActive !== (root.host || this)) return;
      root.querySelector(`[data-delta="${delta}"]`)?.focus?.();
    } catch {}
  }
  _restoreHeroFocus(selector) {
    if (!selector) return;
    try {
      const root = this.shadowRoot;
      if (!root?.querySelector) return;
      const active = root.activeElement;
      if (active && active !== root && active.isConnected) return;
      const doc = typeof document === 'undefined' ? null : document;
      const docActive = doc?.activeElement;
      if (docActive && docActive !== doc.body && docActive !== (root.host || this)) return;
      root.querySelector(selector)?.focus?.();
    } catch {}
  }
  _renderPreservingDeltaFocus() {
    // Wrapper around _render() for every path that rebuilds the whole card:
    // capture focused +/- or slider hero before the swap, rebuild, and restore
    // focus only if the rebuild dropped it.
    const delta = this._focusedDelta();
    const hero = this._focusedHero();
    this._render();
    this._restoreDeltaFocus(delta);
    this._restoreHeroFocus(hero);
  }
  _requestManualOverride(target, step = null) {
    const t = this._strings();
    const deltaFocus = this._focusedDelta();
    const sliderFocus = this.shadowRoot.activeElement?.classList?.contains('slider');
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-labelledby', 'override-title');
    dialog.innerHTML = `<style>dialog{color:var(--primary-text-color);background:var(--card-background-color,var(--ha-card-background));border:0;border-radius:18px;padding:20px;max-width:min(420px,calc(100vw - 40px));box-shadow:0 12px 40px rgba(0,0,0,.35)}dialog::backdrop{background:rgba(0,0,0,.55)}fieldset{border:0;padding:0;margin:0}legend{font-weight:600;margin-bottom:12px}.choices{display:grid;gap:8px}.choices button,.cancel{font:inherit;color:var(--primary-text-color);background:var(--secondary-background-color);border:0;border-radius:12px;padding:10px 14px;text-align:left;cursor:pointer}.choices button:focus-visible,.cancel:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.error{color:var(--error-color);min-height:1.3em}${BUTTON_FEEDBACK_CSS}</style><fieldset><legend id="override-title"></legend><div class="choices"></div><p class="error" role="alert" aria-live="assertive"></p><button class="cancel" type="button"></button></fieldset>`;
    dialog.querySelector('legend').textContent = t.overrideChoice;
    dialog.querySelector('.cancel').textContent = t.overrideCancel;
    const close = () => { this._overrideDialogOpen = false; dialog.close(); dialog.remove(); this._renderPreservingDeltaFocus(); this.shadowRoot.querySelector(overrideFocusSelector(sliderFocus, deltaFocus))?.focus?.(); };
    dialog.querySelector('.cancel').addEventListener('click', close);
    for (const [duration, label] of overrideDurationChoices(t)) {
      const choice = document.createElement('button'); choice.type = 'button'; choice.textContent = label;
      choice.addEventListener('click', async () => {
        const error = dialog.querySelector('.error'); error.textContent = '';
        try {
          const data = manualOverrideServicePayload(this.config.entity, target, duration, step);
          if (!data) { error.textContent = t.overrideError('Invalid target, duration, or step.'); return; }
          await this._hass.callService('climate_flow_scheduler', 'set_manual_override', data);
          close();
        } catch (err) { error.textContent = t.overrideError(errorLabel(t, err)); }
      });
      dialog.querySelector('.choices').append(choice);
    }
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    this.shadowRoot.append(dialog); this._overrideDialogOpen = true; dialog.showModal();
    dialog.querySelector('.choices button')?.focus();
  }
  _flashPillStepButton(delta) {
    clearTimeout(this._pillStepFeedbackTimer);
    this._pillStepFeedbackDelta = Number(delta);
    const buttons = this.shadowRoot?.querySelectorAll('.controls [data-delta]') || [];
    buttons.forEach((button) => button.classList.toggle('step-feedback', Number(button.dataset.delta) === this._pillStepFeedbackDelta));
    this._pillStepFeedbackTimer = setTimeout(() => {
      this._pillStepFeedbackDelta = null;
      this.shadowRoot?.querySelectorAll('.controls [data-delta].step-feedback').forEach((button) => button.classList.remove('step-feedback'));
      this._pillStepFeedbackTimer = null;
    }, 480);
  }
  _bindCardSurfaceFeedback(card) {
    if (!card) return;
    if (this._cardPressFeedback) card.classList.add('card-press-feedback');
    card.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      this._flashCardSurfaceFeedback();
    }, { passive: true });
    card.addEventListener('click', () => this._flashCardSurfaceFeedback(), true);
  }
  _flashCardSurfaceFeedback() {
    clearTimeout(this._cardSurfaceFeedbackTimer);
    this._cardPressFeedback = true;
    this.shadowRoot?.querySelector('ha-card')?.classList.add('card-press-feedback');
    this._cardSurfaceFeedbackTimer = setTimeout(() => {
      this._cardPressFeedback = false;
      this.shadowRoot?.querySelector('ha-card')?.classList.remove('card-press-feedback');
      this._cardSurfaceFeedbackTimer = null;
    }, 260);
  }
  _setTemperature(value, entity, options = {}) {
    // `value` is the scalar the +/- buttons and the arrow keys move. A gesture
    // that edits one bound of a heat_cool range instead passes the explicit
    // `payload`, which is what goes on the wire and into the optimistic state.
    const base=this._displayEntity(this._hass?.states?.[this.config.entity] || entity);
    const payload = options.payload || temperaturePayload(base, value, this.config.step, this._stepOverride);
    const program = this._scheduleProgram();
    if (program?.enabled && this._hass?.services?.climate_flow_scheduler?.set_manual_override) {
      if (payload?.temperature === undefined) { this._showServiceError(this._strings().dualOverrideUnsupported); return; }
      return this._requestManualOverride(payload.temperature, this._stepOverride);
    }
    if (payload) { clearTimeout(this._optimisticTimer); this._optimistic={entityId:this.config.entity,payload}; this._renderPreservingDeltaFocus(); this._optimisticTimer=setTimeout(()=>{this._optimistic=null;this._optimisticTimer=null;this._renderPreservingDeltaFocus();},8000); const seq=this._optimistic;
      // Continuous inputs (slider, drag, held arrows) batch into one call after
      // a short pause; a single button press keeps its immediate call.
      if (options.debounce) { clearTimeout(this._commitTimer); this._commitTimer=setTimeout(()=>{this._commitTimer=null;this._commitTemperature(payload,seq);},COMMIT_DEBOUNCE_MS); return; }
      Promise.resolve().then(()=>this._hass?.callService('climate','set_temperature',{entity_id:this.config.entity,...payload})).catch(()=>{if(this._optimistic===seq){clearTimeout(this._optimisticTimer);this._optimistic=null;this._renderPreservingDeltaFocus();}}); }
  }
  _commitTemperature(payload, seq, attempt = 0) {
    // A batched commit is worth retrying before the optimistic value is given
    // up: the gesture already collapsed several steps into this one call.
    Promise.resolve().then(()=>this._hass?.callService('climate','set_temperature',{entity_id:this.config.entity,...payload})).catch(()=>{
      if (this._optimistic !== seq) return;
      if (attempt < COMMIT_RETRIES) { this._commitTimer=setTimeout(()=>{this._commitTimer=null;this._commitTemperature(payload,seq,attempt+1);},COMMIT_RETRY_MS); return; }
      if(this._optimistic===seq){clearTimeout(this._optimisticTimer);this._optimistic=null;this._renderPreservingDeltaFocus();}
    });
  }
}

export const CLIMATE_FLOW_CARD_TAG = 'climate-flow-card';
export const CLIMATE_FLOW_CARD_EDITOR_TAG = 'climate-flow-card-editor';
// Element defined by the HA frontend app bundle itself. Its presence in the
// *live* registry proves the scoped customElements registry/polyfill has been
// installed, i.e. extra-module race from home-assistant/frontend#53890 is over.
const FRONTEND_READY_TAG = 'home-assistant';
const REREGISTER_POLL_MS = 100;
const REREGISTER_MAX_ATTEMPTS = 300;

const ensureClimateFlowCardList = () => {
  if (!globalThis.window) return;
  const scope = globalThis.window;
  scope.customCards = scope.customCards || [];
  if (!scope.customCards.some((card) => card?.type === CLIMATE_FLOW_CARD_TAG)) scope.customCards.push({ type: CLIMATE_FLOW_CARD_TAG, name: 'Climate Flow Card', description: 'Standalone climate card with a weekly schedule', preview: true, documentationURL: 'https://github.com/kerdx/climate-flow-card', getEntitySuggestion });
};

export const isClimateFlowElementsRegistered = () => {
  try {
    const registry = globalThis.customElements;
    return registry?.get?.(CLIMATE_FLOW_CARD_TAG) === ClimateFlowCard
      && registry?.get?.(CLIMATE_FLOW_CARD_EDITOR_TAG) === ClimateFlowCardEditor
;
  } catch {
    return false;
  }
};

export const registerClimateFlowElements = () => {
  // Keep the original card-picker entry independent of element registration:
  // it must be added idempotently even when customElements/HTMLElement is
  // (temporarily) unavailable.
  ensureClimateFlowCardList();
  // Read the registry afresh on every call: HA replaces window.customElements
  // when the scoped polyfill takes over, so a captured reference could point
  // to the stale native registry where the first define() was lost.
  const registry = globalThis.customElements;
  if (!registry?.define || !registry?.get || !globalThis.HTMLElement) return false;
  for (const [tag, ctor] of [[CLIMATE_FLOW_CARD_TAG, ClimateFlowCard], [CLIMATE_FLOW_CARD_EDITOR_TAG, ClimateFlowCardEditor]]) {
    if (!registry.get(tag)) {
      try {
        registry.define(tag, ctor);
      } catch (error) {
        // Benign only when another copy raced us and the tag is now defined.
        // Any other define() failure (invalid name/constructor) must surface.
        if (!registry.get(tag)) throw error;
      }
    }
  }
  return isClimateFlowElementsRegistered();
};

export const isHomeAssistantFrontendReady = () => {
  try {
    return Boolean(globalThis.customElements?.get?.(FRONTEND_READY_TAG));
  } catch {
    return false;
  }
};

export const scheduleClimateFlowReregistration = ({ intervalMs = REREGISTER_POLL_MS, maxAttempts = REREGISTER_MAX_ATTEMPTS, schedule = (fn, ms) => setTimeout(fn, ms), clear = (timerId) => clearTimeout(timerId), warn = (message) => globalThis.console?.warn?.(message) } = {}) => {
  let attempts = 0;
  let timer = null;
  const cancel = () => {
    if (timer !== null) {
      clear(timer);
      timer = null;
    }
  };
  const giveUp = () => {
    try {
      warn?.(`climate-flow-card: frontend not ready or card missing from the active registry after ${attempts} attempt(s).`);
    } catch {}
  };
  const poll = () => {
    timer = null;
    if (isHomeAssistantFrontendReady()) {
      try {
        registerClimateFlowElements();
      } catch (error) {
        // Deterministic failure path: a real define() error would otherwise
        // escape this timer callback as an uncaught exception, aborting the
        // poll without the bounded exhaustion diagnosis. Surface the error
        // once and stop: retrying a deterministic constructor failure would
        // only spam. The bounded exhaustion warning below stays a single
        // event for the retry-exhausted path.
        try {
          warn?.(`climate-flow-card: failed to register custom elements: ${error?.message || error}`);
        } catch {}
        return;
      }
      // Do not stop just because home-assistant is ready: the scoped swap may
      // still have dropped our tags, so verify both tags map to our ctors.
      if (isClimateFlowElementsRegistered()) return;
    }
    attempts += 1;
    if (attempts >= maxAttempts) {
      giveUp();
      return;
    }
    timer = schedule(poll, intervalMs);
  };
  registerClimateFlowElements();
  if (isHomeAssistantFrontendReady() && isClimateFlowElementsRegistered()) return cancel;
  if (maxAttempts <= 0) {
    giveUp();
    return cancel;
  }
  timer = schedule(poll, intervalMs);
  return cancel;
};

if (globalThis.window && typeof setTimeout === 'function') {
  scheduleClimateFlowReregistration();
} else {
  registerClimateFlowElements();
}
