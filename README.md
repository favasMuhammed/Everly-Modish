# Everly Modish | Master ERP

Welcome to the **Everly Modish Serverless ERP** repository! This project is a state-of-the-art Single Page Application (SPA) designed to completely manage a business without any traditional backend infrastructure.

## Features
- **Serverless Architecture**: Runs entirely on client-side HTML/JS, using Google Sheets and Google Apps Script as the backend database.
- **Zero-Latency CRUD**: Features a hyper-optimized optimistic UI that renders data mutations (Creates and Edits) instantly while silently syncing with the cloud in the background.
- **Financial Dashboard**: Real-time KPI tracking for revenue, expenses, net profit, and total capital investment.
- **POS & Sales**: Point-of-Sale interface with intelligent SKU autocomplete and localized WhatsApp export payloads.
- **Master Inventory**: Automated SKU generation with prefix matching and comprehensive catalog management.
- **CRM Integration**: Dynamic customer lifetime value (LTV) and order aggregation calculated entirely in the browser with smart VIP badging.
- **Capital Ledger**: Partner cap table and equity tracking mapping individual deficits and surpluses against global net profit.

## Technologies Used
- **Frontend**: Vanilla HTML5, JavaScript (ES6+).
- **Styling**: Tailwind CSS (compiled via JIT and included in the distribution).
- **Backend/Database**: Google Apps Script & Google Sheets API.
- **Security**: Local PIN-based SHA-256 validation and token-authenticated API endpoints.
- **Icons**: Remix Icons.

## Setup & Deployment
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/favasMuhammed/Everly-Modish.git
   ```
2. Navigate into the project directory:
   ```bash
   cd Everly-Modish
   ```
3. Install dependencies required for the CSS build pipeline:
   ```bash
   npm install
   ```
4. To compile styles during development, run:
   ```bash
   npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
   ```
5. Deploy `index.html` and the `dist` folder to any static hosting provider (e.g., GitHub Pages).

*Note: The backend script (`code.gs`) contains sensitive environment configurations and requires deployment as a Google Apps Script Web App. It is intentionally excluded from this repository tracking via `.gitignore`.*

## Contributing
Contributions are welcome! Please follow these guidelines:
- Fork the repository.
- Create a new branch for your feature or bug fix: `git checkout -b my-feature`
- Commit your changes: `git commit -m 'Add some feature'`
- Push to the branch: `git push origin my-feature`
- Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
