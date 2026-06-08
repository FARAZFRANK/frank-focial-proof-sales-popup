import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  if (!admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = new URL(request.url);
  const cursor = url.searchParams.get("after") || null;
  const search = url.searchParams.get("search") || "";

  // Combine query filters: only return images, optionally match search term
  let gqlQuery = "media_type:IMAGE";
  if (search.trim()) {
    gqlQuery += ` AND filename:*${search.trim()}*`;
  }

  try {
    const response = await admin.graphql(`
      query getFiles($query: String, $after: String) {
        files(first: 24, query: $query, after: $after) {
          edges {
            node {
              id
              alt
              ... on MediaImage {
                image {
                  url
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `, {
      variables: {
        query: gqlQuery,
        after: cursor
      }
    });

    const resJson = await response.json();
    const edges = resJson.data?.files?.edges || [];
    const files = edges.map(edge => ({
      id: edge.node.id,
      alt: edge.node.alt || "Shopify Image",
      url: edge.node.image?.url || null
    })).filter(f => f.url);

    return new Response(JSON.stringify({
      files,
      pageInfo: resJson.data?.files?.pageInfo || { hasNextPage: false, endCursor: null }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Failed to fetch Shopify files:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
