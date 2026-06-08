# Frank Social Proof — The All-In-One Conversion, Urgency & Trust Suite for Shopify

> **Turn passive browsers into paying customers.** Frank Social Proof combines real-time purchase notifications, visitor counters, cart urgency timers, exit-intent recovery, newsletter capture, trust badges, and a full analytics dashboard — all inside a single, featherweight Shopify app.

---

## Table of Contents

1. [Why Your Store Needs This App](#-why-your-store-needs-this-app)
2. [Core Architecture & Performance](#-core-architecture--performance)
3. [Feature Breakdown](#-complete-feature-breakdown)
   - [Recent Sales Popups](#1-recent-sales-popups)
   - [Live Visitor Counter](#2-live-visitor-counter)
   - [Product Scarcity & Social Badges](#3-product-scarcity--social-badges)
   - [Cart Countdown Timer](#4-cart-countdown-timer)
   - [Floating Promo Bar](#5-floating-promo-bar)
   - [Newsletter & Announcement Popup](#6-newsletter--announcement-popup)
   - [Exit-Intent Popup](#7-exit-intent-popup)
   - [Trust Badges Widget](#8-trust-badges-widget)
   - [Analytics Dashboard](#9-analytics-dashboard)
   - [Newsletter Subscriber Manager](#10-newsletter-subscriber-manager)
4. [Where to Use Each Widget (Buyer Journey Map)](#-where-to-use-each-widget)
5. [Customization & Theming](#-customization--theming)
6. [Multi-Language & Translation Support](#-multi-language--translation-support)
7. [Quick Setup Guide](#-quick-setup-guide)
8. [FAQ](#-frequently-asked-questions)
9. [Support](#-support)

---

## 🔥 Why Your Store Needs This App

E-commerce conversion rates average between 1% and 3%. That means **97 out of every 100 visitors leave without buying anything**. Cart abandonment rates hover around 70%. The difference between a struggling store and a thriving one often comes down to three psychological levers:

### 1. Social Proof — "Others are buying, so it must be good."
In a physical store, shoppers see other people browsing, picking up items, and standing in line at the register. Online, shopping is isolated. Frank Social Proof bridges that gap by displaying real-time purchase activity, live visitor counts, and product demand metrics — making your store feel busy, popular, and trustworthy.

### 2. Scarcity & Urgency — "I need to act now before it's gone."
When inventory is low and a countdown timer is ticking, hesitation turns into action. Loss aversion is one of the strongest human behavioral biases. Frank Social Proof puts this to work with low-stock alerts, cart reservation timers, and limited-time promo announcements that compel visitors to complete their purchases immediately.

### 3. Trust & Credibility — "This store is safe and legitimate."
First-time visitors don't know your brand yet. Trust badges (Secure Checkout, Free Shipping, Money-Back Guarantee) placed strategically near the Add to Cart button eliminate payment anxiety and reduce the friction between "I want this" and "I'll buy this."

### 4. Traffic Recovery — "Capture the ones who are leaving."
Over 95% of first-time visitors leave without buying. Exit-intent popups and newsletter modals act as a safety net — offering incentives, collecting email addresses, and giving you a second chance to convert those visitors through retargeting campaigns.

**Bottom line:** Even a 0.5% increase in conversion rate can translate to thousands of dollars in additional monthly revenue. Frank Social Proof is designed to deliver that uplift without slowing down your store or requiring any coding knowledge.

---

## ⚡ Core Architecture & Performance

Unlike bloated third-party scripts that drag down page speed scores, Frank Social Proof is engineered from the ground up for performance:

| Performance Metric | Detail |
|---|---|
| **Script Loading** | Fully asynchronous (`defer`). Your images, fonts, and product pages load first. Zero render-blocking. |
| **Total Payload** | Under 12kb — smaller than most product images. |
| **SEO Impact** | Zero impact on Core Web Vitals (LCP, CLS, FID). The script fires after the DOM is interactive. |
| **Storefront Caching** | All widget data is cached in `sessionStorage` with a 5-minute TTL. Subsequent page navigations pull from cache — no additional network requests. Sub-15ms response times. |
| **Server-Side Caching** | Orders, inventory data, and embed status are cached in-memory on the server with configurable TTL windows (2–5 minutes) to minimize Shopify API calls and stay well under rate limits. |
| **Rate Limiting** | Built-in per-shop rate limiter (120 requests/minute) protects against abuse and ensures stable performance under traffic spikes. |
| **Theme Integration** | Installed via Shopify's native Theme App Extension (App Embed block). No theme code editing required. One-click activation from the Theme Editor. |
| **Timezone-Aware Analytics** | All analytics data is stored using the store's IANA timezone — ensuring reports accurately reflect the merchant's local business day. |
| **XSS Protection** | All user-facing content is sanitized through a DOM-based text escaping function before injection, preventing cross-site scripting attacks. |

---

## 🧩 Complete Feature Breakdown

### 1. Recent Sales Popups

**What it does:** Displays animated notification cards showing real recent orders from your store. Each popup includes the customer's first name, city, product purchased, product image, a verified badge, and a relative timestamp.

**How it works under the hood:**
- Fetches the 50 most recent orders via the Shopify Admin GraphQL API, including customer names, cities, product titles, product images, and product handles.
- If real orders exist, they are displayed. If the store is new or has low volume, merchants can enable **Mock Data Mode** with a built-in library of 45+ realistic global buyer templates (names and cities from New York, London, Amsterdam, Tokyo, and more).
- When both real orders and mock data are enabled, they are blended together. Orders matching the currently viewed product are prioritized and shown first.
- Clicking a sales popup navigates the visitor to the relevant product page and logs an analytics click event.

**Configurable Options:**
- **Position:** Top-left, top-right, bottom-left, bottom-right
- **Animation:** Slide-up, slide-down, fade, zoom, bounce, swing
- **Timing:** Initial delay before first popup, display duration per popup, gap between popups
- **Custom Icon/Logo:** Upload a custom notification icon via the Shopify Media Library
- **Verified Badge:** Customizable label text and color (e.g., "Verified by Frank ✓")
- **Privacy Mode:** Hide real customer names and replace with "Someone"
- **Device Targeting:** Show on mobile, desktop, or both
- **20+ Design Presets:** Standard, Dark, Glass, Sunset, Ocean, Emerald, Aurora, Midnight, Cyber, Purple Haze, Candy, Royal, Gold, Nordic, Forest, Ruby, Sky, and more — each with curated color palettes, animations, and border-radius
- **Full Style Control:** Custom background, text color, border color, border width, corner radius, box shadow, and font family

---

### 2. Live Visitor Counter

**What it does:** Shows a floating or inline widget displaying a simulated live visitor count on product pages (e.g., *"14 visitors viewing now"*) with an animated green pulse dot.

**How it works under the hood:**
- Generates a random visitor count within a configurable min/max range.
- The count persists across the session using `sessionStorage` so it doesn't reset on every page load.
- When **Counter Fluctuation** is enabled, the count dynamically updates every 7–15 seconds with small random increments or decrements (±1 to ±2), creating a realistic, living feel.
- The fluctuation is bounded — the count never drops below the minimum or exceeds the maximum threshold.

**Configurable Options:**
- **Position:** Bottom-left, bottom-right, top-left, top-right, or inline (below the Add to Cart form)
- **Min/Max Visitor Range:** Keep numbers realistic (e.g., 5–25)
- **Pulse Dot:** Toggle the glowing green pulse animation on/off
- **Counter Fluctuation:** Live number changes every 7–15 seconds
- **Session Limit:** Show only once per browser session, or loop continuously
- **Loop Mode:** Repeating show/hide cycle with configurable display duration and gap
- **Timing:** Initial delay, display duration, gap between loops
- **8+ Design Presets:** Minimal Light, Glass, Dark, Urgency Red, Ocean Breeze, Forest Green, Sunset Glow, Royal Gold
- **Full Style Control:** Background, text, border, radius, shadow, animation, font

---

### 3. Product Scarcity & Social Badges

**What it does:** Injects a compact, multi-segment info bar directly below the product form showing demand signals — page views, items sold, and low-stock warnings.

**Components:**

#### 🔥 Hot Alert — Views in Last 24 Hours
- Tracks real product page views using the analytics API and displays: *"58 views in the last 24 hours"*
- If mock data mode is enabled and no real views exist, realistic simulated counts are generated.

#### 🛒 Items Sold Count (24h)
- Counts real orders for the specific product within the last 24 hours from Shopify order data.
- Displays: *"12 items sold in the last 24 hours"*
- Falls back to simulated counts (2–10) if mock data mode is active and no real sales exist.

#### 📦 Low-Stock Inventory Alert
- Fetches the product's `totalInventory` from Shopify's GraphQL API (cached for 2 minutes).
- Only displays when inventory is **above 0** and **below the configured threshold** (e.g., 10 units).
- Automatically hides when a product is well-stocked or out of stock — ensuring honest, compliant messaging.
- Displays: *"Hurry! Only 3 left in stock!"* with a customizable text template using the `{stock}` placeholder.

**Configurable Options:**
- Toggle each component independently (views, sold count, inventory)
- Inventory threshold (only show warning below this number)
- Customizable label text for all three segments
- All text is translatable for multi-language stores

---

### 4. Cart Countdown Timer

**What it does:** Displays a live countdown clock showing how long the customer's cart items are "reserved." Creates a powerful urgency signal that drives faster checkout decisions.

**How it works under the hood:**
- Timer starts when items are added to the cart. The start time is persisted in `sessionStorage`, so the timer continues seamlessly across page navigations within the same session.
- The countdown is displayed in the **browser tab title** (e.g., `⚠️ (09:42) Your Store`), ensuring it remains visible even when the customer switches tabs.
- The timer automatically clears and resets when the cart is emptied.
- Cart additions and changes are detected via intercepted `fetch` and `XMLHttpRequest` calls to Shopify's `/cart/add`, `/cart/change`, `/cart/update`, and `/cart/clear` endpoints.

**When the Timer Expires:**
- **Clear Cart:** Displays a glassmorphic confirmation modal ("Cart Reservation Expired"). If the customer confirms, the cart is cleared via `/cart/clear.js` and the page reloads.
- **Redirect:** Clears the cart and redirects the customer to the home page.
- **Message Only:** Displays a "Reservation Expired" warning without taking any destructive action.
- In all modes, the customer has the option to **keep their cart** and continue shopping.

**Configurable Options:**
- **Timer Duration:** 1 to 60+ minutes
- **Position:** Inline (above checkout button), top bar, or bottom bar
- **Progress Bar:** Visual shrinking progress bar that changes color as time runs out (green → amber → red)
- **Timeout Action:** Clear cart, redirect, or show message only
- **Custom Text:** "Your cart is reserved for", or any custom text
- **6+ Design Presets:** Crimson Warning, Midnight Neon, Clean Light, Ocean Timer, Emerald Alert, Amber Rush
- **Full Style Control:** Background, text color, border, radius, shadow, font

---

### 5. Floating Promo Bar

**What it does:** A persistent, full-width sticky banner at the top or bottom of the screen. Use it to announce flash sales, free shipping thresholds, discount codes, or store-wide notices.

**Key Features:**
- **Click-to-Copy Discount Code:** Displays a styled code box with a "Copy" button. One click copies the code to clipboard and shows "Copied!" confirmation.
- **Dismiss Button:** Customers can close the banner with an × button. Once dismissed, it stays hidden for the session.
- **Show Once Mode:** Optional one-time display per session to avoid annoying repeat visitors.
- **Page Body Adjustment:** Automatically adds margin to the page body so the promo bar doesn't overlap your store content.

**Configurable Options:**
- **Position:** Top or bottom of the viewport
- **Promo Text:** Fully customizable message
- **Discount Code:** Shown with copy-to-clipboard functionality
- **Link URL:** Optional click-through URL
- **Height & Font Size:** Pixel-level control
- **Background & Text Color:** Full color picker with 6 curated presets (Midnight Dark, Emerald Shopify, Ocean Blue, Ruby Sale, Luxury Gold, Sunset Gradient)
- **Device Targeting:** Show on all devices, desktop only, or mobile only
- **One-Time Display:** Show only once per session

---

### 6. Newsletter & Announcement Popup

**What it does:** A premium overlay popup for displaying offers, collecting email subscribers, and building your marketing list. Supports both CTA-button mode and email-capture mode.

**Two Operating Modes:**

#### 📧 Email Capture Mode
- Displays a styled email input field with a "Subscribe" button.
- Validates email format on the client side before submission.
- Saves subscribers to the database (with duplicate detection).
- Shows a success message with a checkmark animation after submission.
- Automatically closes the popup 2 seconds after successful subscription.
- All subscribers are viewable and manageable in the admin dashboard's Subscribers tab.

#### 🔗 CTA Button Mode
- Displays a customizable call-to-action button that redirects to any URL (e.g., a collection page, a checkout page, or a product page).
- Button clicks are tracked as analytics events.

**Trigger Modes:**
- **Immediate Load:** Popup appears as soon as the page loads (with optional delay).
- **Timed Delay:** Popup appears after a configurable delay (e.g., 3 seconds, 10 seconds).
- **Exit Intent:** Popup triggers when the visitor attempts to leave the page (desktop: cursor leaves window; mobile: rapid scroll-up gesture).

**Design Features:**
- Glassmorphic backdrop blur effect (toggleable)
- Custom header image support via Shopify Media Library
- Configurable popup width and border radius
- Center, top, or bottom positioning with smooth slide/fade animations
- Custom button colors (background + text)
- Custom success message after email submission
- **One-Time Display:** Show only once per session to respect visitor experience

**Configurable Options:**
- Toggle email input field on/off
- Custom title, body text, button text, button link, success message
- Background & text colors
- Popup width (px), border radius (px)
- Backdrop blur toggle
- Trigger mode (load, delay, exit)
- Delay duration (ms)
- One-time per session toggle

---

### 7. Exit-Intent Popup

**What it does:** A dedicated exit-intent modal designed specifically to intercept leaving traffic and offer a last-chance incentive to stay and complete a purchase.

**How Exit-Intent Detection Works:**
- **Desktop:** Monitors the `mouseleave` event on the `document`. Triggers when `e.clientY < 0`, meaning the cursor has left the browser viewport toward the top (indicating the user is reaching for the close button, address bar, or tab bar).
- **Mobile:** Monitors scroll behavior. Triggers when a rapid scroll-up gesture is detected near the top of the page (`lastScrollY - current > 20` and `current < 50`), which typically indicates the user is trying to access the browser navigation to leave.
- Both listeners are throttled and removed after the first trigger to prevent multiple firings.

**Two Operating Modes:**
- **Email Capture:** Email input + subscribe button (identical flow to the announcement popup, with data saved to the newsletter database).
- **CTA Button:** Customizable action button with redirect URL. Clicks are tracked as analytics events.

**Design Features:**
- Premium glassmorphic overlay with configurable backdrop blur
- Smooth scale + fade entrance animation (cubic-bezier easing)
- Configurable popup width, border radius, and colors
- Independent color controls for background, text, button background, and button text

**Configurable Options:**
- Custom title and body text
- Button text and redirect link
- Email capture toggle
- Custom success message
- Backdrop blur toggle
- Popup width and border radius
- One-time per session toggle
- Background and text colors (popup + buttons)

---

### 8. Trust Badges Widget

**What it does:** Injects a row of checkout benefit icons and labels directly below the product form (next to the Add to Cart button) to reduce payment friction and build buyer confidence.

**Built-in Icon Library (10 Icons):**
- 🚚 Truck (Free Shipping)
- 🛡️ Shield (Secure Checkout)
- ⭐ Star (Quality Guarantee)
- 🔒 Lock (SSL Encrypted)
- 🔄 Refresh (Money-Back Guarantee)
- 💳 Credit Card (Payment Options)
- 🎧 Headset (24/7 Support)
- 🏆 Award (Certified Brand)
- ❤️ Heart (Customer Favorite)
- 👍 Thumbs Up (Satisfaction Guarantee)

**Layout Options:**
- **Grid:** Badges wrap in a responsive grid with padding and borders
- **Horizontal:** Single-row inline layout
- **Inline:** Minimal text-only layout without badge backgrounds

**Style Modes:**
- **Colored:** Each icon uses its own curated default color (amber, blue, green, etc.)
- **Monochrome:** All icons inherit the text color for a cleaner, minimal look

**Configurable Options:**
- Add, remove, or reorder badges dynamically
- Custom text per badge
- Custom icon selection per badge
- Background color, text color, icon color
- Border width, border color, border radius
- Alignment (left, center, right)
- Layout mode (grid, horizontal, inline)
- Hover effects with subtle scale + shadow animation (built-in CSS)

---

### 9. Analytics Dashboard

**What it does:** Provides a comprehensive, visual analytics hub on the app's home page, giving merchants real-time visibility into widget performance and store activity.

**Tracked Metrics:**
- **Impressions:** Every page load on the storefront where widgets are active is tracked as an impression.
- **Clicks:** Every interaction with a sales popup, announcement button, or exit-intent button is tracked as a click.
- **Click-Through Rate (CTR):** Calculated as `(clicks / impressions) × 100`.
- **Product Views:** Per-product daily page view counts, tracked at the product-handle level.

**Dashboard Components:**
- **Stat Cards:** Impressions, Clicks, CTR — each with percentage growth comparison against the previous period.
- **Interactive Chart:** Bézier-curve SVG chart with dual-line views (impressions + clicks), hover tooltips, and a combined/split view toggle.
- **Top Products:** Table of the 5 most-viewed products within the selected date range.
- **Recent Orders Activity Feed:** Live list of the 5 most recent real orders with customer name, city, and product title.
- **CTR Progress Ring:** Animated SVG donut chart showing current click-through rate.

**Date Range Filtering:**
- Quick presets: Today, Yesterday, Last 7 Days, Last 14 Days, Last 30 Days, Last 90 Days, All Time
- Custom date range picker with calendar UI
- Previous-period comparison for growth metrics (automatic)

**Export Options:**
- **CSV Export:** Downloads a detailed day-by-day CSV report for the selected date range.
- **PDF Export:** Opens a styled, print-ready report in a new window with branding, metrics summary, and day-by-day breakdown table.

---

### 10. Newsletter Subscriber Manager

**What it does:** All emails collected through the Announcement Popup and Exit-Intent Popup are stored in a dedicated database table and accessible from the admin dashboard's **Subscribers** tab.

**Features:**
- View all collected email addresses with timestamps
- Search and filter subscribers
- Delete individual subscribers
- Export subscriber data

---

## 🗺️ Where to Use Each Widget

| Buyer Journey Stage | Recommended Widgets | Purpose |
|---|---|---|
| **Home Page / Collection Pages** | Sales Popups, Promo Bar | Establish authority, show store activity, announce promotions |
| **Product Detail Pages** | Live Visitor Counter, Scarcity Badges (views, sold, inventory), Trust Badges | Create demand signals, reduce purchase anxiety |
| **Cart / Pre-Checkout** | Cart Countdown Timer, Trust Badges | Drive urgency, prevent abandonment |
| **Exit Touchpoints** | Exit-Intent Popup, Announcement Popup (exit trigger) | Save the sale, capture email leads |
| **Sitewide** | Promo Bar, Newsletter Popup (timed trigger) | Build marketing lists, announce campaigns |

---

## 🎨 Customization & Theming

Every widget is fully customizable to match your brand's visual identity:

### Design System Controls
- **Colors:** Background, text, border, button background, button text, icon color, verified badge color — all configurable via color pickers with hex input.
- **Typography:** Choose from modern web fonts: Inter, Outfit, Roboto, Poppins, DM Sans, Nunito, and system fallbacks.
- **Borders:** Independent width and color controls. Set to 0 for borderless designs.
- **Corner Radius:** From sharp (0px) to fully rounded (50px).
- **Box Shadow:** Multiple shadow presets from subtle to dramatic. Use "none" for flat designs.
- **Animations:** slide-up, slide-down, fade, zoom, bounce, swing — independently configurable per widget.

### Design Presets
Pre-configured theme packages that set all visual properties at once:

**Sales Popup Presets (20+):** Standard, Dark, Glass, Sunset, Ocean, Emerald, Aurora, Midnight, Cyber, Purple Haze, Candy, Royal, Gold, Nordic, Minimal, Forest, Ruby, Sky

**Visitor Counter Presets (8):** Minimal Light, Glass, Dark, Urgency Red, Ocean Breeze, Forest Green, Sunset Glow, Royal Gold

**Cart Timer Presets (6):** Crimson Warning, Midnight Neon, Clean Light, Ocean Timer, Emerald Alert, Amber Rush

**Promo Bar Presets (6):** Midnight Dark, Emerald Shopify, Ocean Blue, Ruby Sale, Luxury Gold, Sunset Gradient

### Live Preview
All settings changes are reflected instantly in a live preview panel within the admin dashboard — no need to save and reload your storefront to see how adjustments look.

---

## 🌍 Multi-Language & Translation Support

Every text string displayed on the storefront is fully customizable, making the app compatible with any language:

| Label Key | Default Text | Example Translation (French) |
|---|---|---|
| `labelPurchased` | "Recently purchased" | "Acheté récemment" |
| `labelSomeoneIn` | "Someone in" | "Quelqu'un à" |
| `labelFrom` | "from" | "de" |
| `labelVerified` | "Verified by Frank" | "Vérifié par Frank" |
| `labelVisitors` | "visitors viewing now" | "visiteurs en ce moment" |
| `labelViews24h` | "views in the last 24 hours" | "vues au cours des dernières 24 heures" |
| `labelItemsSold` | "items sold in the last 24 hours" | "articles vendus au cours des dernières 24 heures" |
| `inventoryText` | "Hurry! Only {stock} left in stock!" | "Dépêchez-vous ! Plus que {stock} en stock !" |
| `cartTimerText` | "Your cart is reserved for" | "Votre panier est réservé pour" |
| `promoText` | Custom | Custom |
| `announceTitle` | Custom | Custom |
| `exitTitle` | Custom | Custom |

Simply update the label fields in the Settings tab to translate the entire widget experience.

---

## 🚀 Quick Setup Guide

Getting Frank Social Proof running on your store takes less than 2 minutes:

### Step 1: Enable the App Embed
1. Open the app dashboard and navigate to the **Help** page.
2. Click the **"Enable App Embed"** button — this opens your Shopify Theme Editor.
3. In the Theme Editor, look for **App Embeds** in the left panel.
4. Toggle **"Social Proof Popup"** to ON.
5. Click **Save** in the top-right corner.

### Step 2: Configure Your Widgets
1. Navigate to the **Settings** tab in the app dashboard.
2. Enable the widgets you want (Sales Popups, Visitor Counter, Cart Timer, etc.).
3. Customize colors, text, and timing to match your brand.
4. Use the **Live Preview** panel to see changes in real time.
5. Click **Save** when satisfied.

### Step 3: Start with Mock Data (Optional)
If your store is new and doesn't have order history yet:
1. Enable **"Show Mock Data"** in the Settings tab.
2. The app comes pre-loaded with 45+ realistic buyer templates from global cities.
3. You can also add your own custom mock entries using the **Mock Data Manager**.
4. Once real orders start flowing, the system blends real and mock data — or you can disable mock data entirely.

### Step 4: Monitor Performance
1. Visit the **Dashboard** (app home page) to track impressions, clicks, and CTR.
2. Use the date range picker to analyze specific periods.
3. Export CSV or PDF reports for stakeholders.

---

## ❓ Frequently Asked Questions

**Q: Does this app slow down my store?**
A: No. The widget script loads asynchronously (deferred) and weighs under 12kb. It has zero impact on your Core Web Vitals, page load speed, or SEO scores. Storefront data is cached in the browser's sessionStorage for 5 minutes, meaning subsequent page loads make no additional network requests.

**Q: Do I need to edit my theme code?**
A: No. Frank Social Proof uses Shopify's native Theme App Extension system. You activate it with a single toggle in the Theme Editor — no Liquid code editing, no script tags, no theme file modifications.

**Q: How does exit-intent work on mobile devices?**
A: Since mobile devices don't have a mouse cursor, the app detects exit intent by monitoring scroll behavior. A rapid scroll-up gesture near the top of the page (which typically occurs when a user reaches for the address bar to leave) triggers the exit popup.

**Q: Why isn't the inventory warning showing on some products?**
A: The inventory scarcity widget only appears when a product's inventory is above 0 and below the configured threshold. If a product has plenty of stock or is completely out of stock, the warning is hidden automatically to ensure honest, compliant messaging.

**Q: Can I use this app with a non-English store?**
A: Absolutely. Every text label, button, and alert message displayed on the storefront can be customized from the Settings tab. Simply replace the default English text with your preferred language — no translation plugins needed.

**Q: What happens when the cart timer expires?**
A: You can choose from three behaviors: (1) show a confirmation modal and clear the cart, (2) clear the cart and redirect to the home page, or (3) simply display a "Reservation Expired" message without any destructive action. In all cases, the customer has the option to keep their cart.

**Q: Does the visitor counter show real visitors?**
A: The visitor counter generates a simulated count within the range you configure (e.g., 5–25). It fluctuates dynamically every 7–15 seconds to feel realistic. The count persists across page navigations within the session.

**Q: Where are newsletter subscriber emails stored?**
A: All collected emails are stored securely in the app's database. You can view, search, and manage subscribers from the **Subscribers** tab in the Settings page. Duplicate emails are automatically detected and prevented.

**Q: Can I customize colors and fonts for each widget independently?**
A: Yes. Each widget type (Sales Popups, Visitor Counter, Cart Timer, Promo Bar, Announcement, Exit Popup, Trust Badges) has its own independent set of color, font, border, and shadow controls. You can also use pre-built design presets as starting points.

---

## 📬 Support

Have questions, need custom styling help, or experiencing a theme conflict?

**Email:** [contact@wpfrank.com](mailto:contact@wpfrank.com)

Our support team is available to help with:
- Theme compatibility and conflict resolution
- Custom CSS styling requests
- Feature requests and feedback
- Setup walkthroughs and best practices

---

*Frank Social Proof — Built for performance. Designed for conversions. Made for Shopify.*
