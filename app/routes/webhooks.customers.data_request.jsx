import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Customer data request — report what data we store for this customer
  try {
    const customerEmail = payload?.customer?.email;
    if (customerEmail) {
      const records = await prisma.newsletter.findMany({
        where: { shop, email: customerEmail }
      });
      console.log(`Data request: found ${records.length} newsletter record(s) for ${customerEmail} in ${shop}`);
    }
  } catch (error) {
    console.error(`Error during customers/data_request for ${shop}:`, error);
  }

  return new Response();
};
