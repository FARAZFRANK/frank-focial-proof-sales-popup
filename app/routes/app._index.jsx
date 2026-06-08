import { useLoaderData, Link, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { 
  Page, 
  Text, 
  Grid, 
  BlockStack, 
  InlineStack, 
  Badge, 
  Icon
} from "@shopify/polaris";
import {
  CartIcon,
  ViewIcon,
  PackageIcon,
  CalendarIcon,
  GiftCardIcon,
  MagicIcon,
  EmailIcon,
  SettingsIcon,
  ChartPopularIcon,
  GaugeIcon,
  ShieldCheckMarkIcon,
  AppsIcon
} from "@shopify/polaris-icons";

// Cache embed status (isEmbedEnabled + extensionId) per shop — 10 second TTL
const embedStatusCache = new Map();
const EMBED_CACHE_TTL_MS = 10 * 1000;

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  let isEmbedEnabled = false;
  let extensionId = "ea691a59-47df-b6e4-81b5-35e318b96494c9523f59"; // Fallback to dev UUID

  const cachedEmbed = embedStatusCache.get(shop);
  if (cachedEmbed && (Date.now() - cachedEmbed.timestamp < EMBED_CACHE_TTL_MS)) {
    isEmbedEnabled = cachedEmbed.isEmbedEnabled;
    extensionId = cachedEmbed.extensionId;
  } else {
    try {
      const response = await admin.graphql(
        `#graphql
        query GetMainThemeSettingsInWelcome {
          themes(first: 10) {
            nodes {
              id
              role
              files(filenames: ["config/settings_data.json"]) {
                nodes {
                  body {
                    ... on OnlineStoreThemeFileBodyText {
                      content
                    }
                  }
                }
              }
            }
          }
        }`
      );
      const resJson = await response.json();
      const themes = resJson.data?.themes?.nodes || [];

      // Scan all themes to detect the extension UUID dynamically
      for (const theme of themes) {
        const content = theme.files?.nodes?.[0]?.body?.content;
        if (content) {
          try {
            const jsonStart = content.indexOf('{');
            const cleaned = jsonStart !== -1 ? content.slice(jsonStart) : content;
            const parsed = JSON.parse(cleaned);
            const blocks = parsed.current?.blocks || {};
            for (const block of Object.values(blocks)) {
              if (typeof block.type === "string" && block.type.includes("/blocks/social_proof")) {
                const parts = block.type.split("/");
                const uuid = parts[parts.length - 1];
                if (uuid && uuid.length > 20) {
                  extensionId = uuid;
                  break;
                }
              }
            }
          } catch (e) {}
        }
      }

      const mainTheme = themes.find((t) => t.role?.toUpperCase() === "MAIN");
      const fileNode = mainTheme?.files?.nodes?.[0];
      const fileContent = fileNode?.body?.content;
      if (fileContent) {
        const jsonStart = fileContent.indexOf('{');
        const cleanedContent = jsonStart !== -1 ? fileContent.slice(jsonStart) : fileContent;
        const settingsData = JSON.parse(cleanedContent);
        const blocks = settingsData.current?.blocks || {};
        isEmbedEnabled = Object.values(blocks).some((block) => {
          const isTypeMatch = typeof block.type === "string" &&
                              block.type.includes("/blocks/social_proof");
          const isEnabled = block.disabled !== true;
          return isTypeMatch && isEnabled;
        });
      }

      embedStatusCache.set(shop, { isEmbedEnabled, extensionId, timestamp: Date.now() });
    } catch (err) {
      console.error("Failed to check app embed status in welcome page:", err);
      isEmbedEnabled = true; // Fallback to true if API fails
    }
  }

  if (process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID) {
    extensionId = process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID;
  }

  const shopName = shop.replace(".myshopify.com", "");
  const embedActivateUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&activateAppId=${extensionId}/social_proof`;

  // Fetch saved settings for the merchant to configure custom visual previews
  let settings = await prisma.settings.findUnique({
    where: { shop },
  });

  const defaultMockData = [
    { name: "Emma", city: "New York, US", product: "Wireless Headphones" },
    { name: "Sophie", city: "Amsterdam, NL", product: "Leather Backpack" }
  ];

  if (!settings) {
    settings = {
      title: "Frank Social Proof Sales Popup",
      description: "Recently purchased",
      position: "bottom-left",
      displayDuration: 5000,
      backgroundColor: "#ffffff",
      textColor: "#1a1a1a",
      showMockData: false,
      showVisitorCount: false,
      isEnabled: true,
      mockData: JSON.stringify(defaultMockData),
      logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23008060'%3E%3Cpath fill-rule='evenodd' d='M16.403 4.57a.75.75 0 01.127 1.053l-7 9a.75.75 0 01-1.128.05l-3.5-4a.75.75 0 111.104-1.023l2.892 3.305 6.452-8.295a.75.75 0 011.053-.127z' clip-rule='evenodd' /%3E%3C/svg%3E",
      animationType: "slide-up",
      showOnMobile: true,
      showOnDesktop: true,
      showHotAlert: false,
      initialDelay: 3000,
      displayGap: 3000,
      labelVerified: "Verified by Frank",
      verifiedColor: "#10b981",
      labelPurchased: "Recently purchased",
      labelSomeoneIn: "Someone in",
      labelVisitors: "visitors active on this page",
      labelViews24h: "views in the last 24 hours",
      labelTrending: "Trending Now",
      showOnPages: "all",
      hideNames: false,
      labelFrom: "from",
      showSoldCount: false,
      labelItemsSold: "items sold in the last 24 hours",
      showPromoBar: false,
      promoText: "Flash Sale! Get 20% OFF with code: SAVE20",
      promoCode: "SAVE20",
      promoLink: "",
      promoBgColor: "#1a1a1a",
      promoTextColor: "#ffffff",
      showAnnounce: false,
      announceTitle: "Special Offer!",
      announceText: "Subscribe to our newsletter and get 10% off your first order.",
      announceButtonText: "Claim Offer",
      announceButtonLink: "/collections/all",
      announceImage: "",
      announceTrigger: "load",
      announceBtnBgColor: "#1a1a1a",
      announceBtnTextColor: "#ffffff",
      announceSuccessMessage: "Thank you for subscribing!",
      announceWidth: 450,
      announceBorderRadius: 16,
      announceBackdropBlur: true,
      announceDelay: 3000,
      showCartTimer: false,
      cartTimerMins: 10,
      cartTimerText: "Your cart is reserved for",
      showEmailInput: false,
      showInventory: false,
      inventoryThreshold: 10,
      inventoryText: "Hurry! Only {stock} left in stock!",
      announceOnce: true,
      promoOnce: false,
      showTrustBadges: false,
      trustStyle: "colored",
      trustBadgesData: JSON.stringify([
        { icon: "truck", text: "Free Shipping" },
        { icon: "shield", text: "Secure Checkout" },
        { icon: "refresh", text: "Money Back Guarantee" }
      ]),
      sales_pos: "bottom-left",
      sales_bg: "#ffffff",
      sales_text: "#1a1a1a",
      sales_anim: "slide-up",
      sales_radius: 8,
      sales_shadow: "0 4px 12px rgba(0,0,0,0.1)",
      sales_font: "Inter, sans-serif",
      sales_border_color: "#e1e3e5",
      sales_border_width: 0,
      showSalesPopups: true,
      counter_pos: "bottom-right",
      counter_bg: "#ffffff",
      counter_text: "#1a1a1a",
      counter_radius: 50,
      counter_border_color: "#e1e3e5",
      counter_border_width: 1,
      counter_shadow: "0 2px 8px rgba(0,0,0,0.05)",
      counter_anim: "slide-up",
      counter_font: "Inter, sans-serif",
      counter_delay: 3000,
      counter_duration: 6000,
      counter_gap: 4000,
      counterPulse: true,
      counterFluctuate: true,
      counter_once_per_session: false,
      counter_loop: false,
      cart_bg: "#fef2f2",
      cart_text: "#991b1b",
      cart_radius: 8,
      cart_border_width: 1,
      cart_border_color: "#fee2e2",
      cart_shadow: "0 2px 8px rgba(0,0,0,0.05)",
      cart_font: "'Outfit', sans-serif",
      cart_pos: "inline",
      cart_show_progress: true,
      cart_timeout_action: "message",
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
      promo_pos: "top",
      announce_bg: "#ffffff",
      announce_text: "#1a1a1a",
      announce_pos: "center"
    };
  }

  return { isEmbedEnabled, embedActivateUrl, settings };
};

const getPreviewIcon = (iconName, themeMode, customColor) => {
  const colors = {
    'truck': '#f59e0b',
    'shield': '#2563eb',
    'star': '#fbbf24',
    'lock': '#10b981',
    'refresh': '#8b5cf6',
    'credit-card': '#6366f1',
    'headset': '#0d9488',
    'award': '#f43f5e',
    'heart': '#ef4444',
    'thumbs-up': '#3b82f6'
  };

  const color = themeMode === 'monochrome' ? (customColor || '#1a1a1a') : (colors[iconName] || '#2563eb');

  switch (iconName) {
    case 'truck':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path d="M2 4.5A1.5 1.5 0 013.5 3h9a1.5 1.5 0 011.5 1.5V5h2.75a.75.75 0 01.75.75v7a.75.75 0 01-.75.75h-.35a2.5 2.5 0 01-4.8 0h-3.4a2.5 2.5 0 01-4.8 0H2.75A.75.75 0 012 12.75V4.5zm12.5 4.5V6H14v3h.5zM4.5 13a1 1 0 100-2 1 1 0 000 2zm11 0a1 1 0 100-2 1 1 0 000 2z" /></svg>;
    case 'shield':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path fillRule="evenodd" d="M10 1.944A11.94 11.94 0 012.166 5c.136 5.227 2.186 9.49 7.834 13.056 5.648-3.565 7.698-7.829 7.834-13.056A11.942 11.942 0 0110 1.944zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
    case 'star':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
    case 'lock':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
    case 'refresh':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
    case 'credit-card':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM5 12a1 1 0 110-2 1 1 0 010 2zm3-1a1 1 0 100 2h3a1 1 0 100-2H8z" /></svg>;
    case 'headset':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0-2.2-1.8-4-4-4H8a4 4 0 00-4 4v1a2 2 0 002 2h1a2 2 0 002-2V9a2 2 0 00-2-2H6.5c.3-1.4 1.5-2.5 3-2.5s2.7 1.1 3 2.5H12a2 2 0 00-2 2v2a2 2 0 002 2h1a2 2 0 002-2v-1z" clipRule="evenodd" /></svg>;
    case 'award':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5.414l3.707-3.707a1 1 0 0 0-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L9 12.586z" clipRule="evenodd" /></svg>;
    case 'heart':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
    case 'thumbs-up':
      return <svg viewBox="0 0 20 20" fill={color} width="18" height="18"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 8.4a2 2 0 00-.8 1.933z" /></svg>;
    default:
      return null;
  }
};

export default function Welcome() {
  const { isEmbedEnabled, embedActivateUrl, settings } = useLoaderData();
  const [searchParams] = useSearchParams();
  const searchStr = searchParams.toString();
  const searchString = searchStr ? `?${searchStr}` : "";

  // Destructure variables from settings with fallback values matching settings page
  const {
    sales_bg = "#ffffff",
    sales_text = "#1a1a1a",
    sales_border_color = "#e2e8f0",
    sales_border_width = 0,
    sales_radius = 8,
    sales_shadow = "0 4px 12px rgba(0,0,0,0.1)",
    sales_font = "Inter, sans-serif",
    verifiedColor = "#10b981",
    labelVerified = "Verified by Frank",
    labelPurchased = "Recently purchased",
    logoUrl = "",
    hideNames = false,

    counter_bg = "#ffffff",
    counter_text = "#1a1a1a",
    counter_border_color = "#e1e3e5",
    counter_border_width = 1,
    counter_radius = 50,
    counter_shadow = "0 2px 8px rgba(0,0,0,0.05)",
    counter_font = "Inter, sans-serif",
    counterPulse = true,
    labelVisitors = "visitors active on this page",

    labelViews24h = "views in the last 24 hours",
    labelItemsSold = "items sold in the last 24 hours",
    inventoryText = "Hurry! Only {stock} left in stock!",

    cart_bg = "#fef2f2",
    cart_text = "#991b1b",
    cart_border_width = 1,
    cart_border_color = "#fee2e2",
    cart_radius = 8,
    cart_shadow = "0 2px 8px rgba(0,0,0,0.05)",
    cart_font = "'Outfit', sans-serif",
    cartTimerText = "Your cart is reserved for",
    cartTimerMins = 10,
    cart_show_progress = true,

    promoBgColor = "#1a1a1a",
    promoTextColor = "#ffffff",
    promoText = "Flash Sale! Get 20% OFF with code: SAVE20",
    promoCode = "SAVE20",

    announce_bg = "#ffffff",
    announce_text = "#1a1a1a",
    announceTitle = "Special Offer!",
    announceText = "Subscribe to our newsletter and get 10% off your first order.",
    announceButtonText = "Claim Offer",
    announceBtnBgColor = "#1a1a1a",
    announceBtnTextColor = "#ffffff",
    announceBorderRadius = 16,
    announceImage = "",

    exit_bg = "#ffffff",
    exit_text = "#1a1a1a",
    exitTitle = "Wait! Don't go!",
    exitText = "Get 10% off your order if you stay!",
    exitButtonText = "Stay with us!",
    exitBtnBgColor = "#1a1a1a",
    exitBtnTextColor = "#ffffff",
    exitBorderRadius = 16,
    showExitEmailInput = false,

    trustBgColor = "#ffffff",
    trustTextColor = "#1a1a1a",
    trustIconColor = "#2563eb",
    trustBorderColor = "#e1e3e5",
    trustBorderRadius = 10,
    trustBorderWidth = 1,
    trustLayout = "grid",
    trustAlignment = "center",
    trustStyle = "colored",
    trustBadgesData = "[]"
  } = settings;

  // Parse trust badges
  let parsedBadges = [];
  try {
    parsedBadges = JSON.parse(trustBadgesData);
  } catch (e) {}

  if (!parsedBadges || parsedBadges.length === 0) {
    parsedBadges = [
      { icon: "truck", text: "Free Shipping" },
      { icon: "shield", text: "Secure Checkout" },
      { icon: "refresh", text: "Money Back Guarantee" }
    ];
  }

  const CAMPAIGNS_LIST = [
    {
      id: "sales-popups",
      label: "Sales Popups",
      icon: CartIcon,
      description: "Display recent purchase popups on your store to build instant shopper trust.",
      preview: (
        <div 
          className="live-sales-popup"
          style={{
            background: sales_bg,
            color: sales_text,
            border: `${sales_border_width}px solid ${sales_border_color}`,
            borderRadius: `${sales_radius}px`,
            boxShadow: sales_shadow === 'none' ? 'none' : sales_shadow,
            fontFamily: sales_font || "inherit",
          }}
        >
          <div 
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img src={logoUrl || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', fontFamily: 'inherit', lineHeight: '1.2' }}>
              {hideNames ? "Someone" : "Emma"} from New York, US
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.9, fontFamily: 'inherit', lineHeight: '1.2' }}>
              {labelPurchased} Wireless Headphones
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {labelVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '600', color: verifiedColor }}>
                  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5.414l3.707-3.707a1 1 0 0 0-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L9 12.586z" clipRule="evenodd" /></svg>
                  <span>{labelVerified}</span>
                </div>
              )}
              <span style={{ fontSize: '9px', opacity: 0.6 }}>1h ago</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "counters",
      label: "Live Counters",
      icon: ViewIcon,
      description: "Show real-time active visitor counts to create urgency and a busy-store feel.",
      preview: (
        <div 
          className="live-sales-popup"
          style={{
            background: counter_bg,
            color: counter_text,
            border: `${counter_border_width}px solid ${counter_border_color}`,
            borderRadius: `${counter_radius}px`,
            boxShadow: counter_shadow === 'none' ? 'none' : counter_shadow,
            fontFamily: counter_font || "inherit",
            maxWidth: "280px",
            justifyContent: "center",
            gap: "10px"
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'inherit' }}>
            {counterPulse ? (
              <span className="pulse-dot"></span>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" style={{ fill: 'currentColor' }}><path d="M10 4C5.5 4 2 10 2 10C2 10 5.5 16 10 16C14.5 16 18 10 18 10C18 10 14.5 4 10 4ZM10 14C7.79 14 6 12.21 6 10C6 7.79 7.79 6 10 6C12.21 6 14 7.79 14 10C14 12.21 12.21 14 10 14ZM10 8C8.9 8 8 8.9 8 10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8Z"/></svg>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', fontFamily: 'inherit' }}>
            14 {labelVisitors}
          </p>
        </div>
      )
    },
    {
      id: "product-scarcity",
      label: "Product Scarcity",
      icon: PackageIcon,
      description: "Show page views, recent orders count, and remaining stock to drive fast buy actions.",
      preview: (
        <div 
          className="float-preview"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '340px',
            padding: '12px 16px',
            background: '#ffffff',
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#374151',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', color: '#f97316', width: '18px', height: '18px' }}>
              <Icon source={ChartPopularIcon} />
            </span>
            <span style={{ fontWeight: '600' }}>124 {labelViews24h}</span>
          </span>
          <span style={{ color: '#d1d5db', userSelect: 'none' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', color: '#3b82f6', width: '18px', height: '18px' }}>
              <Icon source={CartIcon} />
            </span>
            <span style={{ fontWeight: '600' }}>8 {labelItemsSold}</span>
          </span>
          <span style={{ color: '#d1d5db', userSelect: 'none' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', color: '#ef4444', width: '18px', height: '18px' }}>
              <Icon source={PackageIcon} />
            </span>
            <span style={{ fontWeight: '700', color: '#ef4444' }}>{inventoryText.replace('{stock}', '5')}</span>
          </span>
        </div>
      )
    },
    {
      id: "cart-timer",
      label: "Cart Urgency",
      icon: CalendarIcon,
      description: "Remind customers of cart reservation time to reduce cart abandonment.",
      preview: (
        <div 
          className="float-preview"
          style={{ 
            background: cart_bg, 
            color: cart_text, 
            border: `${cart_border_width}px solid ${cart_border_color}`, 
            borderRadius: `${cart_radius}px`,
            boxShadow: cart_shadow === 'none' ? 'none' : cart_shadow,
            fontFamily: cart_font,
            width: '100%', 
            maxWidth: '300px',
            padding: '12px 16px',
            overflow: 'hidden',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left' }}>
            <div style={{
              background: cart_bg === '#000000' || cart_bg === '#1f2937' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit',
              flexShrink: 0
            }}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" style={{ fill: 'currentColor' }}>
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM10.5 6h-1v5l3.5 2.1.5-.8-3-1.8V6z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.85, marginBottom: '2px', color: 'inherit' }}>{cartTimerText}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '1px', lineHeight: 1, color: 'inherit' }}>
                {cartTimerMins.toString().padStart(2, '0')}:00
              </div>
            </div>
          </div>
          {cart_show_progress && (
            <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `75%`, 
                height: '100%', 
                background: cart_border_color, 
                borderRadius: '3px'
              }}></div>
            </div>
          )}
        </div>
      )
    },
    {
      id: "promo-bar",
      label: "Promotion Bar",
      icon: GiftCardIcon,
      description: "Sticky bar to announce discounts, free shipping thresholds, or seasonal deals.",
      preview: (
        <div 
          className="float-preview"
          style={{
            width: '100%',
            maxWidth: '460px',
          background: promoBgColor,
          color: promoTextColor,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          position: 'relative',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
            <div dangerouslySetInnerHTML={{ __html: promoText }} style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.4' }} />
            {promoCode && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.12)', padding: '4px 10px', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.4)', flexShrink: 0 }}>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px', fontSize: '12px' }}>{promoCode}</span>
                <button style={{ background: 'white', color: '#1a1a1a', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'default', fontWeight: 'bold', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexShrink: 0 }}>Copy</button>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: "announcement",
      label: "Announcements",
      icon: MagicIcon,
      description: "Engage store visitors with premium rich-media banner announcements.",
      preview: (
        <div 
          className="float-preview"
          style={{
            background: announce_bg,
          color: announce_text,
          border: 'none',
          width: '100%',
          maxWidth: '320px',
          flexDirection: 'column',
          textAlign: 'center',
          padding: 0,
          borderRadius: `${announceBorderRadius}px`,
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          {announceImage && (
            <img src={announceImage} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} alt="" />
          )}
          <div style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '700', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>{announceTitle || "Announcement Title"}</span>
            </h3>
            <div dangerouslySetInnerHTML={{ __html: announceText }} style={{ fontSize: '12px', opacity: 0.9, marginBottom: '16px', lineHeight: '1.4', color: 'inherit' }} />
            {announceButtonText && (
              <button type="button" style={{ background: announceBtnBgColor, color: announceBtnTextColor, border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'default', width: '100%' }}>{announceButtonText}</button>
            )}
          </div>
        </div>
      )
    },
    {
      id: "exit-popup",
      label: "Exit Intent Popup",
      icon: EmailIcon,
      description: "Detect when a user is about to leave and show a high-converting lead capture coupon.",
      preview: (
        <div 
          className="float-preview"
          style={{ 
            background: exit_bg, 
          color: exit_text, 
          border: 'none', 
          width: '100%', 
          maxWidth: '320px',
          flexDirection: 'column', 
          textAlign: 'center', 
          padding: '20px', 
          borderRadius: `${exitBorderRadius}px`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span>{exitTitle}</span>
          </h3>
          <div dangerouslySetInnerHTML={{ __html: exitText }} style={{ margin: '0 0 16px 0', fontSize: '13px', opacity: 0.85, lineHeight: '1.4', color: 'inherit' }} />
          {showExitEmailInput ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <input type="email" placeholder="Enter your email" disabled style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', width: '100%', boxSizing: 'border-box', background: '#f8fafc' }} />
              <button type="button" style={{ background: exitBtnBgColor, color: exitBtnTextColor, border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'default', width: '100%' }}>{exitButtonText || "Subscribe"}</button>
            </div>
          ) : (
            <button style={{ 
              width: '100%', 
              padding: '10px', 
              background: exitBtnBgColor, 
              color: exitBtnTextColor, 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              fontSize: '13px',
              cursor: 'default'
            }}>
              {exitButtonText || "Stay with us!"}
            </button>
          )}
        </div>
      )
    },
    {
      id: "trust-badges",
      label: "Trust Badges",
      icon: SettingsIcon,
      description: "Reassure shoppers by showing standard trust checkout indicators.",
      preview: (
        <div 
          className="float-preview"
          style={{ 
            width: '100%', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          justifyContent: trustAlignment === 'center' ? 'center' : (trustAlignment === 'right' ? 'flex-end' : 'flex-start')
        }}>
          {parsedBadges.map((badge, i) => {
            const isInline = trustLayout === 'inline';
            return (
              <div key={i} style={isInline ? {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '800',
                color: trustTextColor
              } : {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: trustBgColor,
                border: `${trustBorderWidth}px solid ${trustBorderColor}`,
                borderRadius: `${trustBorderRadius}px`,
                fontSize: '12px',
                fontWeight: '800',
                color: trustTextColor,
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {getPreviewIcon(badge.icon, trustStyle, trustIconColor)}
                </div>
                <span style={{ verticalAlign: 'middle' }}>{badge.text}</span>
              </div>
            );
          })}
        </div>
      )
    }
  ];

  return (
    <Page fullWidth>
      {/* Custom Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .welcome-hero-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #311042 100%);
          border-radius: 16px;
          padding: 48px;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          margin-bottom: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .welcome-hero-banner::after {
          content: "";
          position: absolute;
          top: -50%;
          right: -20%;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%);
          pointer-events: none;
        }
        .welcome-hero-banner::before {
          content: "";
          position: absolute;
          bottom: -40%;
          left: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%);
          pointer-events: none;
        }
        .welcome-badge-glow {
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
          border: 1px solid rgba(16, 185, 129, 0.5);
          animation: pulse-glow-green 2s infinite alternate;
        }
        .welcome-badge-glow-warn {
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
          border: 1px solid rgba(245, 158, 11, 0.5);
          animation: pulse-glow-warn 2s infinite alternate;
        }
        @keyframes pulse-glow-green {
          0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
          100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.7); }
        }
        @keyframes pulse-glow-warn {
          0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.3); }
          100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.7); }
        }
        .step-number {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
        }
        .onboarding-card {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          cursor: pointer;
        }
        .onboarding-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.08);
          border-color: #6366f1;
        }
        .campaign-showcase-row {
          display: flex;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
        }
        .campaign-showcase-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.06);
          border-color: #cbd5e1;
        }
        .campaign-showcase-info {
          width: 40%;
          padding: 28px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .campaign-showcase-preview-box {
          width: 60%;
          padding: 36px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafb;
          position: relative;
          overflow: hidden;
          min-height: 180px;
        }
        .campaign-showcase-preview-box::before {
          content: "LIVE STOREFRONT PREVIEW";
          position: absolute;
          top: 14px;
          left: 14px;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }
        @media (max-width: 768px) {
          .campaign-showcase-row {
            flex-direction: column;
          }
          .campaign-showcase-info {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          .campaign-showcase-preview-box {
            width: 100%;
          }
        }
        .live-sales-popup {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 22px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 340px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          animation: float-popup 3s ease-in-out infinite;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .float-preview {
          animation: float-popup 3s ease-in-out infinite;
          transition: all 0.3s ease;
        }
        @keyframes float-popup {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .pulse-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px #10b981;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .feature-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .feature-card:hover {
          border-color: #cbd5e1;
          transform: scale(1.01);
        }
        .quick-action-btn-custom {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white !important;
          border: none;
          padding: 10px 20px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        .quick-action-btn-custom:hover {
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }
        .editor-btn-custom {
          background: #10b981;
          color: white !important;
          border: none;
          padding: 10px 20px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .editor-btn-custom:hover {
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }
      ` }} />

      <BlockStack gap="600">
        
        {/* Welcome Premium Hero Banner */}
        <div className="welcome-hero-banner">
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8 }}>
              <BlockStack gap="400">
                <InlineStack gap="200" align="start">
                  <Badge tone="attention">Version 2.0 Live</Badge>
                  {isEmbedEnabled ? (
                    <div className="welcome-badge-glow" style={{ borderRadius: '20px', display: 'inline-flex' }}>
                      <Badge tone="success">Store Widget Active</Badge>
                    </div>
                  ) : (
                    <div className="welcome-badge-glow-warn" style={{ borderRadius: '20px', display: 'inline-flex' }}>
                      <Badge tone="warning">Widget Embed Off</Badge>
                    </div>
                  )}
                </InlineStack>
                <Text variant="heading3xl" as="h1" fontWeight="bold">
                  Frank Social Proof Sales Popup
                </Text>
                <Text variant="bodyLg" as="p" style={{ opacity: 0.95, maxWidth: '600px', lineHeight: '1.6' }}>
                  Boost conversions, validate trust, and show real-time shopper activity. Engage your visitors the second they land on your store!
                </Text>
                <div style={{ marginTop: '12px' }}>
                  {isEmbedEnabled ? (
                    <Link to={`/app/settings${searchString}`} className="quick-action-btn-custom">
                      Configure Popups Now
                    </Link>
                  ) : (
                    <a href={embedActivateUrl} target="_top" className="editor-btn-custom">
                      Enable in Theme Editor
                    </a>
                  )}
                </div>
              </BlockStack>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
              {/* Pulsing floating UI badge */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  borderRadius: '100px',
                  padding: '24px 36px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <span style={{ display: 'inline-flex', color: '#ffb300', width: '32px', height: '32px' }}>
                      <Icon source={MagicIcon} />
                    </span>
                  </div>
                  <Text variant="headingMd" as="h3" color="white" fontWeight="bold">
                    +24% Sales
                  </Text>
                  <Text variant="bodySm" as="p" color="white" style={{ opacity: 0.8 }}>
                    Average merchant conversion lift
                  </Text>
                </div>
              </div>
            </Grid.Cell>
          </Grid>
        </div>

        {/* 3-Step Onboarding Journey */}
        <BlockStack gap="300">
          <Text variant="headingLg" as="h2" fontWeight="bold">
            Your Launch Checklist
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Complete these 3 simple steps to start showing social proof alerts on your store.
          </Text>
          
          <Grid>
            {/* Step 1 */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
              <div className="onboarding-card" style={{ padding: '24px', height: '100%' }}>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <span className="step-number">1</span>
                    {isEmbedEnabled ? (
                      <Badge tone="success">Completed</Badge>
                    ) : (
                      <Badge tone="attention">Action Needed</Badge>
                    )}
                  </InlineStack>
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h3" fontWeight="bold">
                      Enable App Embed
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Turn on the Frank widget script in your active Shopify theme editor to display notifications.
                    </Text>
                  </BlockStack>
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    {isEmbedEnabled ? (
                      <span style={{ color: '#8c9196', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Widget is Active ✓
                      </span>
                    ) : (
                      <a 
                        href={embedActivateUrl} 
                        target="_top" 
                        style={{ 
                          color: '#4f46e5', 
                          fontWeight: '600', 
                          fontSize: '14px', 
                          textDecoration: 'none', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px' 
                        }}
                      >
                        Enable in Theme Editor ➔
                      </a>
                    )}
                  </div>
                </BlockStack>
              </div>
            </Grid.Cell>

            {/* Step 2 */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
              <div className="onboarding-card" style={{ padding: '24px', height: '100%' }}>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <span className="step-number">2</span>
                    <Badge tone="info">Customize</Badge>
                  </InlineStack>
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h3" fontWeight="bold">
                      Configure Design
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Change popup colors, custom layouts, delays, timers, and upload custom notification icons.
                    </Text>
                  </BlockStack>
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <Link 
                      to={`/app/settings${searchString}`} 
                      style={{ 
                        color: '#4f46e5', 
                        fontWeight: '600', 
                        fontSize: '14px', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}
                    >
                      Go to Settings ➔
                    </Link>
                  </div>
                </BlockStack>
              </div>
            </Grid.Cell>

            {/* Step 3 */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
              <div className="onboarding-card" style={{ padding: '24px', height: '100%' }}>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <span className="step-number">3</span>
                    <Badge tone="info">Live Stats</Badge>
                  </InlineStack>
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h3" fontWeight="bold">
                      Track Conversions
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Watch impressions and click conversion metrics on our analytics dashboard live.
                    </Text>
                  </BlockStack>
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <Link 
                      to={`/app/analytics${searchString}`} 
                      style={{ 
                        color: '#4f46e5', 
                        fontWeight: '600', 
                        fontSize: '14px', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}
                    >
                      View Analytics Dashboard ➔
                    </Link>
                  </div>
                </BlockStack>
              </div>
            </Grid.Cell>
          </Grid>
        </BlockStack>

        {/* Live Campaign Previews Showcase List */}
        <BlockStack gap="400">
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <span style={{ display: 'inline-flex', color: '#1c1c1c', width: '22px', height: '22px' }}>
                <Icon source={AppsIcon} />
              </span>
              <Text variant="headingLg" as="h2" fontWeight="bold">
                Live Campaigns & Widgets Preview
              </Text>
            </InlineStack>
            <Text variant="bodyMd" as="p" tone="subdued">
              Check out all the conversion booster widgets that you can activate and customize inside settings.
            </Text>
          </BlockStack>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
            {CAMPAIGNS_LIST.map((camp) => (
              <div key={camp.id} className="campaign-showcase-row">
                <div className="campaign-showcase-info">
                  <InlineStack gap="200" blockAlign="center">
                    <span style={{ display: 'inline-flex', color: '#4f46e5', width: '20px', height: '20px' }}>
                      <Icon source={camp.icon} />
                    </span>
                    <Text variant="headingMd" as="h3" fontWeight="bold">
                      {camp.label}
                    </Text>
                  </InlineStack>
                  <div style={{ marginTop: '8px' }}>
                    <Text variant="bodySm" as="p" tone="subdued">
                      {camp.description}
                    </Text>
                  </div>
                  <div>
                    <Link 
                      to={`/app/settings${searchString ? searchString + '&' : '?'}tab=${camp.id}`} 
                      style={{ 
                        color: '#4f46e5', 
                        fontWeight: '600', 
                        fontSize: '13px', 
                        textDecoration: 'none', 
                        marginTop: '16px', 
                        display: 'inline-block' 
                      }}
                    >
                      Configure Widget ➔
                    </Link>
                  </div>
                </div>
                <div className="campaign-showcase-preview-box">
                  {camp.preview}
                </div>
              </div>
            ))}
          </div>
        </BlockStack>

        {/* Feature Grid */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
            <div className="feature-card">
              <BlockStack gap="300">
                <span style={{ display: 'inline-flex', color: '#ffb300', width: '28px', height: '28px' }}>
                  <Icon source={GaugeIcon} />
                </span>
                <Text variant="headingMd" as="h3" fontWeight="bold">
                  Ultralight Storefront Script
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Our custom widget scripts load asynchronously so that your store page speed is completely unaffected.
                </Text>
              </BlockStack>
            </div>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
            <div className="feature-card">
              <BlockStack gap="300">
                <span style={{ display: 'inline-flex', color: '#10b981', width: '28px', height: '28px' }}>
                  <Icon source={ShieldCheckMarkIcon} />
                </span>
                <Text variant="headingMd" as="h3" fontWeight="bold">
                  GDPR & Privacy Compliant
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Safely hide customer names or locations with a single switch. Fully compliant with modern consumer privacy acts.
                </Text>
              </BlockStack>
            </div>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
            <div className="feature-card">
              <BlockStack gap="300">
                <span style={{ display: 'inline-flex', color: '#3b82f6', width: '28px', height: '28px' }}>
                  <Icon source={ChartPopularIcon} />
                </span>
                <Text variant="headingMd" as="h3" fontWeight="bold">
                  Real-time CTR Tracking
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Track every impression, click, and interaction immediately. Generate CSV and PDF report summaries easily.
                </Text>
              </BlockStack>
            </div>
          </Grid.Cell>
        </Grid>

        {/* Footer Support Banner */}
        <div style={{ textAlign: 'center', padding: '24px 0 12px 0' }}>
          <Text variant="bodySm" as="p" tone="subdued">
            Need help configuring your popup widgets? Check out our {" "}
            <Link to={`/app/help${searchString}`} style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'underline' }}>
              Help & Documentation
            </Link>{" "}
            for step-by-step video instructions.
          </Text>
        </div>

      </BlockStack>
    </Page>
  );
}
