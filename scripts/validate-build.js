import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const requiredFiles = [
  'strapi-server.js',
  'strapi-admin.js',
  'strapi-server.d.ts',
  'strapi-admin.d.ts',
];

console.log('Validating build output...');

let hasError = false;

if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory not found!');
  process.exit(1);
}

for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${file}`);
    hasError = true;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

if (hasError) {
  console.error('❌ Build validation failed.');
  process.exit(1);
} else {
  console.log('✅ Build validation passed.');
}
