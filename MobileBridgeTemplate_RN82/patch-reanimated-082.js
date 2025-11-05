const fs = require('fs');
const path = require('path');

console.log('🔧 Patching react-native-reanimated and react-native-worklets for RN 0.82...');

// Patch react-native-reanimated compatibility.json
const reanimatedCompatPath = path.join(
  __dirname,
  'node_modules',
  'react-native-reanimated',
  'compatibility.json'
);

// Patch react-native-worklets compatibility.json
const workletsCompatPath = path.join(
  __dirname,
  'node_modules',
  'react-native-worklets',
  'compatibility.json'
);

function patchCompatibilityFile(filePath, packageName) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${packageName} compatibility.json not found at: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const compat = JSON.parse(content);

    let modified = false;

    // Patch all 4.x versions to include 0.82
    Object.keys(compat).forEach(version => {
      if (version.startsWith('4.') && compat[version]['react-native']) {
        const rnVersions = compat[version]['react-native'];
        if (!rnVersions.includes('0.82')) {
          rnVersions.push('0.82');
          modified = true;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(compat, null, 2));
      console.log(`✅ Successfully patched ${packageName}`);
      return true;
    } else {
      console.log(`ℹ️  ${packageName} already includes RN 0.82 support`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error patching ${packageName}:`, error.message);
    return false;
  }
}

// Patch both packages
const reanimatedPatched = patchCompatibilityFile(reanimatedCompatPath, 'react-native-reanimated');
const workletsPatched = patchCompatibilityFile(workletsCompatPath, 'react-native-worklets');

if (reanimatedPatched && workletsPatched) {
  console.log('\n✨ All patches applied successfully!');
  console.log('You can now run: npm run android');
  process.exit(0);
} else {
  console.log('\n⚠️  Some patches failed. Please check the errors above.');
  process.exit(1);
}
