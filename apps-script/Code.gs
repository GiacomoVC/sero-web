/**
 * Sero — Google Apps Script webhook.
 *
 * Setup (10 minutes):
 *   1. Create a Google Sheet. Name it "Sero Quiz Responses".
 *   2. In the menu: Extensions → Apps Script.
 *   3. Replace Code.gs with the contents of THIS file.
 *   4. Optional: set a shared secret in the script properties
 *        (Project Settings → Script Properties → Add):
 *          key:   WEBHOOK_SECRET
 *          value: <any long random string>
 *      and set the same value as WEBHOOK_SECRET in your Vercel env.
 *   5. Click Deploy → New deployment → Type: Web app.
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Click Deploy. Authorize. Copy the Web app URL.
 *   6. Paste the URL into your Vercel env as APPS_SCRIPT_URL.
 *
 * IMPORTANT after updating this file: you must create a NEW deployment
 * (not edit existing) in Apps Script for changes to take effect.
 * Also clear row 1 of the "responses" sheet so headers are recreated.
 */

const SHEET_NAME = 'responses';

const COLUMNS = [
  'timestamp', 'slug', 'referredBy',
  'firstName', 'lastName', 'age', 'whatsapp',
  'selectedWorlds', 'otrosMundos',
  // Música
  'musica.categories', 'musica.eras', 'musica.topArtists',
  // Series
  'series.categories', 'series.seriesOtro', 'series.region', 'series.netflixPick',
  // Películas
  'peliculas.categories', 'peliculas.tipo', 'peliculas.favorites',
  // Anime
  'anime.categories', 'anime.preference', 'anime.favorites', 'anime.current',
  // Libros
  'libros.categories', 'libros.topBooks', 'libros.recent',
  // Deportes
  'deportes.selected', 'deportes.otros',
  // Videojuegos
  'videojuegos.categories', 'videojuegos.favorites',
  // Cierre
  'diningStyle', 'dietary', 'dietaryNote', 'expPreference',
  'rawJson',
];

// Fields that arrive as arrays — joined with ", " for human reading in the sheet.
const ARRAY_FIELDS = {
  'selectedWorlds':       true,
  'musica.categories':    true,
  'musica.eras':          true,
  'series.categories':    true,
  'series.region':        true,
  'series.netflixPick':   true,
  'peliculas.categories': true,
  'peliculas.tipo':       true,
  'anime.categories':     true,
  'libros.categories':    true,
  'videojuegos.categories': true,
  'deportes.selected':    true,
};

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function resolveSlug_(sh, desired) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return desired;
  const slugColIdx = COLUMNS.indexOf('slug') + 1;
  const range = sh.getRange(2, slugColIdx, lastRow - 1, 1).getValues();
  const taken = {};
  range.forEach((r) => {
    if (r[0]) taken[String(r[0]).toLowerCase()] = true;
  });
  if (!taken[desired.toLowerCase()]) return desired;
  let i = 2;
  while (taken[`${desired}-${i}`.toLowerCase()]) i++;
  return `${desired}-${i}`;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (expected && body.secret !== expected) {
      return _json({ error: 'unauthorized' }, 401);
    }
    const payload = body.payload || {};
    const desired = String(body.desiredSlug || '').trim() || 'sero';

    const sh = getSheet_();
    const slug = resolveSlug_(sh, desired);

    const row = COLUMNS.map((col) => {
      if (col === 'timestamp') return new Date();
      if (col === 'slug')      return slug;
      if (col === 'rawJson')   return JSON.stringify(payload);

      let val;
      if (col.indexOf('.') > -1) {
        const [a, b] = col.split('.');
        val = payload[a] && payload[a][b];
      } else {
        val = payload[col];
      }

      if (ARRAY_FIELDS[col]) return (val || []).join(', ');
      return val != null ? val : '';
    });
    sh.appendRow(row);

    return _json({ slug: slug });
  } catch (err) {
    return _json({ error: String(err) }, 500);
  }
}

function doGet() {
  return _json({ ok: true, service: 'sero-quiz-webhook' });
}

function _json(obj) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
