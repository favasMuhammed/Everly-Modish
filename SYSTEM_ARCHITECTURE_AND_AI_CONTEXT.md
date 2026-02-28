# Everly Modish | Master ERP
## System Architecture and AI Context

This document serves as the **master context** and **technical guideline** for AI assistants (like Cursor, Windsurf, Copilot, etc.) contributing to the **Everly Modish Serverless ERP** repository. Read this entirely before proposing or executing architectural changes.

---

### 1. System Overview & Tech Stack

**Architecture Paradigm:**
The application is a pure Serverless Single Page Application (SPA). It completely eschews traditional backend frameworks (Node.js, Python, Ruby, PHP) and relational databases (PostgreSQL, MySQL, MongoDB). Instead, it leverages the Google Workspace ecosystem as its backend and database infrastructure.

**Data Flow Architecture:**
- **Frontend Hosting:** Designed to be hosted on any static file server (e.g., GitHub Pages, Netlify, Vercel). Currently, it runs entirely from `index.html`.
- **Backend API:** A Google Apps Script (`code.gs`) deployed as a Web App serves as a REST-like endpoint. It handles HTTP POST (for writes/deletions) and GET (for reads). *(Note: `code.gs` contains sensitive access tokens and is purposely untracked by Git via `.gitignore` to prevent exposure on GitHub).*
- **Database:** A defined Google Spreadsheet acts as the relational database. Each sheet (tab) functions as an isolated table (`Sales`, `Inventory`, `Expenses`, `Capital`).

**Tech Stack:**
- **Markup / Logic:** HTML5 and Vanilla JavaScript (ES6+). No complex frontend frameworks (React, Vue, Angular) are used to maintain supreme simplicity and portability.
- **Styling:** Tailwind CSS (utility-first styling). We no longer use the slow CDN on production; css is compiled natively.
- **Icons:** Remix Icons (loaded via CDN) for scalable vector graphics.
- **Backend / DB:** Google Apps Script (GAS) and Google Sheets API.

---

### 2. Current Capabilities & Active Modules

The ERP currently orchestrates the following core business modules. All features are built to run entirely inside the client browser.

| Module | Description | Key Features |
| :--- | :--- | :--- |
| **Security Gateway** | PIN-based Lock screen | Hardcoded SHA-256 hash validation preventing unauthorized SPA hydration. |
| **Zero-Latency CRUD** | Optimistic UI pipeline | Data mutations (Creates, Edits) instantly re-render the frontend DOM locally (0ms payload hook) before silently executing background syncing. |
| **Dashboard** | Financial KPIs | Real-time calculation of Total Revenue, Net Profit, Profit Margins, Expenses, Inventory Capital, and Avg Order Value. Includes advanced MBA-level percentage badges (Expense Ratio % & Margin per Item %). |
| **POS / Sales** | Point-of-Sale UI | Smart SKU auto-complete, automated price fetching, shipping calculator, dynamic 'Copy Dispatch' for logistics formatting. |
| **Inventory** | Master Product Catalog | Tracks Costs/Retail prices. Features an intelligent Auto-SKU generator mapping 3-letter prefixes (e.g., `EM-ABA-`), expanded categories (Skirt, Shirt, Other), and a 1-click global `Copy Catalog` live-stock aggregator. |
| **Expenses** | Operational Ledger | Dedicated ledger to categorize logs (Ads, Packaging, Salary, Rent), feeding directly into the global Net Profit. |
| **CRM** | Customer Management | Algorithmic view aggregating the flat `Sales` sheet by phone number. Calculates LTV, Orders, and assigns 'VIP' badges. |
| **Capital & Equity**| Partner Cap Table | Manages investments/withdrawals. Calculates Equal Targets, dynamic Surplus/Deficits, P&L Share mapping from `NetProfit`, and explicit Ownership %. |
| **Bank & Cashflow** | Live Bank Balances | Isolates pure physical Cash in Hand vs theoretical P&L. Algorithmically aggregates Sales, Inventory purchases, Capital adjustments, and manual Ledger transfers. |
| **Clipboard Pipeline**| WhatsApp Export Utility | All modules possess localized Javascript copy exporters (`copyDispatch`, `copyCapTable`) that automatically generate WhatsApp-formatted payloads (with Date headers, standard bold markdown, and `*Everly Modish | ERP*` branding text), and flash the UI button to Green. |

---

### 3. Data Flow & State Management

**The State Object:**
The application relies on a single, global Javascript object named `state` acting as the authoritative source of truth for the UI at any given moment:
```javascript
let state = {
    sales: [],
    inventory: [],
    expenses: [],
    capital: [],
    bank: [], // Physical Cashflow Ledger
    skus: [],
    netProfit: 0 // Injected algorithmically by renderFinancials() for downstream use
};
```

