/**
 * EVERLY MODISH MASTER API (PHASE 2)
 * Manages Sales, Inventory, Expenses, and Financial Analytics
 */

const CONFIG = {
  salesSheet: 'Sales',
  invSheet: 'Inventory',
  expSheet: 'Expenses',
  // Updated Schema
  salesHeaders: ['Date', 'Customer Name', 'Phone', 'Address', 'SKU', 'Qty', 'Retail Price', 'Shipping Charge', 'Total Paid'],
  invHeaders: ['SKU', 'Item Name', 'Category', 'Size', 'Cost Price', 'Retail Price', 'Initial Stock'],
  expHeaders: ['Date', 'Category', 'Amount', 'Notes'],
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

  // Setup Expenses (NEW)
  let eSheet = doc.getSheetByName(CONFIG.expSheet);
  if (!eSheet) {
    eSheet = doc.insertSheet(CONFIG.expSheet);
    eSheet.getRange(1, 1, 1, CONFIG.expHeaders.length).setValues([CONFIG.expHeaders]).setFontWeight("bold");
    eSheet.setFrozenRows(1);
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
        e.parameter['Phone'] || "",
        e.parameter['Address'] || "",
        e.parameter['SKU'] || "",
        e.parameter['Qty'] || "",
        e.parameter['Retail Price'] || "",
        e.parameter['Shipping Charge'] || "",
        e.parameter['Total Paid'] || ""
      ];
      sheet.appendRow(newRow);
      return responseJSON({ result: 'success' });

    } else if (action === 'create_inventory') {
      const sheet = doc.getSheetByName(CONFIG.invSheet);
      const newRow = [
        e.parameter['SKU'] || "",
        e.parameter['Item Name'] || "",
        e.parameter['Category'] || "",
        e.parameter['Size'] || "",
        e.parameter['Cost Price'] || "",
        e.parameter['Retail Price'] || "",
        e.parameter['Initial Stock'] || ""
      ];
      sheet.appendRow(newRow);
      return responseJSON({ result: 'success' });

    } else if (action === 'create_expense') {
      const sheet = doc.getSheetByName(CONFIG.expSheet);
      const newRow = [
        Utilities.formatDate(new Date(), CONFIG.timezone, "yyyy-MM-dd HH:mm:ss"),
        e.parameter['Category'] || "",
        e.parameter['Amount'] || "",
        e.parameter['Notes'] || ""
      ];
      sheet.appendRow(newRow);
      return responseJSON({ result: 'success' });

    } else if (action === 'delete_sale') {
      deleteRow(doc, CONFIG.salesSheet, e.parameter.row);
      return responseJSON({ result: 'success' });

    } else if (action === 'delete_inventory') {
      deleteRow(doc, CONFIG.invSheet, e.parameter.row);
      return responseJSON({ result: 'success' });
      
    } else if (action === 'delete_expense') {
      deleteRow(doc, CONFIG.expSheet, e.parameter.row);
      return responseJSON({ result: 'success' });
    }

    throw new Error("Unknown action");
  } catch (error) {
    return responseJSON({ result: 'error', error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function deleteRow(doc, sheetName, rowParam) {
  const sheet = doc.getSheetByName(sheetName);
  const row = parseInt(rowParam);
  if (row > 1) sheet.deleteRow(row);
}

function doGet(e) {
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('everlyMasterData');
  
  if (cachedData) return responseJSON(JSON.parse(cachedData));
  
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const salesData = getDataSafely(doc, CONFIG.salesSheet);
  const invData = getDataSafely(doc, CONFIG.invSheet);
  const expData = getDataSafely(doc, CONFIG.expSheet);
  
  const payload = { sales: salesData, inventory: invData, expenses: expData };
  cache.put('everlyMasterData', JSON.stringify(payload), 300); 
  
  return responseJSON(payload);
}

function getDataSafely(doc, sheetName) {
  const sheet = doc.getSheetByName(sheetName);
  return sheet ? sheet.getDataRange().getValues() : [];
}

function responseJSON(content) {
  return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(ContentService.MimeType.JSON);
}
