/**
 * Tantu Kala — order recorder (Google Apps Script Web App)
 * Receives an order from the website, appends a row to a Google Sheet,
 * and emails the team. Free. See apps-script/README.md for deploy steps.
 */

// Per-deployment config lives in Script Properties (Project Settings -> Script
// Properties), so the SAME code runs in the prod and local-test Web Apps with no
// diffs. The literals below are the PROD defaults, used when a property is unset.
//   Prod project : leave properties empty (uses defaults below).
//   Test project : set NOTIFY_EMAIL to your inbox, and SITE_URL to '' (Google
//                  cannot reach http://localhost, so price-verify is skipped).
var PROPS_ = PropertiesService.getScriptProperties();

// The email address(es) to notify on each order (comma-separated).
var NOTIFY_EMAIL =
  PROPS_.getProperty("NOTIFY_EMAIL") || "tantu.kala@gmail.com, sushama.jaybhaye@gmail.com";

// Deployed site URL. Used to fetch the authoritative price list (/pricing.json)
// and re-verify the order total server-side. Set to '' (in Script Properties) to
// skip verification — e.g. in the test project, where localhost is unreachable.
var SITE_URL =
  PROPS_.getProperty("SITE_URL") != null
    ? PROPS_.getProperty("SITE_URL")
    : "https://tantukala.embox.in";

function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);
    // "I've paid" ping from the pay screen — flip the existing row to CLAIMED PAID.
    if (order.action === "claim-paid") return markClaimed_(order.ref);
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
  if (!o || typeof o !== "object") return "bad payload";
  if (!o.items || !o.items.length) return "no items";
  if (!(Number(o.subtotal) > 0)) return "bad subtotal";
  var c = o.customer || {};
  // Any letter (Unicode) + space/dot/apostrophe/hyphen; blocks digits/@/<> junk.
  // Mirror of NAME_RE in src/scripts/checkout.ts — keep in sync.
  if (!/^[\p{L}][\p{L}\s.'-]{1,49}$/u.test(String(c.name || "")))
    return "bad name";
  var phone = String(c.phone || "").replace(/\D/g, "");
  if (phone.length === 12 && phone.indexOf("91") === 0) phone = phone.slice(2);
  if (!/^[6-9]\d{9}$/.test(phone)) return "bad phone";
  if (!/^[1-9]\d{5}$/.test(String(c.pincode || ""))) return "bad pincode";
  if (String(c.address || "").length < 10) return "bad address";
  return "";
}

function doGet() {
  return json({ ok: true, service: "tantu-kala-order-recorder" });
}

function appendToSheet(order, expected) {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders") ||
    SpreadsheetApp.getActiveSpreadsheet().insertSheet("Orders");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Order Ref",
      "Items",
      "Item Count",
      "Subtotal (INR)",
      "Coupon",
      "To Pay (client)",
      "Verified Total",
      "Match?",
      "Name",
      "Phone",
      "Address",
      "Pincode",
      "Note",
      "Status",
    ]);
  }

  var itemsStr = (order.items || [])
    .map(function (i) {
      return i.qty + "x " + i.name + " @" + i.price;
    })
    .join("\n");

  var c = order.customer || {};
  var coupon = order.coupon
    ? order.coupon.percentOff + "% (-" + order.coupon.discount + ")"
    : "";
  var match =
    expected == null
      ? "n/a"
      : Number(expected) === Number(order.payable)
        ? "YES"
        : "MISMATCH";

  sheet.appendRow([
    istStamp_(order.createdAt),
    order.ref || "",
    itemsStr,
    order.itemCount || "",
    order.subtotal || "",
    coupon,
    order.payable || "",
    expected == null ? "" : expected,
    match,
    c.name || "",
    c.phone || "",
    fullAddress_(c),
    c.pincode || "",
    c.note || "",
    "NEW",
  ]);
}

/**
 * Customer tapped "I've completed the payment": find their order row by ref and
 * advance a still-NEW row to CLAIMED PAID. We never overwrite a status the owner
 * has already moved on (e.g. VERIFIED / SHIPPED), and payment is still confirmed
 * manually before dispatch — this is only a "please check" signal.
 */
