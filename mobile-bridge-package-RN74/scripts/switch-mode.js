#!/usr/bin/env node

/**
 * Script to switch between Full, Embedded and TestHost modes
 * Usage: npm run mode:full or npm run mode:embedded or npm run mode:testhost
 */

const fs = require('fs');
const path = require('path');

const mode = process.argv[2]; // 'full', 'embedded', or 'testhost'

if (!mode || !['standalone', 'embedded', 'testhost'].includes(mode)) {
  console.error('Usage: node switch-mode.js [standalone|embedded|testhost]');
  console.error('');
  console.error('Modes:');
  console.error('  standalone - Standalone app with TabBar navigation');
  console.error('  embedded - Fullscreen WebView without TabBar');
  console.error('  testhost - Demo app showing how to embed WebView in a larger app');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.js');

// Backup original index.js if doesn't exist
const backupPath = path.join(rootDir, 'index.js.backup');
if (!fs.existsSync(backupPath) && fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, backupPath);
}

let appImport;
let description;

if (mode === 'standalone') {
  appImport = "import App from './App';";
  description = 'Standalone mode (with TabBar)';
} else if (mode === 'embedded') {
  appImport = "import App from './App.Embedded';";
  description = 'EMBEDDED mode (fullscreen WebView)';
} else if (mode === 'testhost') {
  appImport = "import App from './App.TestHost';";
  description = 'TEST HOST mode (demo app with embedded WebView)';
}

const indexContent = `/**
 * @format
 */

import { AppRegistry } from 'react-native';
${appImport}
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
`;

fs.writeFileSync(indexPath, indexContent);

console.log(`✅ Switching to ${description}...`);
console.log(`\n✨ Mode switched to: ${mode.toUpperCase()}`);
console.log('\nReload your app:');
console.log('  - Press R + R in the app');
console.log('  - Or restart: npm run android / npm run ios');

if (mode === 'testhost') {
  console.log('\n📱 TEST HOST MODE:');
  console.log('  This mode demonstrates how to integrate the WebView');
  console.log('  embedded inside a larger React Native application.');
  console.log('  Navigate between tabs to see the integration!\n');
}
