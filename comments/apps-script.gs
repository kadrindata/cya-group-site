/**
 * cyagroup.org comments
 *
 * A standalone Apps Script project ("cyagroup.org Comments API") that reads and
 * writes the "cyagroup.org Comments" Google Sheet. Deployed as a web app
 * (Execute as: Me, Who has access: Anyone).
 *
 *   GET  /exec            → visible comments as JSON
 *   POST /exec            → adds a comment (fields: session, name, comment)
 *
 * Sheet columns: Timestamp | Session | Name | Comment | Hide
 * To take a comment down, delete its row, or type anything in its Hide cell.
 */

var SPREADSHEET_ID = '1olxbg4jUibeBFGiJhc7cYGwAfg1G1RCrxTEIOxd2BKI';
var SHEET_NAME = 'Comments';
var SESSIONS = 6;
var MAX_NAME = 60;
var MAX_COMMENT = 1500;

function sheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(value, max) {
  var s = String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
  return s.slice(0, max);
}

// Stop text like "=IMPORTXML(...)" from being treated as a formula
function safeCell_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doGet() {
  var sh = sheet_();
  var last = sh.getLastRow();
  var out = [];
  if (last > 1) {
    var rows = sh.getRange(2, 1, last - 1, 5).getValues();
    rows.forEach(function (r) {
      if (String(r[4]).trim()) return;            // hidden
      if (!r[2] || !r[3]) return;                  // incomplete
      out.push({
        time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
        session: Number(r[1]),
        name: String(r[2]),
        comment: String(r[3])
      });
    });
  }
  return json_({ ok: true, comments: out });
}

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Hidden field real people never fill in; bots usually do
  if (p.website) return json_({ ok: true });

  var session = parseInt(p.session, 10);
  var name = clean_(p.name, MAX_NAME);
  var comment = clean_(p.comment, MAX_COMMENT);

  if (!(session >= 1 && session <= SESSIONS)) return json_({ ok: false, error: 'Unknown session.' });
  if (!name) return json_({ ok: false, error: 'Please add your name.' });
  if (!comment) return json_({ ok: false, error: 'Please write a comment.' });

  // Ignore the same comment sent twice in a row (double taps, resubmits)
  var cache = CacheService.getScriptCache();
  var key = Utilities.base64Encode(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_1, session + '|' + name + '|' + comment, Utilities.Charset.UTF_8));
  if (cache.get(key)) return json_({ ok: true, duplicate: true });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(), session, safeCell_(name), safeCell_(comment), '']);
  } finally {
    lock.releaseLock();
  }
  cache.put(key, '1', 600);
  return json_({ ok: true });
}
