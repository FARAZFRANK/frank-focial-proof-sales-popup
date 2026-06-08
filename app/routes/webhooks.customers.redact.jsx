import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Customer data redaction requested — delete their newsletter subscription if stored
  try {
    const customerEmail = payload?.customer?.email;
    if (customerEmail) {
      const deleted = await prisma.newsletter.deleteMany({
        where: { shop, email: customerEmail }
      });
      console.log(`Redacted ${deleted.count} newsletter record(s) for customer ${customerEmail} in ${shop}`);
    }
  } catch (error) {
    console.error(`Error during customers/redact for ${shop}:`, error);
  }

  return new Response();
};
