import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    // Delete ALL data associated with this shop (GDPR compliance)
    await Promise.all([
      prisma.settings.deleteMany({ where: { shop } }),
      prisma.newsletter.deleteMany({ where: { shop } }),
      prisma.analytics.deleteMany({ where: { shop } }),
      prisma.productView.deleteMany({ where: { shop } }),
    ]);
    console.log(`Successfully redacted all database records for shop: ${shop}`);
  } catch (error) {
    console.error(`Error during shop/redact database cleanup for ${shop}:`, error);
  }

  return new Response();
};
