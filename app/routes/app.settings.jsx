import { useEffect, useState, useRef, useMemo } from "react";
import { Form, useActionData, useLoaderData, useFetcher, useNavigation, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { Page, Icon, Banner, Button, BlockStack } from "@shopify/polaris";
import { ChartPopularIcon, CartIcon, PackageIcon, GiftCardIcon, MagicIcon } from "@shopify/polaris-icons";
import settingsStyles from "../styles/settings.css?url";

// Modular tab imports
import SalesPopupsTab from "../components/settings/SalesPopupsTab";
import CountersTab from "../components/settings/CountersTab";
import ProductScarcityTab from "../components/settings/ProductScarcityTab";
import CartTimerTab from "../components/settings/CartTimerTab";
import PromoBarTab from "../components/settings/PromoBarTab";
import AnnouncementTab from "../components/settings/AnnouncementTab";
import ExitPopupTab from "../components/settings/ExitPopupTab";
import TrustBadgesTab from "../components/settings/TrustBadgesTab";
import SubscribersTab from "../components/settings/SubscribersTab";
import AestheticsTab from "../components/settings/AestheticsTab";
import LivePreview from "../components/settings/LivePreview";

// Reusable sub-components
import PremiumToggle from "../components/PremiumToggle";
import RangeInput from "../components/RangeInput";
import RichTextEditor from "../components/RichTextEditor";

export const GLOBAL_DEFAULT_MOCK_DATA = [
  { name: "Emma", city: "New York, US", product: "Wireless Headphones" },
  { name: "Sophie", city: "Amsterdam, NL", product: "Leather Backpack" },
  { name: "Liam", city: "London, UK", product: "Minimalist Wallet" },
  { name: "Lucas", city: "Berlin, DE", product: "Smart Watch" },
  { name: "Chloe", city: "Paris, FR", product: "Organic Cotton Tee" },
  { name: "Noah", city: "Los Angeles, US", product: "Running Shoes" },
  { name: "Olivia", city: "Toronto, CA", product: "Denim Jacket" },
  { name: "Alexander", city: "Stockholm, SE", product: "Waterproof Boots" },
  { name: "Mia", city: "Milan, IT", product: "Designer Sunglasses" },
  { name: "Charlotte", city: "Auckland, NZ", product: "Wool Scarf" },
  { name: "Ella", city: "Sydney, AU", product: "Swimwear" },
  { name: "Sophie", city: "Rotterdam, NL", product: "Ceramic Mug" },
  { name: "Thomas", city: "Brussels, BE", product: "Belgian Chocolate Box" },
  { name: "Daniel", city: "Dublin, IE", product: "Irish Whiskey Glasses" },
  { name: "Emily", city: "Chicago, US", product: "Scented Candle" },
  { name: "James", city: "Boston, US", product: "Leather Journal" },
  { name: "William", city: "Vancouver, CA", product: "Thermal Flask" },
  { name: "Benjamin", city: "Melbourne, AU", product: "KeepCup Coffee Cup" },
  { name: "Isabella", city: "Rome, IT", product: "Espresso Maker" },
  { name: "Oliver", city: "Manchester, UK", product: "Umbrella" },
  { name: "Sophia", city: "Munich, DE", product: "Beer Stein" },
  { name: "Amelia", city: "Copenhagen, DK", product: "Designer Vase" },
  { name: "Lucas", city: "Utrecht, NL", product: "Bicycle Lock" },
  { name: "Mia", city: "Geneva, CH", product: "Swiss Pocket Knife" },
  { name: "Henry", city: "Seattle, US", product: "Rain Coat" },
  { name: "Harper", city: "San Francisco, US", product: "Fleece Pullover" },
  { name: "Evelyn", city: "Montreal, CA", product: "Maple Syrup Set" },
  { name: "Jack", city: "Edinburgh, UK", product: "Cashmere Throw" },
  { name: "Mason", city: "Austin, US", product: "Hot Sauce Pack" },
  { name: "Avery", city: "Denver, US", product: "Hiking Backpack" },
  { name: "Abigail", city: "Portland, US", product: "Pour Over Kettle" },
  { name: "Leo", city: "Barcelona, ES", product: "Tapas Board" },
  { name: "Ella", city: "Lyon, FR", product: "Chef's Knife" },
  { name: "Ryan", city: "Tokyo, JP", product: "Matcha Whisk" },
  { name: "Max", city: "Vienna, AT", product: "Classic Fountain Pen" },
  { name: "Mila", city: "Prague, CZ", product: "Crystal Glassware" },
  { name: "Zoe", city: "Oslo, NO", product: "Woolen Beanie" },
  { name: "Lily", city: "Helsinki, FI", product: "Linen Apron" },
  { name: "Jacob", city: "Calgary, CA", product: "Campfire Grill" },
  { name: "Samuel", city: "Cape Town, ZA", product: "Wine Aerator" },
  { name: "Evelyn", city: "Lisbon, PT", product: "Ceramic Plate" },
  { name: "Aria", city: "Singapore, SG", product: "Smart Diffuser" },
  { name: "Gabriel", city: "Rio de Janeiro, BR", product: "Leather Sandals" },
  { name: "Maya", city: "Mexico City, MX", product: "Handwoven Blanket" },
  { name: "David", city: "Tel Aviv, IL", product: "Olive Oil Set" }
];

export const links = () => [
  { rel: "stylesheet", href: settingsStyles },
];

// Cache embed status (isEmbedEnabled + extensionId) per shop — 60 second TTL
const embedStatusCacheSettings = new Map();
const EMBED_CACHE_TTL_SETTINGS_MS = 10 * 1000; // 10 second TTL for snappier UI updates

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  // Verify if the social_proof app embed block is enabled — uses 60s cache
  let isEmbedEnabled = false;
  let extensionId = "ea691a59-47df-b6e4-81b5-35e318b96494c9523f59"; // Fallback to dev UUID

  const cachedEmbed = embedStatusCacheSettings.get(shop);
  if (cachedEmbed && (Date.now() - cachedEmbed.timestamp < EMBED_CACHE_TTL_SETTINGS_MS)) {
    isEmbedEnabled = cachedEmbed.isEmbedEnabled;
    extensionId = cachedEmbed.extensionId;
  } else {
    try {
      const response = await admin.graphql(
        `#graphql
        query GetMainThemeSettingsInSettings {
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
          } catch (e) {
            // ignore theme settings parsing errors
          }
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

      embedStatusCacheSettings.set(shop, { isEmbedEnabled, extensionId, timestamp: Date.now() });
    } catch (err) {
      console.error("Failed to check app embed status in settings:", err);
      isEmbedEnabled = true; // Fallback to true if API fails
    }
  }

  // Override fallback ID with env variable if available in production environment
  if (process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID) {
    extensionId = process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID;
  }

  const shopName = shop.replace(".myshopify.com", "");
  const embedActivateUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&activateAppId=${extensionId}/social_proof`;

  let settings = await prisma.settings.findUnique({
    where: { shop: session.shop },
  });

  const defaultMockData = GLOBAL_DEFAULT_MOCK_DATA;

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
      labelVisitors: "visitors viewing now",
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
      // Sales Popups (standard preset defaults)
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

      // Live visitor counters (minimal_light preset defaults)
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

      // Cart timer (crimson_warning preset defaults)
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

      // Exit Popup
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

      // Promo bar & Announce
      promo_pos: "top",
      announce_bg: "#ffffff",
      announce_text: "#1a1a1a",
      announce_pos: "center",
    };
  }
  const subscribers = await prisma.newsletter.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });
  return { settings, subscribers, isEmbedEnabled, embedActivateUrl };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const actionType = data.actionType;
  if (actionType === "deleteSubscriber") {
    const subscriberId = parseInt(data.subscriberId);
    if (!isNaN(subscriberId)) {
      await prisma.newsletter.delete({
        where: { id: subscriberId, shop: session.shop }
      });
      return { success: true, subscriberAction: true, message: "Subscriber deleted successfully!" };
    }
  }

  const settingsData = {
    // Basic Settings
    title: data.title || "Frank Social Proof Sales Popup",
    description: data.description || "Recently purchased",
    position: data.position || "bottom-left",
    displayDuration: parseInt(data.displayDuration) || 5000,
    initialDelay: parseInt(data.initialDelay) || 3000,
    displayGap: parseInt(data.displayGap) || 3000,
    backgroundColor: data.backgroundColor || "#ffffff",
    textColor: data.textColor || "#202223",

    // Feature Specific Positions/Colors
    promo_pos: data.promo_pos || "top",
    promoBgColor: data.promoBgColor || "#1a1a1a",
    promoTextColor: data.promoTextColor || "#ffffff",

    exitTitle: data.exitTitle || "",
    exitText: data.exitText || "",

    // Strings & JSON
    showMockData: data.showMockData === "true",
    showVisitorCount: data.showVisitorCount === "true",
    isEnabled: data.isEnabled === "true",
    showPromoBar: data.showPromoBar === "true",
    showAnnounce: data.showAnnounce === "true",
    showCartTimer: data.showCartTimer === "true",
    showInventory: data.showInventory === "true",
    showOnMobile: data.showOnMobile === "true",
    showOnDesktop: data.showOnDesktop === "true",
    showHotAlert: data.showHotAlert === "true",
    hideNames: data.hideNames === "true",
    showSoldCount: data.showSoldCount === "true",
    showEmailInput: data.showEmailInput === "true",
    exitOnce: data.exitOnce === "true",
    showExitEmailInput: data.showExitEmailInput === "true",
    exitBackdropBlur: data.exitBackdropBlur === "true",
    announceOnce: data.announceOnce === "true",
    promoOnce: data.promoOnce === "true",
    showTrustBadges: data.showTrustBadges === "true",
    showExitPopup: data.showExitPopup === "true",
    showSalesPopups: data.showSalesPopups === "true",
    counterPulse: data.counterPulse === "true",
    counterFluctuate: data.counterFluctuate === "true",
    counter_once_per_session: data.counter_once_per_session === "true",
    counter_loop: data.counter_loop === "true",

    // Strings & JSON
    mockData: data.mockData || "[]",
    logoUrl: data.logoUrl || "",
    animationType: data.animationType || "slide-up",
    labelVerified: data.labelVerified || "Verified by Frank",
    verifiedColor: data.verifiedColor || "#10b981",
    labelPurchased: data.labelPurchased || "Recently purchased",
    labelSomeoneIn: data.labelSomeoneIn || "Someone in",
    labelVisitors: data.labelVisitors || "visitors viewing now",
    labelViews24h: data.labelViews24h || "views in the last 24 hours",
    labelTrending: data.labelTrending || "Trending Now",
    showOnPages: data.showOnPages || "all",
    labelFrom: data.labelFrom || "from",
    labelItemsSold: data.labelItemsSold || "items sold in the last 24 hours",
    promoText: data.promoText || "",
    promoCode: data.promoCode || "",
    promoLink: data.promoLink || "",
    announceTitle: data.announceTitle || "",
    announceText: data.announceText || "",
    announceButtonText: data.announceButtonText || "",
    announceButtonLink: data.announceButtonLink || "",
    announceImage: data.announceImage || "",
    announceTrigger: data.announceTrigger || "load",
    cartTimerText: data.cartTimerText || "",
    inventoryText: data.inventoryText || "",
    trustStyle: data.trustStyle || "colored",
    trustBadgesData: data.trustBadgesData || "[]",
    trustBgColor: data.trustBgColor || "#ffffff",
    trustTextColor: data.trustTextColor || "#1a1a1a",
    trustIconColor: data.trustIconColor || "#2563eb",
    trustBorderColor: data.trustBorderColor || "#e1e3e5",
    trustBorderWidth: isNaN(parseInt(data.trustBorderWidth)) ? 1 : parseInt(data.trustBorderWidth),
    trustBorderRadius: isNaN(parseInt(data.trustBorderRadius)) ? 10 : parseInt(data.trustBorderRadius),
    trustAlignment: data.trustAlignment || "center",
    trustLayout: data.trustLayout || "grid",
    sales_bg: data.sales_bg || "#ffffff",
    sales_text: data.sales_text || "#1a1a1a",
    sales_pos: data.sales_pos || "bottom-left",
    sales_anim: data.sales_anim || "slide-up",
    sales_radius: isNaN(parseInt(data.sales_radius)) ? 8 : parseInt(data.sales_radius),
    sales_shadow: data.sales_shadow || "0 4px 12px rgba(0,0,0,0.1)",
    sales_font: data.sales_font || "Inter, sans-serif",
    sales_border_color: data.sales_border_color || "#e1e3e5",
    sales_border_width: isNaN(parseInt(data.sales_border_width)) ? 0 : parseInt(data.sales_border_width),

    counter_bg: data.counter_bg || "#ffffff",
    counter_text: data.counter_text || "#1a1a1a",
    counter_pos: data.counter_pos || "bottom-left",
    counter_radius: isNaN(parseInt(data.counter_radius)) ? 50 : parseInt(data.counter_radius),
    counter_border_color: data.counter_border_color || "#e1e3e5",
    counter_border_width: isNaN(parseInt(data.counter_border_width)) ? 0 : parseInt(data.counter_border_width),
    counter_shadow: data.counter_shadow || "0 4px 15px rgba(0,0,0,0.15)",
    counter_anim: data.counter_anim || "slide-up",
    counter_font: data.counter_font || "Inter, sans-serif",
    counter_delay: isNaN(parseInt(data.counter_delay)) ? 3000 : parseInt(data.counter_delay),
    counter_duration: isNaN(parseInt(data.counter_duration)) ? 6000 : parseInt(data.counter_duration),
    counter_gap: isNaN(parseInt(data.counter_gap)) ? 4000 : parseInt(data.counter_gap),

    cart_bg: data.cart_bg || "#ffffff",
    cart_text: data.cart_text || "#ff4d4d",
    cart_pos: data.cart_pos || "inline",

    announce_bg: data.announce_bg || "#ffffff",
    announce_text: data.announce_text || "#1a1a1a",
    announce_pos: data.announce_pos || "center",
    announceBtnBgColor: data.announceBtnBgColor || "#1a1a1a",
    announceBtnTextColor: data.announceBtnTextColor || "#ffffff",
    announceSuccessMessage: data.announceSuccessMessage || "Thank you for subscribing!",
    announceWidth: isNaN(parseInt(data.announceWidth)) ? 450 : parseInt(data.announceWidth),
    announceBorderRadius: isNaN(parseInt(data.announceBorderRadius)) ? 16 : parseInt(data.announceBorderRadius),
    announceBackdropBlur: data.announceBackdropBlur === "true",
    announceDelay: isNaN(parseInt(data.announceDelay)) ? 3000 : parseInt(data.announceDelay),

    exit_bg: data.exit_bg || "#ffffff",
    exit_text: data.exit_text || "#1a1a1a",
    exitButtonText: data.exitButtonText || "Stay with us!",
    exitButtonLink: data.exitButtonLink || "",
    exitBtnBgColor: data.exitBtnBgColor || "#1a1a1a",
    exitBtnTextColor: data.exitBtnTextColor || "#ffffff",
    exitWidth: isNaN(parseInt(data.exitWidth)) ? 450 : parseInt(data.exitWidth),
    exitBorderRadius: isNaN(parseInt(data.exitBorderRadius)) ? 16 : parseInt(data.exitBorderRadius),
    exitSuccessMessage: data.exitSuccessMessage || "Thank you!",

    // Cart Urgency Extended
    cart_radius: isNaN(parseInt(data.cart_radius)) ? 8 : parseInt(data.cart_radius),
    cart_border_width: isNaN(parseInt(data.cart_border_width)) ? 0 : parseInt(data.cart_border_width),
    cart_border_color: data.cart_border_color || "#ff4d4f",
    cart_shadow: data.cart_shadow || "0 4px 12px rgba(0,0,0,0.1)",
    cart_font: data.cart_font || "Inter, sans-serif",
    cart_show_progress: data.cart_show_progress === "true",
    cart_timeout_action: data.cart_timeout_action || "message",

    // Numbers
    minVisitors: isNaN(parseInt(data.minVisitors)) ? 5 : parseInt(data.minVisitors),
    maxVisitors: isNaN(parseInt(data.maxVisitors)) ? 25 : parseInt(data.maxVisitors),
    cartTimerMins: isNaN(parseInt(data.cartTimerMins)) ? 10 : parseInt(data.cartTimerMins),
    inventoryThreshold: isNaN(parseInt(data.inventoryThreshold)) ? 10 : parseInt(data.inventoryThreshold),
    promoHeight: isNaN(parseInt(data.promoHeight)) ? 44 : parseInt(data.promoHeight),
    promoFontSize: isNaN(parseInt(data.promoFontSize)) ? 14 : parseInt(data.promoFontSize),
    promoShowOn: data.promoShowOn || "all",
  };

  await prisma.settings.upsert({
    where: { shop: session.shop },
    update: settingsData,
    create: { ...settingsData, shop: session.shop },
  });

  return { success: true, isEnabled: settingsData.isEnabled };
};

