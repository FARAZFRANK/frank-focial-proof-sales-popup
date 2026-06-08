(async function() {
  let settings = window.frankSocialProofSettings || {};

  // 1. Fetch settings and data from App Proxy if not loaded
  if (!settings.isEnabled) {
    try {
      const handle = window.frankSocialProofProductHandle || "";
      const cacheKey = "frank_sp_" + handle;
      const cacheTimeKey = cacheKey + "_t";
      const cachedData = sessionStorage.getItem(cacheKey);
      const cachedTime = parseInt(sessionStorage.getItem(cacheTimeKey) || "0");
      const isPreview = window.Shopify?.designMode || 
                        window.location.search.includes("preview_theme_id") || 
                        window.location.search.includes("pb=0") ||
                        window.location.search.includes("shopify-preview");
      const cacheDuration = isPreview ? 0 : 300 * 1000; // 5 minutes (bypass cache in preview / theme editor)

      if (cachedData && (Date.now() - cachedTime < cacheDuration)) {
        const parsed = JSON.parse(cachedData);
        settings = parsed.settings || {};
        settings.mockData = JSON.stringify(parsed.orders || []);
        settings.liveVisitorCount = parsed.liveVisitorCount;
        settings.productViewCount = parsed.productViewCount;
        settings.productSoldCount = parsed.productSoldCount;
        settings.totalInventory = parsed.totalInventory;
        window.frankSocialProofSettings = settings;
      } else {
        const res = await fetch(`/apps/social-proof/orders${handle ? "?productHandle=" + handle : ""}`);
        if (res.ok) {
          const data = await res.json();
          settings = data.settings || {};
          settings.mockData = JSON.stringify(data.orders || []);
          settings.liveVisitorCount = data.liveVisitorCount;
          settings.productViewCount = data.productViewCount;
          settings.productSoldCount = data.productSoldCount;
          settings.totalInventory = data.totalInventory;
          window.frankSocialProofSettings = settings;
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            sessionStorage.setItem(cacheTimeKey, String(Date.now()));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error("Failed to fetch social proof settings:", e);
    }
  }

  if (!settings.isEnabled) return;

  // XSS Sanitizer Helper
  function sanitize(str) {
    if (!str) return "";
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  // 2. Helper to apply container styling based on theme settings
  function applyContainerStyles(element, type) {
    let prefix = "sales";
    if (type === "counter") prefix = "counter";
    if (type === "cart") prefix = "cart";

    const radius = settings[prefix + "_radius"];
    const borderWidth = settings[prefix + "_border_width"];

    element.style.fontFamily = settings[prefix + "_font"] || "Inter, sans-serif";
    element.style.background = settings[prefix + "_bg"] || "#ffffff";
    element.style.color = settings[prefix + "_text"] || "#1a1a1a";
    element.style.borderRadius = `${radius === 0 || radius ? radius : (type === "sales" ? 8 : (type === "counter" ? 50 : 8))}px`;
    element.style.boxShadow = settings[prefix + "_shadow"] === "none" ? "none" : (settings[prefix + "_shadow"] || "0 4px 12px rgba(0,0,0,0.1)");
    element.style.border = `${borderWidth === 0 || borderWidth ? borderWidth : 0}px solid ${settings[prefix + "_border_color"] || "#e1e3e5"}`;
  }

  // 3. Render Sales Popup
  function showSalesPopup() {
    if (!settings.showSalesPopups || document.querySelector(".sales-popup-container")) return;

    const orders = JSON.parse(settings.mockData || "[]");
    if (orders.length === 0) return;

    const order = orders[Math.floor(Math.random() * orders.length)];
    const container = document.createElement("div");
    container.className = `social-proof-container sales-popup-container active ${settings.sales_anim || "slide-up"} ${settings.sales_pos || "bottom-left"}`;
    applyContainerStyles(container, "sales");

    const name = settings.hideNames ? "Someone" : (order.customerName || order.name || "Someone");
    const city = order.city || "Somewhere";
    const product = order.productTitle || order.product || "an item";
    const purchasedLabel = settings.labelPurchased || "Recently purchased";
    const verifiedLabel = settings.labelVerified !== undefined ? settings.labelVerified : "Verified by Frank";
    const verifiedColor = settings.verifiedColor || "#10b981";

    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "14px";
    container.style.padding = "14px 24px";
    container.style.position = "fixed";
    container.style.zIndex = "2147483646";

    const pos = settings.sales_pos || "bottom-left";
    if (pos.includes("top")) {
      container.style.top = "20px";
    } else {
      container.style.bottom = "20px";
    }
    if (pos.includes("left")) {
      container.style.left = "20px";
    } else {
      container.style.right = "20px";
    }
    container.style.width = "auto";
    container.style.maxWidth = "400px";

    // Use sanitization to block XSS
    container.innerHTML = `
      <div style="position:absolute; top:-8px; right:-8px; width:22px; height:22px; background:#ef4444; color:white; border:2px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:10; cursor:pointer;" class="sales-close-btn">&times;</div>
      <div style="width:52px; height:52px; border-radius:10px; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; z-index:1;">
        <img src="${sanitize(order.productImage || settings.logoUrl || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png")}" style="max-width:100%; max-height:100%; object-fit:contain;">
      </div>
      <div style="flex:1;">
        <p style="margin:0; font-size:13px; font-weight:700; font-family:inherit; line-height:1.2;">${sanitize(name)} from ${sanitize(city)}</p>
        <p style="margin:2px 0 0 0; font-size:11px; opacity:0.9; font-family:inherit; line-height:1.2;">${sanitize(purchasedLabel)} ${sanitize(product)}</p>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px solid rgba(0,0,0,0.06);">
          ${verifiedLabel ? `
            <div style="display:flex; align-items:center; gap:4px; font-size:10px; font-weight:600; color:${sanitize(verifiedColor)};">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              <span>${sanitize(verifiedLabel)}</span>
            </div>
          ` : "<div></div>"}
          <span style="font-size:9px; opacity:0.6;">${(() => {
            const times = ["1h ago", "2h ago", "3h ago", "4h ago", "5h ago", "6h ago", "8h ago", "12h ago", "24h ago"];
            return times[Math.floor(Math.random() * times.length)];
          })()}</span>
        </div>
      </div>
    `;

    container.style.cursor = "pointer";
    container.addEventListener("click", (e) => {
      if (e.target.classList.contains("sales-close-btn") || e.target.innerText === "×") {
        container.remove();
        return;
      }
      fetch("/apps/social-proof/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click" })
      }).catch(() => {});
      if (order.productHandle) {
        window.location.href = `/products/${order.productHandle}`;
      }
    });

    document.body.appendChild(container);
  }

  // Loop manager for Sales Popups
  function initSalesPopupsLoop() {
    if (!settings.showSalesPopups) return;
    const initialDelay = settings.initialDelay !== undefined && settings.initialDelay !== null ? parseInt(settings.initialDelay) : 3000;
    
    setTimeout(runLoop, initialDelay);

    function runLoop() {
      if (!settings.showSalesPopups) return;
      showSalesPopup();
      
      const duration = settings.displayDuration !== undefined && settings.displayDuration !== null ? parseInt(settings.displayDuration) : 5000;
      const gap = settings.displayGap !== undefined && settings.displayGap !== null ? parseInt(settings.displayGap) : 3000;

      setTimeout(() => {
        const pop = document.querySelector(".sales-popup-container");
        if (pop) {
          pop.classList.remove("active");
          setTimeout(() => pop.remove(), 400);
        }
        setTimeout(runLoop, gap);
      }, duration);
    }
  }

  // 4. Render Promo Bar
  function showPromoBar() {
    if (!settings.showPromoBar || document.querySelector(".promo-bar") || sessionStorage.getItem("promo_bar_closed") || (settings.promoOnce && sessionStorage.getItem("promo_bar_seen"))) return;

    if (settings.promoOnce) {
      sessionStorage.setItem("promo_bar_seen", "true");
    }

    const bar = document.createElement("div");
    bar.className = "promo-bar";
    const isTop = settings.promo_pos !== "bottom";

    Object.assign(bar.style, {
      position: "fixed",
      [isTop ? "top" : "bottom"]: "0",
      left: "0",
      width: "100%",
      background: settings.promoBgColor || "#1a1a1a",
      color: settings.promoTextColor || "#ffffff",
      padding: "10px 40px",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "12px"
    });

    let html = `
      <div style="display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:nowrap; width:100%;">
        <div style="white-space:nowrap; text-align:center;">${sanitize(settings.promoText)}</div>
    `;

    if (settings.promoCode) {
      html += `
        <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:4px 12px; border-radius:4px; border:1px dashed rgba(255,255,255,0.4); flex-shrink:0;">
          <span style="font-weight:bold; font-family:monospace; letter-spacing:1px;">${sanitize(settings.promoCode)}</span>
          <button class="promo-copy-btn" style="background:white; color:#333; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:bold; box-shadow:0 1px 3px rgba(0,0,0,0.1); flex-shrink:0;">Copy</button>
        </div>
      `;
    }

    html += `
      </div>
      <button class="promo-close-btn" style="position:absolute; right:15px; background:none; border:none; color:inherit; font-size:24px; cursor:pointer; padding:0; line-height:1; opacity:0.8; flex-shrink:0;">&times;</button>
    `;

    bar.innerHTML = html;
    document.body.appendChild(bar);
    document.documentElement.style[isTop ? "marginTop" : "marginBottom"] = bar.offsetHeight + "px";

    const copyBtn = bar.querySelector(".promo-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(settings.promoCode);
        copyBtn.innerText = "Copied!";
        setTimeout(() => copyBtn.innerText = "Copy", 2000);
      });
    }

    const closeBtn = bar.querySelector(".promo-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        bar.remove();
        document.documentElement.style[isTop ? "marginTop" : "marginBottom"] = "0";
        sessionStorage.setItem("promo_bar_closed", "true");
      });
    }
  }

  // 5. Cart Timer logic
  // Broader set of selectors for common Shopify themes (Dawn, Debut, etc.)
  const CART_CHECKOUT_SELECTORS = [
    '[name="checkout"]',
    'form[action="/cart"] button[type="submit"]',
    '.cart__checkout-button',
    '.cart-drawer__footer',
    '.cart__footer',
    'button[name="checkout"]',
    '.cart__ctas',
    '#cart-footer',
    '#CartDrawer-Footer',
    '.cart-drawer__ctas',
    '.drawer__footer',
    '.mini-cart__footer',
    '.side-cart__footer',
    '.ajax-cart__footer',
    '.cart-notification__links',
    '[data-cart-footer]',
    '.cart__blocks'
  ];

  function findCheckoutAnchor() {
    for (const sel of CART_CHECKOUT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  async function checkCartTimer() {
    if (settings.showCartTimer) {
      try {
        const cart = await (await fetch("/cart.js")).json();
        const container = document.querySelector(".cart-timer-container");
        if (cart.item_count === 0) {
          sessionStorage.removeItem("cart_timer_start");
          if (container) container.remove();
          if (window.cartTimerInterval) clearInterval(window.cartTimerInterval);
          if (document.title.startsWith("⚠️ (")) {
            const closeParenIndex = document.title.indexOf(")");
            if (closeParenIndex !== -1) {
              document.title = document.title.substring(closeParenIndex + 1).trim();
            }
          }
          window.originalTabTitle = null;
          return;
        }
        if (!container) renderCartTimer();
      } catch (e) {}
    }
  }

  function renderCartTimer() {
    const pos = settings.cart_pos || "inline";
    const isBar = pos === "top-bar" || pos === "bottom-bar";
    const isInline = pos === "inline";

    const container = document.createElement("div");
    container.className = `social-proof-container cart-timer-container active ${pos}`;
    container.style.zIndex = "2147483645";
    applyContainerStyles(container, "cart");

    if (isBar) {
      Object.assign(container.style, {
        position: "fixed",
        left: "0",
        right: "0",
        width: "100%",
        maxWidth: "none",
        borderRadius: "0",
        padding: "12px 24px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        borderLeft: "none",
        borderRight: "none",
        boxSizing: "border-box"
      });
      if (pos === "top-bar") {
        container.style.top = "0";
        container.style.bottom = "auto";
        container.style.borderTop = "none";
      } else {
        container.style.bottom = "0";
        container.style.top = "auto";
        container.style.borderBottom = "none";
      }
    } else if (isInline) {
      Object.assign(container.style, {
        position: "relative",
        left: "auto",
        right: "auto",
        top: "auto",
        bottom: "auto",
        width: "100%",
        maxWidth: "100%",
        margin: "15px 0",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "12px",
        boxSizing: "border-box"
      });
    } else {
      Object.assign(container.style, {
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "12px"
      });
    }

    const limit = (parseInt(settings.cartTimerMins) || 10) * 60;
    let timerStart = sessionStorage.getItem("cart_timer_start");
    if (!timerStart) {
      timerStart = Date.now().toString();
      sessionStorage.setItem("cart_timer_start", timerStart);
    }

    const startTime = parseInt(timerStart) || Date.now();
    const getSecondsLeft = () => Math.max(0, limit - Math.floor((Date.now() - startTime) / 1000));

    const updateTimer = () => {
      const left = getSecondsLeft();
      if (left <= 0) {
        if (window.cartTimerInterval) clearInterval(window.cartTimerInterval);
        handleTimeout();
        return;
      }
      const mins = Math.floor(left / 60);
      const secs = left % 60;
      const displayStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

      const digits = container.querySelector(".cart-timer-digits");
      if (digits) digits.innerText = displayStr;

      // Update browser tab title to show countdown always if cart timer is active
      const titlePrefix = `⚠️ (${displayStr})`;
      let cleanTitle = document.title;
      if (cleanTitle.startsWith("⚠️ (")) {
        const closeParenIndex = cleanTitle.indexOf(")");
        if (closeParenIndex !== -1) {
          cleanTitle = cleanTitle.substring(closeParenIndex + 1).trim();
        }
      } else {
        window.originalTabTitle = cleanTitle;
      }
      document.title = `${titlePrefix} ${cleanTitle}`;

      const progress = container.querySelector(".cart-timer-progress-inner");
      const percent = (left / limit) * 100;
      if (progress) {
        progress.style.setProperty("width", `${percent}%`, "important");
        if (percent < 20) {
          progress.style.setProperty("background", "#ff4d4f", "important");
        } else if (percent < 50) {
          progress.style.setProperty("background", "#ffa940", "important");
        } else {
          progress.style.setProperty("background", settings.cart_border_color || "#ff4d4f", "important");
        }
      }
      if (left < 120) {
        container.classList.add("cart-pulse");
      }
    };

    const handleTimeout = () => {
      if (document.title.startsWith("⚠️ (")) {
        const closeParenIndex = document.title.indexOf(")");
        if (closeParenIndex !== -1) {
          document.title = document.title.substring(closeParenIndex + 1).trim();
        }
      }
      window.originalTabTitle = null;
      const actionType = settings.cart_timeout_action || "clear";

      // Show a confirmation modal before clearing/redirecting
      const showConfirmModal = (onConfirm) => {
        const overlay = document.createElement("div");
        Object.assign(overlay.style, {
          position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", zIndex: "2147483647",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        });
        overlay.innerHTML = `
          <div style="background:#fff; border-radius:16px; padding:28px 32px; max-width:380px; width:90%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <div style="font-size:36px; margin-bottom:12px;">🛒</div>
            <h3 style="margin:0 0 10px; font-size:18px; font-weight:700; color:#1a1a1a;">Cart Reservation Expired</h3>
            <p style="margin:0 0 24px; font-size:14px; color:#6d7175; line-height:1.5;">Your reserved items have expired. Would you like to clear your cart?</p>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button id="frank-cart-keep" style="flex:1; padding:12px 16px; border:1.5px solid #e1e3e5; border-radius:8px; background:#fff; color:#1a1a1a; font-size:14px; font-weight:600; cursor:pointer;">Keep Cart</button>
              <button id="frank-cart-clear" style="flex:1; padding:12px 16px; border:none; border-radius:8px; background:#e53935; color:#fff; font-size:14px; font-weight:600; cursor:pointer;">Clear Cart</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector("#frank-cart-keep").addEventListener("click", () => {
          overlay.remove();
          sessionStorage.removeItem("cart_timer_start");
        });
        overlay.querySelector("#frank-cart-clear").addEventListener("click", () => {
          overlay.remove();
          onConfirm();
        });
      };

      if (actionType === "clear") {
        container.innerHTML = '<div style="font-weight:700; font-size:13px; text-align:center">🛒 Cart Expired!</div>';
        showConfirmModal(() => {
          fetch("/cart/clear.js").then(() => {
            sessionStorage.removeItem("cart_timer_start");
            window.location.reload();
          });
        });
      } else if (actionType === "redirect") {
        showConfirmModal(() => {
          fetch("/cart/clear.js").then(() => {
            sessionStorage.removeItem("cart_timer_start");
            window.location.href = "/";
          });
        });
      } else {
        sessionStorage.removeItem("cart_timer_start");
        container.innerHTML = '<div style="font-weight:700; font-size:13px; text-align:center">⚠️ Reservation Expired</div>';
      }
    };

    const cartText = settings.cartTimerText || "Items reserved for:";
    const showProgress = settings.cart_show_progress !== false && settings.cart_show_progress !== "false";

    if (isBar) {
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:inherit; text-align:left">
          <div style="display:flex; align-items:center; justify-content:center; color:inherit; width:18px; height:18px; flex-shrink:0">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width:100%; height:100%; fill:currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM10.5 6h-1v5l3.5 2.1.5-.8-3-1.8V6z"/></svg>
          </div>
          <span>${sanitize(cartText)}</span>
          <span class="cart-timer-digits" style="font-size:18px; font-weight:900; font-family:monospace; letter-spacing:1px; line-height:1; margin-left:4px;">--:--</span>
        </div>
        ${showProgress ? `<div class="cart-timer-progress-wrap" style="position:absolute !important; ${pos === "top-bar" ? "bottom" : "top"}:0 !important; left:0 !important; width:100% !important; height:4px !important; background:rgba(255,255,255,0.15) !important; overflow:hidden !important; display:block !important;"><div class="cart-timer-progress-inner" style="display:block !important; width:100% !important; height:100% !important; min-height:4px !important; background:${settings.cart_border_color || "#ff4d4f"} !important; transition: width 1s linear, background 0.4s ease;"></div></div>` : ""}
      `;
    } else {
      const isDarkBg = settings.cart_bg === "#000000" || settings.cart_bg === "#1f2937" || settings.cart_bg === "rgba(0,0,0,1)" || settings.cart_bg === "black";
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; width:100%; text-align:left">
          <div style="background:${isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}; padding:8px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:inherit; flex-shrink:0; width:36px; height:36px; box-sizing:border-box">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width:20px; height:20px; fill:currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM10.5 6h-1v5l3.5 2.1.5-.8-3-1.8V6z"/></svg>
          </div>
          <div style="flex:1; text-align:left">
            <div style="font-size:12px; font-weight:600; opacity:0.85; margin-bottom:2px; color:inherit">${sanitize(cartText)}</div>
            <div class="cart-timer-digits" style="font-size:24px; font-weight:900; font-family:monospace; letter-spacing:1px; line-height:1; color:inherit">--:--</div>
          </div>
        </div>
        ${showProgress ? `<div class="cart-timer-progress-wrap" style="width:100% !important; height:6px !important; background:rgba(255,255,255,0.15) !important; border-radius:3px !important; margin-top:12px !important; overflow:hidden !important; display:block !important; position:relative !important; z-index:1 !important;"><div class="cart-timer-progress-inner" style="display:block !important; width:100% !important; height:100% !important; min-height:6px !important; border-radius:3px !important; background:${settings.cart_border_color || "#ff4d4f"} !important; transition: width 1s linear, background 0.4s ease;"></div></div>` : ""}
      `;
    }

    if (isInline) {
      const checkoutBtn = findCheckoutAnchor();
      if (checkoutBtn) {
        Object.assign(container.style, {
          position: "relative",
          left: "auto",
          right: "auto",
          top: "auto",
          bottom: "auto",
          width: "100%",
          maxWidth: "100%",
          margin: "10px 0 15px 0",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "12px",
          boxSizing: "border-box"
        });
        checkoutBtn.parentNode.insertBefore(container, checkoutBtn);
      } else {
        // Cart drawer not open yet – place as fixed bottom bar for now
        Object.assign(container.style, {
          position: "fixed",
          left: "0",
          right: "0",
          width: "100%",
          maxWidth: "none",
          borderRadius: "0",
          padding: "12px 24px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          borderLeft: "none",
          borderRight: "none",
          boxSizing: "border-box"
        });
        container.style.bottom = "0";
        container.style.top = "auto";
        container.style.borderBottom = "none";
        document.body.appendChild(container);
      }
    } else {
      document.body.appendChild(container);
    }

    updateTimer();
    if (window.cartTimerInterval) clearInterval(window.cartTimerInterval);
    window.cartTimerInterval = setInterval(updateTimer, 1000);
  }

  // 6. Announcement Popup
  function showAnnouncement() {
    if (!settings.showAnnounce || !settings.announceTitle || document.querySelector(".social-proof-announce-popup") || document.querySelector(".social-proof-announce-overlay")) return;

    const pos = settings.announce_pos || "center";
    let overlay = null;
    const popup = document.createElement("div");
    popup.className = "social-proof-announce-popup";

    Object.assign(popup.style, {
      background: settings.announce_bg || "#ffffff",
      color: settings.announce_text || "#202223",
      borderRadius: `${settings.announceBorderRadius ?? 16}px`,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      zIndex: "2147483648",
      transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      overflow: "hidden",
      fontFamily: "Inter, sans-serif",
      width: "calc(100% - 40px)",
      maxWidth: `${settings.announceWidth || 450}px`
    });

    if (pos === "center") {
      overlay = document.createElement("div");
      overlay.className = "social-proof-announce-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        zIndex: "2147483648",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.3s ease",
        opacity: "0"
      });
      if (settings.announceBackdropBlur !== false) {
        overlay.style.backdropFilter = "blur(8px)";
        overlay.style.webkitBackdropFilter = "blur(8px)";
      }
      overlay.appendChild(popup);
      document.body.appendChild(overlay);
      setTimeout(() => overlay.style.opacity = "1", 50);
    } else {
      Object.assign(popup.style, {
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: "0"
      });
      if (pos === "top") {
        popup.style.top = "-500px";
        document.body.appendChild(popup);
        setTimeout(() => {
          popup.style.opacity = "1";
          popup.style.top = "20px";
        }, 50);
      } else {
        popup.style.bottom = "-500px";
        document.body.appendChild(popup);
        setTimeout(() => {
          popup.style.opacity = "1";
          popup.style.bottom = "20px";
        }, 50);
      }
    }

    let html = "";
    if (settings.announceImage) {
      html += `<img src="${sanitize(settings.announceImage)}" style="width:100%; height:180px; object-fit:cover; display:block;" />`;
    }

    const title = settings.announceTitle;
    const announceText = settings.announceText || "";
    const emailSuccessMsg = settings.announceSuccessMessage || "Thank you for subscribing!";

    html += `
      <div style="padding: 24px 30px; text-align: center; position: relative;">
        <span class="announce-close-btn" style="position:absolute; top:12px; right:15px; font-size:24px; cursor:pointer; font-weight:300; line-height:1; opacity:0.6; transition: opacity 0.2s;">&times;</span>
        <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: inherit; line-height: 1.25; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>${sanitize(title)}</span>
          <svg viewBox="0 0 20 20" style="width:20px; height:20px; fill:#f97316; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M8.798 7.992c-.343-.756-1.098-1.242-1.928-1.242-1.173 0-2.119.954-2.119 2.122 0 1.171.95 2.128 2.125 2.128h.858c-.595.51-1.256.924-1.84 1.008-.41.058-.694.438-.635.848.058.41.438.695.848.636 1.11-.158 2.128-.919 2.803-1.53.121-.11.235-.217.341-.322.106.105.22.213.34.322.676.611 1.693 1.372 2.804 1.53.41.059.79-.226.848-.636.059-.41-.226-.79-.636-.848-.583-.084-1.244-.498-1.839-1.008h.858c1.176 0 2.125-.957 2.125-2.128 0-1.168-.946-2.122-2.119-2.122-.83 0-1.585.486-1.928 1.242l-.453.996-.453-.996Zm-.962 1.508h-.96c-.343 0-.625-.28-.625-.628 0-.344.28-.622.619-.622.242 0 .462.142.563.363l.403.887Zm3.79 0h-.96l.403-.887c.1-.221.32-.363.563-.363.34 0 .619.278.619.622 0 .347-.282.628-.625.628Z"/><path fill-rule="evenodd" d="M2.499 6.75c0-1.519 1.231-2.75 2.75-2.75h9.5c1.519 0 2.75 1.231 2.75 2.75v2.945l.002.055c0 .018 0 .037-.002.055v3.445c0 1.519-1.231 2.75-2.75 2.75h-9.5c-1.519 0-2.75-1.231-2.75-2.75v-6.5Zm13.5 2.25h-1.248c-.414 0-.75.336-.75.75s.336.75.75.75h1.248v2.75c0 .69-.56 1.25-1.25 1.25h-4.748v-1c0-.414-.336-.75-.75-.75s-.75.336-.75.75v1h-3.252c-.69 0-1.25-.56-1.25-1.25v-2.792c.292-.102.502-.38.502-.708 0-.327-.21-.606-.502-.708v-2.292c0-.69.56-1.25 1.25-1.25h3.252v.75c0 .414.336.75.75.75s.75-.336.75-.75v-.75h4.748c.69 0 1.25.56 1.25 1.25v2.25Z"/></svg>
        </h2>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 20px; line-height: 1.5; color: inherit;">${sanitize(announceText)}</div>
    `;

    if (settings.showEmailInput) {
      html += `
        <div class="announce-subscribe-wrapper" style="margin-top: 20px;">
          <form class="announce-subscribe-form" style="display:flex; flex-direction:column; gap:8px;">
            <input type="email" placeholder="Enter your email address" required style="padding: 12px 16px; border: 1.5px solid #d2d5d8; border-radius: 8px; font-size: 14px; background: white; color: #1a1a1a; outline: none; width:100%; box-sizing:border-box;" />
            <button type="submit" style="background:${sanitize(settings.announceBtnBgColor || "#1a1a1a")}; color:${sanitize(settings.announceBtnTextColor || "#ffffff")}; border:none; padding:12px 20px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; width:100%; transition: opacity 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">Subscribe</button>
          </form>
          <div class="announce-success-msg" style="display:none; align-items:center; justify-content:center; gap:6px; color:#10b981; font-weight:600; font-size:14px; margin-top:10px;">
            <svg viewBox="0 0 20 20" style="width:16px; height:16px; fill:#10b981; display:inline-block; vertical-align:middle;"><path d="M13.28 9.03a.75.75 0 0 0-1.06-1.06l-2.97 2.97-1.22-1.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.5-3.5Z"/><path fill-rule="evenodd" d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"/></svg> 
            <span>${sanitize(emailSuccessMsg)}</span>
          </div>
        </div>
      `;
    } else if (settings.announceButtonText && settings.announceButtonLink) {
      html += `
        <div style="margin-top: 20px;">
          <a class="announce-action-btn" href="${sanitize(settings.announceButtonLink)}" style="display:inline-block; text-decoration:none; text-align:center; background:${sanitize(settings.announceBtnBgColor || "#1a1a1a")}; color:${sanitize(settings.announceBtnTextColor || "#ffffff")}; padding:12px 30px; border-radius:8px; font-size:14px; font-weight:700; width:100%; box-sizing:border-box; transition: opacity 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">${sanitize(settings.announceButtonText)}</a>
        </div>
      `;
    }

    html += "</div>";
    popup.innerHTML = html;

    const actionBtn = popup.querySelector(".announce-action-btn");
    if (actionBtn) {
      actionBtn.addEventListener("click", () => {
        fetch("/apps/social-proof/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "click" })
        }).catch(() => {});
      });
    }

    const closeBtn = popup.querySelector(".announce-close-btn");
    const closePopup = () => {
      if (pos === "center" && overlay) {
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 300);
      } else {
        popup.style.opacity = "0";
        if (pos === "top") {
          popup.style.top = "-500px";
        } else {
          popup.style.bottom = "-500px";
        }
        setTimeout(() => popup.remove(), 500);
      }
    };

    if (closeBtn) closeBtn.addEventListener("click", closePopup);
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closePopup();
      });
    }

    const form = popup.querySelector(".announce-subscribe-form");
    const successMsg = popup.querySelector(".announce-success-msg");

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = input ? input.value.trim() : "";
        if (!email) return;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert("Please enter a valid email address.");
          return;
        }

        const submitBtn = form.querySelector("button");
        submitBtn.disabled = true;
        submitBtn.innerText = "Subscribing...";

        try {
          const res = await fetch("/apps/social-proof/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
          });
          if (res.ok) {
            form.style.display = "none";
            if (successMsg) successMsg.style.display = "flex";
            setTimeout(closePopup, 2000);
          }
        } catch (err) {
          console.error("Newsletter submission failed:", err);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerText = "Subscribe";
        }
      });
    }
  }

  function initAnnouncement() {
    if (!settings.showAnnounce || !settings.announceTitle) return;
    const once = settings.announceOnce === true || settings.announceOnce === "true";
    if (once && sessionStorage.getItem("announce-shown")) return;

    const trigger = settings.announceTrigger || "load";
    const delay = parseInt(settings.announceDelay) || 0;

    const runTrigger = () => {
      if (once) {
        sessionStorage.setItem("announce-shown", "true");
      }
      showAnnouncement();
    };

    if (trigger === "exit") {
      let triggered = false;
      const onExit = () => {
        if (triggered) return;
        triggered = true;
        document.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("scroll", handleScroll);
        runTrigger();
      };
      const handleMouseLeave = (e) => {
        if (e.clientY < 0) onExit();
      };
      let lastScrollY = window.scrollY;
      const handleScroll = () => {
        const current = window.scrollY;
        if (lastScrollY - current > 20 && current < 50) {
          onExit();
        }
        lastScrollY = current;
      };
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      if (delay > 0) {
        setTimeout(runTrigger, delay);
      } else {
        runTrigger();
      }
    }
  }

  // 7. Get SVG Icon for trust badges
  function getTrustIconSvg(icon, style, customColor) {
    const defaultColors = {
      truck: "#f59e0b",
      shield: "#2563eb",
      star: "#fbbf24",
      lock: "#10b981",
      refresh: "#8b5cf6",
      "credit-card": "#6366f1",
      headset: "#0d9488",
      award: "#f43f5e",
      heart: "#ef4444",
      "thumbs-up": "#3b82f6"
    };

    const color = style === "monochrome" ? "currentColor" : (customColor || defaultColors[icon] || "currentColor");

    const paths = {
      truck: `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path d="M2 4.5A1.5 1.5 0 013.5 3h9a1.5 1.5 0 011.5 1.5V5h2.75a.75.75 0 01.75.75v7a.75.75 0 01-.75.75h-.35a2.5 2.5 0 01-4.8 0h-3.4a2.5 2.5 0 01-4.8 0H2.75A.75.75 0 012 12.75V4.5zm12.5 4.5V6H14v3h.5zM4.5 13a1 1 0 100-2 1 1 0 000 2zm11 0a1 1 0 100-2 1 1 0 000 2z" /></svg>`,
      shield: `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M10 1.944A11.94 11.94 0 012.166 5c.136 5.227 2.186 9.49 7.834 13.056 5.648-3.565 7.698-7.829 7.834-13.056A11.942 11.942 0 0110 1.944zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>`,
      star: `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`,
      lock: `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>`,
      refresh: `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /></svg>`,
      "credit-card": `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM5 12a1 1 0 110-2 1 1 0 010 2zm3-1a1 1 0 100 2h3a1 1 0 100-2H8z" /></svg>`,
      headset: `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0-2.2-1.8-4-4-4H8a4 4 0 00-4 4v1a2 2 0 002 2h1a2 2 0 002-2V9a2 2 0 00-2-2H6.5c.3-1.4 1.5-2.5 3-2.5s2.7 1.1 3 2.5H12a2 2 0 00-2 2v2a2 2 0 002 2h1a2 2 0 002-2v-1z" clip-rule="evenodd" /></svg>`,
      award: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><circle cx="12" cy="8" r="7" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /></svg>`,
      heart: `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>`,
      "thumbs-up": `<svg viewBox="0 0 20 20" fill="${color}" style="width:20px; height:20px; display:inline-block; vertical-align:middle;"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 8.4a2 2 0 00-.8 1.933z" /></svg>`
    };

    return paths[icon] || "";
  }

  // 8. Render Trust Badges
  function showTrustBadges() {
    if (!settings.showTrustBadges || document.querySelector(".frank-trust-badges-wrapper")) return;

    const form = document.querySelector('form[action*="/cart/add"]') || document.querySelector(".product-form");
    if (!form) return;

    const wrapper = document.createElement("div");
    wrapper.className = "frank-trust-badges-wrapper";
    wrapper.style.marginTop = "24px";
    wrapper.style.marginBottom = "24px";
    wrapper.style.display = "flex";
    wrapper.style.flexWrap = "wrap";
    wrapper.style.gap = "10px";
    wrapper.style.width = "100%";

    const align = settings.trustAlignment || "center";
    if (align === "center") {
      wrapper.style.justifyContent = "center";
    } else if (align === "right") {
      wrapper.style.justifyContent = "flex-end";
    } else {
      wrapper.style.justifyContent = "flex-start";
    }

    const layout = settings.trustLayout || "grid";
    if (layout === "horizontal") {
      wrapper.style.flexDirection = "row";
    }

    const items = JSON.parse(settings.trustBadgesData || "[]");
    const bgColor = settings.trustBgColor || "#ffffff";
    const textColor = settings.trustTextColor || "#1a1a1a";
    const iconColor = settings.trustIconColor || textColor;
    const borderColor = settings.trustBorderColor || "#e1e3e5";
    const borderWidth = settings.trustBorderWidth !== undefined ? parseInt(settings.trustBorderWidth) : 1;
    const borderRadius = settings.trustBorderRadius !== undefined ? parseInt(settings.trustBorderRadius) : 10;

    wrapper.innerHTML = items.map(item => {
      const svg = getTrustIconSvg(item.icon, settings.trustStyle, iconColor);
      if (layout === "inline") {
        return `
          <div class="frank-trust-badge" style="display:flex; align-items:center; font-weight:600; font-size:13px; color:${sanitize(textColor)}; gap:6px; transition: transform 0.2s ease, filter 0.2s ease; cursor: pointer;">
            ${svg}
            <span style="vertical-align:middle;">${sanitize(item.text)}</span>
          </div>
        `;
      } else {
        return `
          <div class="frank-trust-badge" style="display:flex; align-items:center; padding:10px 15px; background:${sanitize(bgColor)}; border:${borderWidth}px solid ${sanitize(borderColor)}; border-radius:${borderRadius}px; font-weight:600; font-size:13px; color:${sanitize(textColor)}; gap:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease; cursor: pointer;">
            ${svg}
            <span style="vertical-align:middle;">${sanitize(item.text)}</span>
          </div>
        `;
      }
    }).join("");

    if (!document.getElementById("frank-trust-badges-styles")) {
      const style = document.createElement("style");
      style.id = "frank-trust-badges-styles";
      style.innerHTML = `
        .frank-trust-badge {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, filter 0.2s ease !important;
        }
        .frank-trust-badge:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important;
          filter: brightness(1.04);
        }
      `;
      document.head.appendChild(style);
    }

    form.parentNode.insertBefore(wrapper, form.nextSibling);
  }

  // 9. Exit Intent Popup
  function initExitPopup() {
    if (!settings.showExitPopup) return;
    const once = settings.exitOnce === true || settings.exitOnce === "true";
    if (once && sessionStorage.getItem("exit-shown")) return;

    let triggered = false;

    function trigger() {
      if (triggered || (once && sessionStorage.getItem("exit-shown"))) return;
      triggered = true;
      if (once) {
        sessionStorage.setItem("exit-shown", "true");
      }

      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);

      const overlay = document.createElement("div");
      overlay.className = "social-proof-exit-overlay";
      const blur = settings.exitBackdropBlur !== false && settings.exitBackdropBlur !== "false";

      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: blur ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.8)",
        zIndex: "2147483647",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        opacity: "0",
        transition: "opacity 0.3s ease"
      });

      if (blur) {
        overlay.style.backdropFilter = "blur(8px)";
        overlay.style.webkitBackdropFilter = "blur(8px)";
      }

      const popup = document.createElement("div");
      popup.className = "social-proof-exit-popup";
      const radius = settings.exitBorderRadius ?? 16;
      const width = settings.exitWidth || 450;

      Object.assign(popup.style, {
        background: settings.exit_bg || "#ffffff",
        color: settings.exit_text || "#1a1a1a",
        padding: "40px",
        borderRadius: `${radius}px`,
        textAlign: "center",
        maxWidth: "90%",
        width: `${width}px`,
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        position: "relative",
        transform: "scale(0.9)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      });

      const closeBtn = document.createElement("div");
      closeBtn.innerHTML = "&times;";
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "12px",
        right: "18px",
        fontSize: "24px",
        fontWeight: "bold",
        cursor: "pointer",
        opacity: "0.6",
        transition: "opacity 0.2s",
        color: "inherit"
      });

      const closeExitPopup = () => {
        overlay.style.opacity = "0";
        popup.style.transform = "scale(0.9)";
        setTimeout(() => overlay.remove(), 300);
      };

      closeBtn.onclick = closeExitPopup;
      closeBtn.onmouseenter = () => closeBtn.style.opacity = "1";
      closeBtn.onmouseleave = () => closeBtn.style.opacity = "0.6";
      popup.appendChild(closeBtn);

      const title = settings.exitTitle || "Wait! Don't go!";
      const h2 = document.createElement("h2");
      h2.innerHTML = `<span>${sanitize(title)}</span><svg viewBox="0 0 20 20" style="width:20px; height:20px; fill:#f97316; display:inline-block; vertical-align:middle; margin-left:8px;"><path fill-rule="evenodd" d="M8.798 7.992c-.343-.756-1.098-1.242-1.928-1.242-1.173 0-2.119.954-2.119 2.122 0 1.171.95 2.128 2.125 2.128h.858c-.595.51-1.256.924-1.84 1.008-.41.058-.694.438-.635.848.058.41.438.695.848.636 1.11-.158 2.128-.919 2.803-1.53.121-.11.235-.217.341-.322.106.105.22.213.34.322.676.611 1.693 1.372 2.804 1.53.41.059.79-.226.848-.636.059-.41-.226-.79-.636-.848-.583-.084-1.244-.498-1.839-1.008h.858c1.176 0 2.125-.957 2.125-2.128 0-1.168-.946-2.122-2.119-2.122-.83 0-1.585.486-1.928 1.242l-.453.996-.453-.996Zm-.962 1.508h-.96c-.343 0-.625-.28-.625-.628 0-.344.28-.622.619-.622.242 0 .462.142.563.363l.403.887Zm3.79 0h-.96l.403-.887c.1-.221.32-.363.563-.363.34 0 .619.278.619.622 0 .347-.282.628-.625.628Z"/><path fill-rule="evenodd" d="M2.499 6.75c0-1.519 1.231-2.75 2.75-2.75h9.5c1.519 0 2.75 1.231 2.75 2.75v2.945l.002.055c0 .018 0 .037-.002.055v3.445c0 1.519-1.231 2.75-2.75 2.75h-9.5c-1.519 0-2.75-1.231-2.75-2.75v-6.5Zm13.5 2.25h-1.248c-.414 0-.75.336-.75.75s.336.75.75.75h1.248v2.75c0 .69-.56 1.25-1.25 1.25h-4.748v-1c0-.414-.336-.75-.75-.75s-.75.336-.75.75v1h-3.252c-.69 0-1.25-.56-1.25-1.25v-2.792c.292-.102.502-.38.502-.708 0-.327-.21-.606-.502-.708v-2.292c0-.69.56-1.25 1.25-1.25h3.252v.75c0 .414.336.75.75.75s.75-.336.75-.75v-.75h4.748c.69 0 1.25.56 1.25 1.25v2.25Z"/></svg>`;
      Object.assign(h2.style, {
        margin: "0 0 12px 0",
        fontSize: "22px",
        fontWeight: "800",
        lineHeight: "1.3",
        color: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      });
      popup.appendChild(h2);

      const exitText = settings.exitText || "Get 10% off your order if you stay!";
      const pText = document.createElement("div");
      pText.innerHTML = sanitize(exitText);
      Object.assign(pText.style, {
        margin: "0 0 24px 0",
        fontSize: "15px",
        lineHeight: "1.5",
        opacity: "0.9",
        color: "inherit"
      });
      popup.appendChild(pText);

      const emailInput = settings.showExitEmailInput === true || settings.showExitEmailInput === "true";
      const successMsgText = settings.exitSuccessMessage || "Thank you!";

      if (emailInput) {
        const wrap = document.createElement("div");
        wrap.style.marginTop = "20px";
        const form = document.createElement("form");
        form.style.cssText = "display:flex; flex-direction:column; gap:8px;";

        const email = document.createElement("input");
        email.type = "email";
        email.placeholder = "Enter your email address";
        email.required = true;
        Object.assign(email.style, {
          padding: "12px 16px",
          border: "1.5px solid #d2d5d8",
          borderRadius: "8px",
          fontSize: "14px",
          background: "white",
          color: "#1a1a1a",
          outline: "none",
          width: "100%",
          boxSizing: "border-box"
        });
        form.appendChild(email);

        const subBtn = document.createElement("button");
        subBtn.type = "submit";
        subBtn.innerText = "Subscribe";
        const btnBg = settings.exitBtnBgColor || "#1a1a1a";
        const btnText = settings.exitBtnTextColor || "#ffffff";
        Object.assign(subBtn.style, {
          background: btnBg,
          color: btnText,
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "700",
          cursor: "pointer",
          width: "100%",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          transition: "opacity 0.2s"
        });
        form.appendChild(subBtn);
        wrap.appendChild(form);

        const success = document.createElement("div");
        success.innerHTML = `<svg viewBox="0 0 20 20" style="width:16px; height:16px; fill:#10b981; display:inline-block; vertical-align:middle; margin-right:6px;"><path d="M13.28 9.03a.75.75 0 0 0-1.06-1.06l-2.97 2.97-1.22-1.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.5-3.5Z"/><path fill-rule="evenodd" d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"/></svg><span>${sanitize(successMsgText)}</span>`;
        Object.assign(success.style, {
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          color: "#10b981",
          fontWeight: "600",
          fontSize: "14px",
          marginTop: "10px"
        });
        wrap.appendChild(success);

        form.onsubmit = async (e) => {
          e.preventDefault();
          const emailVal = email.value.trim();
          if (emailVal) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
              alert("Please enter a valid email address.");
              return;
            }
            subBtn.disabled = true;
            subBtn.innerText = "Subscribing...";
            try {
              const res = await fetch("/apps/social-proof/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailVal })
              });
              if (res.ok) {
                form.style.display = "none";
                success.style.display = "flex";
                setTimeout(closeExitPopup, 2e3);
              }
            } catch (err) {
              console.error("Newsletter submission failed:", err);
            } finally {
              subBtn.disabled = false;
              subBtn.innerText = "Subscribe";
            }
          }
        };

        popup.appendChild(wrap);
      } else {
        const actionBtn = document.createElement("button");
        const exitBtnText = settings.exitButtonText || "Stay with us!";
        actionBtn.innerHTML = `<span>${sanitize(exitBtnText)}</span><svg viewBox="0 0 20 20" style="width:16px; height:16px; fill:currentColor; display:inline-block; vertical-align:middle; margin-left:6px;"><path fill-rule="evenodd" d="M8.798 7.992c-.343-.756-1.098-1.242-1.928-1.242-1.173 0-2.119.954-2.119 2.122 0 1.171.95 2.128 2.125 2.128h.858c-.595.51-1.256.924-1.84 1.008-.41.058-.694.438-.635.848.058.41.438.695.848.636 1.11-.158 2.128-.919 2.803-1.53.121-.11.235-.217.341-.322.106.105.22.213.34.322.676.611 1.693 1.372 2.804 1.53.41.059.79-.226.848-.636.059-.41-.226-.79-.636-.848-.583-.084-1.244-.498-1.839-1.008h.858c1.176 0 2.125-.957 2.125-2.128 0-1.168-.946-2.122-2.119-2.122-.83 0-1.585.486-1.928 1.242l-.453.996-.453-.996Zm-.962 1.508h-.96c-.343 0-.625-.28-.625-.628 0-.344.28-.622.619-.622.242 0 .462.142.563.363l.403.887Zm3.79 0h-.96l.403-.887c.1-.221.32-.363.563-.363.34 0 .619.278.619.622 0 .347-.282.628-.625.628Z"/><path fill-rule="evenodd" d="M2.499 6.75c0-1.519 1.231-2.75 2.75-2.75h9.5c1.519 0 2.75 1.231 2.75 2.75v2.945l.002.055c0 .018 0 .037-.002.055v3.445c0 1.519-1.231 2.75-2.75 2.75h-9.5c-1.519 0-2.75-1.231-2.75-2.75v-6.5Zm13.5 2.25h-1.248c-.414 0-.75.336-.75.75s.336.75.75.75h1.248v2.75c0 .69-.56 1.25-1.25 1.25h-4.748v-1c0-.414-.336-.75-.75-.75s-.75.336-.75.75v1h-3.252c-.69 0-1.25-.56-1.25-1.25v-2.792c.292-.102.502-.38.502-.708 0-.327-.21-.606-.502-.708v-2.292c0-.69.56-1.25 1.25-1.25h3.252v.75c0 .414.336.75.75.75s.75-.336.75-.75v-.75h4.748c.69 0 1.25.56 1.25 1.25v2.25Z"/></svg>`;
        const btnBg = settings.exitBtnBgColor || "#1a1a1a";
        const btnText = settings.exitBtnTextColor || "#ffffff";
        Object.assign(actionBtn.style, {
          width: "100%",
          padding: "12px 24px",
          background: btnBg,
          color: btnText,
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "opacity 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        });
        actionBtn.onclick = () => {
          fetch("/apps/social-proof/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "click" })
          }).catch(() => {});
          if (settings.exitButtonLink) {
            window.location.href = settings.exitButtonLink;
          } else {
            closeExitPopup();
          }
        };
        popup.appendChild(actionBtn);
      }

      overlay.appendChild(popup);
      document.body.appendChild(overlay);
      setTimeout(() => {
        overlay.style.opacity = "1";
        popup.style.transform = "scale(1)";
      }, 50);
    }

    const handleMouseLeave = (e) => {
      if (e.clientY < 0) trigger();
    };

    let lastScroll = window.scrollY;
    let throttleTimeout = null;

    function handleScroll() {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        const current = window.scrollY;
        if (lastScroll - current > 20 && current < 50) {
          trigger();
        }
        lastScroll = current;
      }, 150);
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  // 10. Render Live Visitor count
  function showLiveVisitors() {
    if (!settings.showVisitorCount || document.querySelector(".social-proof-visitor-container")) return;

    if (settings.counterPulse && !document.getElementById("social-proof-dynamic-styles")) {
      const style = document.createElement("style");
      style.id = "social-proof-dynamic-styles";
      style.innerHTML = `
        @keyframes socialProofPulseGreen {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .social-proof-pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          animation: socialProofPulseGreen 2s infinite;
          flex-shrink: 0;
        }
      `;
      document.head.appendChild(style);
    }

    const pos = settings.counter_pos || "bottom-right";
    const container = document.createElement("div");
    container.className = "social-proof-visitor-container";

    const item = document.createElement("div");
    item.className = "social-proof-counter-item";
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "8px";
    item.style.padding = "10px 15px";
    item.style.transition = "opacity 0.5s ease-in-out";
    applyContainerStyles(item, "counter");

    const cacheKey = `frank_social_proof_visitors_${window.location.pathname}`;
    const cachedCount = sessionStorage.getItem(cacheKey);

    let visitors = cachedCount ? parseInt(cachedCount) : (Math.floor(Math.random() * (settings.maxVisitors - settings.minVisitors + 1)) + settings.minVisitors);
    if (visitors < settings.minVisitors) visitors = settings.minVisitors;
    if (visitors > settings.maxVisitors) visitors = settings.maxVisitors;
    sessionStorage.setItem(cacheKey, visitors);

    const updateLabel = (count) => {
      const dot = settings.counterPulse ? '<span class="social-proof-pulse-dot" style="margin-right: 4px;"></span>' : '<svg viewBox="0 0 20 20" fill="currentColor" width="18"><path d="M10 4C5.5 4 2 10 2 10C2 10 5.5 16 10 16C14.5 16 18 10 18 10C18 10 14.5 4 10 4ZM10 14C7.79 14 6 12.21 6 10C6 7.79 7.79 6 10 6C12.21 6 14 7.79 14 10C14 12.21 12.21 14 10 14ZM10 8C8.9 8 8 8.9 8 10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8Z"/></svg>';
      const visitorsText = settings.labelVisitors || "visitors viewing now";
      
      const countSpan = item.querySelector(".visitor-count-number");
      if (countSpan) {
        countSpan.innerText = count;
      } else {
        item.innerHTML = `<span style="display:flex; align-items:center;">${dot}</span><span style="font-weight:700;"><span class="visitor-count-number" style="transition: opacity 0.3s ease-in-out;">${count}</span> ${sanitize(visitorsText)}</span>`;
      }
    };

    updateLabel(visitors);
    container.appendChild(item);

    if (pos === "inline") {
      const form = document.querySelector('form[action*="/cart/add"]') || document.querySelector(".product-form");
      if (!form) return;
      container.style.marginTop = "15px";
      container.style.marginBottom = "15px";
      container.style.display = "inline-block";
      form.parentNode.insertBefore(container, form.nextSibling);
    } else {
      container.style.position = "fixed";
      container.style.zIndex = "2147483640";
      if (pos.includes("top")) {
        container.style.top = "20px";
      } else {
        container.style.bottom = "20px";
      }
      if (pos.includes("left")) {
        container.style.left = "20px";
      } else {
        container.style.right = "20px";
      }
      document.body.appendChild(container);
    }

    if (settings.counter_once_per_session) {
      sessionStorage.setItem("frank_social_proof_visitor_seen", "true");
    }

    function fluctuationLoop() {
      const delay = Math.floor(Math.random() * 8000) + 7000;
      setTimeout(() => {
        if (!container.parentNode) return;
        const countSpan = item.querySelector(".visitor-count-number");
        if (countSpan) countSpan.style.opacity = "0";

        setTimeout(() => {
          if (!container.parentNode) return;
          let delta = Math.floor(Math.random() * 5) - 2;
          if (delta === 0) delta = Math.random() > 0.5 ? 1 : -1;
          visitors += delta;

          if (visitors < settings.minVisitors) visitors = settings.minVisitors;
          if (visitors > settings.maxVisitors) visitors = settings.maxVisitors;

          sessionStorage.setItem(cacheKey, visitors);
          updateLabel(visitors);

          const countSpan2 = item.querySelector(".visitor-count-number");
          if (countSpan2) countSpan2.style.opacity = "1";
          fluctuationLoop();
        }, 300);
      }, delay);
    }

    if (settings.counterFluctuate) {
      fluctuationLoop();
    }
  }

  // Loop manager for live visitors
  function initLiveVisitors() {
    if (!settings.showVisitorCount || (settings.counter_once_per_session && sessionStorage.getItem("frank_social_proof_visitor_seen") === "true")) return;
    const delay = settings.counter_delay !== undefined && settings.counter_delay !== null ? parseInt(settings.counter_delay) : 3000;

    if (settings.counter_loop) {
      setTimeout(runLoop, delay);
    } else {
      setTimeout(() => { showLiveVisitors(); }, delay);
    }

    function runLoop() {
      if (!settings.showVisitorCount || (settings.counter_once_per_session && sessionStorage.getItem("frank_social_proof_visitor_seen") === "true")) return;
      showLiveVisitors();

      const duration = settings.counter_duration !== undefined && settings.counter_duration !== null ? parseInt(settings.counter_duration) : 6000;
      const gap = settings.counter_gap !== undefined && settings.counter_gap !== null ? parseInt(settings.counter_gap) : 4000;

      setTimeout(() => {
        const con = document.querySelector(".social-proof-visitor-container");
        if (con) {
          con.style.opacity = "0";
          setTimeout(() => con.remove(), 500);
        }
        setTimeout(runLoop, gap);
      }, duration);
    }
  }

  // 11. Render Scarcity / Hot Alert / Inventory counters
  function showScarcityCounters() {
    if (document.querySelector(".social-proof-counters-container")) return;

    const form = document.querySelector('form[action*="/cart/add"]') || document.querySelector(".product-form");
    if (!form || (!settings.showSoldCount && !settings.showHotAlert && !settings.showInventory)) return;

    const container = document.createElement("div");
    container.className = "social-proof-counters-container";
    Object.assign(container.style, {
      marginTop: "15px",
      marginBottom: "15px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "12px 16px",
      background: "#ffffff",
      border: "1px solid #e1e3e5",
      borderRadius: "8px",
      fontFamily: settings.counter_font || "Inter, sans-serif",
      fontSize: "13px",
      color: "#374151",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    });

    const segments = [];

    // Hot Alert
    if (settings.showHotAlert) {
      const viewsCount = settings.productViewCount || Math.floor(Math.random() * 80) + 40;
      const viewsText = settings.labelViews24h || "views in the last 24 hours";
      const label = `${viewsCount} ${viewsText}`;
      segments.push(`
        <span style="display:inline-flex; align-items:center; gap:6px;">
          <svg viewBox="0 0 20 20" style="width:16px; height:16px; fill:#f97316; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M14.452 3.5h.096c.182 0 .371 0 .543.034a1.75 1.75 0 0 1 1.375 1.375c.035.172.034.361.034.543v9.096c0 .182 0 .371-.034.543a1.75 1.75 0 0 1-1.375 1.376 2.825 2.825 0 0 1-.543.033h-.096c-.182 0-.371 0-.543-.034a1.75 1.75 0 0 1-1.375-1.375 2.825 2.825 0 0 1-.034-.543v-9.096c0-.182 0-.371.034-.543a1.75 1.75 0 0 1 1.375-1.375c.172-.035.361-.034.543-.034Zm-.253 1.505a.25.25 0 0 0-.194.194l-.003.053a8.046 8.046 0 0 0-.002.248v9c0 .121 0 .194.002.248l.003.053a.25.25 0 0 0 .194.194l.053.003c.055.002.127.002.248.002s.193 0 .248-.002l.053-.003a.25.25 0 0 0 .194-.194l.003-.053a8.05 8.05 0 0 0 .002-.248v-9a8.046 8.046 0 0 0-.005-.3.25.25 0 0 0-.194-.195 8.217 8.217 0 0 0-.3-.005 8.221 8.221 0 0 0-.302.005ZM5.452 9h.096c.182 0 .371 0 .543.034a1.75 1.75 0 0 1 1.375 1.375c.035.172.034.361.034.543v3.596c0 .182 0 .371-.034.543a1.75 1.75 0 0 1-1.375 1.376 2.825 2.825 0 0 1-.543.033h-.096c-.182 0-.371 0-.543-.034a1.75 1.75 0 0 1-1.375-1.375 2.824 2.824 0 0 1-.034-.543v-3.596c0-.182 0-.371.034-.543a1.75 1.75 0 0 1 1.375-1.375c.172-.035.361-.034.543-.034Zm-.253 1.505a.25.25 0 0 0-.194.194 8.217 8.217 0 0 0-.005.3v3.501a8.221 8.221 0 0 0 .005.3.25.25 0 0 0 .194.195l.053.003c.055.002.127.002.248.002s.193 0 .248-.002l.053-.003a.25.25 0 0 0 .194-.194l.003-.053c.002-.054.002-.127.002-.248v-3.5a8.208 8.208 0 0 0-.005-.3.25.25 0 0 0-.194-.195 8.045 8.045 0 0 0-.3-.005 8.045 8.045 0 0 0-.302.005ZM10 6h-.048c-.182 0-.371 0-.543.034a1.75 1.75 0 0 0-1.375 1.375 2.824 2.824 0 0 0-.034.543v6.596c0 .182 0 .371.034.543a1.75 1.75 0 0 0 1.375 1.376c.172.034.361.033.543.033h.096c.182 0 .371 0 .543-.034a1.75 1.75 0 0 0 1.375-1.375c.035-.172.034-.36.034-.543v-6.596c0-.182 0-.371-.034-.543a1.75 1.75 0 0 0-1.375-1.375c-.172-.035-.361-.034-.543-.034h-.048Zm-.495 1.7a.25.25 0 0 1 .194-.195 8.216 8.216 0 0 1 .3-.005 8.217 8.217 0 0 1 .302.005.25.25 0 0 1 .194.194l.003.053c.002.055.002.127.002.248v6.5a8.05 8.05 0 0 1-.005.3.25.25 0 0 1-.194.195l-.053.003a8.046 8.046 0 0 1-.248.002c-.121 0-.193 0-.248-.002l-.053-.003a.25.25 0 0 1-.194-.194 8.221 8.221 0 0 1-.005-.3v-6.5a8.217 8.217 0 0 1 .005-.302v.002-.002Z"/></svg>
          <span style="font-weight:600;">${sanitize(label)}</span>
        </span>
      `);
    }

    // Sold Count
    if (settings.showSoldCount) {
      const soldQty = settings.productSoldCount || Math.floor(Math.random() * 10) + 5;
      const itemsSoldText = settings.labelItemsSold || "items sold in the last 24 hours";
      const label = `${soldQty} ${itemsSoldText}`;
      segments.push(`
        <span style="display:inline-flex; align-items:center; gap:6px;">
          <svg viewBox="0 0 20 20" style="width:16px; height:16px; fill:#3b82f6; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M2.5 3.75a.75.75 0 0 1 .75-.75h1.612a1.75 1.75 0 0 1 1.732 1.5h9.656a.75.75 0 0 1 .748.808l-.358 4.653a2.75 2.75 0 0 1-2.742 2.539h-6.351l.093.78a.25.75 0 0 0 .248.22h6.362a.75.75 0 0 1 0 1.5h-6.362a1.75 1.75 0 0 1-1.738-1.543l-1.04-8.737a.25.25 0 0 0-.248-.22h-1.612a.75.75 0 0 1-.75-.75Zm4.868 7.25h6.53a1.25 1.25 0 0 0 1.246-1.154l.296-3.846h-8.667l.595 5Z"/><path d="M10 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/><path d="M15 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>
          <span style="font-weight:600;">${sanitize(label)}</span>
        </span>
      `);
    }

    // Inventory
    if (settings.showInventory) {
      let stock = settings.totalInventory;
      const threshold = parseInt(settings.inventoryThreshold) || 10;
      let shouldShow = false;

      if (stock != null) {
        if (stock > 0 && stock <= threshold) shouldShow = true;
      } else if (settings.showMockData) {
        stock = Math.floor(Math.random() * (threshold - 1)) + 2;
        shouldShow = true;
      }

      if (shouldShow) {
        const textPattern = settings.inventoryText || "Hurry! Only {stock} left in stock!";
        const label = textPattern.replace("{stock}", String(stock));
        segments.push(`
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <svg viewBox="0 0 20 20" style="width:16px; height:16px; fill:#ef4444; display:inline-block; vertical-align:middle;"><path fill-rule="evenodd" d="M7 9a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4Zm.5 3.5v-2h3v2h-3Z"/><path fill-rule="evenodd" d="M5.315 4.45a2.25 2.25 0 0 1 1.836-.95h5.796a2.25 2.25 0 0 1 1.872 1.002l1.22 1.828c.3.452.461.983.461 1.526v6.894a1.75 1.75 0 0 1-1.75 1.75h-9.5a1.75 1.75 0 0 1-1.75-1.75v-6.863c0-.57.177-1.125.506-1.59l1.309-1.848Zm1.836.55a.75.75 0 0 0-.612.316l-.839 1.184h3.55v-1.5h-2.1Zm3.599 1.5h3.599l-.778-1.166a.75.75 0 0 0-.624-.334h-2.197v1.5Zm4.25 1.5h-10v6.75c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25v-6.75Z"/></svg>
            <span style="font-weight:700; color:#ef4444;">${sanitize(label)}</span>
          </span>
        `);
      }
    }

    container.innerHTML = segments.join('<span style="color: #d1d5db; user-select: none;">|</span>');
    form.parentNode.insertBefore(container, form.nextSibling);
  }

  // 12. Hook cart action functions (fetch & XHR) to update cart timer
  function hookCartEvents() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const res = await originalFetch.apply(this, args);
      const url = args[0];
      if (url && typeof url === "string") {
        if (url.includes("/cart/add") || url.includes("/cart/change") || url.includes("/cart/clear") || url.includes("/cart/update")) {
          setTimeout(checkCartTimer, 1000);
        }
      }
      return res;
    };

    const originalSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function(...args) {
      this.addEventListener("load", function() {
        const url = this.responseURL;
        if (url && (url.includes("/cart/add") || url.includes("/cart/change") || url.includes("/cart/clear") || url.includes("/cart/update"))) {
          setTimeout(checkCartTimer, 1000);
        }
      });
      return originalSend.apply(this, args);
    };
  }

  // 12b. Observe DOM for cart drawer appearing (e.g. when user opens it after page load)
  function observeCartDrawer() {
    if (!settings.showCartTimer) return;
    const pos = settings.cart_pos || "inline";
    if (pos !== "inline") return; // Only needed for inline mode

    let debounceTimer = null;

    const observer = new MutationObserver(() => {
      // Debounce to avoid excessive checks
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const existing = document.querySelector(".cart-timer-container");
        if (!existing) {
          // Timer not rendered yet – try to render it
          checkCartTimer();
          return;
        }

        // Timer exists but might be in the wrong place (fixed bar instead of inline)
        const isCurrentlyFixed = existing.style.position === "fixed";
        if (isCurrentlyFixed) {
          const anchor = findCheckoutAnchor();
          if (anchor) {
            // Move timer from fixed bottom bar into the cart drawer inline
            Object.assign(existing.style, {
              position: "relative",
              left: "auto",
              right: "auto",
              top: "auto",
              bottom: "auto",
              width: "100%",
              maxWidth: "100%",
              margin: "10px 0 15px 0",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: "12px",
              boxSizing: "border-box",
              borderRadius: `${settings.cart_radius === 0 || settings.cart_radius ? settings.cart_radius : 8}px`,
              borderLeft: "",
              borderRight: "",
              borderBottom: ""
            });
            anchor.parentNode.insertBefore(existing, anchor);
          }
        }
      }, 300);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 13. Initialize App Storefront script
  function init() {
    if (settings.isEnabled) {
      // Track Page Impression
      fetch("/apps/social-proof/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "impression" })
      }).catch(() => {});

      const productHandle = window.frankSocialProofProductHandle || "";
      if (productHandle) {
        fetch("/apps/social-proof/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "impression", handle: productHandle })
        }).catch(() => {});
      }
    }

    if (settings.showPromoBar) showPromoBar();
    if (settings.showCartTimer) {
      checkCartTimer();
      hookCartEvents();
      // Watch for cart drawer opening so we can re-place the timer inline
      observeCartDrawer();
    }
    if (settings.showAnnounce) initAnnouncement();
    if (settings.showTrustBadges) showTrustBadges();
    if (settings.showExitPopup) initExitPopup();
    if (settings.showVisitorCount) initLiveVisitors();
    if (settings.showHotAlert || settings.showSoldCount || settings.showInventory) showScarcityCounters();
    if (settings.showSalesPopups) initSalesPopupsLoop();
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init);
  }
})();