**The Sync & Render Lifecycle:**
1. **Request:** The app fires a `fetch()` GET request to the Google Apps Script `SCRIPT_URL`.
2. **GAS Cache / Read:** The script bypasses Google Sheets rate limits by first checking `CacheService` for the `everlyMasterData` key. If a cache miss occurs, it queries the sheets via `getDataSafely`, constructs a structured JSON payload, caches it for 300 seconds (5 minutes), and returns it.
3. **Hydration & Local DB:** The frontend receives the JSON slice, removes header rows (`.slice(1)`), and hydrates the global `state` object. It simultaneously writes to `localStorage` (`everlyDb`) for instant rendering on subsequent visits.
4. **Rendering:** A series of synchronous `render[Module]()` functions are called, wiping HTML table bodies and reconstructing them dynamically via template literals (`insertAdjacentHTML`).
5. **Mutation (Writes & Edits):** When a user submits a form, the `submitData()` function executes an **Optimistic UI Payload**. It instantly modifies the local `state` array (via `.push()` or mapping array boundaries via `arrIndex`) and immediately triggers `render[Module]()` to generate an instant zero-latency view. It then fires the Google API POST request strictly in the background. The GAS backend executes `sheet.appendRow()` or `sheet.getRange(rowNum...).setValues()`, explicitly drops the cache (forcing a fresh DB read on the next GET), and returns success. The frontend then gracefully triggers a silent background sync `loadData(true, true)` to synchronize any exact remote timestamps generated natively by Google automatically.

---

### 4. Strict System Standards (The 'Do Not Break' Rules)

**To any AI modifying this codebase, you MUST adhere strictly to the following parameters. Do not attempt to "modernize" to an alternate framework without explicit human authorization.**

> [!WARNING]
> **1. NO BACKEND COMPUTATION OR SERVERS:** 
> This system operates strictly within a $0 Serverless / No-DevOps paradigm. Under no circumstances should you suggest, incorporate, or require Node.js, Python, Docker pipelines, external databases (SQL/NoSQL), or traditional backend APIs. The Google Apps Script is the absolute and only backend boundary.

> [!IMPORTANT]
> **2. STRICT UI CONSISTENCY (Modern Classic Aesthetics):** 
> All new elements must utilize the localized Tailwind design language natively inside `index.html`. We follow a stark, minimalist corporate standard.
> - **Backgrounds**: `bg-slate-50`, `bg-white`
> - **Interactions**: `hover:bg-slate-50`, `active:scale-[0.98]`, `transition-colors`, `transition-all`
> - **Structural**: `rounded-lg` ONLY. No heavy `shadow-lg` (use `shadow-sm`), no `rounded-2xl`. Keep borders sharp `border-slate-100`. All tables use exact `bg-slate-50 border-b border-slate-100 uppercase font-semibold text-slate-500` headers.
> - **Typography**: Google fonts `Inter`, utilizing `font-medium`, `font-bold` and semantic slate colors (`text-slate-900`, `text-slate-500`).
> - **Primary Accents**: Monochrome dominance. Primary CTA buttons are strictly `bg-gray-900 hover:bg-black text-white`. Active Nav states are `text-slate-900 font-bold`. Avoid saturated background pills unless semantic (e.g., success).
> - **Success/Error**: `emerald-600` (success), `rose-600` (error).
> - *Under no circumstances should raw CSS be written for standard components; always use Tailwind utilities.*

> [!CAUTION]
> **3. MATHEMATICAL SAFETY & STATE HARDENING:** 
> - All string-to-number conversions involving financial data must implement strict fallback mechanisms using `parseFloat(value) || 0`.
> - Integer counts must use `parseInt(value) || 0`.
> - Division formulas must mathematically safeguard against `Infinity` or `NaN` outputs via direct `isFinite()` conditional wrappers validating the payload before rendering.
> - Final UI outputs for currency must be strictly formatted with `.toFixed(2)` and prefixed with the ₹ symbol.
> - Native `form.reset()` does not clear custom injected DOM text nodes (like generated SKUs) or automatically calculated static `.value` fields. These UI artifacts must be explicitly purged inside `submitData()` on every mutation to prevent memory bleeding.
> - API `fetch` Promises must include a `.finally()` unlock clause to instantly re-enable Call-To-Action buttons if a 500 Network error occurs to avoid permanent UI hangs.

