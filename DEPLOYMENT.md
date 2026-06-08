# Production Deployment Guide: Frank Social Proof App

This guide outlines the step-by-step process of deploying the **Frank Social Proof** Shopify app to a production environment (such as **Render** or **Fly.io**) using a managed **PostgreSQL** database and deploying the **Shopify Theme App Extension**.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Setup a Production Database (PostgreSQL)](#step-1-setup-a-production-database-postgresql)
3. [Step 2: App Registration & API Keys](#step-2-app-registration-api-keys)
4. [Step 3: Environment Variables Setup](#step-3-environment-variables-setup)
5. [Step 4: Host Deployment Options](#step-4-host-deployment-options)
   - [Option A: Deploying on Render (Recommended)](#option-a-deploying-on-render-recommended)
   - [Option B: Deploying on Fly.io](#option-b-deploying-on-flyio)
6. [Step 5: Deploy & Release Shopify Theme App Extension](#step-5-deploy--release-shopify-theme-app-extension)
7. [Step 6: Update Shopify Partner Dashboard URLs](#step-6-update-shopify-partner-dashboard-urls)

---

## 1. Prerequisites
*   A **Shopify Partner Account** and a registered Custom/Public App.
*   A hosting account on **Render.com** or **Fly.io**.
*   A managed PostgreSQL database account (e.g., **Supabase**, **Neon.tech**, or **Render Postgres**).
*   **Shopify CLI** installed locally on your development system.

---

## Step 1: Setup a Production Database (PostgreSQL)

Since SQLite (`dev.sqlite`) is a local file-based database, deploying it to serverless or container platforms will cause data loss whenever the container restarts or redeploys.

1.  Create a PostgreSQL database on **Neon.tech** (free tier), **Supabase**, or directly on **Render**.
2.  Retrieve your database connection string. It should look like this:
    ```text
    postgresql://username:password@ep-cool-snowflake-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
    ```
3.  Store this string safely. You will set this as the `DATABASE_URL` environment variable during hosting setup. The custom `prisma-setup.js` script in your root folder will automatically detect this and switch your Prisma engine from SQLite to PostgreSQL at build time.

---

## Step 2: App Registration & API Keys

1.  Log in to your **Shopify Partner Dashboard** and click on your app.
2.  Go to **Client Credentials**. Copy:
    *   **Client ID** (will be used as `SHOPIFY_API_KEY`)
    *   **Client Secret** (will be used as `SHOPIFY_API_SECRET`)

---

## Step 3: Environment Variables Setup

You must configure the following environment variables in your hosting dashboard:

| Variable Name | Description | Example |
|---|---|---|
| `NODE_ENV` | Run context of the app. Set to production. | `production` |
| `DATABASE_URL` | PostgreSQL database connection string. | `postgresql://user:pass@host/db?sslmode=require` |
| `SHOPIFY_API_KEY` | Client ID from Shopify Partner Dashboard. | `019e0642...` |
| `SHOPIFY_API_SECRET` | Client Secret from Shopify Partner Dashboard. | `shpss_12345...` |
| `SHOPIFY_APP_URL` | The live production domain of your app. | `https://my-social-proof.onrender.com` |
| `PORT` | Container port (usually auto-configured). | `3000` |
| `SHOPIFY_SOCIAL_PROOF_EXTENSION_ID` | Production UUID of the Theme Extension. | `019e0642-59ea-7c6e-a8eb-10334091e362` |

---

## Step 4: Host Deployment Options

### Option A: Deploying on Render (Recommended)

Render is highly recommended because it supports automatic Docker builds directly from Git.

1.  Create a new account on **Render.com** and click **New > Web Service**.
2.  Connect your Git repository.
3.  Configure the settings:
    *   **Runtime:** `Docker` (Render will automatically detect the `Dockerfile` in the root).
    *   **Region:** Select the region closest to your primary target market.
    *   **Branch:** `main` (or your active release branch).
4.  Scroll down to **Advanced** and click **Add Environment Variable**. Add all the variables listed in [Step 3](#step-3-environment-variables-setup).
5.  Click **Create Web Service**. Render will pull the repository, run `prisma-setup.js` to change the database provider to Postgres, run migration commands, compile the React assets, and start the app.

---

### Option B: Deploying on Fly.io

Fly.io is great for speed and deploys containers close to customers.

1.  Install the Fly CLI (`flyctl`) and log in:
    ```bash
    fly auth login
    ```
2.  Initialize the app inside the project directory:
    ```bash
    fly launch
    ```
    *Choose "Yes" to copy settings from the existing Dockerfile. Do not provision a Postgres database if you are using Neon or Supabase.*
3.  Set the secrets in Fly.io using CLI:
    ```bash
    fly secrets set DATABASE_URL="your-postgres-url" SHOPIFY_API_KEY="your-client-id" SHOPIFY_API_SECRET="your-client-secret" SHOPIFY_APP_URL="https://your-fly-app-name.fly.dev" SHOPIFY_SOCIAL_PROOF_EXTENSION_ID="your-extension-uuid" NODE_ENV="production"
    ```
4.  Deploy the app:
    ```bash
    fly deploy
    ```

---

## Step 5: Deploy & Release Shopify Theme App Extension

To make storefront widgets visible to customers, you must push the extension assets to Shopify's servers.

1.  Log in to Shopify CLI from your terminal:
    ```bash
    npx shopify auth login
    ```
2.  Deploy the app extension:
    ```bash
    npm run deploy
    ```
    *This runs `minify-extension.js` to compress code, packages storefront assets, and uploads them to Shopify.*
3.  Once uploaded successfully, go to **Shopify Partner Dashboard > Your App > Extensions**.
4.  Click on **social-proof-extension**.
5.  Under **Version History**, click **Create Version** and then click **Release** on the latest version. This will update the storefront scripts on all live stores.

---

## Step 6: Update Shopify Partner Dashboard URLs

After your app is successfully deployed to Render or Fly.io and you have your live production URL (e.g., `https://my-social-proof.onrender.com`):

1.  Open the **Shopify Partner Dashboard** and select your app.
2.  Go to **Configuration** (App Settings).
3.  Update the **App URL**:
    ```text
    https://my-social-proof.onrender.com
    ```
4.  Update the **Allowed redirection URL(s)**:
    ```text
    https://my-social-proof.onrender.com/auth/callback
    ```
5.  Click **Save**.

Your app is now live in production! Any store that installs the app will have settings saved to your PostgreSQL instance, and widgets will render cleanly using your minified storefront scripts.
