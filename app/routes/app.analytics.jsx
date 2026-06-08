import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState, useCallback, useMemo } from "react";
import { 
  Page, 
  Card, 
  Text, 
  Grid, 
  BlockStack, 
  InlineStack, 
  Badge, 
  Icon, 
  ButtonGroup, 
  Button, 
  DataTable,
  Popover,
  DatePicker,
  Box,
  Banner
} from "@shopify/polaris";
import {
  ViewIcon,
  SearchIcon,
  CartIcon,
  ChartHistogramGrowthIcon,
  CalendarIcon
} from "@shopify/polaris-icons";

// Store timezone cache to prevent redundant GraphQL calls
const shopTimezoneMap = new Map();

// Cache embed status (isEmbedEnabled + extensionId) per shop — 60 second TTL
// Prevents redundant Shopify themes GraphQL call on every dashboard load
const embedStatusCache = new Map();
const EMBED_CACHE_TTL_MS = 10 * 1000; // 10 second TTL for snappy updates

// Helper to format Date object into YYYY-MM-DD string in target timezone
function getLocalDateString(date, timezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

// Helper to convert YYYY-MM-DD string to UTC midnight Date object
function parseDateString(dateStr) {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Consistent UTC date formatting to prevent hydration mismatches
function formatFriendlyDate(dateObj) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = dateObj.getUTCDate();
  const month = months[dateObj.getUTCMonth()];
  const year = dateObj.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

function formatFriendlyDateShort(dateObj) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = dateObj.getUTCDate();
  const month = months[dateObj.getUTCMonth()];
  return `${month} ${day}`;
}

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  // Verify if the social_proof app embed block is enabled — uses 60s cache
  let isEmbedEnabled = false;
  let extensionId = "ea691a59-47df-b6e4-81b5-35e318b96494c9523f59"; // Fallback to dev UUID

  const cachedEmbed = embedStatusCache.get(shop);
  if (cachedEmbed && (Date.now() - cachedEmbed.timestamp < EMBED_CACHE_TTL_MS)) {
    // Cache hit — use cached values, skip GraphQL call
    isEmbedEnabled = cachedEmbed.isEmbedEnabled;
    extensionId = cachedEmbed.extensionId;
  } else {
    // Cache miss — fetch from Shopify and store result
    try {
      const response = await admin.graphql(
        `#graphql
        query GetMainThemeSettings {
          currentAppInstallation {
            app {
              handle
            }
          }
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
              // Match by /blocks/social_proof only — app handle varies between dev and prod
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

      // Store in cache
      embedStatusCache.set(shop, { isEmbedEnabled, extensionId, timestamp: Date.now() });
    } catch (err) {
      console.error("Failed to check app embed status:", err);
      isEmbedEnabled = true; // Fallback to true if API fails
    }
  }

  // Override fallback ID with env variable if available in production environment
  if (process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID) {
    extensionId = process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID;
  }

  const shopName = shop.replace(".myshopify.com", "");
  const embedActivateUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&activateAppId=${extensionId}/social_proof`;

  // 1. Get store timezone (using cached value or fetching via GraphQL)
  let timezone = shopTimezoneMap.get(shop);
  if (!timezone && admin) {
    try {
      const response = await admin.graphql(
        `#graphql
        query getShopTimezoneForDashboard {
          shop {
            ianaTimezone
          }
        }`
      );
      const resJson = await response.json();
      timezone = resJson.data?.shop?.ianaTimezone || "UTC";
      shopTimezoneMap.set(shop, timezone);
    } catch (err) {
      console.error("Failed to fetch shop timezone:", err);
      timezone = "UTC";
    }
  }
  timezone = timezone || "UTC";

  // 2. Parse URL parameters for date filtering
  const url = new URL(request.url);
  const startDateParam = url.searchParams.get("startDate");
  const endDateParam = url.searchParams.get("endDate");
  const presetParam = url.searchParams.get("preset") || "7";

  let curStart = startDateParam;
  let curEnd = endDateParam;
  let preset = presetParam;

  const todayL = getLocalDateString(new Date(), timezone);
  const [ty, tm, td] = todayL.split("-").map(Number);
  const todayObj = new Date(Date.UTC(ty, tm - 1, td));

  // Determine current range if not explicitly provided as custom parameters
  if (!curStart || !curEnd) {
    if (preset === "today") {
      curStart = todayL;
      curEnd = todayL;
    } else if (preset === "yesterday") {
      const yesterdayObj = new Date(todayObj);
      yesterdayObj.setUTCDate(todayObj.getUTCDate() - 1);
      curStart = yesterdayObj.toISOString().split('T')[0];
      curEnd = curStart;
    } else if (preset === "all") {
      // Find earliest analytics date to set as curStart
      const earliest = await prisma.analytics.findFirst({
        where: { shop },
        orderBy: { date: 'asc' }
      });
      curStart = earliest ? earliest.date : todayL;
      curEnd = todayL;
    } else {
      // Standard presets: 7, 14, 30, 90
      let offset = 6;
      if (preset === "14") offset = 13;
      else if (preset === "30") offset = 29;
      else if (preset === "90") offset = 89;
      
      const startObj = new Date(todayObj);
      startObj.setUTCDate(todayObj.getUTCDate() - offset);
      curStart = startObj.toISOString().split('T')[0];
      curEnd = todayL;
    }
  } else {
    if (!url.searchParams.has("preset")) {
      preset = "custom";
    }
  }

  // Calculate previous period for comparison stats
  let previousAnalytics = [];
  let analytics = [];
  const isAllTime = (preset === "all");

  if (isAllTime) {
    // Fetch all analytics for all-time view
    analytics = await prisma.analytics.findMany({
      where: { shop },
      orderBy: { date: 'asc' }
    });
  } else {
    const [sY, sM, sD] = curStart.split("-").map(Number);
    const [eY, eM, eD] = curEnd.split("-").map(Number);
    const startObj = new Date(Date.UTC(sY, sM - 1, sD));
    const endObj = new Date(Date.UTC(eY, eM - 1, eD));
    const diffDays = Math.ceil(Math.abs(endObj - startObj) / (1000 * 60 * 60 * 24)) + 1;

    const prevStartObj = new Date(startObj);
    prevStartObj.setUTCDate(startObj.getUTCDate() - diffDays);
    const prevStartDate = prevStartObj.toISOString().split('T')[0];

    // Fetch current and previous periods combined to optimize query
    const allRecords = await prisma.analytics.findMany({
      where: {
        shop,
        date: {
          gte: prevStartDate,
          lte: curEnd
        }
      },
      orderBy: { date: 'asc' }
    });

    analytics = allRecords.filter(r => r.date >= curStart && r.date <= curEnd);
    previousAnalytics = allRecords.filter(r => r.date >= prevStartDate && r.date < curStart);
  }

  // Fetch product views within the current selected date range
  const pViews = await prisma.productView.findMany({
    where: {
      shop,
      date: {
        gte: curStart,
        lte: curEnd
      }
    }
  });

  // Group and sum product views by handle
  const pViewMap = new Map();
  for (const pv of pViews) {
    const currentCount = pViewMap.get(pv.handle) || 0;
    pViewMap.set(pv.handle, currentCount + pv.count);
  }
  const productViews = Array.from(pViewMap.entries())
    .map(([handle, count]) => ({ handle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalProductViewsInRange = Array.from(pViewMap.values()).reduce((acc, curr) => acc + curr, 0);

  // Fetch recent orders for the activity log (globally last 5 orders)
  let recentOrders = [];
  try {
    const response = await admin.graphql(
      `#graphql
      query fetchRecentOrders {
        orders(first: 5, sortKey: CREATED_AT, reverse: true) {
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
      recentOrders = responseJson.data.orders.edges.map((edge) => {
        const node = edge.node;
        return {
          id: node.id,
          customerName: node.customer?.firstName || "Someone",
          city: node.customer?.defaultAddress?.city || "Somewhere",
          productTitle: node.lineItems.edges[0]?.node.title || "a product",
          createdAt: new Date(node.createdAt).toLocaleString(),
        };
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  return {
    analytics,
    previousAnalytics,
    curStart,
    curEnd,
    preset,
    timezone,
    recentOrders,
    productViews,
    totalProductViewsInRange,
    isEmbedEnabled,
    embedActivateUrl
  };
};

export default function Analytics() {
  const {
    analytics,
    previousAnalytics,
    curStart,
    curEnd,
    preset,
    timezone,
    recentOrders,
    productViews,
    totalProductViewsInRange,
    isEmbedEnabled,
    embedActivateUrl
  } = useLoaderData();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeChartTab, setActiveChartTab] = useState("combined"); // combined, impressions, or clicks
  const [hoveredPoint, setHoveredPoint] = useState(null); // {x, y, label, value, type}
  
  // Date Picker States
  const [popoverActive, setPopoverActive] = useState(false);
  const [tempPreset, setTempPreset] = useState(preset);
  const [tempSelected, setTempSelected] = useState(() => ({
    start: parseDateString(curStart),
    end: parseDateString(curEnd)
  }));
  
  const [{ visibleMonth, visibleYear }, setCalendarDate] = useState(() => {
    const endObj = parseDateString(curEnd);
    return { visibleMonth: endObj.getUTCMonth(), visibleYear: endObj.getUTCFullYear() };
  });

  // Calculate preset ranges on the client-side
  const getPresetRange = useCallback((presetVal, tz) => {
    const todayL = getLocalDateString(new Date(), tz);
    const [ty, tm, td] = todayL.split("-").map(Number);
    const todayObj = new Date(Date.UTC(ty, tm - 1, td));

    let start = todayObj;
    let end = todayObj;

    switch (presetVal) {
      case "today":
        start = todayObj;
        end = todayObj;
        break;
      case "yesterday":
        const yesterday = new Date(todayObj);
        yesterday.setUTCDate(todayObj.getUTCDate() - 1);
        start = yesterday;
        end = yesterday;
        break;
      case "7":
        const start7 = new Date(todayObj);
        start7.setUTCDate(todayObj.getUTCDate() - 6);
        start = start7;
        end = todayObj;
        break;
      case "14":
        const start14 = new Date(todayObj);
        start14.setUTCDate(todayObj.getUTCDate() - 13);
        start = start14;
        end = todayObj;
        break;
      case "30":
        const start30 = new Date(todayObj);
        start30.setUTCDate(todayObj.getUTCDate() - 29);
        start = start30;
        end = todayObj;
        break;
      case "90":
        const start90 = new Date(todayObj);
        start90.setUTCDate(todayObj.getUTCDate() - 89);
        start = start90;
        end = todayObj;
        break;
      case "all":
        start = parseDateString(curStart);
        end = todayObj;
        break;
      default:
        break;
    }

    return { start, end };
  }, [curStart]);

  const togglePopover = useCallback(() => {
    if (!popoverActive) {
      setTempPreset(preset);
      setTempSelected({
        start: parseDateString(curStart),
        end: parseDateString(curEnd)
      });
      const endObj = parseDateString(curEnd);
      setCalendarDate({ visibleMonth: endObj.getUTCMonth(), visibleYear: endObj.getUTCFullYear() });
    }
    setPopoverActive(active => !active);
  }, [popoverActive, preset, curStart, curEnd]);

  const handlePresetClick = useCallback((presetVal) => {
    setTempPreset(presetVal);
    if (presetVal !== "custom") {
      const range = getPresetRange(presetVal, timezone);
      const startStr = range.start.toISOString().split('T')[0];
      const endStr = range.end.toISOString().split('T')[0];
      navigate(`?startDate=${startStr}&endDate=${endStr}&preset=${presetVal}`);
      setPopoverActive(false);
    }
  }, [getPresetRange, timezone, navigate]);

  const handleDateRangeChange = useCallback((range) => {
    setTempSelected(range);
    setTempPreset("custom");
  }, []);

  const handleMonthChange = useCallback((month, year) => {
    setCalendarDate({ visibleMonth: month, visibleYear: year });
  }, []);

  const handleApplyDateRange = useCallback(() => {
    const startStr = tempSelected.start.toISOString().split('T')[0];
    const endStr = tempSelected.end.toISOString().split('T')[0];
    navigate(`?startDate=${startStr}&endDate=${endStr}&preset=${tempPreset}`);
    setPopoverActive(false);
  }, [navigate, tempSelected, tempPreset]);

  // Construct chart data points for each day in range
  const chartData = useMemo(() => {
    const data = [];
    const [sY, sM, sD] = curStart.split("-").map(Number);
    const [eY, eM, eD] = curEnd.split("-").map(Number);
    const startObj = new Date(Date.UTC(sY, sM - 1, sD));
    const endObj = new Date(Date.UTC(eY, eM - 1, eD));

    const tempDate = new Date(startObj);
    while (tempDate <= endObj) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const match = analytics.find(a => a.date === dateStr);
      data.push({
        dateStr,
        dateLabel: formatFriendlyDateShort(tempDate),
        impressions: match ? match.impressions : 0,
        clicks: match ? match.clicks : 0
      });
      tempDate.setUTCDate(tempDate.getUTCDate() + 1);
    }
    return data;
  }, [analytics, curStart, curEnd]);

  // Calculate current range totals
  const rangeImpressions = useMemo(() => chartData.reduce((acc, curr) => acc + curr.impressions, 0), [chartData]);
  const rangeClicks = useMemo(() => chartData.reduce((acc, curr) => acc + curr.clicks, 0), [chartData]);
  const rangeCtr = useMemo(() => rangeImpressions > 0 ? ((rangeClicks / rangeImpressions) * 100).toFixed(1) : "0.0", [rangeImpressions, rangeClicks]);

  // Calculate previous period totals for comparison
  const prevImpressions = useMemo(() => previousAnalytics.reduce((acc, curr) => acc + curr.impressions, 0), [previousAnalytics]);
  const prevClicks = useMemo(() => previousAnalytics.reduce((acc, curr) => acc + (curr.clicks || 0), 0), [previousAnalytics]);
  const prevCtr = useMemo(() => prevImpressions > 0 ? ((prevClicks / prevImpressions) * 100).toFixed(1) : "0.0", [prevImpressions, prevClicks]);

  // Growth percentages
  const calculateGrowth = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  };

  const impressionsGrowth = calculateGrowth(rangeImpressions, prevImpressions);
  const clicksGrowth = calculateGrowth(rangeClicks, prevClicks);
  const ctrGrowth = calculateGrowth(parseFloat(rangeCtr), parseFloat(prevCtr));
  const isAllTime = (preset === "all");

  // Chart SVG coordinates
  const maxImp = Math.max(...chartData.map(d => d.impressions), 10);
  const maxClicks = Math.max(...chartData.map(d => d.clicks), 10);

  const impPoints = useMemo(() => {
    const spacing = 900 / (chartData.length - 1 || 1);
    return chartData.map((d, i) => {
      const x = 50 + i * spacing;
      const y = 180 - (d.impressions / maxImp) * 130;
      return { x, y, value: d.impressions, date: d.dateLabel, type: 'impressions' };
    });
  }, [chartData, maxImp]);

  const clickPoints = useMemo(() => {
    const spacing = 900 / (chartData.length - 1 || 1);
    return chartData.map((d, i) => {
      const x = 50 + i * spacing;
      const y = 180 - (d.clicks / maxClicks) * 130;
      return { x, y, value: d.clicks, date: d.dateLabel, type: 'clicks' };
    });
  }, [chartData, maxClicks]);

  // Bézier curve generator
  const getBezierPath = (points) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const impLinePath = getBezierPath(impPoints);
  const impAreaPath = impPoints.length > 0 ? `${impLinePath} L ${impPoints[impPoints.length - 1].x} 200 L ${impPoints[0].x} 200 Z` : "";

  const clickLinePath = getBezierPath(clickPoints);
  const clickAreaPath = clickPoints.length > 0 ? `${clickLinePath} L ${clickPoints[clickPoints.length - 1].x} 200 L ${clickPoints[0].x} 200 Z` : "";

  // Progress ring
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(parseFloat(rangeCtr), 100) / 100) * circumference;

  // CSV Export for active selection
  const handleExportCSVReport = () => {
    const headers = ["Date", "Impressions", "Clicks", "Click-Through Rate (CTR %)"];
    const rows = chartData.map(d => {
      const dayCtr = d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(1) : "0.0";
      return [
        d.dateStr,
        d.impressions,
        d.clicks,
        `${dayCtr}%`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `social-proof-analytics-${curStart}-to-${curEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.shopify) {
      window.shopify.toast.show("Report exported successfully!");
    }
  };

  // PDF Export for active selection via print window
  const handleExportPDFReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      if (window.shopify) {
        window.shopify.toast.show("Please allow popups to export PDF reports.");
      }
      return;
    }

    const dateLabel = isAllTime ? "All Time" : `${curStart} to ${curEnd}`;
    const tableData = [...chartData].reverse();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Frank Social Proof Analytics - Performance Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #4f46e5;
          }
          .header p {
            margin: 5px 0 0 0;
            color: #64748b;
            font-size: 14px;
          }
          .meta-info {
            text-align: right;
            font-size: 14px;
            color: #64748b;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .metric-card h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
          }
          .metric-card .value {
            font-size: 28px;
            font-weight: bold;
            color: #0f172a;
          }
          .metric-card .growth {
            margin-top: 5px;
            font-size: 12px;
            font-weight: 600;
          }
          .growth.positive { color: #16a34a; }
          .growth.negative { color: #dc2626; }
          .growth.neutral { color: #64748b; }
          
          h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #0f172a;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 600;
            color: #475569;
          }
          tr:hover {
            background-color: #f8fafc;
          }
          
          .footer {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          
          @media print {
            body { padding: 0; }
            .no-print-btn { display: none; }
          }
          
          .no-print-btn {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 20px;
            display: inline-block;
          }
          .no-print-btn:hover {
            background: #4338ca;
          }
        </style>
      </head>
      <body>
        <button class="no-print-btn" onclick="window.print()">Print / Save as PDF</button>
        
        <div class="header">
          <div>
            <h1>Frank Social Proof Sales Popup</h1>
            <p>Performance Report & Storefront Analytics</p>
          </div>
          <div class="meta-info">
            <div><strong>Store:</strong> ${timezone} (Local Time)</div>
            <div><strong>Period:</strong> ${dateLabel}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Impressions</h3>
            <div class="value">${rangeImpressions.toLocaleString()}</div>
            ${!isAllTime ? `
              <div class="growth ${impressionsGrowth > 0 ? 'positive' : impressionsGrowth < 0 ? 'negative' : 'neutral'}">
                ${impressionsGrowth >= 0 ? '▲ +' : '▼ '}${impressionsGrowth}% vs previous period
              </div>
            ` : ''}
          </div>
          <div class="metric-card">
            <h3>Interactions (Clicks)</h3>
            <div class="value">${rangeClicks.toLocaleString()}</div>
            ${!isAllTime ? `
              <div class="growth ${clicksGrowth > 0 ? 'positive' : clicksGrowth < 0 ? 'negative' : 'neutral'}">
                ${clicksGrowth >= 0 ? '▲ +' : '▼ '}${clicksGrowth}% vs previous period
              </div>
            ` : ''}
          </div>
          <div class="metric-card">
            <h3>Click-Through Rate</h3>
            <div class="value">${rangeCtr}%</div>
            ${!isAllTime ? `
              <div class="growth ${ctrGrowth > 0 ? 'positive' : ctrGrowth < 0 ? 'negative' : 'neutral'}">
                ${ctrGrowth >= 0 ? '▲ +' : '▼ '}${ctrGrowth}% vs previous period
              </div>
            ` : ''}
          </div>
          <div class="metric-card">
            <h3>Sales Feeds (7D)</h3>
            <div class="value">${recentOrders.length}</div>
            <div class="growth neutral">Recent Verified</div>
          </div>
        </div>

        <h2>Daily Log Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CTR (%)</th>
            </tr>
          </thead>
          <tbody>
            ${tableData.map(d => {
              const dayCtr = d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(1) : "0.0";
              return `
                <tr>
                  <td>${d.dateStr}</td>
                  <td>${d.impressions.toLocaleString()}</td>
                  <td>${d.clicks.toLocaleString()}</td>
                  <td>${dayCtr}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        ${productViews.length > 0 ? `
          <h2>Popular Products Visited</h2>
          <table>
            <thead>
              <tr>
                <th>Product Handle</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              ${productViews.map(pv => `
                <tr>
                  <td>${pv.handle}</td>
                  <td>${pv.count.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="footer">
          Thank you for using Frank Social Proof Sales Popup app to boost your store conversions.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Determine button text for date range selector
  let datePickerButtonText = "";
  if (preset === "today") datePickerButtonText = "Today";
  else if (preset === "yesterday") datePickerButtonText = "Yesterday";
  else if (preset === "7") datePickerButtonText = "Last 7 Days";
  else if (preset === "14") datePickerButtonText = "Last 14 Days";
  else if (preset === "30") datePickerButtonText = "Last 30 Days";
  else if (preset === "90") datePickerButtonText = "Last 90 Days";
  else if (preset === "all") datePickerButtonText = "All Time";
  else {
    const sObj = parseDateString(curStart);
    const eObj = parseDateString(curEnd);
    datePickerButtonText = `${formatFriendlyDateShort(sObj)} – ${formatFriendlyDateShort(eObj)}`;
  }

  // Pre-calculated activator for popover
  const datePickerActivator = (
    <Button icon={CalendarIcon} onClick={togglePopover} size="large">
      {datePickerButtonText}
    </Button>
  );

  return (
    <Page 
      fullWidth
      title="Analytics Dashboard"
      subtitle="Monitor storefront widgets, click metrics, and conversion rate."
      titleMetadata={<Badge tone="success">Live Tracker Active</Badge>}
      primaryAction={{
        content: "Export CSV Report",
        onAction: handleExportCSVReport
      }}
      secondaryActions={[
        {
          content: "Print / Save PDF Report",
          onAction: handleExportPDFReport
        }
      ]}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-kpi-card {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease !important;
        }
        .premium-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06) !important;
        }
        .chart-point-dot {
          transition: r 0.15s ease, stroke-width 0.15s ease;
          cursor: pointer;
        }
        .chart-point-dot:hover {
          r: 7px;
          stroke-width: 3px;
        }
        .hover-table-row {
          transition: background-color 0.15s ease;
        }
        .hover-table-row:hover {
          background-color: var(--p-color-bg-surface-secondary);
        }
        .calendar-preset-btn {
          text-align: left !important;
          width: 100% !important;
        }
      ` }} />

      <BlockStack gap="500">
        {!isEmbedEnabled && (
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
        )}

        {/* Global Date Selector bar like YouTube Studio */}
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="050">
            <Text variant="headingLg" as="h2">Performance Summary</Text>
            <InlineStack gap="150" blockAlign="center">
              <Text variant="bodySm" as="p" tone="subdued">Synced with live store visitors & checkouts</Text>
              <Badge tone="info">Store Timezone: {timezone}</Badge>
            </InlineStack>
          </BlockStack>
          
          {/* Custom Date Range Popover Calendar */}
          <Popover
            active={popoverActive}
            activator={datePickerActivator}
            onClose={() => setPopoverActive(false)}
          >
            <Box padding="300">
              <BlockStack gap="300">
                <div style={{ display: "flex", flexDirection: "row", gap: "24px", alignItems: "flex-start" }}>
                  {/* Left Column: Preset Buttons */}
                  <Box 
                    minWidth="160px" 
                    padding={tempPreset === "custom" ? { right: "300" } : undefined} 
                    style={tempPreset === "custom" ? { borderRight: "1px solid var(--p-color-border-secondary)" } : undefined}
                  >
                    <BlockStack gap="050">
                      {[
                        { label: "Today", value: "today" },
                        { label: "Yesterday", value: "yesterday" },
                        { label: "Last 7 Days", value: "7" },
                        { label: "Last 14 Days", value: "14" },
                        { label: "Last 30 Days", value: "30" },
                        { label: "Last 90 Days", value: "90" },
                        { label: "All Time", value: "all" },
                        { label: "Custom Range", value: "custom" }
                      ].map((p) => (
                        <Button
                          key={p.value}
                          variant={tempPreset === p.value ? "secondary" : "plain"}
                          onClick={() => handlePresetClick(p.value)}
                          className="calendar-preset-btn"
                          textAlign="left"
                          fullWidth
                        >
                          <span style={{ whiteSpace: "nowrap" }}>{p.label}</span>
                        </Button>
                      ))}
                    </BlockStack>
                  </Box>

                  {/* Right Column: Calendar Picker (Only shown when Custom Range is selected) */}
                  {tempPreset === "custom" && (
                    <Box minWidth="280px">
                      <DatePicker
                        month={visibleMonth}
                        year={visibleYear}
                        selected={tempSelected}
                        onChange={handleDateRangeChange}
                        onMonthChange={handleMonthChange}
                        allowRange
                      />
                    </Box>
                  )}
                </div>

                {/* Footer: Date Range Text & Apply/Cancel (Only shown when Custom Range is selected) */}
                {tempPreset === "custom" && (
                  <div style={{ borderTop: "1px solid var(--p-color-border-secondary)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text variant="bodySm" tone="subdued">
                      {formatFriendlyDate(tempSelected.start)}
                      {" – "}
                      {formatFriendlyDate(tempSelected.end)}
                    </Text>
                    <InlineStack gap="200">
                      <Button onClick={() => setPopoverActive(false)}>Cancel</Button>
                      <Button variant="primary" onClick={handleApplyDateRange}>Apply</Button>
                    </InlineStack>
                  </div>
                )}
              </BlockStack>
            </Box>
          </Popover>
        </InlineStack>

        {/* 4-Column KPI Cards */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <div className="premium-kpi-card">
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingSm" as="h6" tone="subdued">WIDGET IMPRESSIONS</Text>
                    <div style={{ color: "#6366f1", background: "#e0e7ff", padding: "6px", borderRadius: "8px", display: "flex" }}>
                      <Icon source={ViewIcon} tone="base" />
                    </div>
                  </InlineStack>
                  <Text variant="heading2xl" as="p">{rangeImpressions.toLocaleString()}</Text>
                  <InlineStack gap="150" blockAlign="center">
                    {!isAllTime ? (
                      <Badge tone={impressionsGrowth >= 0 ? "success" : "critical"}>
                        {impressionsGrowth >= 0 ? `+${impressionsGrowth}%` : `${impressionsGrowth}%`}
                      </Badge>
                    ) : (
                      <Badge tone="info">All Time</Badge>
                    )}
                    <Text variant="bodyXs" as="p" tone="subdued">
                      {!isAllTime ? "vs previous period" : "Total widget views"}
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Card>
            </div>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <div className="premium-kpi-card">
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingSm" as="h6" tone="subdued">TOTAL INTERACTIONS</Text>
                    <div style={{ color: "#10b981", background: "#d1fae5", padding: "6px", borderRadius: "8px", display: "flex" }}>
                      <Icon source={SearchIcon} tone="base" />
                    </div>
                  </InlineStack>
                  <Text variant="heading2xl" as="p">{rangeClicks.toLocaleString()}</Text>
                  <InlineStack gap="150" blockAlign="center">
                    {!isAllTime ? (
                      <Badge tone={clicksGrowth >= 0 ? "success" : "critical"}>
                        {clicksGrowth >= 0 ? `+${clicksGrowth}%` : `${clicksGrowth}%`}
                      </Badge>
                    ) : (
                      <Badge tone="info">All Time</Badge>
                    )}
                    <Text variant="bodyXs" as="p" tone="subdued">
                      {!isAllTime ? "vs previous period" : "Unique widget clicks"}
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Card>
            </div>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <div className="premium-kpi-card">
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingSm" as="h6" tone="subdued">CONVERSION RATE (CTR)</Text>
                    <svg width="32" height="32" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="30" cy="30" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
                      <circle 
                        cx="30" 
                        cy="30" 
                        r={radius} 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="6" 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                      />
                    </svg>
                  </InlineStack>
                  <Text variant="heading2xl" as="p">{rangeCtr}%</Text>
                  <InlineStack gap="150" blockAlign="center">
                    {!isAllTime ? (
                      <Badge tone={ctrGrowth >= 0 ? "success" : "critical"}>
                        {ctrGrowth >= 0 ? `+${ctrGrowth}%` : `${ctrGrowth}%`}
                      </Badge>
                    ) : (
                      <Badge tone="attention">{parseFloat(rangeCtr) > 2 ? "High Engagement" : "Standard CTR"}</Badge>
                    )}
                    <Text variant="bodyXs" as="p" tone="subdued">
                      {!isAllTime ? "vs previous period" : "Clicks / Views ratio"}
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Card>
            </div>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <div className="premium-kpi-card">
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingSm" as="h6" tone="subdued">SALES LOGGED (7D)</Text>
                    <div style={{ color: "#f59e0b", background: "#fef3c7", padding: "6px", borderRadius: "8px", display: "flex" }}>
                      <Icon source={CartIcon} tone="base" />
                    </div>
                  </InlineStack>
                  <Text variant="heading2xl" as="p">{recentOrders.length}</Text>
                  <InlineStack gap="150" blockAlign="center">
                    <Badge tone="success">Synced</Badge>
                    <Text variant="bodyXs" as="p" tone="success">Real-time order proof feed</Text>
                  </InlineStack>
                </BlockStack>
              </Card>
            </div>
          </Grid.Cell>
        </Grid>

        {/* Custom SVG Gradient Trend Chart */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h3">Conversion Trends & Customer Traffic</Text>
                <Text variant="bodySm" as="p" tone="subdued">Comparison of widget display impressions vs user click interactions.</Text>
              </BlockStack>
              <ButtonGroup variant="segmented">
                <Button 
                  pressed={activeChartTab === "combined"} 
                  onClick={() => { setActiveChartTab("combined"); setHoveredPoint(null); }}
                >
                  Combined
                </Button>
                <Button 
                  pressed={activeChartTab === "impressions"} 
                  onClick={() => { setActiveChartTab("impressions"); setHoveredPoint(null); }}
                >
                  Impressions
                </Button>
                <Button 
                  pressed={activeChartTab === "clicks"} 
                  onClick={() => { setActiveChartTab("clicks"); setHoveredPoint(null); }}
                >
                  Clicks
                </Button>
              </ButtonGroup>
            </InlineStack>

            {/* Legend indicators */}
            <InlineStack gap="400" blockAlign="center">
              {(activeChartTab === "combined" || activeChartTab === "impressions") && (
                <InlineStack gap="150" blockAlign="center">
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#6366f1" }} />
                  <Text variant="bodySm" as="span" fontWeight="semibold">Impressions</Text>
                </InlineStack>
              )}
              {(activeChartTab === "combined" || activeChartTab === "clicks") && (
                <InlineStack gap="150" blockAlign="center">
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981" }} />
                  <Text variant="bodySm" as="span" fontWeight="semibold">Clicks</Text>
                </InlineStack>
              )}
            </InlineStack>

            <div style={{ position: 'relative', width: '100%', padding: '10px 0' }}>
              {rangeImpressions === 0 && rangeClicks === 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  zIndex: 2,
                  backdropFilter: 'blur(2px)'
                }}>
                  <div style={{ color: '#6366f1', marginBottom: '8px' }}>
                    <Icon source={ChartHistogramGrowthIcon} size="large" />
                  </div>
                  <Text variant="headingMd" as="p">No Traffic Logged Yet</Text>
                  <Text variant="bodySm" as="p" tone="subdued">Stats will update live as customers interact with widgets on the storefront.</Text>
                </div>
              )}

              {/* Chart Tooltip Overlay */}
              {hoveredPoint && (
                <div style={{
                  position: 'absolute',
                  top: `${hoveredPoint.y - 45}px`,
                  left: `${hoveredPoint.x - 55}px`,
                  background: '#1e293b',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <span style={{ fontSize: '9px', opacity: 0.75 }}>{hoveredPoint.date}</span>
                  <span>{hoveredPoint.type === 'impressions' ? '👁' : '🖱️'} {hoveredPoint.value} {hoveredPoint.type}</span>
                </div>
              )}

              <svg viewBox="0 0 1000 240" width="100%" style={{ overflow: "visible" }}>
                <defs>
                  <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="50" x2="960" y2="50" stroke="var(--p-color-border-secondary)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="125" x2="960" y2="125" stroke="var(--p-color-border-secondary)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="200" x2="960" y2="200" stroke="var(--p-color-border)" strokeWidth="1.5" />

                {/* Impressions Area & Line Path */}
                {(activeChartTab === "combined" || activeChartTab === "impressions") && (
                  <>
                    <path d={impAreaPath} fill="url(#impGrad)" />
                    <path 
                      d={impLinePath} 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </>
                )}

                {/* Clicks Area & Line Path */}
                {(activeChartTab === "combined" || activeChartTab === "clicks") && (
                  <>
                    <path d={clickAreaPath} fill="url(#clicksGrad)" />
                    <path 
                      d={clickLinePath} 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </>
                )}

                {/* X Axis Date Labels with Dynamic Spacing */}
                {chartData.map((d, idx) => {
                  let skipFactor = 1;
                  if (chartData.length > 30) skipFactor = Math.ceil(chartData.length / 10);
                  else if (chartData.length > 15) skipFactor = 3;
                  else if (chartData.length > 7) skipFactor = 2;

                  if (idx % skipFactor !== 0 && idx !== chartData.length - 1) return null;
                  return (
                    <text key={idx} x={50 + idx * (900 / (chartData.length - 1 || 1))} y="218" fontSize="10" fontWeight="600" fill="var(--p-color-text-secondary)" textAnchor="middle">
                      {d.dateLabel}
                    </text>
                  );
                })}

                {/* Interactive Points / Hover Triggers */}
                {(activeChartTab === "combined" || activeChartTab === "impressions") && impPoints.map((p, idx) => (
                  <circle 
                    key={`imp-dot-${idx}`}
                    cx={p.x} 
                    cy={p.y} 
                    r="4.5" 
                    fill="#6366f1" 
                    stroke="#ffffff" 
                    strokeWidth="2" 
                    className="chart-point-dot"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {(activeChartTab === "combined" || activeChartTab === "clicks") && clickPoints.map((p, idx) => (
                  <circle 
                    key={`click-dot-${idx}`}
                    cx={p.x} 
                    cy={p.y} 
                    r="4.5" 
                    fill="#10b981" 
                    stroke="#ffffff" 
                    strokeWidth="2" 
                    className="chart-point-dot"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>
            </div>
          </BlockStack>
        </Card>

        {/* Side by Side Detailed Grid */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h3">Popular Products Visited (Active Range)</Text>
                  <Badge tone="attention">Views: {totalProductViewsInRange}</Badge>
                </InlineStack>

                {productViews.length > 0 ? (
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'text']}
                    headings={['Product Handle', 'Views Count', 'State']}
                    rows={productViews.map((p) => [
                      p.handle,
                      p.count,
                      p.count > 10 ? <Badge tone="critical">🔥 Trending</Badge> : <Badge>Active</Badge>
                    ])}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text variant="bodyMd" as="p" tone="subdued">No product views logged in this range.</Text>
                  </div>
                )}
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h3">Live Activity Feed</Text>
                  <Badge tone="success">Synced</Badge>
                </InlineStack>

                {recentOrders.length > 0 ? (
                  <BlockStack gap="300">
                    {recentOrders.map((order) => (
                      <div key={order.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '12px 16px', 
                        background: 'var(--p-color-bg-surface-secondary)', 
                        border: '1px solid var(--p-color-border-secondary)', 
                        borderRadius: '8px', 
                        alignItems: 'center',
                        transition: 'transform 0.15s ease'
                      }}>
                        <div>
                          <Text variant="bodyMd" as="p" fontWeight="bold">{order.customerName}</Text>
                          <Text variant="bodySm" as="p" tone="subdued">Purchased {order.productTitle}</Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Badge tone="success">Verified</Badge>
                          <Text variant="bodyXs" as="p" tone="subdued" style={{ marginTop: '4px' }}>{order.city}</Text>
                        </div>
                      </div>
                    ))}
                  </BlockStack>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text variant="bodyMd" as="p" tone="subdued">Waiting for real store orders...</Text>
                  </div>
                )}
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>

        {/* Detailed Range Performance Log */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">Detailed Daily Performance Log</Text>
            {analytics.length > 0 ? (
              <DataTable
                columnContentTypes={['text', 'numeric', 'numeric', 'text']}
                headings={['Record Date', 'Popup Impressions', 'Popup Clicks', 'Campaign Status']}
                rows={[...analytics].reverse().map((day) => [
                  day.date,
                  day.impressions,
                  day.clicks || 0,
                  <Badge tone="info">Recorded</Badge>
                ])}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text variant="bodyMd" as="p" tone="subdued">Performance logs will show automatically.</Text>
              </div>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