**4. MOBILE RESPONSIVENESS MUST BE MAINTAINED:**
Forms must flawlessly stack on mobile devices utilizing standard Tailwind breakpoint grids (e.g., `grid-cols-1 md:grid-cols-2`). Parent table wrappers must permanently utilize `overflow-x-auto scroller` mapping against deeply embedded `table.whitespace-nowrap` logic to prevent catastrophic column crushing horizontally on smartphones.

**5. STATE IMMUTABILITY IN RENDERERS:** 
The `render...()` functions (like `renderSalesHistory`, `renderCrm`) MUST NEVER manipulate the Google Sheet database directly. They only read from the `state` object. DOM updates are handled by re-rendering the entire table body via string template literals.

**6. SECURITY GATEWAY:** 
Keep the SHA-256 PIN UI hashing logic intact. It is the designated security mechanism defending the `index.html` frontend loading payload from unauthorized DOM access.

**7. TAILWIND BUILD PIPELINE INTEGRITY:**
Whenever a new CSS utility class (especially dynamically concatenated strings or new breakpoints like `lg:col-span-1`) is added to `index.html`, **THE DEVELOPER MUST RE-RUN** the compiler via `npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify` before commiting. If dynamic JS string classes are used (e.g. `bg-emerald-50`), they MUST be explicitly whitelisted into the `safelist` array inside `tailwind.config.js`.

---

### 5. AI Automation Guide (How to Upgrade This System)

When instructed by the user to add a new module (e.g., "Add a 'Returns' module" or "Add a 'Payroll' ledger"), follow this exact chronological sequence precisely:

#### Phase 1: Backend Setup (`code.gs`)
1.  **Append Schema:** Add the new sheet name (`newSheetName: 'MyNewSheet'`) and an array of exact headers (`newHeaders: ['Date', 'Field1']`) to the `CONFIG` object at the top of the file.
2.  **Initialization:** In the `setup()` function, replicate the `if (!sheet)` sheet insertion block to automatically generate the tab and lock the header row when setup is next executed.
3.  **POST Handlers (Mutations):** Inside `doPost()`, add new `else if` routing conditions: 
    * One to handle `action === 'create_[module]'` mapping the payload into a `newRow` array via `sheet.appendRow()`.
    * One to handle `action === 'edit_[module]'` targeting coordinates via `sheet.getRange(rowNum, 1, 1, newRow.length).setValues([newRow])`.
    * One to handle `action === 'delete_[module]'` calling the `deleteRow()` helper.
4.  **GET Extraction (Hydration):** Inside `doGet()`, create a new constant firing `getDataSafely()` targeting the new sheet, and append that array to the final JSON `payload` object.

#### Phase 2: Frontend State (`index.html`)
5.  **State Object Configuration:** Add an empty array for the new module (`[moduleName]: []`) to the global `let state = {...}` definition at the top of the JS block.
6.  **JSON Hydration:** Inside the `processData()` function, add the ingestion logic handling the missing data fallback (e.g., `state.[module] = data.[module] ? data.[module].slice(1) : [];`).
7.  **Routing Call:** Add the new `render[Module]()` function trigger to the very end of `processData()`.
8.  **Deletion Mapping:** Update the `handleDelete()` switch logic to map the generic frontend type to the specific backend POST route (e.g., `if (type === '[module]') action = 'delete_[module]';`).

#### Phase 3: UI Construction (`index.html`)
9.  **Navigation Context:** Add the new navigation trigger button inside the `<nav>` component, ensuring it calls `switchTab('[module]')` and uses a Remix icon.
10. **View Container:** Create a new root container `div` directly inside the main element with `id="view-[module]"` and classes `view-section hidden animate-fade-in`.
11. **Form Layout:** Construct the frontend input form inside a `<div class="sticky top-24">` side panel using the standard slate/indigo styling and the grid structure. Ensure the submit button fires `submitData('[formId]', 'create_[module]')`.
12. **Renderer Development:** Write the custom `render[Module]()` function.
    * Target the container and clear it: `tbody.innerHTML = ''`
    * Handle the zero-data fallback state securely and visually.
    * Map through the `state.[module]` array using `.slice(-20).reverse().forEach((row, i) => {...})` to build the HTML string templates via `insertAdjacentHTML`. 
    * Ensure you generate the `rowIndex` dynamically for deletions.
    * Include the standardized `editRecord()` green buttons and `handleDelete()` red buttons in the final table cell logic.
    * Inject the hidden tracking tag `<input type="hidden" name="row" id="row-[formId]">` inside the Form element layout directly so the module natively supports the edit parameters pipeline.
    * Build a localized `copy[Module]()` integration mimicking the system's WhatsApp export formatting payload standard before pushing strings to the clipboard.
    * RUN `npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify` explicitly to package your newly defined UI utilities natively into the distribution.