// Reusable sub-components imported from components folder

export default function SettingsPage() {
  const { settings, subscribers = [], isEmbedEnabled, embedActivateUrl } = useLoaderData();
  const lastActionData = useRef(null);
  const navigation = useNavigation();
  const wasSaving = useRef(false);
  // ==========================================
  // 1. Sales Popups Configuration States
  // ==========================================
  const [title, setTitle] = useState(settings.title);
  const [description, setDescription] = useState(settings.description);
  const [sales_pos, setSalesPos] = useState(settings.sales_pos || 'bottom-left');
  const [sales_bg, setSalesBg] = useState(settings.sales_bg || '#ffffff');
  const [sales_text, setSalesText] = useState(settings.sales_text || '#202223');
  const [sales_anim, setSalesAnim] = useState(settings.sales_anim || 'slide-up');
  const [sales_radius, setSalesRadius] = useState(settings.sales_radius || 8);
  const [sales_shadow, setSalesShadow] = useState(settings.sales_shadow || "0 4px 12px rgba(0,0,0,0.1)");
  const [sales_font, setSalesFont] = useState(settings.sales_font || "Inter, sans-serif");
  const [sales_border_color, setSalesBorderColor] = useState(settings.sales_border_color || "#e1e3e5");
  const [sales_border_width, setSalesBorderWidth] = useState(settings.sales_border_width || 0);
  const [showSalesPopups, setShowSalesPopups] = useState(settings.showSalesPopups ?? true);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [labelVerified, setLabelVerified] = useState(settings.labelVerified || "Verified by Frank");
  const [verifiedColor, setVerifiedColor] = useState(settings.verifiedColor || "#10b981");
  const [labelPurchased, setLabelPurchased] = useState(settings.labelPurchased || "Recently purchased");
  const [labelSomeoneIn, setLabelSomeoneIn] = useState(settings.labelSomeoneIn || "Someone in");
  const [labelFrom, setLabelFrom] = useState(settings.labelFrom || "from");
  const [hideNames, setHideNames] = useState(settings.hideNames || false);

  // ==========================================
  // 2. Live Visitor Counters States
  // ==========================================
  const [counter_pos, setCounterPos] = useState(settings.counter_pos || 'bottom-right');
  const [counter_bg, setCounterBg] = useState(settings.counter_bg || '#ffffff');
  const [counter_text, setCounterText] = useState(settings.counter_text || '#202223');
  const [counter_radius, setCounterRadius] = useState(settings.counter_radius || 50);
  const [counter_border_color, setCounterBorderColor] = useState(settings.counter_border_color || "#e1e3e5");
  const [counter_border_width, setCounterBorderWidth] = useState(settings.counter_border_width || 0);
  const [counter_shadow, setCounterShadow] = useState(settings.counter_shadow || "0 4px 15px rgba(0,0,0,0.15)");
  const [counter_anim, setCounterAnim] = useState(settings.counter_anim || "slide-up");
  const [counter_font, setCounterFont] = useState(settings.counter_font || "Inter, sans-serif");
  const [counter_delay, setCounterDelay] = useState(settings.counter_delay || 3000);
  const [counter_duration, setCounterDuration] = useState(settings.counter_duration || 6000);
  const [counter_gap, setCounterGap] = useState(settings.counter_gap || 4000);
  const [showVisitorCount, setShowVisitorCount] = useState(settings.showVisitorCount);
  const [counterPulse, setCounterPulse] = useState(settings.counterPulse ?? true);
  const [counterFluctuate, setCounterFluctuate] = useState(settings.counterFluctuate ?? true);
  const [counter_once_per_session, setCounterOncePerSession] = useState(settings.counter_once_per_session ?? true);
  const [counter_loop, setCounterLoop] = useState(settings.counter_loop ?? false);
  const [minVisitors, setMinVisitors] = useState(settings.minVisitors || 5);
  const [maxVisitors, setMaxVisitors] = useState(settings.maxVisitors || 25);
  const [labelVisitors, setLabelVisitors] = useState(settings.labelVisitors || "visitors viewing now");

  // ==========================================
  // 3. Product Scarcity / Inventory States
  // ==========================================
  const [showInventory, setShowInventory] = useState(settings.showInventory || false);
  const [inventoryThreshold, setInventoryThreshold] = useState(settings.inventoryThreshold || 10);
  const [inventoryText, setInventoryText] = useState(settings.inventoryText || "Hurry! Only {stock} left in stock!");
  const [showHotAlert, setShowHotAlert] = useState(settings.showHotAlert ?? false);
  const [labelViews24h, setLabelViews24h] = useState(settings.labelViews24h || "views in the last 24 hours");
  const [labelTrending, setLabelTrending] = useState(settings.labelTrending || "Trending Now");
  const [showSoldCount, setShowSoldCount] = useState(settings.showSoldCount || false);
  const [labelItemsSold, setLabelItemsSold] = useState(settings.labelItemsSold || "items sold in the last 24 hours");

  // ==========================================
  // 4. Cart Urgency / Timer States
  // ==========================================
  const [showCartTimer, setShowCartTimer] = useState(settings.showCartTimer || false);
  const [cartTimerMins, setCartTimerMins] = useState(settings.cartTimerMins || 10);
  const [cartTimerText, setCartTimerText] = useState(settings.cartTimerText || "Your cart is reserved for");
  const [cart_bg, setCartBg] = useState(settings.cart_bg || '#ffffff');
  const [cart_text, setCartText] = useState(settings.cart_text || '#ff4d4d');
  const [cart_pos, setCartPos] = useState(settings.cart_pos || 'inline');
  const [cart_radius, setCartRadius] = useState(settings.cart_radius || 8);
  const [cart_border_width, setCartBorderWidth] = useState(settings.cart_border_width || 0);
  const [cart_border_color, setCartBorderColor] = useState(settings.cart_border_color || "#ff4d4f");
  const [cart_shadow, setCartShadow] = useState(settings.cart_shadow || "0 4px 12px rgba(0,0,0,0.1)");
  const [cart_font, setCartFont] = useState(settings.cart_font || "Inter, sans-serif");
  const [cart_show_progress, setCartShowProgress] = useState(settings.cart_show_progress ?? true);
  const [cart_timeout_action, setCartTimeoutAction] = useState(settings.cart_timeout_action || "message");

  // ==========================================
  // 5. Promotion Bar States
  // ==========================================
  const [showPromoBar, setShowPromoBar] = useState(settings.showPromoBar || false);
  const [promoText, setPromoText] = useState(settings.promoText || "Flash Sale! Get 20% OFF with code: SAVE20");
  const [promoLink, setPromoLink] = useState(settings.promoLink || "");
  const [promoBgColor, setPromoBgColor] = useState(settings.promoBgColor || "#1a1a1a");
  const [promoTextColor, setPromoTextColor] = useState(settings.promoTextColor || "#ffffff");
  const [promo_pos, setPromoPos] = useState(settings.promo_pos || "top");
  const [promoHeight, setPromoHeight] = useState(settings.promoHeight || 44);
  const [promoFontSize, setPromoFontSize] = useState(settings.promoFontSize || 14);
  const [promoShowOn, setPromoShowOn] = useState(settings.promoShowOn || "all");
  const [promoCode, setPromoCode] = useState(settings.promoCode || "SAVE20");
  const [promoOnce, setPromoOnce] = useState(settings.promoOnce || false);

  // ==========================================
  // 6. Announcement Popup States
  // ==========================================
  const [showAnnounce, setShowAnnounce] = useState(settings.showAnnounce || false);
  const [announceTitle, setAnnounceTitle] = useState(settings.announceTitle || "Special Offer!");
  const [announceText, setAnnounceText] = useState(settings.announceText || "Subscribe to our newsletter and get 10% off your first order.");
  const [announce_bg, setAnnounceBg] = useState(settings.announce_bg || "#ffffff");
  const [announce_text, setAnnounceTextState] = useState(settings.announce_text || "#202223");
  const [announce_pos, setAnnouncePos] = useState(settings.announce_pos || "center");
  const [announceButtonText, setAnnounceButtonText] = useState(settings.announceButtonText || "Claim Offer");
  const [announceButtonLink, setAnnounceButtonLink] = useState(settings.announceButtonLink || "/collections/all");
  const [announceImage, setAnnounceImage] = useState(settings.announceImage || "");
  const [announceTrigger, setAnnounceTrigger] = useState(settings.announceTrigger || "load");
  const [announceBtnBgColor, setAnnounceBtnBgColor] = useState(settings.announceBtnBgColor || "#1a1a1a");
  const [announceBtnTextColor, setAnnounceBtnTextColor] = useState(settings.announceBtnTextColor || "#ffffff");
  const [announceSuccessMessage, setAnnounceSuccessMessage] = useState(settings.announceSuccessMessage || "Thank you for subscribing!");
  const [announceWidth, setAnnounceWidth] = useState(settings.announceWidth || 450);
  const [announceBorderRadius, setAnnounceBorderRadius] = useState(settings.announceBorderRadius || 16);
  const [announceBackdropBlur, setAnnounceBackdropBlur] = useState(settings.announceBackdropBlur !== false);
  const [announceDelay, setAnnounceDelay] = useState(settings.announceDelay || 3000);
  const [announceOnce, setAnnounceOnce] = useState(settings.announceOnce !== false);

  // ==========================================
  // 7. Exit Intent Popup States
  // ==========================================
  const [showExitPopup, setShowExitPopup] = useState(settings.showExitPopup || false);
  const [exitTitle, setExitTitle] = useState(settings.exitTitle || "Wait! Don't go!");
  const [exitText, setExitText] = useState(settings.exitText || "Get 10% off your order if you stay!");
  const [exit_bg, setExitBg] = useState(settings.exit_bg || "#ffffff");
  const [exit_text, setExitTextState] = useState(settings.exit_text || "#202223");
  const [exitOnce, setExitOnce] = useState(settings.exitOnce !== false);
  const [exitButtonText, setExitButtonText] = useState(settings.exitButtonText || "Stay with us!");
  const [exitButtonLink, setExitButtonLink] = useState(settings.exitButtonLink || "");
  const [exitBtnBgColor, setExitBtnBgColor] = useState(settings.exitBtnBgColor || "#1a1a1a");
  const [exitBtnTextColor, setExitBtnTextColor] = useState(settings.exitBtnTextColor || "#ffffff");
  const [exitWidth, setExitWidth] = useState(settings.exitWidth || 450);
  const [exitBorderRadius, setExitBorderRadius] = useState(settings.exitBorderRadius || 16);
  const [exitBackdropBlur, setExitBackdropBlur] = useState(settings.exitBackdropBlur !== false);
  const [showExitEmailInput, setShowExitEmailInput] = useState(settings.showExitEmailInput || false);
  const [exitSuccessMessage, setExitSuccessMessage] = useState(settings.exitSuccessMessage || "Thank you!");

  // ==========================================
  // 8. Trust Badges States
  // ==========================================
  const [showTrustBadges, setShowTrustBadges] = useState(settings.showTrustBadges || false);
  const [trustStyle, setTrustStyle] = useState(settings.trustStyle || "colored");
  const [trustBadgesData, setTrustBadgesData] = useState(() => {
    try { return JSON.parse(settings.trustBadgesData || "[]"); } catch (e) { return []; }
  });
  const [trustBgColor, setTrustBgColor] = useState(settings.trustBgColor || "#ffffff");
  const [trustTextColor, setTrustTextColor] = useState(settings.trustTextColor || "#1a1a1a");
  const [trustIconColor, setTrustIconColor] = useState(settings.trustIconColor || "#2563eb");
  const [trustBorderColor, setTrustBorderColor] = useState(settings.trustBorderColor || "#e1e3e5");
  const [trustBorderWidth, setTrustBorderWidth] = useState(settings.trustBorderWidth ?? 1);
  const [trustBorderRadius, setTrustBorderRadius] = useState(settings.trustBorderRadius ?? 10);
  const [trustAlignment, setTrustAlignment] = useState(settings.trustAlignment || "center");
  const [trustLayout, setTrustLayout] = useState(settings.trustLayout || "grid");

  // ==========================================
  // 9. General & Global App Settings States
  // ==========================================
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const [animationType, setAnimationType] = useState(settings.animationType);
  const [displayDuration, setDisplayDuration] = useState(settings.displayDuration);
  const [initialDelay, setInitialDelay] = useState(settings.initialDelay || 3000);
  const [displayGap, setDisplayGap] = useState(settings.displayGap || 3000);
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor);
  const [textColor, setTextColor] = useState(settings.textColor);
  const [showMockData, setShowMockData] = useState(settings.showMockData);
  const [showOnPages, setShowOnPages] = useState(settings.showOnPages || "all");
  const [showOnMobile, setShowOnMobile] = useState(settings.showOnMobile ?? true);
  const [showOnDesktop, setShowOnDesktop] = useState(settings.showOnDesktop ?? true);
  const [showEmailInput, setShowEmailInput] = useState(settings.showEmailInput || false);

  const addTrustBadge = () => {
    setTrustBadgesData([...trustBadgesData, { icon: "truck", text: "New Badge" }]);
  };

  const removeTrustBadge = (index) => {
    setTrustBadgesData(trustBadgesData.filter((_, i) => i !== index));
  };

  const updateTrustBadge = (index, field, value) => {
    const updated = [...trustBadgesData];
    updated[index][field] = value;
    setTrustBadgesData(updated);
  };

  // Polaris Icons (SVG Paths)
  const ICONS = {
    settings: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fillRule="evenodd" d="M10.811 3.518a.75.75 0 0 0-1.622 0l-.134.99c-.431.066-.848.196-1.24.385l-.837-.549a.75.75 0 0 0-1.002.164l-.811 1.054a.75.75 0 0 0 .126 1.008l.786.634c-.13.419-.208.857-.229 1.306l-.993.134a.75.75 0 0 0-.649.742v1.328c0 .36.257.671.611.733l1.006.178c.038.444.133.876.28 1.288l-.634.786a.75.75 0 0 0 .126 1.008l1.054.811a.75.75 0 0 0 1.008-.126l.634-.786c.412.147.844.242 1.288.28l.178 1.006c.062.354.373.611.733.611h1.328a.75.75 0 0 0 .742-.649l.134-.993c.45-.021.887-.1 1.306-.229l.634.786a.75.75 0 0 0 1.008.126l1.054-.811a.75.75 0 0 0 .126-1.008l-.786-.634c.147-.412.242-.844.28-1.288l1.006-.178a.75.75 0 0 0 .611-.733v-1.328a.75.75 0 0 0-.649-.742l-.993-.134c-.021-.45-.1-.887-.229-1.306l.786-.634a.75.75 0 0 0 .126-1.008l-.811-1.054a.75.75 0 0 0-1.002-.164l-.837.549c-.392-.189-.809-.319-1.24-.385l-.134-.99ZM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>,
    sales: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10.873 2.155a.75.75 0 0 0-1.746 0l-5.69 11.23a.75.75 0 0 0 .867 1.045l4.31-.96a1 1 0 0 1 .436 0l4.31.96a.75.75 0 0 0 .867-1.045l-5.69-11.23ZM8.42 16.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" /></svg>,
    counters: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M6 3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm4 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1 4a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z" /></svg>,
    timer: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 4.25a.75.75 0 0 0-1.5 0v3.5h-2.5a.75.75 0 0 0 0 1.5h3.25a.75.75 0 0 0 .75-.75v-4.25Z" /></svg>,
    promo: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.5 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1.5 3.5a1 1 0 1 0-2 0 1 1 0 0 0 2 0ZM13 14a3 3 0 0 1-6 0h6Z" /></svg>,
    announce: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 0 0-8 8c0 1.34.331 2.602.915 3.71l-.9 3.149a.75.75 0 0 0 .926.926l3.149-.9A7.96 7.96 0 0 0 10 18a8 8 0 1 0 0-16Zm-3 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm2 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></svg>,
    exit: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h9.5A2.25 2.25 0 0 1 17 4.25v11.5A2.25 2.25 0 0 1 14.75 18h-9.5A2.25 2.25 0 0 1 3 15.75V4.25Zm2.25-.75a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h9.5a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75h-9.5Z" /><path d="M10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 6.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" /></svg>,
    aesthetics: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-4-8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-4 5a3.5 3.5 0 0 1-3-1.75.75.75 0 0 1 1.3-.75 2 2 0 0 0 3.4 0 .75.75 0 1 1 1.3.75A3.5 3.5 0 0 1 10 15Z" /></svg>,
    messaging: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.22l-2.43 2.13a.5.5 0 0 1-.7 0l-2.43-2.13H5a2 2 0 0 1-2-2V5Zm2 .5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2.5a.5.5 0 0 0-.33.13l-1.67 1.46-1.67-1.46a.5.5 0 0 0-.33-.13H5.5a.5.5 0 0 1-.5-.5v-8Z" /></svg>,
    check: <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" style={{ marginRight: '6px' }}><path fillRule="evenodd" d="M16.28 5.22a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L8.5 12.44l6.72-6.72a.75.75 0 0 1 1.06 0Z" /></svg>,
    pause: <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" style={{ marginRight: '6px' }}><path d="M7 6.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm6 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" /></svg>,
    scarcity: <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10.394 2.08a.75.75 0 0 0-.788.08C8.386 3.102 7.02 5.093 7.02 7c0 2.25 1.25 3.5 1.25 3.5s-.5-.75-.5-1.5c0-1.25.75-2.5 1.5-3.25.25.75.75 1.75.75 2.75 0 1.75-.75 2.5-.75 2.5s1.25-.5 1.75-2c.5 1.25.25 3.25-1.5 4.5 2 0 3.5-1.5 3.5-3.5 0-2.5-1.5-5.5-4.382-7.92a.75.75 0 0 0-.204-.5Z" /></svg>
  };

  let initialMockRows = [];
  try {
    initialMockRows = JSON.parse(settings.mockData || "[]");
  } catch (e) {
    initialMockRows = [];
  }
  const [mockRows, setMockRows] = useState(initialMockRows);
  const [animationKey, setAnimationKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("sales-popups");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    setSearchParams(prev => {
      prev.set("tab", activeTab);
      return prev;
    }, { replace: true });
  }, [activeTab]);
  const [subscriberSearch, setSubscriberSearch] = useState("");

  const [previewTimerSeconds, setPreviewTimerSeconds] = useState((cartTimerMins || 10) * 60);

  useEffect(() => {
    if (activeTab === 'cart-timer') {
      setPreviewTimerSeconds((cartTimerMins || 10) * 60);
    }
  }, [activeTab, cartTimerMins]);

  useEffect(() => {
    if (activeTab !== 'cart-timer') return;
    const interval = setInterval(() => {
      setPreviewTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const uploadFetcher = useFetcher();
  const statusFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  useEffect(() => {
    if (deleteFetcher.data && deleteFetcher.data.success && deleteFetcher.data.subscriberAction) {
      shopify.toast.show(deleteFetcher.data.message || "Subscriber deleted successfully!");
    }
  }, [deleteFetcher.data]);

  const fileInputRef = useRef(null);
  const actionData = useActionData();
  const shopify = useAppBridge();

  const PRESETS = {
    standard: { bg: "#ffffff", text: "#1a1a1a", anim: "slide-up", radius: 8, shadow: "0 4px 12px rgba(0,0,0,0.1)" },
    dark: { bg: "#1a1a1a", text: "#ffffff", anim: "fade", radius: 8, shadow: "0 8px 24px rgba(0,0,0,0.2)" },
    glass: { bg: "rgba(16, 185, 129, 0.6)", text: "#ffffff", anim: "zoom", radius: 16, shadow: "0 4px 12px rgba(0,0,0,0.1)" },
    sunset: { bg: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)", text: "#1a1a1a", anim: "bounce", radius: 12, shadow: "0 8px 24px rgba(0,0,0,0.15)" },
    ocean: { bg: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", text: "#1a1a1a", anim: "slide-up", radius: 12, shadow: "0 8px 24px rgba(0,0,0,0.15)" },
    emerald: { bg: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", text: "#1a1a1a", anim: "swing", radius: 12, shadow: "0 8px 24px rgba(0,0,0,0.15)" },
    aurora: { bg: "linear-gradient(215deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)", text: "#ffffff", anim: "fade", radius: 12, shadow: "0 8px 24px rgba(0,0,0,0.15)" },
    midnight: { bg: "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)", text: "#ffffff", anim: "slide-down", radius: 20, shadow: "0 12px 36px rgba(0,0,0,0.25)" },
    cyber: { bg: "linear-gradient(90deg, #FAD961 0%, #F76B1C 100%)", text: "#ffffff", anim: "zoom", radius: 4, shadow: "0 8px 24px rgba(0,0,0,0.2)" },
    purple_haze: { bg: "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)", text: "#ffffff", anim: "slide-up", radius: 24, shadow: "0 12px 36px rgba(0,0,0,0.2)" },
    candy: { bg: "linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)", text: "#ffffff", anim: "bounce", radius: 30, shadow: "0 8px 24px rgba(0,0,0,0.15)" },
    royal: { bg: "linear-gradient(to right, #243b55, #141e30)", text: "#ffffff", anim: "fade", radius: 0, shadow: "0 4px 12px rgba(0,0,0,0.3)" },
    gold: { bg: "linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)", text: "#1a1a1a", anim: "zoom", radius: 2, shadow: "0 8px 24px rgba(0,0,0,0.2)" },
    nordic: { bg: "#2E3440", text: "#ECEFF4", anim: "fade", radius: 8, shadow: "0 4px 12px rgba(0,0,0,0.1)" },
    minimal: { bg: "#374151", text: "#ffffff", anim: "slide-up", radius: 8, shadow: "0 4px 12px rgba(0,0,0,0.1)" },
    forest: { bg: "#1b4332", text: "#ffffff", anim: "slide-up", radius: 12, shadow: "0 4px 12px rgba(0,0,0,0.1)" },
    ruby: { bg: "#a4161a", text: "#ffffff", anim: "bounce", radius: 12, shadow: "0 4px 12px rgba(0,0,0,0.1)" },
    sky: { bg: "#8ecae6", text: "#023047", anim: "fade", radius: 12, shadow: "0 4px 12px rgba(0,0,0,0.1)" },
  };

  const PROMO_PRESETS = {
    midnight: { bg: '#1a1a1a', text: '#ffffff', label: 'Midnight Dark' },
    emerald: { bg: '#008060', text: '#ffffff', label: 'Emerald Shopify' },
    ocean: { bg: '#007ace', text: '#ffffff', label: 'Ocean Blue' },
    ruby: { bg: '#e62e2e', text: '#ffffff', label: 'Ruby Sale' },
    gold: { bg: '#d4af37', text: '#1a1a1a', label: 'Luxury Gold' },
    sunset: { bg: 'linear-gradient(90deg, #ff8a00 0%, #e52e71 100%)', text: '#ffffff', label: 'Sunset Gradient' }
  };

  const COUNTER_PRESETS = {
    minimal_light: { bg: "#ffffff", text: "#1a1a1a", border: "#e1e3e5", radius: 50, border_width: 1, shadow: "0 2px 8px rgba(0,0,0,0.05)" },
    glass: { bg: "rgba(255, 255, 255, 0.7)", text: "#1a1a1a", border: "rgba(255,255,255,0.4)", radius: 50, border_width: 1, shadow: "0 8px 32px rgba(0,0,0,0.08)" },
    dark: { bg: "#1f2937", text: "#ffffff", border: "#374151", radius: 8, border_width: 1, shadow: "0 4px 12px rgba(0,0,0,0.15)" },
    urgency_red: { bg: "#fef2f2", text: "#991b1b", border: "#fee2e2", radius: 50, border_width: 1, shadow: "0 2px 8px rgba(0,0,0,0.05)" },
    ocean_breeze: { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd", radius: 50, border_width: 1, shadow: "0 2px 8px rgba(3,105,161,0.05)" },
    forest_green: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", radius: 50, border_width: 1, shadow: "0 2px 8px rgba(21,128,61,0.05)" },
    sunset_glow: { bg: "#fff7ed", text: "#c2410c", border: "#ffedd5", radius: 50, border_width: 1, shadow: "0 2px 8px rgba(194,65,12,0.05)" },
    royal_gold: { bg: "#fdfcf7", text: "#854d0e", border: "#fef08a", radius: 12, border_width: 1, shadow: "0 4px 12px rgba(133,77,14,0.08)" },
  };

  const CART_PRESETS = {
    crimson_warning: { bg: "#fef2f2", text: "#991b1b", border: "#fee2e2", radius: 8, border_width: 1, shadow: "0 2px 8px rgba(0,0,0,0.05)" },
    midnight_neon: { bg: "#1f2937", text: "#ffffff", border: "#374151", radius: 8, border_width: 1, shadow: "0 4px 12px rgba(0,0,0,0.15)", border_color: "#10b981" },
    forest_trust: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", radius: 8, border_width: 1, shadow: "0 2px 8px rgba(21,128,61,0.05)" },
    luxury_gold: { bg: "#fdfcf7", text: "#854d0e", border: "#fef08a", radius: 12, border_width: 1, shadow: "0 4px 12px rgba(133,77,14,0.08)" },
    ocean_breeze: { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd", radius: 8, border_width: 1, shadow: "0 2px 8px rgba(3,105,161,0.05)" },
    sunset_glow: { bg: "#fff7ed", text: "#c2410c", border: "#ffedd5", radius: 8, border_width: 1, shadow: "0 2px 8px rgba(194,65,12,0.05)" },
    glass: { bg: "rgba(255, 255, 255, 0.7)", text: "#1a1a1a", border: "rgba(255,255,255,0.4)", radius: 50, border_width: 1, shadow: "0 8px 32px rgba(0,0,0,0.08)" },
    cyberpunk: { bg: "#000000", text: "#39ff14", border: "#39ff14", radius: 4, border_width: 1, shadow: "0 0 10px rgba(57,255,20,0.5)" }
  };

  const applyCartPreset = (key) => {
    const p = CART_PRESETS[key];
    setCartBg(p.bg);
    setCartText(p.text);
    setCartBorderColor(p.border);
    setCartRadius(p.radius);
    setCartBorderWidth(p.border_width);
    setCartShadow(p.shadow);
    shopify.toast.show(`${key.replace('_', ' ')} preset applied!`);
  };

  const applyCounterPreset = (key) => {
    const p = COUNTER_PRESETS[key];
    setCounterBg(p.bg);
    setCounterText(p.text);
    setCounterBorderColor(p.border);
    setCounterRadius(p.radius);
    setCounterBorderWidth(p.border_width);
    setCounterShadow(p.shadow);
    shopify.toast.show(`${key.replace('_', ' ')} preset applied!`);
  };

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setSalesBg(p.bg);
    setSalesText(p.text);
    setSalesAnim(p.anim);
    setSalesRadius(p.radius || 8);
    setSalesShadow(p.shadow || "0 4px 12px rgba(0,0,0,0.1)");
    shopify.toast.show(`${key} preset applied!`);
  };

  const applyPromoPreset = (key) => {
    const p = PROMO_PRESETS[key];
    setPromoBgColor(p.bg);
    setPromoTextColor(p.text);
    shopify.toast.show(`${p.label} preset applied!`);
  };

  const generateRandomMockData = () => {
    const newRows = Array.from({ length: 5 }).map(() => {
      const item = GLOBAL_DEFAULT_MOCK_DATA[Math.floor(Math.random() * GLOBAL_DEFAULT_MOCK_DATA.length)];
      return { ...item };
    });
    setMockRows([...mockRows, ...newRows]);
    shopify.toast.show("5 Random orders added!");
  };

  const updateMockRow = (index, field, value) => {
    const updated = [...mockRows];
    updated[index][field] = value;
    setMockRows(updated);
  };

  const removeMockRow = (index) => {
    setMockRows(mockRows.filter((_, i) => i !== index));
  };

  const addMockRow = () => {
    setMockRows([...mockRows, { name: "", city: "", product: "" }]);
  };

  const clearMockRows = () => {
    setMockRows([]);
    shopify.toast.show("All mock data cleared!");
  };

  const toggleStatus = () => {
    const nextStatus = !isEnabled;
    statusFetcher.submit({
      isEnabled: nextStatus.toString(),
      title, description,
      sales_pos, sales_bg, sales_text, sales_anim,
      sales_radius: sales_radius.toString(), sales_shadow, sales_font, sales_border_color, sales_border_width: sales_border_width.toString(),
      counter_pos, counter_bg, counter_text, counter_radius: counter_radius.toString(), counter_border_color, counter_border_width: counter_border_width.toString(), counter_shadow, counter_anim, counter_font,
      counter_delay: counter_delay.toString(), counter_duration: counter_duration.toString(), counter_gap: counter_gap.toString(),
      cart_bg, cart_text, cart_pos, cart_radius: cart_radius.toString(), cart_border_width: cart_border_width.toString(), cart_border_color, cart_shadow, cart_font,
      cart_show_progress: cart_show_progress.toString(), cart_timeout_action,
      showMockData: showMockData.toString(),
      showVisitorCount: showVisitorCount.toString(),
      showHotAlert: showHotAlert.toString(),
      mockData: JSON.stringify(mockRows),
      logoUrl, animationType: sales_anim, minVisitors: minVisitors.toString(), maxVisitors: maxVisitors.toString(),
      showOnMobile: showOnMobile.toString(),
      showOnDesktop: showOnDesktop.toString(),
      showSalesPopups: showSalesPopups.toString(),
      counterPulse: counterPulse.toString(), counterFluctuate: counterFluctuate.toString(),
      counter_once_per_session: counter_once_per_session.toString(), counter_loop: counter_loop.toString(),
      labelVerified, verifiedColor, labelPurchased, labelSomeoneIn, labelFrom, labelVisitors, labelViews24h, labelTrending, showOnPages,
      hideNames: hideNames.toString(),
      showSoldCount: showSoldCount.toString(), labelItemsSold,
      showPromoBar: showPromoBar.toString(), promoText, promoLink, promoBgColor, promoTextColor,
      promo_pos, promoHeight: promoHeight.toString(), promoFontSize: promoFontSize.toString(),
      promoShowOn, promoOnce: promoOnce.toString(), promoCode,
      showAnnounce: showAnnounce.toString(), announceTitle, announceText, announceButtonText, announceButtonLink, announceImage, announceTrigger,
      announce_bg, announce_text, announce_pos, announceBtnBgColor, announceBtnTextColor,
      announceSuccessMessage, announceWidth: announceWidth.toString(), announceBorderRadius: announceBorderRadius.toString(),
      announceBackdropBlur: announceBackdropBlur.toString(), announceDelay: announceDelay.toString(), announceOnce: announceOnce.toString(),
      showCartTimer: showCartTimer.toString(), cartTimerMins: cartTimerMins.toString(), cartTimerText,
      showEmailInput: showEmailInput.toString(), showInventory: showInventory.toString(),
      inventoryThreshold: inventoryThreshold.toString(), inventoryText,
      showExitPopup: showExitPopup.toString(), exitTitle, exitText, exit_bg, exit_text,
      exitOnce: exitOnce.toString(), exitButtonText, exitButtonLink, exitBtnBgColor, exitBtnTextColor,
      exitWidth: exitWidth.toString(), exitBorderRadius: exitBorderRadius.toString(), exitBackdropBlur: exitBackdropBlur.toString(),
      showExitEmailInput: showExitEmailInput.toString(), exitSuccessMessage,
      showTrustBadges: showTrustBadges.toString(), trustStyle, trustBadgesData: JSON.stringify(trustBadgesData),
      trustBgColor, trustTextColor, trustIconColor, trustBorderColor,
      trustBorderWidth: trustBorderWidth.toString(), trustBorderRadius: trustBorderRadius.toString(),
      trustAlignment, trustLayout,
      backgroundColor, textColor, displayDuration: displayDuration.toString(), initialDelay: initialDelay.toString(), displayGap: displayGap.toString(),
    }, { method: "POST" });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Immediately show the image preview (base64)
      setLogoUrl(reader.result);
      shopify.toast.show("Uploading to Media Library...");
      // Upload to Shopify CDN in background
      uploadFetcher.submit({ base64: reader.result }, { method: "POST", action: "/api/upload", encType: "application/json" });

      // Reset input value to allow uploading same file again
      event.target.value = "";
    };
  };

  useEffect(() => {
    if (uploadFetcher.state === "idle" && uploadFetcher.data?.url) {
      setLogoUrl(uploadFetcher.data.url);
      if (uploadFetcher.data.url.startsWith("https://")) {
        shopify.toast.show("✅ Logo uploaded to Shopify CDN!");
      } else {
        shopify.toast.show("Logo Updated!");
      }
    }
    if (uploadFetcher.state === "idle" && uploadFetcher.data?.error) {
      shopify.toast.show("Upload failed, using local preview", { isError: true });
    }
  }, [uploadFetcher.state, uploadFetcher.data]);
  useEffect(() => { if (statusFetcher.data?.success) { setIsEnabled(statusFetcher.data.isEnabled); shopify.toast.show(statusFetcher.data.isEnabled ? "App Activated!" : "App Stopped!"); } }, [statusFetcher.data]);

  const syncStatesWithSettings = (s) => {
    setTitle(s.title);
    setDescription(s.description);
    setSalesPos(s.sales_pos || 'bottom-left');
    setSalesBg(s.sales_bg || '#ffffff');
    setSalesText(s.sales_text || '#202223');
    setSalesAnim(s.sales_anim || 'slide-up');
    setCounterPos(s.counter_pos || 'bottom-right');
    setCounterBg(s.counter_bg || '#ffffff');
    setCounterText(s.counter_text || '#202223');
    setCounterRadius(s.counter_radius || 50);
    setCounterBorderColor(s.counter_border_color || "#e1e3e5");
    setCounterBorderWidth(s.counter_border_width || 0);
    setCounterShadow(s.counter_shadow || "0 4px 15px rgba(0,0,0,0.15)");
    setCounterAnim(s.counter_anim || "slide-up");
    setCounterFont(s.counter_font || "Inter, sans-serif");
    setCounterDelay(s.counter_delay || 3000);
    setCounterDuration(s.counter_duration || 6000);
    setCounterGap(s.counter_gap || 4000);
    setCartBg(s.cart_bg || '#ffffff');
    setCartText(s.cart_text || '#ff4d4d');
    setCartPos(s.cart_pos || 'inline');
    setCartRadius(s.cart_radius || 8);
    setCartBorderWidth(s.cart_border_width || 0);
    setCartBorderColor(s.cart_border_color || "#ff4d4f");
    setCartShadow(s.cart_shadow || "0 4px 12px rgba(0,0,0,0.1)");
    setCartFont(s.cart_font || "Inter, sans-serif");
    setCartShowProgress(s.cart_show_progress ?? true);
    setCartTimeoutAction(s.cart_timeout_action || "message");

    setDisplayDuration(s.displayDuration);
    setInitialDelay(s.initialDelay || 3000);
    setDisplayGap(s.displayGap || 3000);
    setBackgroundColor(s.backgroundColor);
    setTextColor(s.textColor);
    setShowMockData(s.showMockData);
    setShowVisitorCount(s.showVisitorCount);
    setCounterPulse(s.counterPulse ?? true);
    setCounterFluctuate(s.counterFluctuate ?? true);
    setCounterOncePerSession(s.counter_once_per_session ?? true);
    setCounterLoop(s.counter_loop ?? false);
    setShowHotAlert(s.showHotAlert ?? false);
    setShowOnMobile(s.showOnMobile ?? true);
    setShowOnDesktop(s.showOnDesktop ?? true);
    setShowSalesPopups(s.showSalesPopups ?? true);
    setIsEnabled(s.isEnabled);
    setLogoUrl(s.logoUrl);
    setAnimationType(s.animationType);
    setMinVisitors(s.minVisitors || 5);
    setMaxVisitors(s.maxVisitors || 25);
    setLabelVerified(s.labelVerified || "Verified by Frank");
    setVerifiedColor(s.verifiedColor || "#10b981");
    setLabelPurchased(s.labelPurchased || "Recently purchased");
    setLabelSomeoneIn(s.labelSomeoneIn || "Someone in");

    setSalesRadius(s.sales_radius || 8);
    setSalesShadow(s.sales_shadow || "0 4px 12px rgba(0,0,0,0.1)");
    setSalesFont(s.sales_font || "Inter, sans-serif");
    setSalesBorderColor(s.sales_border_color || "#e1e3e5");
    setSalesBorderWidth(s.sales_border_width || 0);
    setLabelVisitors(s.labelVisitors || "visitors viewing now");
    setLabelViews24h(s.labelViews24h || "views in the last 24 hours");
    setLabelTrending(s.labelTrending || "Trending Now");
    setShowOnPages(s.showOnPages || "all");
    setHideNames(s.hideNames || false);
    setLabelFrom(s.labelFrom || "from");
    setShowSoldCount(s.showSoldCount || false);
    setLabelItemsSold(s.labelItemsSold || "items sold in the last 24 hours");
    setShowPromoBar(s.showPromoBar || false);
    setPromoText(s.promoText || "Flash Sale! Get 20% OFF with code: SAVE20");
    setPromoLink(s.promoLink || "");
    setPromoBgColor(s.promoBgColor || "#1a1a1a");
    setPromoTextColor(s.promoTextColor || "#ffffff");
    setPromoPos(s.promo_pos || "top");
    setPromoHeight(s.promoHeight || 44);
    setPromoFontSize(s.promoFontSize || 14);
    setPromoShowOn(s.promoShowOn || "all");
    setPromoCode(s.promoCode || "SAVE20");
    setPromoOnce(s.promoOnce || false);
    setShowAnnounce(s.showAnnounce || false);
    setAnnounceTitle(s.announceTitle || "Special Offer!");
    setAnnounceText(s.announceText || "Subscribe to our newsletter and get 10% off your first order.");
    setAnnounceBg(s.announce_bg || "#ffffff");
    setAnnounceTextState(s.announce_text || "#202223");
    setAnnouncePos(s.announce_pos || "center");
    setAnnounceSuccessMessage(s.announceSuccessMessage || "Thank you for subscribing!");

    setShowExitPopup(s.showExitPopup || false);
    setExitTitle(s.exitTitle || "Wait! Don't go!");
    setExitText(s.exitText || "Get 10% off your order if you stay!");
    setExitBg(s.exit_bg || "#ffffff");
    setExitTextState(s.exit_text || "#202223");
    setExitOnce(s.exitOnce !== false);
    setExitButtonText(s.exitButtonText || "Stay with us!");
    setExitButtonLink(s.exitButtonLink || "");
    setExitBtnBgColor(s.exitBtnBgColor || "#1a1a1a");
    setExitBtnTextColor(s.exitBtnTextColor || "#ffffff");
    setExitWidth(s.exitWidth || 450);
    setExitBorderRadius(s.exitBorderRadius || 16);
    setExitBackdropBlur(s.exitBackdropBlur !== false);
    setShowExitEmailInput(s.showExitEmailInput || false);
    setExitSuccessMessage(s.exitSuccessMessage || "Thank you!");

    setAnnounceButtonText(s.announceButtonText || "Claim Offer");
    setAnnounceButtonLink(s.announceButtonLink || "/collections/all");
    setAnnounceImage(s.announceImage || "");
    setAnnounceTrigger(s.announceTrigger || "load");
    setAnnounceBtnBgColor(s.announceBtnBgColor || "#1a1a1a");
    setAnnounceBtnTextColor(s.announceBtnTextColor || "#ffffff");
    setAnnounceWidth(s.announceWidth || 450);
    setAnnounceBorderRadius(s.announceBorderRadius || 16);
    setAnnounceBackdropBlur(s.announceBackdropBlur !== false);
    setAnnounceDelay(s.announceDelay || 3000);
    setShowCartTimer(s.showCartTimer || false);
    setCartTimerMins(s.cartTimerMins || 10);
    setCartTimerText(s.cartTimerText || "Your cart is reserved for");
    setShowEmailInput(s.showEmailInput || false);
    setShowInventory(s.showInventory || false);
    setInventoryThreshold(s.inventoryThreshold || 10);
    setInventoryText(s.inventoryText || "Hurry! Only {stock} left in stock!");
    setAnnounceOnce(s.announceOnce !== false);
    setShowTrustBadges(s.showTrustBadges || false);
    setTrustStyle(s.trustStyle || "colored");
    setTrustBgColor(s.trustBgColor || "#ffffff");
    setTrustTextColor(s.trustTextColor || "#1a1a1a");
    setTrustIconColor(s.trustIconColor || "#2563eb");
    setTrustBorderColor(s.trustBorderColor || "#e1e3e5");
    setTrustBorderWidth(s.trustBorderWidth ?? 1);
    setTrustBorderRadius(s.trustBorderRadius ?? 10);
    setTrustAlignment(s.trustAlignment || "center");
    setTrustLayout(s.trustLayout || "grid");

    try {
      setMockRows(JSON.parse(s.mockData || "[]"));
    } catch (err) {
      setMockRows([]);
    }

    try {
      setTrustBadgesData(JSON.parse(s.trustBadgesData || "[]"));
    } catch (err) {
      setTrustBadgesData([]);
    }
  };

  useEffect(() => {
    if (actionData?.success && !actionData?.subscriberAction && actionData !== lastActionData.current) {
      lastActionData.current = actionData;
      shopify.toast.show("Settings saved!");
      wasSaving.current = true;
    }
  }, [actionData, shopify]);

  useEffect(() => {
    const isCurrentlySaving = navigation.state !== "idle";
    if (wasSaving.current && !isCurrentlySaving) {
      syncStatesWithSettings(settings);
      wasSaving.current = false;
    }
  }, [navigation.state, settings]);

  useEffect(() => { setAnimationKey(Date.now()); }, [sales_anim]);

  const isDirty = useMemo(() => {
    const s = settings;
    if (!s) return false;

    const normalizeColor = (c) => String(c || '').replace(/\s+/g, '').toLowerCase();
    const compareColor = (a, b) => normalizeColor(a) !== normalizeColor(b);
    const compareNumber = (a, b) => Number(a) !== Number(b);
    const compareBool = (a, b) => {
      const parseBool = (v) => v === true || v === 'true';
      return parseBool(a) !== parseBool(b);
    };
    const compareJson = (a, b) => {
      try {
        const parse = (v) => typeof v === 'string' ? JSON.parse(v) : v;
        return JSON.stringify(parse(a)) !== JSON.stringify(parse(b));
      } catch (e) {
        return String(a) !== String(b);
      }
    };

    const checks = {
      title: title !== s.title,
      description: description !== s.description,
      sales_pos: sales_pos !== (s.sales_pos || 'bottom-left'),
      sales_bg: compareColor(sales_bg, s.sales_bg || '#ffffff'),
      sales_text: compareColor(sales_text, s.sales_text || '#202223'),
      sales_anim: sales_anim !== (s.sales_anim || 'slide-up'),
      counter_pos: counter_pos !== (s.counter_pos || 'bottom-left'),
      counter_bg: compareColor(counter_bg, s.counter_bg || '#ffffff'),
      counter_text: compareColor(counter_text, s.counter_text || '#202223'),
      counter_radius: compareNumber(counter_radius, s.counter_radius || 50),
      counter_border_color: compareColor(counter_border_color, s.counter_border_color || "#e1e3e5"),
      counter_border_width: compareNumber(counter_border_width, s.counter_border_width || 0),
      counter_shadow: counter_shadow !== (s.counter_shadow || "0 4px 15px rgba(0,0,0,0.15)"),
      counter_anim: counter_anim !== (s.counter_anim || "slide-up"),
      counter_font: counter_font !== (s.counter_font || "Inter, sans-serif"),
      counter_delay: compareNumber(counter_delay, s.counter_delay || 3000),
      counter_duration: compareNumber(counter_duration, s.counter_duration || 6000),
      counter_gap: compareNumber(counter_gap, s.counter_gap || 4000),
      cart_bg: compareColor(cart_bg, s.cart_bg || '#ffffff'),
      cart_text: compareColor(cart_text, s.cart_text || '#ff4d4d'),
      cart_pos: cart_pos !== (s.cart_pos || 'inline'),
      cart_radius: compareNumber(cart_radius, s.cart_radius || 8),
      cart_border_width: compareNumber(cart_border_width, s.cart_border_width || 0),
      cart_border_color: compareColor(cart_border_color, s.cart_border_color || '#ff4d4f'),
      cart_shadow: cart_shadow !== (s.cart_shadow || '0 4px 12px rgba(0,0,0,0.1)'),
      cart_font: cart_font !== (s.cart_font || 'Inter, sans-serif'),
      cart_show_progress: compareBool(cart_show_progress, s.cart_show_progress ?? true),
      cart_timeout_action: cart_timeout_action !== (s.cart_timeout_action || 'message'),
      sales_radius: compareNumber(sales_radius, s.sales_radius || 8),
      sales_shadow: sales_shadow !== (s.sales_shadow || "0 4px 12px rgba(0,0,0,0.1)"),
      sales_font: sales_font !== (s.sales_font || "Inter, sans-serif"),
      sales_border_color: compareColor(sales_border_color, s.sales_border_color || "#e1e3e5"),
      sales_border_width: compareNumber(sales_border_width, s.sales_border_width || 0),
      displayDuration: compareNumber(displayDuration, s.displayDuration),
      initialDelay: compareNumber(initialDelay, s.initialDelay || 3000),
      displayGap: compareNumber(displayGap, s.displayGap || 3000),
      showMockData: compareBool(showMockData, s.showMockData),
      showVisitorCount: compareBool(showVisitorCount, s.showVisitorCount),
      counterPulse: compareBool(counterPulse, s.counterPulse ?? true),
      counterFluctuate: compareBool(counterFluctuate, s.counterFluctuate ?? true),
      counter_once_per_session: compareBool(counter_once_per_session, s.counter_once_per_session ?? true),
      counter_loop: compareBool(counter_loop, s.counter_loop ?? false),
      showHotAlert: compareBool(showHotAlert, s.showHotAlert ?? false),
      showOnMobile: compareBool(showOnMobile, s.showOnMobile ?? true),
      showOnDesktop: compareBool(showOnDesktop, s.showOnDesktop ?? true),
      isEnabled: compareBool(isEnabled, s.isEnabled),
      logoUrl: logoUrl !== s.logoUrl,
      minVisitors: compareNumber(minVisitors, s.minVisitors || 5),
      maxVisitors: compareNumber(maxVisitors, s.maxVisitors || 25),
      labelVerified: labelVerified !== (s.labelVerified || "Verified by Frank"),
      verifiedColor: compareColor(verifiedColor, s.verifiedColor || "#10b981"),
      labelPurchased: labelPurchased !== (s.labelPurchased || "Recently purchased"),
      labelSomeoneIn: labelSomeoneIn !== (s.labelSomeoneIn || "Someone in"),
      labelVisitors: labelVisitors !== (s.labelVisitors || "visitors viewing now"),
      labelViews24h: labelViews24h !== (s.labelViews24h || "views in the last 24 hours"),
      labelTrending: labelTrending !== (s.labelTrending || "Trending Now"),
      showOnPages: showOnPages !== (s.showOnPages || "all"),
      hideNames: compareBool(hideNames, s.hideNames || false),
      labelFrom: labelFrom !== (s.labelFrom || "from"),
      showSoldCount: compareBool(showSoldCount, s.showSoldCount || false),
      labelItemsSold: labelItemsSold !== (s.labelItemsSold || "items sold in the last 24 hours"),
      showPromoBar: compareBool(showPromoBar, s.showPromoBar || false),
      promoText: promoText !== (s.promoText || "Flash Sale! Get 20% OFF with code: SAVE20"),
      promoLink: promoLink !== (s.promoLink || ""),
      promoBgColor: compareColor(promoBgColor, s.promoBgColor || "#1a1a1a"),
      promoTextColor: compareColor(promoTextColor, s.promoTextColor || "#ffffff"),
      promo_pos: promo_pos !== (s.promo_pos || "top"),
      promoHeight: compareNumber(promoHeight, s.promoHeight || 44),
      promoFontSize: compareNumber(promoFontSize, s.promoFontSize || 14),
      promoShowOn: promoShowOn !== (s.promoShowOn || "all"),
      promoOnce: compareBool(promoOnce, s.promoOnce || false),
      promoCode: promoCode !== (s.promoCode || "SAVE20"),
      showAnnounce: compareBool(showAnnounce, s.showAnnounce || false),
      announceTitle: announceTitle !== (s.announceTitle || "Special Offer!"),
      announceText: announceText !== (s.announceText || "Subscribe to our newsletter and get 10% off your first order."),
      announce_bg: compareColor(announce_bg, s.announce_bg || "#ffffff"),
      announce_text: compareColor(announce_text, s.announce_text || "#202223"),
      announce_pos: announce_pos !== (s.announce_pos || "center"),
      showExitPopup: compareBool(showExitPopup, s.showExitPopup || false),
      exitTitle: exitTitle !== (s.exitTitle || "Wait! Don't go!"),
      exitText: exitText !== (s.exitText || "Get 10% off your order if you stay!"),
      exit_bg: compareColor(exit_bg, s.exit_bg || "#ffffff"),
      exit_text: compareColor(exit_text, s.exit_text || "#202223"),
      exitOnce: compareBool(exitOnce, s.exitOnce !== false),
      exitButtonText: exitButtonText !== (s.exitButtonText || "Stay with us!"),
      exitButtonLink: exitButtonLink !== (s.exitButtonLink || ""),
      exitBtnBgColor: compareColor(exitBtnBgColor, s.exitBtnBgColor || "#1a1a1a"),
      exitBtnTextColor: compareColor(exitBtnTextColor, s.exitBtnTextColor || "#ffffff"),
      exitWidth: compareNumber(exitWidth, s.exitWidth || 450),
      exitBorderRadius: compareNumber(exitBorderRadius, s.exitBorderRadius || 16),
      exitBackdropBlur: compareBool(exitBackdropBlur, s.exitBackdropBlur !== false),
      showExitEmailInput: compareBool(showExitEmailInput, s.showExitEmailInput || false),
      exitSuccessMessage: exitSuccessMessage !== (s.exitSuccessMessage || "Thank you!"),
      announceButtonText: announceButtonText !== (s.announceButtonText || "Claim Offer"),
      announceButtonLink: announceButtonLink !== (s.announceButtonLink || "/collections/all"),
      announceImage: announceImage !== (s.announceImage || ""),
      announceTrigger: announceTrigger !== (s.announceTrigger || "load"),
      announceBtnBgColor: compareColor(announceBtnBgColor, s.announceBtnBgColor || "#1a1a1a"),
      announceBtnTextColor: compareColor(announceBtnTextColor, s.announceBtnTextColor || "#ffffff"),
      announceSuccessMessage: announceSuccessMessage !== (s.announceSuccessMessage || "Thank you for subscribing!"),
      announceWidth: compareNumber(announceWidth, s.announceWidth || 450),
      announceBorderRadius: compareNumber(announceBorderRadius, s.announceBorderRadius || 16),
      announceBackdropBlur: compareBool(announceBackdropBlur, s.announceBackdropBlur !== false),
      announceDelay: compareNumber(announceDelay, s.announceDelay || 3000),
      showCartTimer: compareBool(showCartTimer, s.showCartTimer || false),
      cartTimerMins: compareNumber(cartTimerMins, s.cartTimerMins || 10),
      cartTimerText: cartTimerText !== (s.cartTimerText || "Your cart is reserved for"),
      showEmailInput: compareBool(showEmailInput, s.showEmailInput || false),
      showInventory: compareBool(showInventory, s.showInventory || false),
      inventoryThreshold: compareNumber(inventoryThreshold, s.inventoryThreshold || 10),
      inventoryText: inventoryText !== (s.inventoryText || "Hurry! Only {stock} left in stock!"),
      announceOnce: compareBool(announceOnce, s.announceOnce !== false),
      showTrustBadges: compareBool(showTrustBadges, s.showTrustBadges || false),
      trustStyle: trustStyle !== (s.trustStyle || "colored"),
      trustBgColor: compareColor(trustBgColor, s.trustBgColor || "#ffffff"),
      trustTextColor: compareColor(trustTextColor, s.trustTextColor || "#1a1a1a"),
      trustIconColor: compareColor(trustIconColor, s.trustIconColor || "#2563eb"),
      trustBorderColor: compareColor(trustBorderColor, s.trustBorderColor || "#e1e3e5"),
      trustBorderWidth: compareNumber(trustBorderWidth, s.trustBorderWidth ?? 1),
      trustBorderRadius: compareNumber(trustBorderRadius, s.trustBorderRadius ?? 10),
      trustAlignment: trustAlignment !== (s.trustAlignment || "center"),
      trustLayout: trustLayout !== (s.trustLayout || "grid"),
      mockRows: compareJson(mockRows, s.mockData),
      trustBadgesData: compareJson(trustBadgesData, s.trustBadgesData || "[]")
    };

    const dirty = Object.keys(checks).filter(k => checks[k]);
    if (dirty.length > 0) {
      // Diagnostic logs removed for production performance
    }
    return dirty.length > 0;
  }, [title, description, sales_pos, sales_bg, sales_text, sales_anim, sales_radius, sales_shadow, sales_font, sales_border_color, sales_border_width, counter_pos, counter_bg, counter_text, cart_bg, cart_text, cart_pos, cart_radius, cart_border_width, cart_border_color, cart_shadow, cart_font, cart_show_progress, cart_timeout_action, displayDuration, initialDelay, displayGap, showMockData, showVisitorCount, counterPulse, counterFluctuate, counter_once_per_session, counter_loop, showHotAlert, showOnMobile, showOnDesktop, isEnabled, logoUrl, minVisitors, maxVisitors, labelVerified, verifiedColor, labelPurchased, labelSomeoneIn, labelVisitors, labelViews24h, labelTrending, showOnPages, hideNames, labelFrom, showSoldCount, labelItemsSold, showPromoBar, promoText, promoLink, promoBgColor, promoTextColor, promo_pos, promoHeight, promoFontSize, promoShowOn, promoOnce, promoCode, showAnnounce, announceTitle, announceText, announce_bg, announce_text, announce_pos, showExitPopup, exitTitle, exitText, exit_bg, exit_text, exitOnce, exitButtonText, exitButtonLink, exitBtnBgColor, exitBtnTextColor, exitWidth, exitBorderRadius, exitBackdropBlur, showExitEmailInput, exitSuccessMessage, announceButtonText, announceButtonLink, announceImage, announceTrigger, announceBtnBgColor, announceBtnTextColor, announceSuccessMessage, announceWidth, announceBorderRadius, announceBackdropBlur, announceDelay, showCartTimer, cartTimerMins, cartTimerText, showEmailInput, showInventory, inventoryThreshold, inventoryText, announceOnce, showTrustBadges, trustStyle, mockRows, trustBadgesData, counter_delay, counter_duration, counter_gap, trustBgColor, trustTextColor, trustIconColor, trustBorderColor, trustBorderWidth, trustBorderRadius, trustAlignment, trustLayout, settings]);

  const saveSettings = () => {
    // Try the main form first; if app is OFF, fall back to the hidden form
    const form = document.getElementById('settings-form') || document.getElementById('settings-form-hidden');
    if (form) form.requestSubmit();
  };

  const handleReset = () => {
    syncStatesWithSettings(settings);
    shopify.toast.show("Changes discarded!");
  };

  useEffect(() => {
    if (isDirty) {
      shopify.saveBar.show("my-save-bar");
    } else {
      shopify.saveBar.hide("my-save-bar");
    }
  }, [isDirty, shopify]);

  return (
    <Page fullWidth>
      <div style={{ padding: '24px', background: '#f6f6f7', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

        <ui-title-bar title="Frank Social Proof Sales Popup"></ui-title-bar>

        <ui-save-bar id="my-save-bar">
          <button variant="primary" onClick={saveSettings}>Save</button>
          <button onClick={handleReset}>Discard</button>
        </ui-save-bar>

        <div style={{ width: '100%', padding: '0 32px' }}>
          {!isEmbedEnabled && (
            <div style={{ marginBottom: '24px', marginTop: '24px' }}>
              <Banner
                title="App Embed is Disabled"
                tone="warning"
              >
                <BlockStack gap="200">
                  <p>
                    The <strong>Frank Social Proof</strong> storefront widget is currently disabled in your active theme. You must enable it in your Theme Editor to show social proof popups, sales notifications, and visitor counters on your live storefront.
                  </p>
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={embedActivateUrl}
                      target="_top"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: '#008060',
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Enable in Theme Editor
                    </a>
                  </div>
                </BlockStack>
              </Banner>
            </div>
          )}

          <div style={{ background: isEnabled ? '#fff' : '#f4f6f8', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginTop: !isEmbedEnabled ? '0px' : '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isEnabled ? '#008060' : '#8c9196', boxShadow: isEnabled ? '0 0 8px #008060' : 'none' }}></div>
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#202223' }}>App Status: {isEnabled ? 'LIVE' : 'OFF'}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6d7175' }}>{isEnabled ? 'App is active and showing notifications on your store.' : 'App is currently paused and hidden from store.'}</p>
              </div>
            </div>
            <PremiumToggle enabled={isEnabled} onClick={toggleStatus} size="large" />
          </div>
        </div>

        {!isEnabled ? (
          <>
            {/* Hidden form so Save bar still works when app is OFF */}
            <Form id="settings-form-hidden" method="post" style={{ display: 'none' }}>
              <input type="hidden" name="isEnabled" value={isEnabled ? "true" : "false"} />
              <input type="hidden" name="showMockData" value={showMockData ? "true" : "false"} />
              <input type="hidden" name="showVisitorCount" value={showVisitorCount ? "true" : "false"} />
              <input type="hidden" name="showInventory" value={showInventory ? "true" : "false"} />
              <input type="hidden" name="showPromoBar" value={showPromoBar ? "true" : "false"} />
              <input type="hidden" name="showAnnounce" value={showAnnounce ? "true" : "false"} />
              <input type="hidden" name="showCartTimer" value={showCartTimer ? "true" : "false"} />
              <input type="hidden" name="showExitPopup" value={showExitPopup ? "true" : "false"} />
              <input type="hidden" name="showTrustBadges" value={showTrustBadges ? "true" : "false"} />
              <input type="hidden" name="showOnMobile" value={showOnMobile ? "true" : "false"} />
              <input type="hidden" name="showOnDesktop" value={showOnDesktop ? "true" : "false"} />
              <input type="hidden" name="logoUrl" value={logoUrl || ""} />
              <input type="hidden" name="mockData" value={JSON.stringify(mockRows)} />
              <input type="hidden" name="trustBadgesData" value={JSON.stringify(trustBadgesData)} />
              <input type="hidden" name="hideNames" value={hideNames ? "true" : "false"} />
              <input type="hidden" name="showSoldCount" value={showSoldCount ? "true" : "false"} />
              <input type="hidden" name="showHotAlert" value={showHotAlert ? "true" : "false"} />
              <input type="hidden" name="showEmailInput" value={showEmailInput ? "true" : "false"} />
              <input type="hidden" name="announceOnce" value={announceOnce ? "true" : "false"} />
              <input type="hidden" name="sales_bg" value={sales_bg} />
              <input type="hidden" name="sales_text" value={sales_text} />
              <input type="hidden" name="sales_pos" value={sales_pos} />
              <input type="hidden" name="sales_anim" value={sales_anim} />
              <input type="hidden" name="sales_radius" value={sales_radius} />
              <input type="hidden" name="sales_shadow" value={sales_shadow} />
              <input type="hidden" name="sales_font" value={sales_font} />
              <input type="hidden" name="sales_border_color" value={sales_border_color} />
              <input type="hidden" name="sales_border_width" value={sales_border_width} />
              <input type="hidden" name="counter_delay" value={counter_delay} />
              <input type="hidden" name="counter_duration" value={counter_duration} />
              <input type="hidden" name="counter_gap" value={counter_gap} />
              <input type="hidden" name="counter_bg" value={counter_bg} />
              <input type="hidden" name="counter_text" value={counter_text} />
              <input type="hidden" name="counter_pos" value={counter_pos} />
              <input type="hidden" name="cart_bg" value={cart_bg} />
              <input type="hidden" name="cart_text" value={cart_text} />
              <input type="hidden" name="cart_pos" value={cart_pos} />
              <input type="hidden" name="announce_bg" value={announce_bg} />
              <input type="hidden" name="announce_text" value={announce_text} />
              <input type="hidden" name="announce_pos" value={announce_pos} />
              <input type="hidden" name="exit_bg" value={exit_bg} />
              <input type="hidden" name="exit_text" value={exit_text} />
              <input type="hidden" name="exitOnce" value={exitOnce ? "true" : "false"} />
              <input type="hidden" name="exitButtonText" value={exitButtonText} />
              <input type="hidden" name="exitButtonLink" value={exitButtonLink} />
              <input type="hidden" name="exitBtnBgColor" value={exitBtnBgColor} />
              <input type="hidden" name="exitBtnTextColor" value={exitBtnTextColor} />
              <input type="hidden" name="exitWidth" value={exitWidth} />
              <input type="hidden" name="exitBorderRadius" value={exitBorderRadius} />
              <input type="hidden" name="exitBackdropBlur" value={exitBackdropBlur ? "true" : "false"} />
              <input type="hidden" name="showExitEmailInput" value={showExitEmailInput ? "true" : "false"} />
              <input type="hidden" name="exitSuccessMessage" value={exitSuccessMessage} />
              <input type="hidden" name="promo_pos" value={promo_pos} />
              <input type="hidden" name="promoBgColor" value={promoBgColor} />
              <input type="hidden" name="promoTextColor" value={promoTextColor} />
              <input type="hidden" name="cart_radius" value={cart_radius} />
              <input type="hidden" name="cart_border_width" value={cart_border_width} />
              <input type="hidden" name="cart_border_color" value={cart_border_color} />
              <input type="hidden" name="cart_shadow" value={cart_shadow} />
              <input type="hidden" name="cart_font" value={cart_font} />
              <input type="hidden" name="cart_show_progress" value={cart_show_progress ? "true" : "false"} />
              <input type="hidden" name="cart_timeout_action" value={cart_timeout_action} />
              <input type="hidden" name="counter_border_width" value={counter_border_width} />
              <input type="hidden" name="counter_radius" value={counter_radius} />
              <input type="hidden" name="counter_shadow" value={counter_shadow} />
              <input type="hidden" name="counter_font" value={counter_font} />
              <input type="hidden" name="counter_border_color" value={counter_border_color} />
              <input type="hidden" name="showSalesPopups" value={showSalesPopups ? "true" : "false"} />
              <input type="hidden" name="initialDelay" value={initialDelay} />
              <input type="hidden" name="displayDuration" value={displayDuration} />
              <input type="hidden" name="displayGap" value={displayGap} />
              <input type="hidden" name="minVisitors" value={minVisitors} />
              <input type="hidden" name="maxVisitors" value={maxVisitors} />
              <input type="hidden" name="labelVisitors" value={labelVisitors} />
              <input type="hidden" name="labelViews24h" value={labelViews24h} />
              <input type="hidden" name="labelTrending" value={labelTrending} />
              <input type="hidden" name="labelItemsSold" value={labelItemsSold} />
              <input type="hidden" name="inventoryThreshold" value={inventoryThreshold} />
              <input type="hidden" name="inventoryText" value={inventoryText} />
              <input type="hidden" name="cartTimerMins" value={cartTimerMins} />
              <input type="hidden" name="cartTimerText" value={cartTimerText} />
              <input type="hidden" name="promoShowOn" value={promoShowOn} />
              <input type="hidden" name="promoHeight" value={promoHeight} />
              <input type="hidden" name="promoFontSize" value={promoFontSize} />
              <input type="hidden" name="promoText" value={promoText} />
              <input type="hidden" name="announceTitle" value={announceTitle} />
              <input type="hidden" name="announceText" value={announceText} />
              <input type="hidden" name="announceButtonText" value={announceButtonText} />
              <input type="hidden" name="announceButtonLink" value={announceButtonLink} />
              <input type="hidden" name="announceTrigger" value={announceTrigger} />
              <input type="hidden" name="announceBtnBgColor" value={announceBtnBgColor} />
              <input type="hidden" name="announceBtnTextColor" value={announceBtnTextColor} />
              <input type="hidden" name="announceSuccessMessage" value={announceSuccessMessage} />
              <input type="hidden" name="announceWidth" value={announceWidth} />
              <input type="hidden" name="announceBorderRadius" value={announceBorderRadius} />
              <input type="hidden" name="announceBackdropBlur" value={announceBackdropBlur ? "true" : "false"} />
              <input type="hidden" name="announceDelay" value={announceDelay} />
              <input type="hidden" name="announceImage" value={announceImage} />
              <input type="hidden" name="exitTitle" value={exitTitle} />
              <input type="hidden" name="exitText" value={exitText} />
              <input type="hidden" name="trustStyle" value={trustStyle} />
              <input type="hidden" name="trustBgColor" value={trustBgColor} />
              <input type="hidden" name="trustTextColor" value={trustTextColor} />
              <input type="hidden" name="trustIconColor" value={trustIconColor} />
              <input type="hidden" name="trustBorderColor" value={trustBorderColor} />
              <input type="hidden" name="trustBorderWidth" value={trustBorderWidth} />
              <input type="hidden" name="trustBorderRadius" value={trustBorderRadius} />
              <input type="hidden" name="trustAlignment" value={trustAlignment} />
              <input type="hidden" name="trustLayout" value={trustLayout} />
              <input type="hidden" name="labelVerified" value={labelVerified} />
              <input type="hidden" name="verifiedColor" value={verifiedColor} />
              <input type="hidden" name="labelPurchased" value={labelPurchased} />
              <input type="hidden" name="labelSomeoneIn" value={labelSomeoneIn} />
              <input type="hidden" name="labelFrom" value={labelFrom} />
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="showOnPages" value={showOnPages} />
              <input type="hidden" name="promoCode" value={promoCode} />
              <input type="hidden" name="promoOnce" value={promoOnce ? "true" : "false"} />
              <input type="hidden" name="promoLink" value={promoLink || ""} />
              <input type="hidden" name="counterPulse" value={counterPulse ? "true" : "false"} />
              <input type="hidden" name="counterFluctuate" value={counterFluctuate ? "true" : "false"} />
              <input type="hidden" name="counter_once_per_session" value={counter_once_per_session ? "true" : "false"} />
              <input type="hidden" name="counter_loop" value={counter_loop ? "true" : "false"} />
              <input type="hidden" name="counter_anim" value={counter_anim} />
              <input type="hidden" name="animationType" value={sales_anim} />
            </Form>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', padding: '40px' }}>
              <div style={{ background: '#f4f6f8', width: '100px', height: '100px', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg viewBox="0 0 20 20" width="40" height="40" fill="#8c9196"><path d="M7 6.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm6 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" /></svg>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#202223' }}>App is Currently Paused</h2>
              <p style={{ color: '#6d7175' }}>Switch the status above to re-activate your social proof tools.</p>
            </div>
          </>
        ) : (
          <div className="settings-container">
            <aside className="sidebar-nav">
              <div className="nav-separator">Campaigns</div>
              <div className={`nav-item ${activeTab === 'sales-popups' ? 'active' : ''}`} onClick={() => setActiveTab('sales-popups')}>
                <span className="nav-icon">{ICONS.sales}</span> Sales Popups
              </div>
              <div className={`nav-item ${activeTab === 'counters' ? 'active' : ''}`} onClick={() => setActiveTab('counters')}>
                <span className="nav-icon">{ICONS.counters}</span> Live Counters
              </div>
              <div className={`nav-item ${activeTab === 'product-scarcity' ? 'active' : ''}`} onClick={() => setActiveTab('product-scarcity')}>
                <span className="nav-icon">{ICONS.scarcity}</span> Product Scarcity
              </div>
              <div className={`nav-item ${activeTab === 'cart-timer' ? 'active' : ''}`} onClick={() => setActiveTab('cart-timer')}>
                <span className="nav-icon">{ICONS.timer}</span> Cart Urgency
              </div>
              <div className={`nav-item ${activeTab === 'promo-bar' ? 'active' : ''}`} onClick={() => setActiveTab('promo-bar')}>
                <span className="nav-icon">{ICONS.promo}</span> Promotion Bar
              </div>
              <div className={`nav-item ${activeTab === 'announcement' ? 'active' : ''}`} onClick={() => setActiveTab('announcement')}>
                <span className="nav-icon">{ICONS.announce}</span> Announcements
              </div>
              <div className={`nav-item ${activeTab === 'exit-popup' ? 'active' : ''}`} onClick={() => setActiveTab('exit-popup')}>
                <span className="nav-icon">{ICONS.exit}</span> Exit Intent Popup
              </div>
              <div className={`nav-item ${activeTab === 'trust-badges' ? 'active' : ''}`} onClick={() => setActiveTab('trust-badges')}>
                <span className="nav-icon">{ICONS.check}</span> Trust Badges
              </div>
              <div className="nav-separator">General</div>
              <div className={`nav-item ${activeTab === 'subscribers' ? 'active' : ''}`} onClick={() => setActiveTab('subscribers')}>
                <span className="nav-icon">{ICONS.messaging}</span> Email Subscribers
              </div>
              <div className={`nav-item ${activeTab === 'aesthetics' ? 'active' : ''}`} onClick={() => setActiveTab('aesthetics')}>
                <span className="nav-icon">{ICONS.aesthetics}</span> Settings & Aesthetics
              </div>
            </aside>

            <main className="main-content">
              <Form id="settings-form" method="post">
                <input type="hidden" name="isEnabled" value={isEnabled ? "true" : "false"} />
                <input type="hidden" name="showMockData" value={showMockData ? "true" : "false"} />
                <input type="hidden" name="showVisitorCount" value={showVisitorCount ? "true" : "false"} />
                <input type="hidden" name="showInventory" value={showInventory ? "true" : "false"} />
                <input type="hidden" name="showPromoBar" value={showPromoBar ? "true" : "false"} />
                <input type="hidden" name="showAnnounce" value={showAnnounce ? "true" : "false"} />
                <input type="hidden" name="showCartTimer" value={showCartTimer ? "true" : "false"} />
                <input type="hidden" name="showExitPopup" value={showExitPopup ? "true" : "false"} />
                <input type="hidden" name="showTrustBadges" value={showTrustBadges ? "true" : "false"} />
                <input type="hidden" name="showOnMobile" value={showOnMobile ? "true" : "false"} />
                <input type="hidden" name="showOnDesktop" value={showOnDesktop ? "true" : "false"} />
                <input type="hidden" name="logoUrl" value={logoUrl || ""} />
                <input type="hidden" name="mockData" value={JSON.stringify(mockRows)} />
                <input type="hidden" name="trustBadgesData" value={JSON.stringify(trustBadgesData)} />
                <input type="hidden" name="hideNames" value={hideNames ? "true" : "false"} />
                <input type="hidden" name="showSoldCount" value={showSoldCount ? "true" : "false"} />
                <input type="hidden" name="showHotAlert" value={showHotAlert ? "true" : "false"} />
                <input type="hidden" name="showEmailInput" value={showEmailInput ? "true" : "false"} />
                <input type="hidden" name="announceOnce" value={announceOnce ? "true" : "false"} />
                <input type="hidden" name="sales_bg" value={sales_bg} />
                <input type="hidden" name="sales_text" value={sales_text} />
                <input type="hidden" name="sales_pos" value={sales_pos} />
                <input type="hidden" name="sales_anim" value={sales_anim} />
                <input type="hidden" name="sales_radius" value={sales_radius} />
                <input type="hidden" name="sales_shadow" value={sales_shadow} />
                <input type="hidden" name="sales_font" value={sales_font} />
                <input type="hidden" name="sales_border_color" value={sales_border_color} />
                <input type="hidden" name="sales_border_width" value={sales_border_width} />
                <input type="hidden" name="counter_delay" value={counter_delay} />
                <input type="hidden" name="counter_duration" value={counter_duration} />
                <input type="hidden" name="counter_gap" value={counter_gap} />
                <input type="hidden" name="counter_bg" value={counter_bg} />
                <input type="hidden" name="counter_text" value={counter_text} />
                <input type="hidden" name="counter_pos" value={counter_pos} />
                <input type="hidden" name="cart_bg" value={cart_bg} />
                <input type="hidden" name="cart_text" value={cart_text} />
                <input type="hidden" name="cart_pos" value={cart_pos} />
                <input type="hidden" name="announce_bg" value={announce_bg} />
                <input type="hidden" name="announce_text" value={announce_text} />
                <input type="hidden" name="announce_pos" value={announce_pos} />
                <input type="hidden" name="exit_bg" value={exit_bg} />
                <input type="hidden" name="exit_text" value={exit_text} />
                <input type="hidden" name="exitOnce" value={exitOnce ? "true" : "false"} />
                <input type="hidden" name="exitButtonText" value={exitButtonText} />
                <input type="hidden" name="exitButtonLink" value={exitButtonLink} />
                <input type="hidden" name="exitBtnBgColor" value={exitBtnBgColor} />
                <input type="hidden" name="exitBtnTextColor" value={exitBtnTextColor} />
                <input type="hidden" name="exitWidth" value={exitWidth} />
                <input type="hidden" name="exitBorderRadius" value={exitBorderRadius} />
                <input type="hidden" name="exitBackdropBlur" value={exitBackdropBlur ? "true" : "false"} />
                <input type="hidden" name="showExitEmailInput" value={showExitEmailInput ? "true" : "false"} />
                <input type="hidden" name="exitSuccessMessage" value={exitSuccessMessage} />
                <input type="hidden" name="promo_pos" value={promo_pos} />
                <input type="hidden" name="promoBgColor" value={promoBgColor} />
                <input type="hidden" name="promoTextColor" value={promoTextColor} />
                <input type="hidden" name="cart_radius" value={cart_radius} />
                <input type="hidden" name="cart_border_width" value={cart_border_width} />
                <input type="hidden" name="cart_border_color" value={cart_border_color} />
                <input type="hidden" name="cart_shadow" value={cart_shadow} />
                <input type="hidden" name="cart_font" value={cart_font} />
                <input type="hidden" name="cart_show_progress" value={cart_show_progress ? "true" : "false"} />
                <input type="hidden" name="cart_timeout_action" value={cart_timeout_action} />
                <input type="hidden" name="counter_border_width" value={counter_border_width} />
                <input type="hidden" name="counter_radius" value={counter_radius} />
                <input type="hidden" name="counter_shadow" value={counter_shadow} />
                <input type="hidden" name="counter_font" value={counter_font} />
                <input type="hidden" name="counter_border_color" value={counter_border_color} />
                <input type="hidden" name="showSalesPopups" value={showSalesPopups ? "true" : "false"} />
                <input type="hidden" name="initialDelay" value={initialDelay} />
                <input type="hidden" name="displayDuration" value={displayDuration} />
                <input type="hidden" name="displayGap" value={displayGap} />
                <input type="hidden" name="minVisitors" value={minVisitors} />
                <input type="hidden" name="maxVisitors" value={maxVisitors} />
                <input type="hidden" name="labelVisitors" value={labelVisitors} />
                <input type="hidden" name="labelViews24h" value={labelViews24h} />
                <input type="hidden" name="labelTrending" value={labelTrending} />
                <input type="hidden" name="labelItemsSold" value={labelItemsSold} />
                <input type="hidden" name="inventoryThreshold" value={inventoryThreshold} />
                <input type="hidden" name="inventoryText" value={inventoryText} />
                <input type="hidden" name="cartTimerMins" value={cartTimerMins} />
                <input type="hidden" name="cartTimerText" value={cartTimerText} />
                <input type="hidden" name="promoShowOn" value={promoShowOn} />
                <input type="hidden" name="promoHeight" value={promoHeight} />
                <input type="hidden" name="promoFontSize" value={promoFontSize} />
                <input type="hidden" name="promoText" value={promoText} />
                <input type="hidden" name="announceTitle" value={announceTitle} />
                <input type="hidden" name="announceText" value={announceText} />
                <input type="hidden" name="announceButtonText" value={announceButtonText} />
                <input type="hidden" name="announceButtonLink" value={announceButtonLink} />
                <input type="hidden" name="announceTrigger" value={announceTrigger} />
                <input type="hidden" name="announceBtnBgColor" value={announceBtnBgColor} />
                <input type="hidden" name="announceBtnTextColor" value={announceBtnTextColor} />
                <input type="hidden" name="announceSuccessMessage" value={announceSuccessMessage} />
                <input type="hidden" name="announceWidth" value={announceWidth} />
                <input type="hidden" name="announceBorderRadius" value={announceBorderRadius} />
                <input type="hidden" name="announceBackdropBlur" value={announceBackdropBlur ? "true" : "false"} />
                <input type="hidden" name="announceDelay" value={announceDelay} />
                <input type="hidden" name="announceImage" value={announceImage} />
                <input type="hidden" name="announce_pos" value={announce_pos} />
                <input type="hidden" name="announce_bg" value={announce_bg} />
                <input type="hidden" name="announce_text" value={announce_text} />
                <input type="hidden" name="exitTitle" value={exitTitle} />
                <input type="hidden" name="exitText" value={exitText} />
                <input type="hidden" name="trustStyle" value={trustStyle} />
                <input type="hidden" name="trustBgColor" value={trustBgColor} />
                <input type="hidden" name="trustTextColor" value={trustTextColor} />
                <input type="hidden" name="trustIconColor" value={trustIconColor} />
                <input type="hidden" name="trustBorderColor" value={trustBorderColor} />
                <input type="hidden" name="trustBorderWidth" value={trustBorderWidth} />
                <input type="hidden" name="trustBorderRadius" value={trustBorderRadius} />
                <input type="hidden" name="trustAlignment" value={trustAlignment} />
                <input type="hidden" name="trustLayout" value={trustLayout} />
                <input type="hidden" name="labelVerified" value={labelVerified} />
                <input type="hidden" name="verifiedColor" value={verifiedColor} />
                <input type="hidden" name="labelPurchased" value={labelPurchased} />
                <input type="hidden" name="labelSomeoneIn" value={labelSomeoneIn} />
                <input type="hidden" name="labelFrom" value={labelFrom} />
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="description" value={description} />
                <input type="hidden" name="showOnPages" value={showOnPages} />
                <input type="hidden" name="promoCode" value={promoCode} />
                <input type="hidden" name="promoOnce" value={promoOnce ? "true" : "false"} />
                <input type="hidden" name="promoLink" value={promoLink || ""} />
                <input type="hidden" name="counterPulse" value={counterPulse ? "true" : "false"} />
                <input type="hidden" name="counterFluctuate" value={counterFluctuate ? "true" : "false"} />
                <input type="hidden" name="counter_once_per_session" value={counter_once_per_session ? "true" : "false"} />
                <input type="hidden" name="counter_loop" value={counter_loop ? "true" : "false"} />
                <input type="hidden" name="counter_anim" value={counter_anim} />
                <input type="hidden" name="animationType" value={sales_anim} />
                {activeTab === 'sales-popups' && (
                  <SalesPopupsTab
                    showSalesPopups={showSalesPopups}
                    setShowSalesPopups={setShowSalesPopups}
                    showMockData={showMockData}
                    logoUrl={logoUrl}
                    setLogoUrl={setLogoUrl}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    labelVerified={labelVerified}
                    setLabelVerified={setLabelVerified}
                    verifiedColor={verifiedColor}
                    setVerifiedColor={setVerifiedColor}
                    labelPurchased={labelPurchased}
                    setLabelPurchased={setLabelPurchased}
                    hideNames={hideNames}
                    setHideNames={setHideNames}
                    sales_bg={sales_bg}
                    setSalesBg={setSalesBg}
                    sales_text={sales_text}
                    setSalesText={setSalesText}
                    sales_pos={sales_pos}
                    setSalesPos={setSalesPos}
                    sales_anim={sales_anim}
                    setSalesAnim={setSalesAnim}
                    sales_radius={sales_radius}
                    setSalesRadius={setSalesRadius}
                    sales_border_color={sales_border_color}
                    setSalesBorderColor={setSalesBorderColor}
                    sales_border_width={sales_border_width}
                    setSalesBorderWidth={setSalesBorderWidth}
                    sales_shadow={sales_shadow}
                    setSalesShadow={setSalesShadow}
                    sales_font={sales_font}
                    setSalesFont={setSalesFont}
                    initialDelay={initialDelay}
                    setInitialDelay={setInitialDelay}
                    displayDuration={displayDuration}
                    setDisplayDuration={setDisplayDuration}
                    displayGap={displayGap}
                    setDisplayGap={setDisplayGap}
                    mockRows={mockRows}
                    updateMockRow={updateMockRow}
                    removeMockRow={removeMockRow}
                    addMockRow={addMockRow}
                    generateRandomMockData={generateRandomMockData}
                    applyPreset={applyPreset}
                    clearMockRows={clearMockRows}
                  />
                )}

                {activeTab === 'counters' && (
                  <CountersTab
                    showVisitorCount={showVisitorCount}
                    setShowVisitorCount={setShowVisitorCount}
                    counter_pos={counter_pos}
                    setCounterPos={setCounterPos}
                    counter_bg={counter_bg}
                    setCounterBg={setCounterBg}
                    counter_text={counter_text}
                    setCounterText={setCounterText}
                    counter_radius={counter_radius}
                    setCounterRadius={setCounterRadius}
                    counter_border_color={counter_border_color}
                    setCounterBorderColor={setCounterBorderColor}
                    counter_border_width={counter_border_width}
                    setCounterBorderWidth={setCounterBorderWidth}
                    counter_shadow={counter_shadow}
                    setCounterShadow={setCounterShadow}
                    counter_anim={counter_anim}
                    setCounterAnim={setCounterAnim}
                    counter_font={counter_font}
                    setCounterFont={setCounterFont}
                    counter_delay={counter_delay}
                    setCounterDelay={setCounterDelay}
                    counter_duration={counter_duration}
                    setCounterDuration={setCounterDuration}
                    counter_gap={counter_gap}
                    setCounterGap={setCounterGap}
                    counterPulse={counterPulse}
                    setCounterPulse={setCounterPulse}
                    counterFluctuate={counterFluctuate}
                    setCounterFluctuate={setCounterFluctuate}
                    counter_once_per_session={counter_once_per_session}
                    setCounterOncePerSession={setCounterOncePerSession}
                    counter_loop={counter_loop}
                    setCounterLoop={setCounterLoop}
                    minVisitors={minVisitors}
                    setMinVisitors={setMinVisitors}
                    maxVisitors={maxVisitors}
                    setMaxVisitors={setMaxVisitors}
                    labelVisitors={labelVisitors}
                    setLabelVisitors={setLabelVisitors}
                    applyCounterPreset={applyCounterPreset}
                  />
                )}

                {activeTab === 'product-scarcity' && (
                  <ProductScarcityTab
                    showHotAlert={showHotAlert}
                    setShowHotAlert={setShowHotAlert}
                    labelTrending={labelTrending}
                    setLabelTrending={setLabelTrending}
                    labelViews24h={labelViews24h}
                    setLabelViews24h={setLabelViews24h}
                    showSoldCount={showSoldCount}
                    setShowSoldCount={setShowSoldCount}
                    labelItemsSold={labelItemsSold}
                    setLabelItemsSold={setLabelItemsSold}
                    showInventory={showInventory}
                    setShowInventory={setShowInventory}
                    inventoryThreshold={inventoryThreshold}
                    setInventoryThreshold={setInventoryThreshold}
                    inventoryText={inventoryText}
                    setInventoryText={setInventoryText}
                  />
                )}

                {activeTab === 'cart-timer' && (
                  <CartTimerTab
                    showCartTimer={showCartTimer}
                    setShowCartTimer={setShowCartTimer}
                    cartTimerText={cartTimerText}
                    setCartTimerText={setCartTimerText}
                    cartTimerMins={cartTimerMins}
                    setCartTimerMins={setCartTimerMins}
                    cart_pos={cart_pos}
                    setCartPos={setCartPos}
                    cart_bg={cart_bg}
                    setCartBg={setCartBg}
                    cart_text={cart_text}
                    setCartText={setCartText}
                    cart_radius={cart_radius}
                    setCartRadius={setCartRadius}
                    cart_border_width={cart_border_width}
                    setCartBorderWidth={setCartBorderWidth}
                    cart_shadow={cart_shadow}
                    setCartShadow={setCartShadow}
                    cart_font={cart_font}
                    setCartFont={setCartFont}
                    cart_border_color={cart_border_color}
                    setCartBorderColor={setCartBorderColor}
                    cart_show_progress={cart_show_progress}
                    setCartShowProgress={setCartShowProgress}
                    cart_timeout_action={cart_timeout_action}
                    setCartTimeoutAction={setCartTimeoutAction}
                    applyCartPreset={applyCartPreset}
                  />
                )}

                {activeTab === 'promo-bar' && (
                  <PromoBarTab
                    showPromoBar={showPromoBar}
                    setShowPromoBar={setShowPromoBar}
                    promoOnce={promoOnce}
                    setPromoOnce={setPromoOnce}
                    promo_pos={promo_pos}
                    setPromoPos={setPromoPos}
                    promoShowOn={promoShowOn}
                    setPromoShowOn={setPromoShowOn}
                    promoText={promoText}
                    setPromoText={setPromoText}
                    promoCode={promoCode}
                    setPromoCode={setPromoCode}
                    promoBgColor={promoBgColor}
                    setPromoBgColor={setPromoBgColor}
                    promoTextColor={promoTextColor}
                    setPromoTextColor={setPromoTextColor}
                    promoHeight={promoHeight}
                    setPromoHeight={setPromoHeight}
                    promoFontSize={promoFontSize}
                    setPromoFontSize={setPromoFontSize}
                    applyPromoPreset={applyPromoPreset}
                  />
                )}

                {activeTab === 'announcement' && (
                  <AnnouncementTab
                    showAnnounce={showAnnounce}
                    setShowAnnounce={setShowAnnounce}
                    announceOnce={announceOnce}
                    setAnnounceOnce={setAnnounceOnce}
                    announceTitle={announceTitle}
                    setAnnounceTitle={setAnnounceTitle}
                    announceText={announceText}
                    setAnnounceText={setAnnounceText}
                    announceImage={announceImage}
                    setAnnounceImage={setAnnounceImage}
                    showEmailInput={showEmailInput}
                    setShowEmailInput={setShowEmailInput}
                    announceSuccessMessage={announceSuccessMessage}
                    setAnnounceSuccessMessage={setAnnounceSuccessMessage}
                    announceButtonText={announceButtonText}
                    setAnnounceButtonText={setAnnounceButtonText}
                    announceButtonLink={announceButtonLink}
                    setAnnounceButtonLink={setAnnounceButtonLink}
                    announceBtnBgColor={announceBtnBgColor}
                    setAnnounceBtnBgColor={setAnnounceBtnBgColor}
                    announceBtnTextColor={announceBtnTextColor}
                    setAnnounceBtnTextColor={setAnnounceBtnTextColor}
                    announceTrigger={announceTrigger}
                    setAnnounceTrigger={setAnnounceTrigger}
                    announceDelay={announceDelay}
                    setAnnounceDelay={setAnnounceDelay}
                    announce_pos={announce_pos}
                    setAnnouncePos={setAnnouncePos}
                    announceWidth={announceWidth}
                    setAnnounceWidth={setAnnounceWidth}
                    announce_bg={announce_bg}
                    setAnnounceBg={setAnnounceBg}
                    announce_text={announce_text}
                    setAnnounceTextState={setAnnounceTextState}
                    announceBorderRadius={announceBorderRadius}
                    setAnnounceBorderRadius={setAnnounceBorderRadius}
                    announceBackdropBlur={announceBackdropBlur}
                    setAnnounceBackdropBlur={setAnnounceBackdropBlur}
                  />
                )}

                {activeTab === 'exit-popup' && (
                  <ExitPopupTab
                    showExitPopup={showExitPopup}
                    setShowExitPopup={setShowExitPopup}
                    exitOnce={exitOnce}
                    setExitOnce={setExitOnce}
                    showExitEmailInput={showExitEmailInput}
                    setShowExitEmailInput={setShowExitEmailInput}
                    exitSuccessMessage={exitSuccessMessage}
                    setExitSuccessMessage={setExitSuccessMessage}
                    exitButtonText={exitButtonText}
                    setExitButtonText={setExitButtonText}
                    exitButtonLink={exitButtonLink}
                    setExitButtonLink={setExitButtonLink}
                    exitBtnBgColor={exitBtnBgColor}
                    setExitBtnBgColor={setExitBtnBgColor}
                    exitBtnTextColor={exitBtnTextColor}
                    setExitBtnTextColor={setExitBtnTextColor}
                    exitTitle={exitTitle}
                    setExitTitle={setExitTitle}
                    exitText={exitText}
                    setExitText={setExitText}
                    exit_bg={exit_bg}
                    setExitBg={setExitBg}
                    exit_text={exit_text}
                    setExitTextState={setExitTextState}
                    exitWidth={exitWidth}
                    setExitWidth={setExitWidth}
                    exitBorderRadius={exitBorderRadius}
                    setExitBorderRadius={setExitBorderRadius}
                    exitBackdropBlur={exitBackdropBlur}
                    setExitBackdropBlur={setExitBackdropBlur}
                  />
                )}

                {activeTab === 'trust-badges' && (
                  <TrustBadgesTab
                    showTrustBadges={showTrustBadges}
                    setShowTrustBadges={setShowTrustBadges}
                    trustStyle={trustStyle}
                    setTrustStyle={setTrustStyle}
                    trustLayout={trustLayout}
                    setTrustLayout={setTrustLayout}
                    trustAlignment={trustAlignment}
                    setTrustAlignment={setTrustAlignment}
                    trustBgColor={trustBgColor}
                    setTrustBgColor={setTrustBgColor}
                    trustTextColor={trustTextColor}
                    setTrustTextColor={setTrustTextColor}
                    trustIconColor={trustIconColor}
                    setTrustIconColor={setTrustIconColor}
                    trustBorderColor={trustBorderColor}
                    setTrustBorderColor={setTrustBorderColor}
                    trustBorderRadius={trustBorderRadius}
                    setTrustBorderRadius={setTrustBorderRadius}
                    trustBorderWidth={trustBorderWidth}
                    setTrustBorderWidth={setTrustBorderWidth}
                    trustBadgesData={trustBadgesData}
                    setTrustBadgesData={setTrustBadgesData}
                    updateTrustBadge={updateTrustBadge}
                    removeTrustBadge={removeTrustBadge}
                    addTrustBadge={addTrustBadge}
                  />
                )}

                {activeTab === 'subscribers' && (
                  <SubscribersTab
                    subscribers={subscribers}
                    subscriberSearch={subscriberSearch}
                    setSubscriberSearch={setSubscriberSearch}
                    settings={settings}
                    shopify={shopify}
                    deleteFetcher={deleteFetcher}
                  />
                )}

                {activeTab === 'aesthetics' && (
                  <AestheticsTab
                    showOnMobile={showOnMobile}
                    setShowOnMobile={setShowOnMobile}
                    showOnDesktop={showOnDesktop}
                    setShowOnDesktop={setShowOnDesktop}
                  />
                )}


              </Form>
            </main>

            <LivePreview
              activeTab={activeTab}
              isEnabled={isEnabled}
              showSalesPopups={showSalesPopups}
              showVisitorCount={showVisitorCount}
              showInventory={showInventory}
              showHotAlert={showHotAlert}
              showSoldCount={showSoldCount}
              showPromoBar={showPromoBar}
              showCartTimer={showCartTimer}
              showExitPopup={showExitPopup}
              showTrustBadges={showTrustBadges}
              animationKey={animationKey}
              sales_anim={sales_anim}
              sales_bg={sales_bg}
              sales_text={sales_text}
              sales_border_width={sales_border_width}
              sales_border_color={sales_border_color}
              sales_radius={sales_radius}
              sales_shadow={sales_shadow}
              sales_font={sales_font}
              logoUrl={logoUrl}
              hideNames={hideNames}
              mockRows={mockRows}
              labelPurchased={labelPurchased}
              labelVerified={labelVerified}
              verifiedColor={verifiedColor}
              counter_anim={counter_anim}
              counter_bg={counter_bg}
              counter_text={counter_text}
              counter_border_width={counter_border_width}
              counter_border_color={counter_border_color}
              counter_radius={counter_radius}
              counter_shadow={counter_shadow}
              counter_font={counter_font}
              counterPulse={counterPulse}
              maxVisitors={maxVisitors}
              labelVisitors={labelVisitors}
              labelViews24h={labelViews24h}
              labelItemsSold={labelItemsSold}
              inventoryText={inventoryText}
              promoBgColor={promoBgColor}
              promoTextColor={promoTextColor}
              promoText={promoText}
              promoCode={promoCode}
              cart_pos={cart_pos}
              cart_bg={cart_bg}
              cart_text={cart_text}
              cart_border_width={cart_border_width}
              cart_border_color={cart_border_color}
              cart_shadow={cart_shadow}
              cart_font={cart_font}
              cartTimerText={cartTimerText}
              previewTimerSeconds={previewTimerSeconds}
              cart_show_progress={cart_show_progress}
              cartTimerMins={cartTimerMins}
              cart_radius={cart_radius}
              exit_bg={exit_bg}
              exit_text={exit_text}
              exitText={exitText}
              exitBorderRadius={exitBorderRadius}
              exitTitle={exitTitle}
              showExitEmailInput={showExitEmailInput}
              exitBtnBgColor={exitBtnBgColor}
              exitBtnTextColor={exitBtnTextColor}
              exitButtonText={exitButtonText}
              showAnnounce={showAnnounce}
              showEmailInput={showEmailInput}
              announceText={announceText}
              announce_bg={announce_bg}
              announce_text={announce_text}
              announceBorderRadius={announceBorderRadius}
              announceImage={announceImage}
              announceTitle={announceTitle}
              announceButtonText={announceButtonText}
              announceBtnBgColor={announceBtnBgColor}
              announceBtnTextColor={announceBtnTextColor}
              trustAlignment={trustAlignment}
              trustLayout={trustLayout}
              trustBadgesData={trustBadgesData}
              trustTextColor={trustTextColor}
              trustBgColor={trustBgColor}
              trustBorderWidth={trustBorderWidth}
              trustBorderColor={trustBorderColor}
              trustBorderRadius={trustBorderRadius}
              trustStyle={trustStyle}
              trustIconColor={trustIconColor}
              subscribers={subscribers}
            />
          </div>
        )}
      </div>
    </Page>
  );
}
