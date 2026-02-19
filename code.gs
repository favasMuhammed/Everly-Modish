/**
 * EVERLY MODISH API - OPTIMIZED V3
 * Features: High-Speed Caching, CRUD Operations, IST Timezone
 */

const CONFIG = {
  sheetName: 'Sales',
  headers: ['Date', 'Customer Name', 'SKU Sold', 'Qty', 'Total Amt', 'Status', 'Notes'],
  timezone: "GMT+5:30" 
};

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const scriptProp = PropertiesService.getScriptProperties();
  scriptProp.setProperty('key', doc.getId());
  
  let sheet = doc.getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    sheet = doc.insertSheet(CONFIG.sheetName);
    sheet.getRange(1, 1, 1, CONFIG.headers.length).setValues([CONFIG.headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(CONFIG.sheetName);
    const action = e.parameter.action;
    
    // Clear the cache so the dashboard gets fresh data next time
    CacheService.getScriptCache().remove('everlyData');

    if (action === 'create') {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const nextRow = sheet.getLastRow() + 1;
      const newRow = headers.map(header => {
        if (header === 'Date') return Utilities.formatDate(new Date(), CONFIG.timezone, "yyyy-MM-dd HH:mm:ss");
        if (header === 'Status') return 'Completed';
        return e.parameter[header] || "";
      });
      
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
      return responseJSON({ 'result': 'success', 'message': 'Sale Recorded' });

    } else if (action === 'delete') {
      const row = parseInt(e.parameter.rowNumber);
      if (row > 1) sheet.deleteRow(row);
      return responseJSON({ 'result': 'success', 'message': 'Row Deleted' });
    }

    throw new Error("Unknown action");

  } catch (error) {
    return responseJSON({ 'result': 'error', 'error': error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('everlyData');
  
  // 1. Instant return from Google Server Cache
  if (cachedData) {
    return responseJSON(JSON.parse(cachedData));
  }
  
  // 2. If no cache, read the sheet and save to cache for 5 minutes
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName(CONFIG.sheetName);
  const data = sheet.getDataRange().getValues();
  
  cache.put('everlyData', JSON.stringify(data), 300); 
  return responseJSON(data);
}

function responseJSON(content) {
  return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(ContentService.MimeType.JSON);
}
