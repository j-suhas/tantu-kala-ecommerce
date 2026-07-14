/**
 * Tantu Kala — order recorder (Google Apps Script Web App)
 * Receives an order from the website, appends a row to a Google Sheet,
 * and emails the team. Free. See apps-script/README.md for deploy steps.
 */

// The email address(es) to notify on each order (comma-separated).
var NOTIFY_EMAIL = 'suhasjaybhaye.sj@gmail.com';

function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);
    appendToSheet(order);
    sendEmail(order);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'tantu-kala-order-recorder' });
}

function appendToSheet(order) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Orders');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Order Ref', 'Items', 'Item Count', 'Subtotal (INR)',
      'Name', 'Phone', 'Address', 'Pincode', 'Note', 'Status'
    ]);
  }

  var itemsStr = (order.items || []).map(function (i) {
    return i.qty + 'x ' + i.name + ' @' + i.price;
  }).join('\n');

  var c = order.customer || {};
  sheet.appendRow([
    order.createdAt || new Date().toISOString(),
    order.ref || '',
    itemsStr,
    order.itemCount || '',
    order.subtotal || '',
    c.name || '', c.phone || '', c.address || '', c.pincode || '', c.note || '',
    'NEW'
  ]);
}

function sendEmail(order) {
  if (!NOTIFY_EMAIL) return;
  var c = order.customer || {};
  var items = (order.items || []).map(function (i) {
    return '  ' + i.qty + 'x ' + i.name + '  @Rs.' + i.price;
  }).join('\n');

  var body =
    'New Tantu Kala order  #' + order.ref + '\n' +
    '--------------------------------\n' +
    items + '\n' +
    '--------------------------------\n' +
    'Items: ' + order.itemCount + '   Subtotal: Rs.' + order.subtotal + '\n\n' +
    'Name: ' + c.name + '\n' +
    'Phone: ' + c.phone + '\n' +
    'Address: ' + c.address + '\n' +
    'Pincode: ' + c.pincode + '\n' +
    (c.note ? 'Note: ' + c.note + '\n' : '') +
    '\nVerify the UPI payment against #' + order.ref + ' before dispatch.';

  MailApp.sendEmail(NOTIFY_EMAIL, 'New order #' + order.ref + ' — ' + (c.name || ''), body);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
