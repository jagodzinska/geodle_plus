// ==UserScript==
// @name         Geodle+
// @namespace    https://github.com/jagodzinska/geodle_plus
// @version      1.7.0
// @description  Zeigt nach dem Spiel die eigenen Geodle-Versuche samt Zielland-Werten wieder in der Seite an (Kontinent, Binnenstaat, Nachbar, Ø Temperatur, Bevölkerung, Fläche).
// @author       jago/claude
// @license      MIT
// @match        https://geotrivia.com/*
// @icon         https://geotrivia.com/favicon.ico
// @homepageURL  https://github.com/jagodzinska/geodle_plus
// @supportURL   https://github.com/jagodzinska/geodle_plus/issues
// @downloadURL  https://raw.githubusercontent.com/jagodzinska/geodle_plus/main/geodle-plus.user.js
// @updateURL    https://raw.githubusercontent.com/jagodzinska/geodle_plus/main/geodle-plus.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  if (window.top !== window.self) return; // nicht in Ad-iframes laufen
  const VIEW_ID = 'geodle-viewer-inline';

  // ---- Formatierung / i18n ----------------------------------------
  const dn = (() => {
    try {
      return new Intl.DisplayNames(['de'], { type: 'region' });
    } catch {
      return null;
    }
  })();
  // Deutsche Ländernamen aus den Spieldaten von geotrivia.com
  // (restcountries, translations.deu.common) – identisch zur Anzeige im Spiel.
  // Intl.DisplayNames nur noch als Fallback für unbekannte Codes.
  const countryDE = {
    AD: 'Andorra', AE: 'Vereinigte Arabische Emirate', AF: 'Afghanistan', AG: 'Antigua und Barbuda',
    AI: 'Anguilla', AL: 'Albanien', AM: 'Armenien', AO: 'Angola',
    AQ: 'Antarktis', AR: 'Argentinien', AS: 'Amerikanisch-Samoa', AT: 'Österreich',
    AU: 'Australien', AW: 'Aruba', AX: 'Åland', AZ: 'Aserbaidschan',
    BA: 'Bosnien und Herzegowina', BB: 'Barbados', BD: 'Bangladesch', BE: 'Belgien',
    BF: 'Burkina Faso', BG: 'Bulgarien', BH: 'Bahrain', BI: 'Burundi',
    BJ: 'Benin', BL: 'Saint-Barthélemy', BM: 'Bermuda', BN: 'Brunei',
    BO: 'Bolivien', BQ: 'Karibische Niederlande', BR: 'Brasilien', BS: 'Bahamas',
    BT: 'Bhutan', BV: 'Bouvetinsel', BW: 'Botswana', BY: 'Belarus',
    BZ: 'Belize', CA: 'Kanada', CC: 'Kokosinseln', CD: 'Kongo (Dem. Rep.)',
    CF: 'Zentralafrikanische Republik', CG: 'Kongo', CH: 'Schweiz', CI: 'Elfenbeinküste',
    CK: 'Cookinseln', CL: 'Chile', CM: 'Kamerun', CN: 'China',
    CO: 'Kolumbien', CR: 'Costa Rica', CU: 'Kuba', CV: 'Kap Verde',
    CW: 'Curaçao', CX: 'Weihnachtsinsel', CY: 'Zypern', CZ: 'Tschechien',
    DE: 'Deutschland', DJ: 'Dschibuti', DK: 'Dänemark', DM: 'Dominica',
    DO: 'Dominikanische Republik', DZ: 'Algerien', EC: 'Ecuador', EE: 'Estland',
    EG: 'Ägypten', EH: 'Westsahara', ER: 'Eritrea', ES: 'Spanien',
    ET: 'Äthiopien', FI: 'Finnland', FJ: 'Fidschi', FK: 'Falklandinseln',
    FM: 'Mikronesien', FO: 'Färöer-Inseln', FR: 'Frankreich', GA: 'Gabun',
    GB: 'Vereinigtes Königreich', GD: 'Grenada', GE: 'Georgien', GF: 'Französisch-Guayana',
    GG: 'Guernsey', GH: 'Ghana', GI: 'Gibraltar', GL: 'Grönland',
    GM: 'Gambia', GN: 'Guinea', GP: 'Guadeloupe', GQ: 'Äquatorialguinea',
    GR: 'Griechenland', GS: 'Südgeorgien und die Südlichen Sandwichinseln', GT: 'Guatemala', GU: 'Guam',
    GW: 'Guinea-Bissau', GY: 'Guyana', HK: 'Hongkong', HM: 'Heard und die McDonaldinseln',
    HN: 'Honduras', HR: 'Kroatien', HT: 'Haiti', HU: 'Ungarn',
    ID: 'Indonesien', IE: 'Irland', IL: 'Israel', IM: 'Insel Man',
    IN: 'Indien', IO: 'Britisches Territorium im Indischen Ozean', IQ: 'Irak', IR: 'Iran',
    IS: 'Island', IT: 'Italien', JE: 'Jersey', JM: 'Jamaika',
    JO: 'Jordanien', JP: 'Japan', KE: 'Kenia', KG: 'Kirgisistan',
    KH: 'Kambodscha', KI: 'Kiribati', KM: 'Komoren', KN: 'St. Kitts und Nevis',
    KP: 'Nordkorea', KR: 'Südkorea', KW: 'Kuwait', KY: 'Kaimaninseln',
    KZ: 'Kasachstan', LA: 'Laos', LB: 'Libanon', LC: 'St. Lucia',
    LI: 'Liechtenstein', LK: 'Sri Lanka', LR: 'Liberia', LS: 'Lesotho',
    LT: 'Litauen', LU: 'Luxemburg', LV: 'Lettland', LY: 'Libyen',
    MA: 'Marokko', MC: 'Monaco', MD: 'Moldawien', ME: 'Montenegro',
    MF: 'Saint-Martin', MG: 'Madagaskar', MH: 'Marshallinseln', MK: 'Nordmazedonien',
    ML: 'Mali', MM: 'Myanmar', MN: 'Mongolei', MO: 'Macao',
    MP: 'Nördliche Marianen', MQ: 'Martinique', MR: 'Mauretanien', MS: 'Montserrat',
    MT: 'Malta', MU: 'Mauritius', MV: 'Malediven', MW: 'Malawi',
    MX: 'Mexiko', MY: 'Malaysia', MZ: 'Mosambik', NA: 'Namibia',
    NC: 'Neukaledonien', NE: 'Niger', NF: 'Norfolkinsel', NG: 'Nigeria',
    NI: 'Nicaragua', NL: 'Niederlande', NO: 'Norwegen', NP: 'Nepal',
    NR: 'Nauru', NU: 'Niue', NZ: 'Neuseeland', OM: 'Oman',
    PA: 'Panama', PE: 'Peru', PF: 'Französisch-Polynesien', PG: 'Papua-Neuguinea',
    PH: 'Philippinen', PK: 'Pakistan', PL: 'Polen', PM: 'St. Pierre und Miquelon',
    PN: 'Pitcairninseln', PR: 'Puerto Rico', PS: 'Palästina', PT: 'Portugal',
    PW: 'Palau', PY: 'Paraguay', QA: 'Katar', RE: 'Réunion',
    RO: 'Rumänien', RS: 'Serbien', RU: 'Russland', RW: 'Ruanda',
    SA: 'Saudi-Arabien', SB: 'Salomonen', SC: 'Seychellen', SD: 'Sudan',
    SE: 'Schweden', SG: 'Singapur', SH: 'St. Helena, Ascension und Tristan da Cunha', SI: 'Slowenien',
    SJ: 'Spitzbergen und Jan Mayen', SK: 'Slowakei', SL: 'Sierra Leone', SM: 'San Marino',
    SN: 'Senegal', SO: 'Somalia', SR: 'Suriname', SS: 'Südsudan',
    ST: 'São Tomé und Príncipe', SV: 'El Salvador', SX: 'Sint Maarten', SY: 'Syrien',
    SZ: 'Eswatini', TC: 'Turks-und Caicosinseln', TD: 'Tschad', TF: 'Französische Süd- und Antarktisgebiete',
    TG: 'Togo', TH: 'Thailand', TJ: 'Tadschikistan', TK: 'Tokelau',
    TL: 'Osttimor', TM: 'Turkmenistan', TN: 'Tunesien', TO: 'Tonga',
    TR: 'Türkei', TT: 'Trinidad und Tobago', TV: 'Tuvalu', TW: 'Taiwan',
    TZ: 'Tansania', UA: 'Ukraine', UG: 'Uganda', UM: 'Kleinere Inselbesitzungen der Vereinigten Staaten',
    US: 'Vereinigte Staaten', UY: 'Uruguay', UZ: 'Usbekistan', VA: 'Vatikanstadt',
    VC: 'St. Vincent und die Grenadinen', VE: 'Venezuela', VG: 'Britische Jungferninseln', VI: 'Amerikanische Jungferninseln',
    VN: 'Vietnam', VU: 'Vanuatu', WF: 'Wallis und Futuna', WS: 'Samoa',
    XK: 'Kosovo', YE: 'Jemen', YT: 'Mayotte', ZA: 'Südafrika',
    ZM: 'Sambia', ZW: 'Simbabwe',
  };
  const name = (c) => countryDE[c] || dn?.of(c) || c;
  const flag = (c) => `https://flagcdn.com/${c.toLowerCase()}.svg`;
  // Zahlenformate 1:1 wie die Versuchs-Kacheln im Spiel (GeodleGame):
  // Temperatur mit Punkt, Bevölkerung/Fläche als B/M/K.
  const fmtTemp = (v) => `${v.toFixed(1)}°C`;
  const fmtPop = (n) =>
    n >= 1e9 ? (n / 1e9).toFixed(1) + 'B'
    : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M'
    : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K'
    : String(n);
  const fmtArea = (n) =>
    n >= 1e6 ? (n / 1e6).toFixed(1) + 'M'
    : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K'
    : String(n);
  const yesno = (v) => (v ? 'Ja' : 'Nein');
  const contDE = {
    Europe: 'Europa',
    Asia: 'Asien',
    Africa: 'Afrika',
    Oceania: 'Ozeanien',
    'North America': 'Nordamerika',
    'South America': 'Südamerika',
    Antarctica: 'Antarktis',
  };
  const cont = (v) => contDE[v] || v;

  // Phosphor CaretUp/CaretDown (bold), wie im Spiel nur bei höher/niedriger
  const caret = (path) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 256 256" class="shrink-0"><path d="${path}"></path></svg>`;
  const ICON = {
    higher: caret(
      'M216.49,168.49a12,12,0,0,1-17,0L128,97,56.49,168.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0l80,80A12,12,0,0,1,216.49,168.49Z',
    ),
    lower: caret(
      'M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z',
    ),
  };

  // ---- Spielstand aus localStorage --------------------------------
  function loadState() {
    const cand = [
      'geodle-storage',
      ...Object.keys(localStorage).filter((k) => /geodle/i.test(k)),
    ];
    for (const k of cand) {
      try {
        const o = JSON.parse(localStorage.getItem(k));
        const st = o.state || o;
        if (Array.isArray(st.guesses) && st.guesses.length) return st;
      } catch {}
    }
    return null;
  }

  // ---- Kachel + Card (Geotrivia-Klassen) --------------------------
  // Markup und Klassen 1:1 aus der Versuchsliste des Spiels übernommen.
  // Wichtig: Die Seite liefert nur CSS für Klassen, die sie selbst benutzt –
  // eigene Tailwind-Klassen (z. B. text-[8px]) greifen nicht.
  const tile = (title, label, fb) => {
    const colorCls =
      fb === 'correct' ? 'bg-success border-success text-[#171717]'
      : fb === 'wrong' ? 'bg-error border-error text-[#171717]'
      : 'bg-card border-border text-foreground';
    return `<div class="flex min-w-0 flex-col items-center justify-center rounded-[11px] border px-1.5 py-1 text-center h-[58px] ${colorCls}">
      <span class="mb-[3px] w-full truncate font-sans font-bold text-[9.5px] leading-[13px]">${title}</span>
      <div class="flex w-full min-w-0 items-center justify-center gap-[3px]">
        <span class="line-clamp-2 min-w-0 break-words font-sans font-bold text-[11.5px] leading-4">${label}</span>${ICON[fb] || ''}
      </div>
    </div>`;
  };

  const card = (g, i) => `
    <div class="w-full rounded-[18px] border border-border bg-card p-3.5">
      <div class="mb-3 flex items-center gap-2.5">
        <div class="game-flag-frame box-border shrink-0 overflow-hidden rounded border border-border bg-card h-7">
          <img src="${flag(g.countryCode)}" alt="${g.countryCode}" class="h-full" style="width:auto;display:block;">
        </div>
        <span class="min-w-0 flex-1 truncate font-sans font-bold text-foreground text-[15.75px] leading-[24.5px]">${name(g.countryCode)}</span>
        <div class="ml-auto min-w-[34px] text-right font-sans font-bold text-muted-foreground text-sm">#${i + 1}</div>
      </div>
      <div class="grid grid-cols-3 gap-x-1.5 gap-y-2">
        ${tile('Kontinent', cont(g.continent.value), g.continent.feedback)}
        ${tile('Binnenstaat', yesno(g.landlocked.value), g.landlocked.feedback)}
        ${tile('Nachbar', yesno(g.neighbor.value), g.neighbor.feedback)}
        ${tile('Ø Temperatur', fmtTemp(g.temperature.value), g.temperature.feedback)}
        ${tile('Bevölkerung', fmtPop(g.population.value), g.population.feedback)}
        ${tile('Fläche', fmtArea(g.landArea.value), g.landArea.feedback)}
      </div>
    </div>`;

  function section() {
    const sec = document.createElement('section');
    sec.id = VIEW_ID;
    sec.className = 'w-full mx-auto max-w-[27rem] flex flex-col gap-3.5';
    sec.style.margin = '1rem auto'; // my-4 gibt es im Seiten-CSS nicht
    return sec;
  }

  function build(guesses) {
    const sec = section();
    sec.innerHTML = guesses.map(card).reverse().join(''); // neuester oben, erster unten
    return sec;
  }

  // Storage leer (z. B. anderes Gerät): trotzdem ein Kasten im Karten-Stil,
  // damit erkennbar ist, dass das Skript läuft – nur eben ohne Versuchsdaten.
  function buildEmpty() {
    const sec = section();
    sec.innerHTML = `
    <div class="w-full rounded-[18px] border border-border bg-card p-3.5 flex items-center justify-center">
      <span class="truncate font-sans font-bold text-foreground text-[15.75px] leading-[24.5px]">Geodle Storage leer</span>
    </div>`;
    return sec;
  }

  // ---- Mount-Anker: gemeinsamer Ergebnis-Screen der Daily-Spiele ----
  // Seit dem Umbau (Sept. 2026) rendert Geotrivia das Spielende in
  // `.daily-result-screen`: fixe Viewport-Höhe, darin ein scrollender Bereich
  // (overflow-y: auto) mit der zentrierten Ergebnis-Spalte (Werte, Flagge,
  // „Länderfakten“, „Tippen zum Fortfahren“). Den Block hängen wir unten an
  // diese Spalte. Den Scrollbereich finden wir über den berechneten Style
  // statt über Tailwind-Klassen.
  function mount(sec) {
    const screen = document.querySelector('.daily-result-screen');
    if (!screen) return false; // Spiel läuft noch / Ergebnis noch nicht da

    const scroll = [...screen.children].find(
      (el) => getComputedStyle(el).overflowY === 'auto',
    );
    const column = scroll?.firstElementChild;
    if (!column) return false;

    // Die Seite blockiert auf dem Desktop das Mausrad außerhalb von
    // [data-allow-wheel] – ohne das Attribut wäre der Block nur per
    // Scrollbalken erreichbar.
    scroll.setAttribute('data-allow-wheel', 'true');
    column.appendChild(sec);
    return true;
  }

  // ---- Render-Entscheidung ----------------------------------------
  let mounts = 0; // erfolgreiche Einhängungen seit letztem (Re-)Start
  function render() {
    const onGeodle = /geodle/.test(location.pathname);
    const existing = document.getElementById(VIEW_ID);
    if (!onGeodle) {
      existing?.remove();
      return;
    }

    const s = loadState();
    // Spiel läuft noch (Storage vorhanden, aber nicht beendet) → kein Block
    if (s && !s.gameOver) {
      existing?.remove();
      return;
    }
    if (existing) return; // schon da → nichts tun

    // Storage vorhanden+beendet → Versuche; Storage leer → Hinweis-Kasten.
    // mount() greift erst, wenn der Ergebnis-Screen da ist, also nicht während
    // des Spiels (auch nicht bei leerem Storage).
    const sec = s ? build(s.guesses) : buildEmpty();
    if (mount(sec)) mounts++; // findet kein Mount? Observer versucht es erneut
  }

  // ---- Observer + Polling + SPA-Routing ---------------------------
  // Observer + Intervall laufen nur, bis der Block stabil in der Seite hängt;
  // danach ist komplett Ruhe. Der frühere Dauer-Zyklus (React wirft den Block
  // raus, Intervall hängt ihn wieder ein) hat auf manchen Rechnern sichtbar
  // geflackert. SPA-Navigation (History-Hook unten) startet die Beobachtung neu.
  let t;
  const schedule = () => {
    clearTimeout(t);
    t = setTimeout(render, 150);
  };

  const observer = new MutationObserver(schedule);
  let iv = null;
  let stableSince = 0;

  function stopWatching() {
    observer.disconnect();
    clearTimeout(t);
    if (iv) {
      clearInterval(iv);
      iv = null;
    }
  }

  function startWatching() {
    stableSince = 0;
    mounts = 0;
    observer.observe(document.body, { childList: true, subtree: true });
    if (!iv) iv = setInterval(tick, 500);
    schedule();
  }

  function tick() {
    if (!/geodle/.test(location.pathname)) {
      stopWatching();
      return;
    }
    render();
    const el = document.getElementById(VIEW_ID);
    if (el?.isConnected) {
      if (!stableSince) stableSince = Date.now();
      // 3 s unangetastet → fertig. Wirft die App den Block trotzdem immer
      // wieder raus (≥ 5 Re-Mounts), ebenfalls aufhören statt endlos zu blinken.
      if (Date.now() - stableSince >= 3000 || mounts >= 5) stopWatching();
    } else {
      stableSince = 0;
      if (mounts >= 5) stopWatching();
    }
  }

  window.addEventListener('load', startWatching);
  document.addEventListener('DOMContentLoaded', startWatching);
  window.addEventListener('beforeunload', stopWatching);

  (function hookHistory() {
    const fire = () => window.dispatchEvent(new Event('geodle:locationchange'));
    for (const m of ['pushState', 'replaceState']) {
      const orig = history[m];
      history[m] = function () {
        const r = orig.apply(this, arguments);
        fire();
        return r;
      };
    }
    window.addEventListener('popstate', fire);
    window.addEventListener('geodle:locationchange', startWatching);
  })();

  startWatching();
})();
