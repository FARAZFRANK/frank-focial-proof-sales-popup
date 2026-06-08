import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Simple in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map();
const RATE_LIMIT = 120; // max requests
const RATE_WINDOW = 60 * 1000; // per 1 minute

let lastCleanup = Date.now();

function isRateLimited(key) {
  const now = Date.now();
  
  // Lazy cleanup stale entries every 5 minutes to prevent memory leak
  if (now - lastCleanup > 5 * 60 * 1000) {
    for (const [k, entry] of rateLimitMap) {
      if ((now - entry.start) > RATE_WINDOW * 2) rateLimitMap.delete(k);
    }
    lastCleanup = now;
  }

  const entry = rateLimitMap.get(key);
  if (!entry || (now - entry.start) > RATE_WINDOW) {
    rateLimitMap.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

// Store timezone cache to prevent excessive GraphQL queries
const shopTimezoneMap = new Map();

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.public.appProxy(request);

  if (!session?.shop) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const shop = session.shop;

  // Rate limit by shop
  if (isRateLimited(shop)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), { 
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" }
    });
  }

  // Get store timezone (using cached value or fetching via GraphQL)
  let timezone = shopTimezoneMap.get(shop);
  if (!timezone && admin) {
    try {
      const response = await admin.graphql(
        `#graphql
        query getShopTimezoneForTracking {
          shop {
            ianaTimezone
          }
        }`
      );
      const resJson = await response.json();
      timezone = resJson.data?.shop?.ianaTimezone || "UTC";
      shopTimezoneMap.set(shop, timezone);
    } catch (err) {
      console.error("Failed to fetch shop timezone for tracking:", err);
      timezone = "UTC";
    }
  }
  timezone = timezone || "UTC";

  // Get current date in store's timezone format (YYYY-MM-DD)
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  
  try {
    const body = await request.json().catch(() => ({}));
    const productHandle = body.handle;
    const actionType = body.action || 'impression';
    const email = body.email;

    if (email) {
      const trimmedEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 255) {
        return new Response(JSON.stringify({ error: "Invalid email address format" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Check for duplicate email subscription
      const existing = await prisma.newsletter.findFirst({
        where: { shop, email: trimmedEmail }
      });
      if (existing) {
        return new Response(JSON.stringify({ success: true, message: "Already subscribed!" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Save newsletter subscription
      await prisma.newsletter.create({
        data: { shop, email: trimmedEmail }
      });
      return new Response(JSON.stringify({ success: true, message: "Subscribed!" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (productHandle && actionType === 'impression') {
      // Track product view
      await prisma.productView.upsert({
        where: {
          shop_handle_date: { shop, handle: productHandle, date }
        },
        update: {
          count: { increment: 1 }
        },
        create: {
          shop,
          handle: productHandle,
          date,
          count: 1
        }
      });
    } else {
      // Track general analytics (impressions or clicks)
      await prisma.analytics.upsert({
        where: {
          shop_date: { shop, date }
        },
        update: {
          impressions: actionType === 'impression' ? { increment: 1 } : undefined,
          clicks: actionType === 'click' ? { increment: 1 } : undefined,
        },
        create: {
          shop,
          date,
          impressions: actionType === 'impression' ? 1 : 0,
          clicks: actionType === 'click' ? 1 : 0
        }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("Tracking error:", e);
    return new Response(JSON.stringify({ error: "Database error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
