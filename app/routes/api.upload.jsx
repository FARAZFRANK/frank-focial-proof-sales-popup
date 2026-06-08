import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  if (!admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { base64 } = await request.json();
    if (!base64) {
      return new Response(JSON.stringify({ error: "No image data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extract MIME type and raw base64 from data URI
    const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      // Fallback: return as-is if not a proper data URI
      return new Response(JSON.stringify({ url: base64 }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const mimeType = matches[1];
    const ext = mimeType.split("/")[1] || "png";
    const fileName = `frank-social-proof-${Date.now()}.${ext}`;
    const rawBase64 = matches[2];
    const fileSize = Math.ceil((rawBase64.length * 3) / 4);

    // Step 1: Create a staged upload target on Shopify
    const stagedRes = await admin.graphql(`
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        input: [{
          filename: fileName,
          mimeType: mimeType,
          resource: "FILE",
          fileSize: String(fileSize),
          httpMethod: "POST"
        }]
      }
    });

    const stagedData = await stagedRes.json();
    const target = stagedData?.data?.stagedUploadsCreate?.stagedTargets?.[0];

    if (!target) {
      console.error("Staged upload failed:", stagedData?.data?.stagedUploadsCreate?.userErrors);
      // Fallback to base64
      return new Response(JSON.stringify({ url: base64 }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Step 2: Upload the file to the staged URL
    const formData = new FormData();
    for (const param of target.parameters) {
      formData.append(param.name, param.value);
    }

    // Convert base64 to Blob
    const byteCharacters = atob(rawBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    formData.append("file", blob, fileName);

    const uploadRes = await fetch(target.url, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      console.error("Upload to staged URL failed:", uploadRes.status);
      return new Response(JSON.stringify({ url: base64 }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Step 3: Create the file in Shopify using resourceUrl
    const fileCreateRes = await admin.graphql(`
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            alt
            ... on MediaImage {
              image {
                url
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        files: [{
          alt: "Frank Social Proof Logo",
          contentType: "IMAGE",
          originalSource: target.resourceUrl,
        }]
      }
    });

    const fileData = await fileCreateRes.json();
    const createdFile = fileData?.data?.fileCreate?.files?.[0];

    if (!createdFile) {
      console.error("File create failed:", fileData?.data?.fileCreate?.userErrors);
      return new Response(JSON.stringify({ url: base64 }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Step 4: Poll for the file URL (Shopify processes images asynchronously)
    const fileId = createdFile.id;
    let cdnUrl = createdFile?.image?.url || null;

    if (!cdnUrl) {
      // Wait a moment for processing, then query the file
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise(r => setTimeout(r, 1500));

        const pollRes = await admin.graphql(`
          query getFile($id: ID!) {
            node(id: $id) {
              ... on MediaImage {
                image {
                  url
                }
                fileStatus
              }
            }
          }
        `, { variables: { id: fileId } });

        const pollData = await pollRes.json();
        const node = pollData?.data?.node;

        if (node?.image?.url) {
          cdnUrl = node.image.url;
          break;
        }

        if (node?.fileStatus === "FAILED") {
          console.error("File processing failed");
          return new Response(JSON.stringify({ url: base64 }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }

    if (cdnUrl) {
      return new Response(JSON.stringify({ url: cdnUrl }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Final fallback
    return new Response(JSON.stringify({ url: base64 }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Upload error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
