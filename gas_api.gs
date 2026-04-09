// ======================================================
// 伊都文化会館 大ホール 空席情報システム - GAS API
// ======================================================

var SHEET_NAME = "seats";

// ======================================================
// Web API エンドポイント
// 列構成: row(A) / seat_number(B) / reserved(C)
// ======================================================
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var seats = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === "" && row[1] === "") continue;
    seats.push({
      row: String(row[0]),
      seat_number: Number(row[1]),
      reserved: row[2] === "予約済み" || row[2] === true || row[2] === "TRUE"
    });
  }

  var now = new Date();
  var jstOffset = 9 * 60;
  var utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  var jstDate = new Date(utcMs + jstOffset * 60000);

  var pad = function(n) { return n < 10 ? "0" + n : String(n); };
  var updatedAt =
    jstDate.getFullYear() + "-" +
    pad(jstDate.getMonth() + 1) + "-" +
    pad(jstDate.getDate()) + "T" +
    pad(jstDate.getHours()) + ":" +
    pad(jstDate.getMinutes()) + ":" +
    pad(jstDate.getSeconds()) + "+09:00";

  var output = ContentService
    .createTextOutput(JSON.stringify({ seats: seats, updated_at: updatedAt }))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}

// ======================================================
// 初期データ一括生成
// 座席構成:
//   A〜G列: 3-10(左), 11-24(中), 25-34(右) = 32席/列
//   H〜O列: 1-10(左), 11-24(中), 25-36(右) = 36席/列
// ※P〜W列は自由席のためスプレッドシート管理不要
// ======================================================
function initSeats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clearContents();
  sheet.getDataRange().clearDataValidations();

  var rows = [["row", "seat_number", "reserved"]];

  // A〜G列: 左(3-10), 中(11-24), 右(25-34)
  ["A","B","C","D","E","F","G"].forEach(function(rowName) {
    for (var s = 3;  s <= 10; s++) rows.push([rowName, s, "空席"]);
    for (var s = 11; s <= 24; s++) rows.push([rowName, s, "空席"]);
    for (var s = 25; s <= 34; s++) rows.push([rowName, s, "空席"]);
  });

  // H〜O列: 左(1-10), 中(11-24), 右(25-36)
  ["H","I","J","K","L","M","N","O"].forEach(function(rowName) {
    for (var s = 1;  s <= 10; s++) rows.push([rowName, s, "空席"]);
    for (var s = 11; s <= 24; s++) rows.push([rowName, s, "空席"]);
    for (var s = 25; s <= 36; s++) rows.push([rowName, s, "空席"]);
  });

  sheet.getRange(1, 1, rows.length, 3).setValues(rows);
  Logger.log("完了：" + (rows.length - 1) + "件の座席データを生成しました。");
}

// 診断用
function debugTest() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("ss = " + ss.getName());
    var sheet = ss.getSheetByName(SHEET_NAME);
    Logger.log("sheet = " + (sheet ? "found" : "null"));
    Logger.log("range = " + sheet.getDataRange().getA1Notation());
  } catch(e) {
    Logger.log("ERROR: " + e.message);
  }
}
