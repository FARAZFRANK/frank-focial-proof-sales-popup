/*
  Warnings:

  - You are about to drop the column `mockCities` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `mockNames` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `mockProducts` on the `Settings` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Analytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProductView" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "title" TEXT DEFAULT 'Frank Social Proof Sales Popup',
    "description" TEXT DEFAULT 'Recently purchased',
    "position" TEXT DEFAULT 'bottom-left',
    "displayDuration" INTEGER DEFAULT 5000,
    "initialDelay" INTEGER DEFAULT 3000,
    "displayGap" INTEGER DEFAULT 3000,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "textColor" TEXT DEFAULT '#1a1a1a',
    "showMockData" BOOLEAN DEFAULT false,
    "showVisitorCount" BOOLEAN DEFAULT false,
    "minVisitors" INTEGER DEFAULT 5,
    "maxVisitors" INTEGER DEFAULT 25,
    "isEnabled" BOOLEAN DEFAULT true,
    "showOnMobile" BOOLEAN DEFAULT true,
    "showOnDesktop" BOOLEAN DEFAULT true,
    "mockData" TEXT DEFAULT '[{"name":"Emma","city":"New York, US","product":"Wireless Headphones"},{"name":"Sophie","city":"Amsterdam, NL","product":"Leather Backpack"},{"name":"Liam","city":"London, UK","product":"Minimalist Wallet"},{"name":"Lucas","city":"Berlin, DE","product":"Smart Watch"},{"name":"Chloe","city":"Paris, FR","product":"Organic Cotton Tee"}]',
    "logoUrl" TEXT DEFAULT 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
    "animationType" TEXT DEFAULT 'slide-up',
    "showHotAlert" BOOLEAN DEFAULT false,
    "labelVerified" TEXT DEFAULT 'Verified by',
    "labelPurchased" TEXT DEFAULT 'Recently purchased',
    "labelSomeoneIn" TEXT DEFAULT 'Someone in',
    "labelVisitors" TEXT DEFAULT 'visitors viewing now',
    "labelViews24h" TEXT DEFAULT 'views in the last 24 hours',
    "labelTrending" TEXT DEFAULT 'Trending Now',
    "showOnPages" TEXT DEFAULT 'all',
    "hideNames" BOOLEAN DEFAULT false,
    "labelFrom" TEXT DEFAULT 'from',
    "showSoldCount" BOOLEAN DEFAULT false,
    "labelItemsSold" TEXT DEFAULT 'items sold in the last 24 hours',
    "showPromoBar" BOOLEAN DEFAULT false,
    "promoText" TEXT DEFAULT 'Flash Sale! Get 20% OFF with code: SAVE20',
    "promoLink" TEXT DEFAULT '',
    "promoBgColor" TEXT DEFAULT '#1a1a1a',
    "promoTextColor" TEXT DEFAULT '#ffffff',
    "showAnnounce" BOOLEAN DEFAULT false,
    "announceTitle" TEXT DEFAULT 'Special Offer!',
    "announceText" TEXT DEFAULT 'Subscribe to our newsletter and get 10% off your first order.',
    "announceButtonText" TEXT DEFAULT 'Claim Offer',
    "announceButtonLink" TEXT DEFAULT '/collections/all',
    "announceImage" TEXT DEFAULT '',
    "announceTrigger" TEXT DEFAULT 'load',
    "showCartTimer" BOOLEAN DEFAULT false,
    "cartTimerMins" INTEGER DEFAULT 10,
    "cartTimerText" TEXT DEFAULT 'Your cart is reserved for',
    "showEmailInput" BOOLEAN DEFAULT false,
    "showInventory" BOOLEAN DEFAULT false,
    "inventoryThreshold" INTEGER DEFAULT 10,
    "inventoryText" TEXT DEFAULT 'Hurry! Only {stock} left in stock!',
    "announceOnce" BOOLEAN DEFAULT true,
    "showTrustBadges" BOOLEAN DEFAULT false,
    "trustStyle" TEXT DEFAULT 'colored',
    "trustBadgesData" TEXT DEFAULT '[{"icon":"truck","text":"Free Shipping"},{"icon":"shield","text":"Secure Checkout"},{"icon":"refresh","text":"Money Back Guarantee"}]',
    "sales_pos" TEXT DEFAULT 'bottom-left',
    "sales_bg" TEXT DEFAULT '#ffffff',
    "sales_text" TEXT DEFAULT '#1a1a1a',
    "sales_anim" TEXT DEFAULT 'slide-up',
    "counter_pos" TEXT DEFAULT 'bottom-right',
    "counter_bg" TEXT DEFAULT '#ffffff',
    "counter_text" TEXT DEFAULT '#1a1a1a',
    "cart_bg" TEXT DEFAULT '#fef2f2',
    "cart_text" TEXT DEFAULT '#991b1b',
    "cart_pos" TEXT DEFAULT 'inline',
    "promo_pos" TEXT DEFAULT 'top',
    "announce_bg" TEXT DEFAULT '#ffffff',
    "announce_text" TEXT DEFAULT '#1a1a1a',
    "announce_pos" TEXT DEFAULT 'center',
    "showExitPopup" BOOLEAN DEFAULT false,
    "exitTitle" TEXT DEFAULT 'Wait! Don''t go!',
    "exitText" TEXT DEFAULT 'Get 10% off your order if you stay!',
    "exit_bg" TEXT DEFAULT '#ffffff',
    "exit_text" TEXT DEFAULT '#1a1a1a',
    "promoHeight" INTEGER DEFAULT 44,
    "promoFontSize" INTEGER DEFAULT 14,
    "promoShowOn" TEXT DEFAULT 'all',
    "sales_radius" INTEGER DEFAULT 8,
    "sales_shadow" TEXT DEFAULT '0 4px 12px rgba(0,0,0,0.1)',
    "sales_font" TEXT DEFAULT 'Inter, sans-serif',
    "sales_border_color" TEXT DEFAULT '#e1e3e5',
    "sales_border_width" INTEGER DEFAULT 0,
    "counter_radius" INTEGER DEFAULT 50,
    "counter_border_color" TEXT DEFAULT '#e1e3e5',
    "counter_border_width" INTEGER DEFAULT 1,
    "counter_shadow" TEXT DEFAULT '0 2px 8px rgba(0,0,0,0.05)',
    "counter_anim" TEXT DEFAULT 'slide-up',
    "counter_font" TEXT DEFAULT 'Inter, sans-serif',
    "counter_delay" INTEGER DEFAULT 3000,
    "counter_duration" INTEGER DEFAULT 6000,
    "counter_gap" INTEGER DEFAULT 4000,
    "showSalesPopups" BOOLEAN DEFAULT true,
    "cart_radius" INTEGER DEFAULT 8,
    "cart_border_width" INTEGER DEFAULT 1,
    "cart_border_color" TEXT DEFAULT '#fee2e2',
    "cart_shadow" TEXT DEFAULT '0 2px 8px rgba(0,0,0,0.05)',
    "cart_font" TEXT DEFAULT '''Outfit'', sans-serif',
    "cart_show_progress" BOOLEAN DEFAULT true,
    "cart_timeout_action" TEXT DEFAULT 'message',
    "promoCode" TEXT DEFAULT 'SAVE20',
    "verifiedColor" TEXT DEFAULT '#10b981',
    "announceBackdropBlur" BOOLEAN DEFAULT true,
    "announceBorderRadius" INTEGER DEFAULT 16,
    "announceBtnBgColor" TEXT DEFAULT '#1a1a1a',
    "announceBtnTextColor" TEXT DEFAULT '#ffffff',
    "announceDelay" INTEGER DEFAULT 3000,
    "announceSuccessMessage" TEXT DEFAULT 'Thank you for subscribing!',
    "announceWidth" INTEGER DEFAULT 450,
    "exitBackdropBlur" BOOLEAN DEFAULT true,
    "exitBorderRadius" INTEGER DEFAULT 16,
    "exitBtnBgColor" TEXT DEFAULT '#1a1a1a',
    "exitBtnTextColor" TEXT DEFAULT '#ffffff',
    "exitButtonLink" TEXT DEFAULT '',
    "exitButtonText" TEXT DEFAULT 'Stay with us!',
    "exitOnce" BOOLEAN DEFAULT true,
    "exitSuccessMessage" TEXT DEFAULT 'Thank you!',
    "exitWidth" INTEGER DEFAULT 450,
    "showExitEmailInput" BOOLEAN DEFAULT false,
    "trustAlignment" TEXT DEFAULT 'center',
    "trustBgColor" TEXT DEFAULT '#ffffff',
    "trustBorderColor" TEXT DEFAULT '#e1e3e5',
    "trustBorderRadius" INTEGER DEFAULT 10,
    "trustBorderWidth" INTEGER DEFAULT 1,
    "trustIconColor" TEXT DEFAULT '#2563eb',
    "trustLayout" TEXT DEFAULT 'grid',
    "trustTextColor" TEXT DEFAULT '#1a1a1a',
    "counterFluctuate" BOOLEAN DEFAULT true,
    "counterPulse" BOOLEAN DEFAULT true,
    "counter_loop" BOOLEAN DEFAULT false,
    "counter_once_per_session" BOOLEAN DEFAULT false,
    "promoOnce" BOOLEAN DEFAULT false
);
INSERT INTO "new_Settings" ("backgroundColor", "description", "displayDuration", "id", "initialDelay", "isEnabled", "maxVisitors", "minVisitors", "position", "shop", "showMockData", "showVisitorCount", "textColor", "title") SELECT "backgroundColor", "description", "displayDuration", "id", "initialDelay", "isEnabled", "maxVisitors", "minVisitors", "position", "shop", "showMockData", "showVisitorCount", "textColor", "title" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings_shop_key" ON "Settings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_shop_date_key" ON "Analytics"("shop", "date");

-- CreateIndex
CREATE INDEX "Newsletter_shop_createdAt_idx" ON "Newsletter"("shop", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductView_shop_handle_date_key" ON "ProductView"("shop", "handle", "date");

-- CreateIndex
CREATE INDEX "Session_shop_idx" ON "Session"("shop");
