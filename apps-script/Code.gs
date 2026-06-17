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
const FRIENDSHIPS_SHEET_NAME = 'friendships';
const FRIENDSHIP_COLUMNS = ['timestamp', 'fromSlug', 'fromName', 'toSlug', 'toName', 'mutualFriend', 'commonCount'];

// Column order MUST match the live `responses` sheet exactly — doPost appends
// rows positionally and the export reads by COLUMNS.indexOf(...). 42 columns.
const COLUMNS = [
  'timestamp', 'slug', 'referredBy',
  'firstName', 'lastName', 'city', 'age', 'whatsapp',
  'selectedWorlds', 'otrosMundos',
  // Música
  'musica.categories', 'musica.picks', 'musica.eras', 'musica.topArtists',
  // Series
  'series.categories', 'series.picks', 'series.seriesOtro', 'series.region', 'series.netflixPick',
  // Películas
  'peliculas.categories', 'peliculas.picks', 'peliculas.tipo', 'peliculas.favorites',
  // Anime
  'anime.categories', 'anime.picks', 'anime.preference', 'anime.favorites', 'anime.current',
  // Libros
  'libros.categories', 'libros.picks', 'libros.topBooks', 'libros.recent',
  // Deportes
  'deportes.selected', 'deportes.otros',
  // Videojuegos
  'videojuegos.categories', 'videojuegos.picks', 'videojuegos.favorites',
  // Cierre
  'diningStyle', 'dietary', 'dietaryNote', 'expPreference',
  'rawJson',
];

// Fields that arrive as arrays — joined with ", " for human reading in the sheet.
const ARRAY_FIELDS = {
  'selectedWorlds':       true,
  'musica.categories':    true,
  'musica.picks':         true,
  'musica.eras':          true,
  'series.categories':    true,
  'series.picks':         true,
  'series.region':        true,
  'peliculas.categories': true,
  'peliculas.picks':      true,
  'peliculas.tipo':       true,
  'anime.categories':     true,
  'anime.picks':          true,
  'libros.categories':    true,
  'libros.picks':         true,
  'videojuegos.categories': true,
  'videojuegos.picks':    true,
  'deportes.selected':    true,
};

function getSpreadsheet_() {
  // Works when the script is bound to the sheet (Extensions → Apps Script).
  const bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;
  // Standalone script: requires SPREADSHEET_ID in Script Properties.
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error(
    'Script is not bound to a spreadsheet. Either open the sheet → Extensions → Apps Script, ' +
    'OR add SPREADSHEET_ID to Script Properties.'
  );
  return SpreadsheetApp.openById(id);
}

function getFriendshipsSheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(FRIENDSHIPS_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(FRIENDSHIPS_SHEET_NAME);
    sh.appendRow(FRIENDSHIP_COLUMNS);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(FRIENDSHIP_COLUMNS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function getSheet_() {
  const ss = getSpreadsheet_();
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

/**
 * After inserting a new user, scan the sheet for potential friend matches.
 * Priority: the user's referrer and people referred by the same person.
 * Ranked by shared selectedWorlds count.
 */
function findMatches_(sh, newSlug, referredBy, newWorldsArr) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  const slugIdx       = COLUMNS.indexOf('slug');
  const firstNameIdx  = COLUMNS.indexOf('firstName');
  const lastNameIdx   = COLUMNS.indexOf('lastName');
  const referredByIdx = COLUMNS.indexOf('referredBy');
  const worldsIdx     = COLUMNS.indexOf('selectedWorlds');

  const data = sh.getRange(2, 1, lastRow - 1, COLUMNS.length).getValues();
  const newWorldsSet = new Set(newWorldsArr || []);

  // Look up the referrer's first name to show "Amigo en común: [name]"
  var referrerFirstName = '';
  if (referredBy) {
    for (var r = 0; r < data.length; r++) {
      if (String(data[r][slugIdx] || '').trim() === referredBy) {
        referrerFirstName = String(data[r][firstNameIdx] || '').trim();
        break;
      }
    }
  }

  const candidates = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowSlug = String(row[slugIdx] || '').trim();
    if (!rowSlug || rowSlug === newSlug) continue;

    const rowFirstName  = String(row[firstNameIdx] || '').trim();
    const rowLastName   = String(row[lastNameIdx] || '').trim();
    const rowReferredBy = String(row[referredByIdx] || '').trim();
    const rowWorldsStr  = String(row[worldsIdx] || '');
    const rowWorlds     = rowWorldsStr ? rowWorldsStr.split(', ').filter(Boolean) : [];

    const commonCount  = rowWorlds.filter(function(w) { return newWorldsSet.has(w); }).length;
    const isReferrer   = rowSlug === referredBy;
    const isCoReferral = !!(referredBy && rowReferredBy === referredBy);
    const isPriority   = isReferrer || isCoReferral;

    if (!isPriority && commonCount === 0) continue;

    // Co-referrals share a mutual friend (the referrer).
    // The referrer themselves directly invited you — no "en común" label needed.
    const mutualFriend = isCoReferral && !isReferrer ? referrerFirstName : '';

    candidates.push({
      slug: rowSlug,
      name: rowFirstName + (rowLastName ? ' ' + rowLastName : ''),
      commonCount: commonCount,
      mutualFriend: mutualFriend,
      priority: isPriority ? 1 : 0,
    });
  }

  candidates.sort(function(a, b) {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.commonCount - a.commonCount;
  });

  return candidates
    .map(function(c) { return { slug: c.slug, name: c.name, commonCount: c.commonCount, mutualFriend: c.mutualFriend }; });
}

function confirmFriend_(body) {
  const sh = getFriendshipsSheet_();

  // Look up the confirmer's full name from responses sheet
  var fromName = '';
  try {
    var rsh = getSheet_();
    var lastRow = rsh.getLastRow();
    if (lastRow >= 2) {
      var slugIdx   = COLUMNS.indexOf('slug');
      var fnIdx     = COLUMNS.indexOf('firstName');
      var lnIdx     = COLUMNS.indexOf('lastName');
      var data      = rsh.getRange(2, 1, lastRow - 1, COLUMNS.length).getValues();
      for (var i = 0; i < data.length; i++) {
        if (String(data[i][slugIdx] || '').trim() === body.fromSlug) {
          fromName = String(data[i][fnIdx] || '').trim();
          var ln = String(data[i][lnIdx] || '').trim();
          if (ln) fromName += ' ' + ln;
          break;
        }
      }
    }
  } catch(e) { console.error('confirmFriend_: lookup error', String(e)); }

  sh.appendRow([
    new Date(),
    body.fromSlug   || '',
    fromName,
    body.toSlug     || '',
    body.toName     || '',
    body.mutualFriend || '',
    body.commonCount  || 0,
  ]);

  return _json({ ok: true });
}

function doPost(e) {
  try {
    console.log('doPost: START');

    const body = JSON.parse(e.postData.contents || '{}');

    if (body.action === 'confirmFriend') {
      const expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
      if (expected && body.secret !== expected) return _json({ error: 'unauthorized' });
      return confirmFriend_(body);
    }

    console.log('doPost: desiredSlug =', body.desiredSlug);

    const expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (expected && body.secret !== expected) {
      console.log('doPost: UNAUTHORIZED — secret mismatch');
      return _json({ error: 'unauthorized' });
    }

    const payload = body.payload || {};
    const desired = String(body.desiredSlug || '').trim() || 'sero';

    console.log('doPost: getting sheet...');
    const sh = getSheet_();
    console.log('doPost: sheet name =', sh.getName(), '| rows =', sh.getLastRow());

    const slug = resolveSlug_(sh, desired);
    console.log('doPost: resolved slug =', slug);

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
    console.log('doPost: row appended OK — slug:', slug);

    const newWorldsArr = (payload.selectedWorlds || []);
    const matches = findMatches_(sh, slug, payload.referredBy || '', newWorldsArr);
    console.log('doPost: matches found =', matches.length);

    return _json({ slug: slug, matches: matches });
  } catch (err) {
    console.error('doPost: ERROR —', String(err));
    return _json({ error: String(err) });
  }
}

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'export') {
    var expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (expected && (e.parameter.secret || '') !== expected) {
      return _json({ error: 'unauthorized' });
    }
    return _json(exportData_());
  }
  return _json({ ok: true, service: 'sero-quiz-webhook' });
}

/**
 * Full dump for the matching engine: every response (with its original quiz
 * JSON parsed from rawJson) plus every confirmed friendship.
 */
function exportData_() {
  var responses = [];
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last >= 2) {
    var slugIdx = COLUMNS.indexOf('slug');
    var fnIdx   = COLUMNS.indexOf('firstName');
    var lnIdx   = COLUMNS.indexOf('lastName');
    var refIdx  = COLUMNS.indexOf('referredBy');
    var rawIdx  = COLUMNS.indexOf('rawJson');
    var data = sh.getRange(2, 1, last - 1, COLUMNS.length).getValues();
    for (var i = 0; i < data.length; i++) {
      var payload = {};
      try { payload = data[i][rawIdx] ? JSON.parse(data[i][rawIdx]) : {}; } catch (_e) {}
      responses.push({
        slug:       String(data[i][slugIdx] || ''),
        firstName:  String(data[i][fnIdx] || ''),
        lastName:   String(data[i][lnIdx] || ''),
        referredBy: String(data[i][refIdx] || ''),
        payload:    payload,
      });
    }
  }

  var friendships = [];
  var fsh = getFriendshipsSheet_();
  var fl = fsh.getLastRow();
  if (fl >= 2) {
    var fFrom = FRIENDSHIP_COLUMNS.indexOf('fromSlug');
    var fTo   = FRIENDSHIP_COLUMNS.indexOf('toSlug');
    var fdata = fsh.getRange(2, 1, fl - 1, FRIENDSHIP_COLUMNS.length).getValues();
    for (var j = 0; j < fdata.length; j++) {
      friendships.push({
        fromSlug: String(fdata[j][fFrom] || ''),
        toSlug:   String(fdata[j][fTo] || ''),
      });
    }
  }

  return { responses: responses, friendships: friendships };
}

function _json(obj) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
