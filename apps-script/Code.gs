/**
 * Tantu Kala — order recorder (Google Apps Script Web App)
 * Receives an order from the website, appends a row to a Google Sheet,
 * and emails the team. Free. See apps-script/README.md for deploy steps.
 */

// The email address(es) to notify on each order (comma-separated).
var NOTIFY_EMAIL = 'suhasjaybhaye.sj@gmail.com';

// Your deployed site URL (e.g. https://tantukala.pages.dev). Used to fetch the
// authoritative price list (/pricing.json) and re-verify the order total
// server-side, so a tampered cart/coupon is flagged. Leave '' to skip verification.
var SITE_URL = '';

function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);
    // Honeypot: a filled "company" field means a bot — accept silently, don't record.
    if (order.company) return json({ ok: true });
    var problem = validateOrder(order);
    if (problem) return json({ ok: false, error: problem });
    var expected = expectedTotal_(order); // server-verified total (null if unavailable)
    appendToSheet(order, expected);
    sendEmail(order, expected);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Server-side validation so junk/bot POSTs never hit the sheet or inbox. */
function validateOrder(o) {
  if (!o || typeof o !== 'object') return 'bad payload';
  if (!o.items || !o.items.length) return 'no items';
  if (!(Number(o.subtotal) > 0)) return 'bad subtotal';
  var c = o.customer || {};
  if (!/^[A-Za-z][A-Za-z .]{1,39}$/.test(String(c.name || ''))) return 'bad name';
  var phone = String(c.phone || '').replace(/\D/g, '');
  if (phone.length === 12 && phone.indexOf('91') === 0) phone = phone.slice(2);
  if (!/^[6-9]\d{9}$/.test(phone)) return 'bad phone';
  if (!/^[1-9]\d{5}$/.test(String(c.pincode || ''))) return 'bad pincode';
  if (String(c.address || '').length < 10) return 'bad address';
  return '';
}

function doGet() {
  return json({ ok: true, service: 'tantu-kala-order-recorder' });
}

function appendToSheet(order, expected) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Orders');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Order Ref', 'Items', 'Item Count', 'Subtotal (INR)', 'Coupon',
      'To Pay (client)', 'Verified Total', 'Match?',
      'Name', 'Phone', 'Address', 'Pincode', 'Note', 'Status'
    ]);
  }

  var itemsStr = (order.items || []).map(function (i) {
    return i.qty + 'x ' + i.name + ' @' + i.price;
  }).join('\n');

  var c = order.customer || {};
  var coupon = order.coupon ? (order.coupon.percentOff + '% (-' + order.coupon.discount + ')') : '';
  var match = expected == null ? 'n/a' : (Number(expected) === Number(order.payable) ? 'YES' : 'MISMATCH');

  sheet.appendRow([
    order.createdAt || new Date().toISOString(),
    order.ref || '',
    itemsStr,
    order.itemCount || '',
    order.subtotal || '',
    coupon,
    order.payable || '',
    expected == null ? '' : expected,
    match,
    c.name || '', c.phone || '', c.address || '', c.pincode || '', c.note || '',
    'NEW'
  ]);
}

function sendEmail(order, expected) {
  if (!NOTIFY_EMAIL) return;
  var c = order.customer || {};
  var items = (order.items || []).map(function (i) {
    return '  ' + i.qty + 'x ' + i.name + '  @Rs.' + i.price;
  }).join('\n');

  var warn = '';
  if (expected != null && Number(expected) !== Number(order.payable)) {
    warn = '\n*** AMOUNT MISMATCH: browser said Rs.' + order.payable +
           ' but server-verified total is Rs.' + expected +
           '. Do NOT ship until you confirm the correct amount. ***\n';
  }

  var body =
    'New Tantu Kala order  #' + order.ref + '\n' +
    '--------------------------------\n' +
    items + '\n' +
    '--------------------------------\n' +
    'Subtotal: Rs.' + order.subtotal + '\n' +
    (order.coupon ? 'Coupon: ' + order.coupon.percentOff + '% off (-Rs.' + order.coupon.discount + ')\n' : '') +
    'Shipping: ' + (order.shipping ? 'Rs.' + order.shipping : 'Free') + '\n' +
    'To pay (browser): Rs.' + order.payable + '\n' +
    (expected != null ? 'Verified total (server): Rs.' + expected + '\n' : '') +
    warn +
    '\nName: ' + c.name + '\n' +
    'Phone: ' + c.phone + '\n' +
    'Address: ' + c.address + '\n' +
    'Pincode: ' + c.pincode + '\n' +
    (c.note ? 'Note: ' + c.note + '\n' : '') +
    '\nVerify the UPI payment (amount + ref #' + order.ref + ') before dispatch.';

  MailApp.sendEmail(NOTIFY_EMAIL, 'New order #' + order.ref + ' — ' + (c.name || ''), body);
}

/** Fetch the authoritative price/coupon feed from the deployed site. */
function fetchPricing_() {
  if (!SITE_URL) return null;
  try {
    var url = SITE_URL.replace(/\/$/, '') + '/pricing.json';
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    return JSON.parse(resp.getContentText());
  } catch (e) {
    return null;
  }
}

/**
 * Re-derive the payable total from slug + qty using the AUTHORITATIVE price list,
 * ignoring the prices/coupon the browser sent. This is what catches tampering.
 */
function expectedTotal_(order) {
  var cfg = fetchPricing_();
  if (!cfg || !cfg.products) return null;

  var priceMap = {};
  cfg.products.forEach(function (p) { priceMap[p.slug] = p; });

  var sub = 0;
  (order.items || []).forEach(function (i) {
    var p = priceMap[i.slug];
    if (!p) return;
    var unit = p.discountPercent > 0 ? Math.ceil(p.price * (1 - p.discountPercent / 100)) : p.price;
    sub += unit * (Number(i.qty) || 0);
  });

  var best = null;
  var tiers = (cfg.coupons && cfg.coupons.autoOrderValue) || [];
  tiers.forEach(function (t) {
    if (sub >= t.minSubtotal && (!best || t.minSubtotal > best.minSubtotal)) best = t;
  });
  var goods = best ? Math.ceil(sub * (1 - best.percentOff / 100)) : sub;

  var ship = 0;
  var s = cfg.shipping || {};
  ship = (s.freeAbove && sub >= s.freeAbove) ? 0 : (s.flat || 0);

  return goods + ship;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
