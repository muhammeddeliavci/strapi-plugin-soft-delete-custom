#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'soft-delete';
const PLUGIN_PACKAGE = '@siyahbeyaz/strapi-plugin-soft-delete-custom';

// Parent project'in root'unu bul
const projectRoot = path.resolve(process.cwd(), '../..');
const configDir = path.join(projectRoot, 'config');
const pluginsConfigPath = path.join(configDir, 'plugins.js');
const pluginsConfigTsPath = path.join(configDir, 'plugins.ts');

console.log('\n🔧 Setting up Soft Delete Plugin...\n');

// Strapi projesi mi kontrol et
const packageJsonPath = path.join(projectRoot, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('⚠️  Not in a Strapi project. Skipping auto-configuration.');
  process.exit(0);
}

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.dependencies || !packageJson.dependencies['@strapi/strapi']) {
    console.log('⚠️  Not a Strapi project. Skipping auto-configuration.');
    process.exit(0);
  }
} catch (error) {
  console.log('⚠️  Could not read package.json. Skipping auto-configuration.');
  process.exit(0);
}

// Config dizini yoksa oluştur
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Plugin config içeriği
const pluginConfigJs = `module.exports = ({ env }) => ({
  '${PLUGIN_NAME}': {
    enabled: true,
    resolve: '${PLUGIN_PACKAGE}'
  },
});
`;

const pluginConfigTs = `export default ({ env }) => ({
  '${PLUGIN_NAME}': {
    enabled: true,
    resolve: '${PLUGIN_PACKAGE}'
  },
});
`;

// TypeScript config varsa onu kullan
const isTypeScript = fs.existsSync(pluginsConfigTsPath);
const configPath = isTypeScript ? pluginsConfigTsPath : pluginsConfigPath;
const configContent = isTypeScript ? pluginConfigTs : pluginConfigJs;

// Config dosyası yoksa oluştur
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Created ${path.basename(configPath)} with soft-delete plugin enabled`);
  console.log('✨ Soft Delete Plugin is ready to use!\n');
} else {
  // Var olan config'i oku
  const existingConfig = fs.readFileSync(configPath, 'utf8');

  // Plugin zaten eklenmişse skip et
  if (existingConfig.includes(PLUGIN_NAME) || existingConfig.includes(PLUGIN_PACKAGE)) {
    console.log('✅ Soft Delete Plugin is already configured');
    console.log('✨ Ready to use!\n');
  } else {
    // Manuel ekleme talimatı ver
    console.log('⚠️  plugins config file already exists.');
    console.log('\n📝 Please add the following to your config/plugins file:\n');
    console.log('─'.repeat(60));
    console.log(isTypeScript ?
      `  '${PLUGIN_NAME}': {\n    enabled: true,\n    resolve: '${PLUGIN_PACKAGE}'\n  },` :
      `  '${PLUGIN_NAME}': {\n    enabled: true,\n    resolve: '${PLUGIN_PACKAGE}'\n  },`
    );
    console.log('─'.repeat(60));
    console.log('\n💡 Or run: npm run setup:soft-delete\n');
  }
}
