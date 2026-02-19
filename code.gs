/**
 * EVERLY MODISH ADVANCED PORTAL API
 * v2.0 - Features: Dynamic Columns, Inventory Check, Search, Pagination
 */

// CONFIGURATION
const CONFIG = {
  sheetName: 'Sales',
  inventorySheetName: 'Inventory', // Optional: for checking stock
  headers: ['Date', 'Customer Name', 'SKU Sold', 'Qty', 'Total Amt', 'Status', 'Notes'],
  timezone: "GMT+5:30" // Adjust to your local time
};

// INITIAL SETUP
function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const scriptProp = PropertiesService.getScriptProperties();
  scriptProp.setProperty('key', doc.getId());
  
  // Create Sales Sheet if not exists
  let sheet = doc.getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    sheet = doc.insertSheet(CONFIG.sheetName);
    sheet.getRange(1, 1, 1, CONFIG.headers.length).setValues([CONFIG.headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

// --------------------------------------------------------------------------
// CREATE / UPDATE / DELETE (POST REQUESTS)
// --------------------------------------------------------------------------
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(CONFIG.sheetName);
    const action = e.parameter.action;
    
    if (!sheet) throw new Error("Sheet '" + CONFIG.sheetName + "' not found. Run setup() first.");

    // ROUTES
    if (action === 'create') {
      return handleCreate(e, sheet, doc);
    } else if (action === 'update') {
      return handleUpdate(e, sheet);
    } else if (action === 'delete') {
      return handleDelete(e, sheet);
    } else {
      throw new Error("Unknown action: " + action);
    }

  } catch (error) {
    return responseJSON({ 'result': 'error', 'error': error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// HANDLER: CREATE NEW SALE
function handleCreate(e, sheet, doc) {
  // 1. Optional: Check Inventory
  const sku = e.parameter['SKU Sold'];
  const qty = parseInt(e.parameter['Qty']) || 1;
  const inventorySheet = doc.getSheetByName(CONFIG.inventorySheetName);
  
  if (inventorySheet && sku) {
    // Simple lookup: Column A=SKU, Column B=Qty
    const data = inventorySheet.getDataRange().getValues();
    const itemRow = data.find(r => r[0] === sku);
    if (itemRow) {
      const currentStock = parseInt(itemRow[1]);
      if (currentStock < qty) throw new Error(`Insufficient stock for ${sku}. Only ${currentStock} left.`);
      // (Optional) Deduct stock here if you want
    }
  }

  // 2. Map incoming parameters to headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const nextRow = sheet.getLastRow() + 1;
  const newRow = headers.map(header => {
    if (header === 'Date') return Utilities.formatDate(new Date(), CONFIG.timezone, "yyyy-MM-dd HH:mm:ss");
    if (header === 'Status') return 'Completed';
    return e.parameter[header] || "";
  });

  sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
  return responseJSON({ 'result': 'success', 'row': nextRow, 'message': 'Sale Recorded Successfully' });
}

// HANDLER: UPDATE
function handleUpdate(e, sheet) {
  const row = parseInt(e.parameter.rowNumber); // 1-based index from frontend
  const col = parseInt(e.parameter.colNumber); // 1-based index
  const value = e.parameter.value;
  
  if (row <= 1) throw new Error("Cannot edit header row");
  
  sheet.getRange(row, col).setValue(value);
  return responseJSON({ 'result': 'success', 'message': 'Updated' });
}

// HANDLER: DELETE
function handleDelete(e, sheet) {
  const row = parseInt(e.parameter.rowNumber);
  if (row <= 1) throw new Error("Cannot delete header row");
  
  sheet.deleteRow(row);
  return responseJSON({ 'result': 'success', 'message': 'Deleted Row ' + row });
}

// --------------------------------------------------------------------------
// READ (GET REQUESTS)
// --------------------------------------------------------------------------
function doGet(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(CONFIG.sheetName);
    
    // Support basic search
    const search = e.parameter.search; 
    
    // Get all data
    const data = sheet.getDataRange().getValues();
    
    // Filter if search term exists
    let filteredData = data;
    if (search) {
      const lowerSearch = search.toLowerCase();
      // Keep header + matching rows
      filteredData = [data[0], ...data.slice(1).filter(row => row.join(" ").toLowerCase().includes(lowerSearch))];
    }
    
    return responseJSON(filteredData);
    
  } catch (error) {
    return responseJSON({ 'error': error.toString() });
  }
}

// HELPER: standardize JSON response
function responseJSON(content) {
  return ContentService
    .createTextOutput(JSON.stringify(content))
    .setMimeType(ContentService.MimeType.JSON);
}