function markClaimed_(ref) {
  if (!ref) return json({ ok: false, error: "no ref" });
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
  if (!sheet || sheet.getLastRow() < 2)
    return json({ ok: false, error: "no orders" });
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var refCol = header.indexOf("Order Ref") + 1;
  var statusCol = header.indexOf("Status") + 1;
  if (!refCol || !statusCol) return json({ ok: false, error: "bad sheet" });
  var n = sheet.getLastRow() - 1;
  var refs = sheet.getRange(2, refCol, n, 1).getValues();
  var found = false;
  for (var i = 0; i < n; i++) {
    if (String(refs[i][0]) === String(ref)) {
      var cell = sheet.getRange(i + 2, statusCol);
      var cur = String(cell.getValue());
      if (cur === "NEW" || cur === "") cell.setValue("CLAIMED PAID");
      found = true;
    }
  }
  return json({ ok: found });
}

/**
 * Format an order time as a readable IST string, e.g. "30 Jul 2026, 01:49 AM".
 * The site sends createdAt as an ISO-8601 UTC string; we convert to Asia/Kolkata
 * (+5:30) so the sheet reads in local time. If createdAt is missing or
 * unparseable, we fall back to the server's receipt time — but tag it
 * "(server time)" and log a warning to the Executions log, so the data issue is
 * surfaced instead of silently looking like a freshly placed order.
 */
function istStamp_(iso) {
  var d = iso ? new Date(iso) : new Date();
  var fromClient = iso && !isNaN(d.getTime());
  if (!fromClient) {
    console.warn(
      "istStamp_: unusable createdAt " +
        JSON.stringify(iso) +
        "; using server time",
    );
    d = new Date();
  }
  var out = Utilities.formatDate(d, "Asia/Kolkata", "dd MMM yyyy, hh:mm a");
  return fromClient ? out : out + " (server time)";
}

/** Compose address + city + state for display/records. */
function fullAddress_(c) {
  return [c.address, c.city, c.state]
    .filter(function (x) {
      return x;
    })
    .join(", ");
}

/**
 * Validate + resolve a pincode via India Post (email enrichment only). Wrapped so a
 * slow/failed lookup degrades to "unverified" and never blocks the order.
 * Returns { state:"ok"|"invalid"|"unverified", city, district, stateName, delivery, match }.
 */
