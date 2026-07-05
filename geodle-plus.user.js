// ==UserScript==
// @name         Geodle+
// @namespace    https://github.com/jagodzinska/geodle_plus
// @version      1.5.0
// @description  Zeigt nach dem Spiel die eigenen Geodle-Versuche samt Zielland-Werten wieder in der Seite an (Kontinent, Bevölkerung, Fläche, Binnenland, Avg Temp, Nachbar).
// @author       jago/claude
// @license      MIT
// @match        https://geotrivia.com/*
// @icon         https://geotrivia.com/favicon.ico
// @homepageURL  https://github.com/jago/geodle-viewer
// @supportURL   https://github.com/jago/geodle-viewer/issues
// @downloadURL  https://raw.githubusercontent.com/jago/geodle-viewer/main/geodle-viewer.user.js
// @updateURL    https://raw.githubusercontent.com/jago/geodle-viewer/main/geodle-viewer.user.js
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
  const compact = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  const fmtTemp = (v) => `${v.toFixed(1)}°C`;
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

  const sv = (path) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" class="shrink-0"><path d="${path}"></path></svg>`;
  const ICON = {
    correct: sv(
      'M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z',
    ),
    wrong: sv(
      'M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z',
    ),
    higher: sv(
      'M216.49,168.49a12,12,0,0,1-17,0L128,97,56.49,168.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0l80,80A12,12,0,0,1,216.49,168.49Z',
    ),
    lower: sv(
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
  const tile = (label, value, fb) => {
    const bgCls =
      fb === 'correct' ? 'bg-success' : fb === 'wrong' ? 'bg-error' : 'bg-card';
    return `<div class="border-2 border-border text-foreground rounded-xl flex flex-col items-center justify-center gap-0.5 p-1.5 min-w-0 transition-colors shadow-neo h-14 sm:h-16 ${bgCls}">
      <span class="font-sans font-bold text-[8px] sm:text-[9px] opacity-50 leading-none mb-0.5 truncate w-full text-center">${label}</span>
      <div class="flex items-center gap-0.5 justify-center w-full min-w-0">
        ${ICON[fb] || ''}<span class="font-sans font-black text-[10px] sm:text-xs text-center leading-none truncate px-0.5">${value}</span>
      </div>
    </div>`;
  };

  const card = (g, i) => `
    <div class="w-full bg-card border-2 border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col gap-2.5 relative shrink-0 shadow-neo">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <img src="${flag(g.countryCode)}" alt="" class="border border-border/20 shrink-0" style="width:40px;height:auto;border-radius:4px;">
          <span class="font-sans font-black text-base sm:text-xl text-foreground leading-none truncate">${name(g.countryCode)}</span>
        </div>
        <span class="font-sans font-black text-muted-foreground/30 text-base sm:text-lg leading-none shrink-0">#${i + 1}</span>
      </div>
      <div class="grid grid-cols-3 gap-1.5">
        ${tile('Kontinent', cont(g.continent.value), g.continent.feedback)}
        ${tile('Binnenland', yesno(g.landlocked.value), g.landlocked.feedback)}
        ${tile('Nachbar', yesno(g.neighbor.value), g.neighbor.feedback)}
        ${tile('Avg Temp', fmtTemp(g.temperature.value), g.temperature.feedback)}
        ${tile('Bevölkerung', compact.format(g.population.value), g.population.feedback)}
        ${tile('Fläche', compact.format(g.landArea.value), g.landArea.feedback)}
      </div>
    </div>`;

  function build(guesses) {
    const sec = document.createElement('section');
    sec.id = VIEW_ID;
    sec.className = 'w-full mx-auto max-w-[27rem] flex flex-col gap-2 my-4'; // symmetrischer Abstand oben/unten
    sec.innerHTML = guesses.map(card).reverse().join(''); // neuester oben, erster unten
    return sec;
  }

  // Storage leer (z. B. anderes Gerät): trotzdem ein Kasten im Länderkasten-Stil,
  // damit erkennbar ist, dass das Skript läuft – nur eben ohne Versuchsdaten.
  // Schrift = identisches Layout wie der Landesname in der Karte.
  function buildEmpty() {
    const sec = document.createElement('section');
    sec.id = VIEW_ID;
    sec.className = 'w-full mx-auto max-w-[27rem] flex flex-col gap-2 my-4';
    sec.innerHTML = `
    <div class="w-full bg-card border-2 border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-center relative shrink-0 shadow-neo">
      <span class="font-sans font-black text-base sm:text-xl text-foreground leading-none truncate">Geodle Storage leer</span>
    </div>`;
    return sec;
  }

  // ---- Mount-Anker: klassenunabhängig über die Ergebnis-Flagge ----
  // Einstieg per data-Attribut (kein Style), Anker = Ziel-Flaggengrafik der
  // Ergebniskarte. Von dort zur Content-Spalte hochsteigen – keine Tailwind-
  // Klassen, robust gegen Theme und vom Werbe-Loader eingeschobene DIVs.
  function mount(sec) {
    const scroll = document.querySelector('[data-allow-wheel="true"]');
    if (!scroll) return false;

    const flag = scroll.querySelector('img[src*="/_next/static/media/"]');
    if (!flag) return false; // Ergebnis (mit Ziel-Flagge) noch nicht da

    // Bis zum Scroll-Container hochsteigen; das letzte Element davor ist die
    // Content-Spalte, das vorletzte die zentrierte Ergebnis-Spalte.
    let node = flag,
      column = flag;
    while (node.parentElement && node.parentElement !== scroll) {
      column = node;
      node = node.parentElement;
    }
    // node = Content-Spalte (Kind von scroll), column = deren Kind mit der Flagge
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
    // mount() greift erst, wenn die Ergebnis-Flagge da ist, also nicht während
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
