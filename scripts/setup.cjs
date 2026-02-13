#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PLUGIN_NAME = 'soft-delete';
const PLUGIN_PACKAGE = '@siyahbeyaz/strapi-plugin-soft-delete-custom';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const configDir = path.join(process.cwd(), 'config');
const pluginsConfigPath = path.join(configDir, 'plugins.js');
const pluginsConfigTsPath = path.join(configDir, 'plugins.ts');

console.log('\n🚀 Soft Delete Plugin Setup\n');

// Config dizini yoksa oluştur
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// TypeScript mi JavaScript mi?
const isTypeScript = fs.existsSync(pluginsConfigTsPath);
const configPath = isTypeScript ? pluginsConfigTsPath : pluginsConfigPath;

const pluginConfig = isTypeScript ?
`export default ({ env }) => ({
  '${PLUGIN_NAME}': {
    enabled: true,
    resolve: '${PLUGIN_PACKAGE}'
  },
});` :
`module.exports = ({ env }) => ({
  '${PLUGIN_NAME}': {
    enabled: true,
    resolve: '${PLUGIN_PACKAGE}'
  },
});`;

// Config dosyası yoksa direkt oluştur
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, pluginConfig);
  console.log(`✅ Created ${path.basename(configPath)}`);
  console.log('✨ Soft Delete Plugin is now enabled!\n');
  console.log('🔄 Restart your Strapi server to see the changes.\n');
  rl.close();
  process.exit(0);
}

// Var olan config'i oku
const existingConfig = fs.readFileSync(configPath, 'utf8');

// Zaten eklenmişse
if (existingConfig.includes(PLUGIN_NAME) || existingConfig.includes(PLUGIN_PACKAGE)) {
  console.log('✅ Soft Delete Plugin is already configured!');
  console.log('✨ Ready to use!\n');
  rl.close();
  process.exit(0);
}

// Manuel ekleme talimatı
console.log('⚠️  Config file already exists.\n');
console.log('📝 Add this to your config/plugins file:\n');
console.log('─'.repeat(70));
console.log(`  '${PLUGIN_NAME}': {\n    enabled: true,\n    resolve: '${PLUGIN_PACKAGE}'\n  },`);
console.log('─'.repeat(70));
console.log('\n');

rl.question('Would you like to automatically append it? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    try {
      // Basit bir merge yap - son parantezden önce ekle
      let updatedConfig = existingConfig;

      // return {...} pattern'ini bul
      const returnMatch = updatedConfig.match(/return\s*\{/);
      if (returnMatch) {
        // return { ... } pattern'i varsa
        const insertionPoint = updatedConfig.lastIndexOf('}');
        const before = updatedConfig.substring(0, insertionPoint);
        const after = updatedConfig.substring(insertionPoint);

        const newEntry = `  '${PLUGIN_NAME}': {\n    enabled: true,\n    resolve: '${PLUGIN_PACKAGE}'\n  },\n`;
        updatedConfig = before + newEntry + after;
      } else {
        // module.exports = { ... } veya export default { ... } pattern'i
        const insertionPoint = updatedConfig.lastIndexOf('}');
        const before = updatedConfig.substring(0, insertionPoint);
        const after = updatedConfig.substring(insertionPoint);

        const newEntry = `  '${PLUGIN_NAME}': {\n    enabled: true,\n    resolve: '${PLUGIN_PACKAGE}'\n  },\n`;
        updatedConfig = before + newEntry + after;
      }

      // Backup oluştur
      fs.writeFileSync(configPath + '.backup', existingConfig);
      fs.writeFileSync(configPath, updatedConfig);

      console.log('\n✅ Plugin configuration added successfully!');
      console.log(`💾 Backup saved to: ${path.basename(configPath)}.backup`);
      console.log('🔄 Restart your Strapi server to see the changes.\n');
    } catch (error) {
      console.error('\n❌ Error updating config file:', error.message);
      console.log('Please add the configuration manually.\n');
    }
  } else {
    console.log('\n📝 Please add the configuration manually to your config/plugins file.\n');
  }

  rl.close();
});
