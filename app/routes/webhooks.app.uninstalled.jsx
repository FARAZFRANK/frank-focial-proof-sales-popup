import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Clean up all shop data on uninstall
  try {
    await Promise.all([
      db.settings.deleteMany({ where: { shop } }),
      db.newsletter.deleteMany({ where: { shop } }),
      db.analytics.deleteMany({ where: { shop } }),
      db.productView.deleteMany({ where: { shop } }),
    ]);
    console.log(`Cleaned up all data for uninstalled shop: ${shop}`);
  } catch (error) {
    console.error(`Error cleaning up data for ${shop}:`, error);
  }

  return new Response();
};
