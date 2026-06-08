/**
 * Minify storefront extension assets for production.
 * Uses esbuild (bundled with Vite) to reduce JS/CSS file sizes.
 * Run automatically as part of the build pipeline.
 */
import { transform } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ASSETS_DIR = './extensions/social-proof-extension/assets';

async function minifyAssets() {
  const jsSourcePath = join(ASSETS_DIR, 'social-proof.src.js');
  const jsTargetPath = join(ASSETS_DIR, 'social-proof.js');
  const cssSourcePath = join(ASSETS_DIR, 'social-proof.src.css');
  const cssTargetPath = join(ASSETS_DIR, 'social-proof.css');

  try {
    // Process JS
    const jsContent = readFileSync(jsSourcePath, 'utf-8');
    const jsResult = await transform(jsContent, {
      minify: true,
      loader: 'js',
      target: 'es2020',
    });
    writeFileSync(jsTargetPath, jsResult.code);
    const jsSaved = ((1 - jsResult.code.length / jsContent.length) * 100).toFixed(1);
    console.log(`✅ social-proof.js: ${(jsContent.length / 1024).toFixed(1)}KB → ${(jsResult.code.length / 1024).toFixed(1)}KB (${jsSaved}% smaller)`);

    // Process CSS
    const cssContent = readFileSync(cssSourcePath, 'utf-8');
    const cssResult = await transform(cssContent, {
      minify: true,
      loader: 'css',
    });
    writeFileSync(cssTargetPath, cssResult.code);
    const cssSaved = ((1 - cssResult.code.length / cssContent.length) * 100).toFixed(1);
    console.log(`✅ social-proof.css: ${(cssContent.length / 1024).toFixed(1)}KB → ${(cssResult.code.length / 1024).toFixed(1)}KB (${cssSaved}% smaller)`);

  } catch (error) {
    console.error('Error during minification:', error);
  }

  console.log('\n🎉 Extension assets minified for production!');
}

minifyAssets().catch(console.error);
