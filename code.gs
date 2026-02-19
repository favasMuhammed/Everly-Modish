/**
 * EVERLY MODISH MASTER API
 * Manages Sales, Inventory, and Dashboard Analytics
 */

const CONFIG = {
  salesSheet: 'Sales',
  invSheet: 'Inventory',
  salesHeaders: ['Date', 'Customer Name', 'SKU Sold', 'Qty', 'Total Amt'],
  invHeaders: ['SKU', 'Item Name', 'Size', 'Price', 'Initial Stock'],
  timezone: "GMT+5:30" 
};

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Sales
  let sSheet = doc.getSheetByName(CONFIG.salesSheet);
  if (!sSheet) {
    sSheet = doc.insertSheet(CONFIG.salesSheet);
    sSheet.getRange(1, 1, 1, CONFIG.salesHeaders.length).setValues([CONFIG.salesHeaders]).setFontWeight("bold");
    sSheet.setFrozenRows(1);
  }

  // Setup Inventory
  let iSheet = doc.getSheetByName(CONFIG.invSheet);
  if (!iSheet) {
    iSheet = doc.insertSheet(CONFIG.invSheet);
    iSheet.getRange(1, 1, 1, CONFIG.invHeaders.length).setValues([CONFIG.invHeaders]).setFontWeight("bold");
    iSheet.setFrozenRows(1);
  }
  
  PropertiesService.getScriptProperties().setProperty('key', doc.getId());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action;
    CacheService.getScriptCache().remove('everlyMasterData');

    if (action === 'create_sale') {
      const sheet = doc.getSheetByName(CONFIG.salesSheet);
      const newRow = [
        Utilities.formatDate(new Date(), CONFIG.timezone, "yyyy-MM-dd HH:mm:ss"),
        e.parameter['Customer Name'] || "",
        e.parameter['SKU Sold'] || "",
        e.parameter['Qty'] || "",
        e.parameter['Total Amt'] || ""
      ];
      sheet.appendRow(newRow);
      return responseJSON({ result: 'success' });

    } else if (action === 'create_inventory') {
      const sheet = doc.getSheetByName(CONFIG.invSheet);
      const newRow = [
        e.parameter['SKU'] || "",
        e.parameter['Item Name'] || "",
        e.parameter['Size'] || "",
        e.parameter['Price'] || "",
        e.parameter['Initial Stock'] || ""
      ];
      sheet.appendRow(newRow);
      return responseJSON({ result: 'success' });
    }

    throw new Error("Unknown action");
  } catch (error) {
    return responseJSON({ result: 'error', error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('everlyMasterData');
  
  if (cachedData) return responseJSON(JSON.parse(cachedData));
  
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const salesData = doc.getSheetByName(CONFIG.salesSheet).getDataRange().getValues();
  const invData = doc.getSheetByName(CONFIG.invSheet).getDataRange().getValues();
  
  const payload = { sales: salesData, inventory: invData };
  cache.put('everlyMasterData', JSON.stringify(payload), 300); 
  
  return responseJSON(payload);
}

function responseJSON(content) {
  return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(ContentService.MimeType.JSON);
}
