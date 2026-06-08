import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Server-side in-memory cache to speed up storefront queries and reduce Shopify API rate limit usage
const ordersCache = new Map();
const inventoryCache = new Map();

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.public.appProxy(request);

  if (!admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!session?.shop) {
    return new Response(JSON.stringify({ error: "Session missing" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  let settings = await prisma.settings.findUnique({
    where: { shop: session.shop },
  });

  // Fallback defaults if settings don't exist yet
  const defaultSettings = {
    shop: session.shop,
    title: "Frank Social Proof Sales Popup",
    description: "Recently purchased",
    position: "bottom-left",
    displayDuration: 5000,
    initialDelay: 3000,
    displayGap: 3000,
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    showMockData: true,
    isEnabled: true,
    animationType: "slide-up",
    logoUrl: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
    mockData: JSON.stringify([
      { name: "John", city: "New York", product: "Premium T-Shirt" },
      { name: "Emma", city: "London", product: "Silk Saree" }
    ]),
    showPromoBar: false,
    promoText: "Flash Sale! Get 20% OFF with code: SAVE20",
    promoBgColor: "#1a1a1a",
    promoTextColor: "#ffffff",
    showAnnounce: false,
    announceTitle: "Special Offer!",
    announceText: "Subscribe to our newsletter and get 10% off your first order.",
    announceButtonText: "Claim Offer",
    announceTrigger: "load",
    showCartTimer: false,
    cartTimerMins: 10,
    cartTimerText: "Your cart is reserved for",
    showTrustBadges: false,
    trustStyle: "colored",
    trustBadgesData: JSON.stringify([
      { icon: "truck", text: "Free Shipping" },
      { icon: "shield", text: "Secure Checkout" },
      { icon: "refresh", text: "Money Back Guarantee" }
    ]),
    trustBgColor: "#ffffff",
    trustTextColor: "#1a1a1a",
    trustIconColor: "#2563eb",
    trustBorderColor: "#e1e3e5",
    trustBorderWidth: 1,
    trustBorderRadius: 10,
    trustAlignment: "center",
    trustLayout: "grid",
    sales_pos: "bottom-left",
    sales_bg: "#ffffff",
    sales_text: "#1a1a1a",
    sales_radius: 8,
    sales_shadow: "0 4px 12px rgba(0,0,0,0.1)",
    sales_font: "Inter, sans-serif",
    sales_border_color: "#e1e3e5",
    sales_border_width: 0,
    sales_anim: "slide-up",
    counter_pos: "bottom-right",
    counter_bg: "#ffffff",
    counter_text: "#1a1a1a",
    counter_radius: 50,
    counter_border_width: 0,
    counter_border_color: "#e1e3e5",
    counter_shadow: "0 4px 15px rgba(0,0,0,0.15)",
    counter_font: "Inter, sans-serif",
    counter_delay: 3000,
    counter_duration: 6000,
    counter_gap: 4000,
    counter_anim: "slide-up",
    cart_bg: "#ffffff",
    cart_text: "#ff4d4d",
    cart_pos: "bottom-right",
    cart_radius: 8,
    cart_border_width: 0,
    cart_border_color: "#ff4d4f",
    cart_shadow: "0 4px 12px rgba(0,0,0,0.1)",
    cart_font: "Inter, sans-serif",
    cart_show_progress: true,
    cart_timeout_action: "message",
    promo_pos: "top",
    announce_bg: "#ffffff",
    announce_text: "#1a1a1a",
    announce_pos: "center",
    showExitPopup: false,
    exitTitle: "Wait! Don't go!",
    exitText: "Get 10% off your order if you stay!",
    exit_bg: "#ffffff",
    exit_text: "#1a1a1a",
    exitOnce: true,
    exitButtonText: "Stay with us!",
    exitButtonLink: "",
    exitBtnBgColor: "#1a1a1a",
    exitBtnTextColor: "#ffffff",
    exitWidth: 450,
    exitBorderRadius: 16,
    exitBackdropBlur: true,
    showExitEmailInput: false,
    exitSuccessMessage: "Thank you!",
    showOnMobile: true,
    showOnDesktop: true,
    showHotAlert: false,
    hideNames: false,
    showSoldCount: false,
    labelVerified: "Verified by Frank",
    verifiedColor: "#10b981",
    promoCode: "SAVE20",
    announceBtnBgColor: "#1a1a1a",
    announceBtnTextColor: "#ffffff",
    announceSuccessMessage: "Thank you for subscribing!",
    announceWidth: 450,
    announceBorderRadius: 16,
    announceBackdropBlur: true,
    announceDelay: 3000,
    announceOnce: true
  };

  // Clean up settings from DB to filter out null/undefined values so defaults can take effect
  const cleanSettings = {};
  if (settings) {
    for (const [key, value] of Object.entries(settings)) {
      if (value !== null && value !== undefined) {
        cleanSettings[key] = value;
      }
    }
  }

  // Merge DB settings with defaults so no field is ever empty
  const finalSettings = { 
    ...defaultSettings, 
    ...cleanSettings,
    // Add backward compatibility for existing storefront script
    position: cleanSettings.sales_pos || defaultSettings.sales_pos,
    animationType: cleanSettings.sales_anim || defaultSettings.sales_anim
  };
  
  // Force fallbacks for empty strings specifically
  if (!finalSettings.promoText) finalSettings.promoText = defaultSettings.promoText;
  if (!finalSettings.announceTitle) finalSettings.announceTitle = defaultSettings.announceTitle;
  if (!finalSettings.announceText) finalSettings.announceText = defaultSettings.announceText;
  if (!finalSettings.exitTitle) finalSettings.exitTitle = defaultSettings.exitTitle;
  if (!finalSettings.exitText) finalSettings.exitText = defaultSettings.exitText;

  if (finalSettings.isEnabled === false) {
    return new Response(JSON.stringify({ orders: [], settings: finalSettings, isEnabled: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = new URL(request.url);
  const currentProductHandle = url.searchParams.get("productHandle");

  let orders = [];
  const cacheKeyOrders = session.shop;
  const cachedOrders = ordersCache.get(cacheKeyOrders);
  const CACHE_TTL_ORDERS = 5 * 60 * 1000; // 5 minutes

  if (cachedOrders && (Date.now() - cachedOrders.timestamp < CACHE_TTL_ORDERS)) {
    orders = cachedOrders.orders;
  } else {
    try {
      const response = await admin.graphql(
        `#graphql
        query fetchRecentOrders {
          orders(first: 50, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                createdAt
                customer {
                  firstName
                  defaultAddress { city }
                }
                lineItems(first: 1) {
                  edges {
                    node {
                      title
                      image { url }
                      product { handle }
                    }
                  }
                }
              }
            }
          }
        }`
      );

      const responseJson = await response.json();
      if (responseJson.data?.orders?.edges) {
        orders = responseJson.data.orders.edges.map((edge) => {
          const node = edge.node;
          const product = node.lineItems.edges[0]?.node;
          return {
            id: node.id,
            customerName: node.customer?.firstName || "Someone",
            city: node.customer?.defaultAddress?.city || "somewhere",
            productTitle: product?.title || "a product",
            productImage: product?.image?.url || finalSettings.logoUrl,
            productHandle: product?.product?.handle || "",
            createdAt: node.createdAt,
          };
        });
        
        if (orders.length > 0) {
          ordersCache.set(cacheKeyOrders, { orders, timestamp: Date.now() });
        }
      }
    } catch (e) {
      console.error("Fetch orders error:", e);
    }
  }

  const generateMockOrders = () => {
    let mockList = [];
    try {
      mockList = JSON.parse(finalSettings.mockData || "[]");
    } catch (e) {
      mockList = [];
    }

    if (mockList.length === 0) {
      mockList = JSON.parse(defaultSettings.mockData);
    }

    return mockList.map((item, i) => ({
      id: `mock-${i}-${Math.random()}`,
      customerName: item.name || "Someone",
      city: item.city || "Somewhere",
      productTitle: item.product || "a product",
      productImage: finalSettings.logoUrl,
      productHandle: "", 
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString()
    }));
  };

  if (finalSettings.showSalesPopups === false) {
    orders = [];
  } else if (finalSettings.showMockData || orders.length === 0) {
    const mockOrders = generateMockOrders();
    orders = [...orders, ...mockOrders];
  }

  // Handle Hot Product Alert data
  let productViewCount = 0;
  let totalInventory = 0;
  
  if (currentProductHandle) {
    const cacheKeyInventory = `${session.shop}:${currentProductHandle}`;
    const cachedInventory = inventoryCache.get(cacheKeyInventory);
    const CACHE_TTL_INVENTORY = 2 * 60 * 1000; // 2 minutes

    if (cachedInventory && (Date.now() - cachedInventory.timestamp < CACHE_TTL_INVENTORY)) {
      totalInventory = cachedInventory.totalInventory;
    } else {
      try {
        const prodResponse = await admin.graphql(
          `#graphql
          query fetchProductDetails($handle: String!) {
            product(handle: $handle) {
              totalInventory
            }
          }` ,
          { variables: { handle: currentProductHandle } }
        );
        const prodJson = await prodResponse.json();
        totalInventory = prodJson.data?.product?.totalInventory || 0;
        inventoryCache.set(cacheKeyInventory, { totalInventory, timestamp: Date.now() });
      } catch (e) {
        console.error("Fetch inventory error:", e);
      }
    }

    if (finalSettings.showHotAlert) {
      const today = new Date().toISOString().split('T')[0];
      const viewRecord = await prisma.productView.findUnique({
        where: {
          shop_handle_date: { shop: finalSettings.shop, handle: currentProductHandle, date: today }
        }
      });
      productViewCount = viewRecord?.count || 0;
    }
  }

  // Handle Product Sold Count
  let productSoldCount = 0;
  if (finalSettings.showSoldCount && currentProductHandle) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRealSales = orders.filter(o => 
      o.productHandle === currentProductHandle && 
      new Date(o.createdAt) > oneDayAgo &&
      !o.id.startsWith('mock-')
    ).length;

    productSoldCount = recentRealSales;
    
    // Fallback if no real sales and mock is on
    if (productSoldCount === 0 && finalSettings.showMockData) {
      productSoldCount = Math.floor(Math.random() * 8) + 2;
    }
  }

  // PRIORITIZATION LOGIC:
  // If we are on a product page, move orders for that product to the top
  if (currentProductHandle) {
    const matchingOrders = orders.filter(o => o.productHandle === currentProductHandle);
    const otherOrders = orders.filter(o => o.productHandle !== currentProductHandle);
    
    // Shuffle other orders so they are not always the same after matching ones
    otherOrders.sort(() => Math.random() - 0.5);
    
    orders = [...matchingOrders, ...otherOrders];
  } else {
    // General sorting by date if not on product page
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Generate a visitor count if enabled
  let liveVisitorCount = null;
  if (finalSettings.showVisitorCount) {
    const min = finalSettings.minVisitors || 5;
    const max = finalSettings.maxVisitors || 25;
    liveVisitorCount = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return new Response(JSON.stringify({ 
    orders: orders.slice(0, 20),
    settings: finalSettings,
    isEnabled: finalSettings.isEnabled,
    liveVisitorCount: liveVisitorCount,
    productViewCount: (productViewCount === 0 && finalSettings.showMockData) ? Math.floor(Math.random() * 40) + 10 : productViewCount,
    productSoldCount: productSoldCount,
    totalInventory: currentProductHandle ? totalInventory : (finalSettings.showMockData ? Math.floor(Math.random() * 5) + 2 : 0),
    showOnMobile: finalSettings.showOnMobile ?? true,
    showOnDesktop: finalSettings.showOnDesktop ?? true
  }), {
    headers: { "Content-Type": "application/json" }
  });
};
