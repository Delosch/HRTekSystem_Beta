# HRTEK SYSTEM - Digital Transformation Dashboard

Welcome to the HRTEK SYSTEM repository. This guide will help you get the application running on your local machine with minimal effort.

## 🚀 Quick Start (Windows)

The easiest way to get started is to use our one-click setup script:

1.  **Run Setup**: Double-click the `setup.bat` file in the root directory.
    *   This will check if you have Node.js installed.
    *   It will install all necessary dependencies.
    *   It will create your `.env` file if it doesn't exist.
2.  **Configure Environment**: 
    *   Open the newly created `.env` file.
    *   Fill in your **AWS Credentials**, **DynamoDB Table Name**, and **SMTP/Email Settings**.
3.  **Run the App**:
    ```bash
    npm run dev
    ```

## 🛠 Manual Installation

If you prefer to set up manually, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    *   Copy `.env.template` to `.env`.
    *   Ensure all required keys are filled.
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```

## ⚠️ Common Errors & Fixes

*   **Missing Credentials**: If you see "ERROR: Missing required environment variables", check your `.env` file. The app will not start without valid AWS and SMTP credentials.
*   **Port already in use**: If port 3000 (or 5173) is busy, try closing other terminal windows or change the port in `vite.config.ts`.
*   **Node Version**: Ensure you are using **Node.js v20** or higher.

---
© 2026 HRTEK SYSTEM - Cognitive HR Transformation