function pinCheck_(pincode, typedCity, typedState) {
  var pin = String(pincode || "").trim();
  if (!/^[1-9]\d{5}$/.test(pin)) return { state: "invalid" };
  var data;
  try {
    var resp = UrlFetchApp.fetch(
      "https://api.postalpincode.in/pincode/" + pin,
      {
        muteHttpExceptions: true,
      },
    );
    if (resp.getResponseCode() !== 200) return { state: "unverified" };
    data = JSON.parse(resp.getContentText());
  } catch (e) {
    return { state: "unverified" };
  }
  var rec = data && data[0];
  if (
    !rec ||
    rec.Status !== "Success" ||
    !rec.PostOffice ||
    !rec.PostOffice.length
  ) {
    return { state: "invalid" };
  }
  var pos = rec.PostOffice;
  var district = pos[0].District || "";
  var stateName = pos[0].State || "";
  // City = Block (lowest common locality) -> single/consistent Name -> District.
  var city = pos[0].Block || "";
  if (!city) {
    var names = pos.map(function (p) {
      return p.Name;
    });
    city = names.length === 1 ? names[0] : district;
  }
  // Match "Delivery" and "Delivering" but not "Non-Delivery" / "Non Delivery",
  // so we're resilient to exactly which string India Post returns.
  var delivering = pos.some(function (p) {
    return /^deliver/i.test(String(p.DeliveryStatus || ""));
  });

  // Loose comparison, to avoid false alarms on spelling variants (Pune/Poona etc.).
  var match = "n/a";
  if (String(typedCity || "").trim()) {
    var norm = function (s) {
      return String(s || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    };
    var stateOK =
      !typedState ||
      norm(typedState) === norm(stateName) ||
      norm(stateName).indexOf(norm(typedState)) >= 0 ||
      norm(typedState).indexOf(norm(stateName)) >= 0;
    var tokens = pos.map(function (p) {
      return norm(p.Name);
    });
    tokens.push(norm(district), norm(city));
    var tc = norm(typedCity);
    var cityOK = tokens.some(function (t) {
      return t && (t.indexOf(tc) >= 0 || tc.indexOf(t) >= 0);
    });
    match = stateOK && cityOK ? "match" : "mismatch";
  }
  return {
    state: "ok",
    city: city,
    district: district,
    stateName: stateName,
    delivery: delivering ? "Delivering" : "Non-Delivery",
    match: match,
  };
}

/** Tiny UA parser -> "Android · Chrome · mobile". Returns "unknown" if empty. */
function parseUa_(ua) {
  ua = String(ua || "");
  if (!ua) return "unknown";
  var os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "?";
  var br = /Edg\//.test(ua)
    ? "Edge"
    : /SamsungBrowser/.test(ua)
      ? "Samsung"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "?";
  var type = /Mobi|Android|iPhone|iPod/.test(ua)
    ? "mobile"
    : /iPad|Tablet/.test(ua)
      ? "tablet"
      : "desktop";
  return os + " · " + br + " · " + type;
}

/** Friendly name for a referrer host. */
function refSource_(host) {
  host = String(host || "").toLowerCase();
  if (!host) return "direct";
  if (host.indexOf("instagram") >= 0) return "Instagram (" + host + ")";
  if (host.indexOf("facebook") >= 0) return "Facebook (" + host + ")";
  if (
    host.indexOf("t.co") >= 0 ||
    host.indexOf("twitter") >= 0 ||
    host === "x.com"
  )
    return "X/Twitter (" + host + ")";
  if (host.indexOf("whatsapp") >= 0 || host.indexOf("wa.me") >= 0)
    return "WhatsApp (" + host + ")";
  if (host.indexOf("google") >= 0) return "Google (" + host + ")";
  return host;
}

function sendEmail(order, expected) {
  if (!NOTIFY_EMAIL) return;
  var c = order.customer || {};
  var items = (order.items || [])
    .map(function (i) {
      return "  " + i.qty + "x " + i.name + "  @Rs." + i.price;
    })
    .join("\n");

  var warn = "";
  if (expected != null && Number(expected) !== Number(order.payable)) {
    warn =
      "\n*** AMOUNT MISMATCH: browser said Rs." +
      order.payable +
      " but server-verified total is Rs." +
      expected +
      ". Do NOT ship until you confirm the correct amount. ***\n";
  }

  // ---- Enrichment: postal location check + browser signals + risk flags ----
  var pin = pinCheck_(c.pincode, c.city, c.state);
  var s = order.signals || {};
  // signals are client-supplied — clamp string lengths + bound fillMs so a
  // malformed or oversized payload can't bloat the email or skew a flag.
  var clip_ = function (v, n) {
    return String(v == null ? "" : v).slice(0, n);
  };
  var sUa = clip_(s.ua, 300);
  var sLang = clip_(s.lang, 35);
  var sTz = clip_(s.tz, 40);
  var sScreen = clip_(s.screen, 20);
  var sEntry = clip_(s.entryRef, 120);
  var sUtm = clip_(s.utm, 120);
  var sFill = Number(s.fillMs);
  if (!isFinite(sFill) || sFill < 0 || sFill > 3600000) sFill = 0;
  var flags = [];
  if (expected != null && Number(expected) !== Number(order.payable))
    flags.push("Amount mismatch");
  if (pin.state === "invalid") flags.push("Invalid PIN");
  else if (pin.state === "unverified") flags.push("PIN not verified");
  else {
    if (pin.match === "mismatch") flags.push("Location mismatch");
    if (pin.delivery === "Non-Delivery") flags.push("Non-delivery area");
  }
  if (sFill && sFill < 2000)
    flags.push("Fast submit (" + (sFill / 1000).toFixed(1) + "s)");

  var locBlock = "\nLocation (from PIN " + (c.pincode || "?") + ")\n";
  if (pin.state === "ok") {
    locBlock +=
      "  City: " +
      (pin.city || "?") +
      " · District: " +
      (pin.district || "?") +
      " · State: " +
      (pin.stateName || "?") +
      " · " +
      pin.delivery +
      "\n";
    if (pin.match === "mismatch")
      locBlock +=
        "  Customer entered: " +
        (c.city || "-") +
        (c.state ? ", " + c.state : "") +
        "   ** MISMATCH **\n";
    else if (pin.match === "match")
      locBlock += "  Customer entered: " + (c.city || "-") + "   (match)\n";
    if (pin.delivery === "Non-Delivery")
      locBlock += "  ** India Post shows NON-DELIVERY for this PIN **\n";
  } else if (pin.state === "invalid") {
    locBlock += "  ** Invalid pincode — no such PIN **\n";
  } else {
    locBlock += "  PIN not verified (postal lookup unavailable)\n";
  }

  var devBlock = "\nDevice & source\n";
  devBlock += "  Device:    " + parseUa_(sUa) + "\n";
  if (sLang || sTz)
    devBlock +=
      "  Language:  " + (sLang || "?") + "     Timezone: " + (sTz || "?") + "\n";
  if (sScreen) devBlock += "  Screen:    " + sScreen + "\n";
  devBlock +=
    "  Came from: " +
    refSource_(sEntry) +
    (sUtm ? "  [utm: " + sUtm + "]" : "") +
    "\n";
  if (sFill)
    devBlock +=
      "  Form time: " +
      (sFill / 1000).toFixed(1) +
      "s" +
      (sFill < 2000 ? "  (bot-like)" : "") +
      "\n";

  var body =
    (flags.length ? "⚠ FLAGS: " + flags.join(" · ") : "✓ No risk flags") +
    "\n\n" +
    "Tantu Kala order  #" +
    order.ref +
    "\n" +
    "Placed: " +
    istStamp_(order.createdAt) +
    "\n" +
    "--------------------------------\n" +
    items +
    "\n" +
    "--------------------------------\n" +
    "Subtotal: Rs." +
    order.subtotal +
    "\n" +
    (order.coupon
      ? "Coupon: " +
        order.coupon.percentOff +
        "% off (-Rs." +
        order.coupon.discount +
        ")\n"
      : "") +
    "Shipping: " +
    (order.shipping ? "Rs." + order.shipping : "Free") +
    "\n" +
    "To pay (browser): Rs." +
    order.payable +
    "\n" +
    (expected != null ? "Verified total (server): Rs." + expected + "\n" : "") +
    warn +
    "\nCustomer\n" +
    "  Name:    " +
    c.name +
    "\n" +
    "  Phone:   " +
    c.phone +
    "\n" +
    "  Address: " +
    fullAddress_(c) +
    "\n" +
    "  Pincode: " +
    c.pincode +
    "\n" +
    (c.note ? "  Note:    " + c.note + "\n" : "") +
    locBlock +
    devBlock +
    "\nVerify the UPI payment (amount + ref #" +
    order.ref +
    ") before dispatch.";

  var subject =
    "New order #" +
    order.ref +
    " — " +
    (c.name || "") +
    (flags.length
      ? "  ⚠ (" + flags.length + " flag" + (flags.length > 1 ? "s" : "") + ")"
      : "  ✓");

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

/** Fetch the authoritative price/coupon feed from the deployed site. */
function fetchPricing_() {
  if (!SITE_URL) return null;
  try {
    var url = SITE_URL.replace(/\/$/, "") + "/pricing.json";
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
 *
 * The pricing RULES (prices, discountPercent, coupon tiers, shipping) are a single
 * source of truth: they live in src/config/site.mjs + products.json and are served
 * to BOTH sides via /pricing.json — so a rule change propagates here automatically.
 * Only the arithmetic below is intentionally re-implemented (it must NOT import the
 * client code, or the verification wouldn't be independent). Keep the ceil-discount +
 * highest-tier-coupon math in sync with src/lib/pricing.ts and src/lib/coupon.ts.
 */
function expectedTotal_(order) {
  var cfg = fetchPricing_();
  if (!cfg || !cfg.products) return null;

  var priceMap = {};
  cfg.products.forEach(function (p) {
    priceMap[p.slug] = p;
  });

  var sub = 0;
  (order.items || []).forEach(function (i) {
    var p = priceMap[i.slug];
    if (!p) return;
    var unit =
      p.discountPercent > 0
        ? Math.ceil(p.price * (1 - p.discountPercent / 100))
        : p.price;
    sub += unit * (Number(i.qty) || 0);
  });

  var best = null;
  var tiers = (cfg.coupons && cfg.coupons.autoOrderValue) || [];
  tiers.forEach(function (t) {
    if (sub >= t.minSubtotal && (!best || t.minSubtotal > best.minSubtotal))
      best = t;
  });
  var goods = best ? Math.ceil(sub * (1 - best.percentOff / 100)) : sub;

  var ship = 0;
  var s = cfg.shipping || {};
  ship = s.freeAbove && sub >= s.freeAbove ? 0 : s.flat || 0;

  return goods + ship;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
