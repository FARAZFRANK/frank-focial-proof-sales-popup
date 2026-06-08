# Frank Social Proof - Conversion Rate Optimization (CRO) App

An advanced, premium-tier Shopify Social Proof and conversion optimization application built using **Remix (React Router v7)**, **Shopify App Bridge**, **Prisma ORM**, and a native **Shopify Theme App Extension**. 

This application empowers merchants to boost store conversion rates, leverage FOMO (Fear of Missing Out), and build immediate trust using real-time storefront notifications, widgets, and dynamic banners.

---

## 🚀 Key Features

*   **Live Activity Feed (Sales Popups):** Displays recent sales and verified order conversions dynamically on the customer's storefront.
*   **Live Visitor Counter:** Shows the current viewing audience on product pages with smooth CSS transitions and session storage persistence.
*   **Urgency & Scarcity Indicators:** Highlights remaining stock levels with custom thresholds and views/sales counts from the last 24 hours.
*   **Interactive Promo Bar:** Floating custom promotion banners (top/bottom) with copyable discount codes and close toggles.
*   **Announcement & Exit Intent Popups:** Custom newsletter/email collection models, featuring a dual-action trigger system supporting desktop mouse-leave events and mobile rapid scroll-up gestures.
*   **Trust Badges Widget:** Instantly display security, payment, and quality assurance badges to build trust.
*   **Reserved Cart Timer:** Counts down time left for shopping carts, synced in real-time across AJAX actions.

---

## 📂 File & Directory Structure

Here is a breakdown of how the project is organized and what each directory does:

```text
frank-social-proof/
├── app/                       # Main application workspace
│   ├── components/            # Reusable UI components
│   │   └── settings/          # Tab components for the Admin Dashboard
│   ├── routes/                # Backend routes and API endpoints (Remix)
│   │   ├── api.orders.jsx     # Fetch order data to feed sales popups
│   │   ├── api.track.jsx      # Tracks analytical events (clicks, impressions)
│   │   ├── api.upload.jsx     # Handles custom media/image uploads to Shopify
│   │   ├── app._index.jsx     # Admin Panel Home / Dashboard
│   │   └── app.settings.jsx   # Admin Settings Orchestrator
│   ├── db.server.js           # Database client initialization (Prisma)
│   ├── root.jsx               # App entry and global context layout
│   └── shopify.server.js      # Shopify Admin API client and OAuth handler
├── prisma/                    # Database models and migrations
│   ├── dev.sqlite             # SQLite database (Development)
│   └── schema.prisma          # Database schemas for settings & subscribers
├── extensions/                # Shopify Theme App Extensions (Storefront code)
│   └── social-proof-extension/
│       ├── assets/            # Client-side CSS and compiled minified JS
│       ├── blocks/            # Liquid blocks injected into Shopify Themes
│       └── snippets/          # Reusable Liquid code snippets
├── shopify.app.toml           # Core Shopify App Configuration
├── vite.config.js             # Vite bundler configuration
└── minify-extension.js        # Helper script to minify storefront assets
```

---

## 🛠️ Installation & Local Development

### Prerequisites
*   **Node.js** (version `>=20.19`)
*   **Shopify CLI**
*   A **Shopify Partner Account** and a **Development Store**

### Setup Instructions
1.  Clone the repository and install the dependencies:
    ```bash
    npm install
    ```
2.  Initialize the Prisma SQLite Database:
    ```bash
    npx prisma db push
    ```
3.  Start the local development server:
    ```bash
    npm run dev
    ```
    *Note: Press `P` in the CLI to open the app configuration window and install the app on your development store.*

---

## 📦 Building & Production Deployment

To package the application for production deployment, run:
```bash
npm run build
```

This command automatically:
1.  Executes `prisma-setup.js` to ensure the database schema is up-to-date.
2.  Generates the Prisma client.
3.  Runs `minify-extension.js` to compress and minify storefront assets inside the Shopify Theme Extension for optimal page loading speeds.
4.  Compiles the Remix server and client builds using Vite.

### Production Database Recommendation
By default, the app uses **SQLite** for local development. For production deployment (e.g., Render, Fly.io, Heroku), it is highly recommended to set up a managed **PostgreSQL** or **MySQL** instance and configure the `DATABASE_URL` environment variable inside your deployment dashboard.

---

## 📝 License
Proprietary app created by **Brosoft**. All rights reserved.
