import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const databaseUrl = process.env.DATABASE_URL || '';

let provider = 'sqlite';
let urlValue = '"file:dev.sqlite"';

if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  provider = 'postgresql';
  urlValue = 'env("DATABASE_URL")';
} else if (databaseUrl.startsWith('mysql://')) {
  provider = 'mysql';
  urlValue = 'env("DATABASE_URL")';
} else if (databaseUrl) {
  provider = 'sqlite';
  urlValue = 'env("DATABASE_URL")';
}

// Replace provider and url values specifically inside the datasource db block
const updatedContent = schemaContent.replace(
  /(datasource db\s*\{[^}]*\})/g,
  (match) => {
    return match
      .replace(/provider\s*=\s*"[^"]+"/, `provider = "${provider}"`)
      .replace(/url\s*=\s*("[^"]+"|[^\n]+)/, `url      = ${urlValue}`);
  }
);

if (schemaContent !== updatedContent) {
  console.log(`[prisma-setup] Updating database provider to: ${provider}`);
  fs.writeFileSync(schemaPath, updatedContent, 'utf8');
} else {
  console.log(`[prisma-setup] Database provider is already: ${provider}`);
}
