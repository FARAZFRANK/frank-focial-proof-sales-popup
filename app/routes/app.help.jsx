import { authenticate } from "../shopify.server";
import { useState } from "react";
import { useLoaderData, Link } from "react-router";
import {
  Page,
  Card,
  Text,
  Grid,
  BlockStack,
  InlineStack,
  Icon,
  Badge
} from "@shopify/polaris";
import {
  EmailIcon,
  PlayIcon,
  SettingsIcon,
  CheckIcon,
  QuestionCircleIcon
} from "@shopify/polaris-icons";

// ==========================================
// 🎥 PASTE YOUR YOUTUBE/VIMEO TUTORIAL VIDEO EMBED URL HERE
// Replace the default URL below with your actual tutorial link.
// ==========================================
const TUTORIAL_VIDEO_URL = "https://www.youtube.com/embed/lty6NUKLyZw?fs=0"; // Tutorial video

// Cache embed status per shop — 10 second TTL
const embedStatusCacheHelp = new Map();

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const shopName = shop.replace(".myshopify.com", "");

  const cached = embedStatusCacheHelp.get(shop);
  const cacheDuration = 10 * 1000;
  if (cached && (Date.now() - cached.timestamp < cacheDuration)) {
    const embedActivateUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&activateAppId=${cached.extensionId}/social_proof`;
    return { embedActivateUrl, isEmbedEnabled: cached.isEmbedEnabled };
  }

  let isEmbedEnabled = false;
  let extensionId = "ea691a59-47df-b6e4-81b5-35e318b96494c9523f59";

  try {
    const response = await admin.graphql(
      `#graphql
      query GetExtensionIdInHelp {
        themes(first: 10) {
          nodes {
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
        } catch (e) { }
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
  } catch (err) { }

  if (process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID) {
    extensionId = process.env.SHOPIFY_SOCIAL_PROOF_EXTENSION_ID;
  }

  embedStatusCacheHelp.set(shop, { isEmbedEnabled, extensionId, timestamp: Date.now() });

  const embedActivateUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&activateAppId=${extensionId}/social_proof`;
  return { embedActivateUrl, isEmbedEnabled };
};

export default function HelpDocs() {
  const { embedActivateUrl, isEmbedEnabled } = useLoaderData();
  const [isMaximized, setIsMaximized] = useState(false);

  const chapters = [
    { title: "Enable App Embed in Shopify", duration: "0:45" },
    { title: "Configure Sales & Visitor Previews", duration: "1:20" },
    { title: "Design Custom Widget Aesthetics", duration: "2:15" },
    { title: "Launch & CTR Analytics Overview", duration: "3:10" }
  ];

  return (
    <Page
      fullWidth
      title="Video Setup Tutorial"
      subtitle="Watch our quick visual guide to get started with Frank Social Proof in minutes."
    >
      <div style={{ padding: '0 32px 32px 32px', fontFamily: "'Inter', sans-serif" }}>

        {/* Main layout grid */}
        <Grid>
          {/* Left Column - Video Player & Setup Steps */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8 }}>
            <BlockStack gap="500">

              {/* Video Player Card */}
              <div className="premium-help-card">
                <BlockStack gap="400">
                  <div className="video-player-container">
                    <iframe
                      src={TUTORIAL_VIDEO_URL}
                      title="Frank Social Proof Setup Guide Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px'
                      }}
                    ></iframe>
                  </div>

                  <div style={{ padding: '4px' }}>
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="100">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <Text variant="headingLg" as="h3" fontWeight="bold">
                            Official Video Walkthrough
                          </Text>
                          <button
                            onClick={() => setIsMaximized(true)}
                            className="custom-fullscreen-btn"
                          >
                            <span>🖥️</span> Watch Full Screen
                          </button>
                        </div>
                        <Text variant="bodyMd" as="p" tone="subdued">
                          A complete end-to-end setup showing theme activation, custom badge styling, and visitor counter settings.
                        </Text>
                      </BlockStack>
                      <Badge tone="success">HD 1080p</Badge>
                    </InlineStack>
                  </div>
                </BlockStack>
              </div>

              {/* Full Screen Player Overlay */}
              {isMaximized && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  zIndex: 999999,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  boxSizing: 'border-box'
                }}>
                  <button 
                    onClick={() => setIsMaximized(false)}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      color: 'white',
                      fontSize: '15px',
                      padding: '10px 22px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ✕ Close Full Screen
                  </button>
                  <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    aspectRatio: '16/9',
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                    background: '#000'
                  }}>
                    <iframe
                      src={TUTORIAL_VIDEO_URL}
                      title="Frank Social Proof Setup Guide Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                      }}
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Text Instructions */}
              <div className="premium-help-card">
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3" fontWeight="bold">
                    Quick Setup Summary
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="docs-step-row">
                      <span className="bullet-num">1</span>
                      <div>
                        <Text variant="bodyMd" as="p" fontWeight="bold">Enable App Embed</Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Open the theme editor and turn on the <strong>Social Proof Popup</strong> embed in your Shopify theme dashboard.
                        </Text>
                      </div>
                    </div>

                    <div className="docs-step-row">
                      <span className="bullet-num">2</span>
                      <div>
                        <Text variant="bodyMd" as="p" fontWeight="bold">Customize Campaigns</Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Configure sales notifications, countdown timers, and scarcity badges in the Settings dashboard.
                        </Text>
                      </div>
                    </div>

                    <div className="docs-step-row">
                      <span className="bullet-num">3</span>
                      <div>
                        <Text variant="bodyMd" as="p" fontWeight="bold">Save & Publish</Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Click Save in your theme customizer. The widgets will immediately appear live on your storefront.
                        </Text>
                      </div>
                    </div>
                  </div>
                </BlockStack>
              </div>

            </BlockStack>
          </Grid.Cell>

          {/* Right Column - Status, Index, and Support */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
            <BlockStack gap="500">

              {/* App Embed Status Card */}
              <div className="premium-help-card flex-vertical-card">
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3" fontWeight="bold">
                    Embed Status
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: isEmbedEnabled ? '#008060' : '#d42f2f',
                      boxShadow: isEmbedEnabled ? '0 0 8px #008060' : '0 0 8px #d42f2f'
                    }}></div>
                    <Text variant="bodyMd" as="span" fontWeight="bold">
                      {isEmbedEnabled ? "App Embed is Active" : "App Embed is Suspended"}
                    </Text>
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Storefront social proof widgets require the app embed script to be toggled ON in your active theme editor.
                  </Text>
                  {isEmbedEnabled ? (
                    <button className="status-action-btn disabled" disabled>
                      ✓ Enabled Successfully
                    </button>
                  ) : (
                    <a href={embedActivateUrl} target="_top" className="status-action-btn active">
                      🚀 Enable App Embed Now
                    </a>
                  )}
                </BlockStack>
              </div>

              {/* What's covered card */}
              <div className="premium-help-card">
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3" fontWeight="bold">
                    Video Chapters
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chapters.map((chap, idx) => (
                      <div key={idx} className="chapter-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                          <span style={{ color: '#008060', width: '16px', height: '16px', display: 'inline-flex' }}>
                            <Icon source={CheckIcon} />
                          </span>
                          <span className="chapter-title">{chap.title}</span>
                        </div>
                        <span className="chapter-duration">{chap.duration}</span>
                      </div>
                    ))}
                  </div>
                </BlockStack>
              </div>

              {/* Support Contact Card */}
              <div className="support-gradient-card">
                <BlockStack gap="400">
                  <div className="support-badge-circle">
                    <span style={{ display: 'inline-flex', color: '#ffffff', width: '24px', height: '24px' }}>
                      <Icon source={EmailIcon} />
                    </span>
                  </div>
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h3" color="white" fontWeight="bold">
                      Need Technical Help?
                    </Text>
                    <Text variant="bodySm" as="p" color="white" style={{ opacity: 0.9 }}>
                      Our developer support team can help you resolve theme conflicts or set up custom styles for your storefront widgets.
                    </Text>
                  </BlockStack>
                  <a
                    href="mailto:contact@wpfrank.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-email-btn"
                  >
                    ✉️ Contact Support
                  </a>
                </BlockStack>
              </div>

            </BlockStack>
          </Grid.Cell>
        </Grid>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Premium Card style */
        .premium-help-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        /* 16:9 Aspect Ratio Video Box */
        .video-player-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 12px;
          background: #0f172a;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.3);
        }

        /* Setup Step Bullet */
        .docs-step-row {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 14px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }

        .bullet-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Right sidebar items */
        .chapter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .chapter-row:last-child {
          border-bottom: none;
        }
        .chapter-title {
          font-size: 13px;
          color: #334155;
          font-weight: 500;
        }
        .chapter-duration {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Status card button */
        .status-action-btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 10px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .status-action-btn.active {
          background: #008060;
          color: white !important;
        }
        .status-action-btn.active:hover {
          background: #006e52;
        }
        .status-action-btn.disabled {
          background: #e6f4ea;
          color: #008060 !important;
          cursor: not-allowed;
          border: 1px solid #c2e7d9;
        }

        /* Priority support gradient card */
        .support-gradient-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 12px;
          padding: 28px 24px;
          color: white;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.15);
        }
        .support-badge-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .support-email-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: white;
          color: #0f172a !important;
          font-weight: 700;
          padding: 11px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 13px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          cursor: pointer;
        }
        .support-email-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,255,255,0.2);
        }

        /* Custom Fullscreen Button */
        .custom-fullscreen-btn {
          background: #008060;
          border: 1px solid #006e52;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: white;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .custom-fullscreen-btn:hover {
          background: #006e52;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,110,82,0.15);
        }
      `}} />
    </Page>
  );
}
