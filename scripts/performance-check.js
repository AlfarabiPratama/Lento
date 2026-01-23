/**
 * Performance Check Script
 * 
 * Analyzes build output and checks bundle sizes against thresholds.
 * Run after build to ensure performance targets are met.
 * 
 * Usage:
 *   npm run perf           # Local check with detailed output
 *   npm run perf:ci        # CI mode with strict thresholds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance thresholds (in KB)
const THRESHOLDS = {
  // Initial bundle (critical path)
  initialJS: {
    warning: 150,  // 150KB
    error: 200,    // 200KB
  },
  initialCSS: {
    warning: 30,   // 30KB
    error: 50,     // 50KB
  },
  // Total bundle size
  totalJS: {
    warning: 500,  // 500KB
    error: 750,    // 750KB
  },
  totalCSS: {
    warning: 50,   // 50KB
    error: 75,     // 75KB
  },
  // Individual chunks
  chunkSize: {
    warning: 100,  // 100KB
    error: 150,    // 150KB
  },
};

const isCI = process.argv.includes('--ci');

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / 1024;
}

/**
 * Analyze build output
 */
function analyzeBuild() {
  const distDir = path.join(__dirname, '../dist');
  const assetsDir = path.join(distDir, 'assets');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  const files = {
    js: [],
    css: [],
  };

  // Read assets directory
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir, { recursive: true });

    assetFiles.forEach((file) => {
      const fullPath = path.join(assetsDir, file);
      
      // Skip directories
      if (fs.statSync(fullPath).isDirectory()) return;

      const ext = path.extname(file);
      const size = getFileSizeKB(fullPath);

      if (ext === '.js') {
        files.js.push({ name: file, size, path: fullPath });
      } else if (ext === '.css') {
        files.css.push({ name: file, size, path: fullPath });
      }
    });
  }

  return files;
}

/**
 * Check if value exceeds threshold
 */
function checkThreshold(value, threshold, label) {
  const status = {
    pass: value <= threshold.warning,
    warning: value > threshold.warning && value <= threshold.error,
    error: value > threshold.error,
  };

  let icon = '✅';
  let color = '\x1b[32m'; // Green
  let message = 'PASS';

  if (status.warning) {
    icon = '⚠️';
    color = '\x1b[33m'; // Yellow
    message = 'WARNING';
  } else if (status.error) {
    icon = '❌';
    color = '\x1b[31m'; // Red
    message = 'FAIL';
  }

  const reset = '\x1b[0m';

  console.log(
    `${icon} ${color}${label}:${reset} ${value.toFixed(2)} KB ${color}(${message})${reset}`
  );

  return status;
}

/**
 * Main performance check
 */
function performanceCheck() {
  console.log('\n📊 Performance Check\n');
  console.log('═'.repeat(60));

  const files = analyzeBuild();

  // Calculate totals
  const totalJS = files.js.reduce((sum, f) => sum + f.size, 0);
  const totalCSS = files.css.reduce((sum, f) => sum + f.size, 0);

  // Find largest chunks
  const jsChunks = files.js.sort((a, b) => b.size - a.size);
  const cssChunks = files.css.sort((a, b) => b.size - a.size);

  const initialJS = jsChunks[0]; // Assume first/largest is initial
  const initialCSS = cssChunks[0];

  let hasErrors = false;
  let hasWarnings = false;

  // Check JS bundles
  console.log('\n📦 JavaScript Bundles\n');
  console.log('─'.repeat(60));

  if (initialJS) {
    const status = checkThreshold(
      initialJS.size,
      THRESHOLDS.initialJS,
      `Initial Bundle (${initialJS.name})`
    );
    if (status.error) hasErrors = true;
    if (status.warning) hasWarnings = true;
  }

  const totalStatus = checkThreshold(totalJS, THRESHOLDS.totalJS, 'Total JS');
  if (totalStatus.error) hasErrors = true;
  if (totalStatus.warning) hasWarnings = true;

  console.log(`\n   Files: ${files.js.length}`);

  // List all JS chunks
  console.log('\n   Chunks:');
  jsChunks.slice(0, 10).forEach((chunk) => {
    const sizeStr = chunk.size.toFixed(2).padStart(8);
    let icon = '  ';
    if (chunk.size > THRESHOLDS.chunkSize.error) {
      icon = '❌';
      hasErrors = true;
    } else if (chunk.size > THRESHOLDS.chunkSize.warning) {
      icon = '⚠️';
      hasWarnings = true;
    }
    console.log(`   ${icon} ${sizeStr} KB - ${chunk.name}`);
  });

  // Check CSS bundles
  console.log('\n🎨 CSS Bundles\n');
  console.log('─'.repeat(60));

  if (initialCSS) {
    const status = checkThreshold(
      initialCSS.size,
      THRESHOLDS.initialCSS,
      `Initial Bundle (${initialCSS.name})`
    );
    if (status.error) hasErrors = true;
    if (status.warning) hasWarnings = true;
  }

  const cssStatus = checkThreshold(totalCSS, THRESHOLDS.totalCSS, 'Total CSS');
  if (cssStatus.error) hasErrors = true;
  if (cssStatus.warning) hasWarnings = true;

  console.log(`\n   Files: ${files.css.length}`);

  if (cssChunks.length > 0) {
    console.log('\n   Chunks:');
    cssChunks.forEach((chunk) => {
      const sizeStr = chunk.size.toFixed(2).padStart(8);
      console.log(`      ${sizeStr} KB - ${chunk.name}`);
    });
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📈 Summary\n');

  console.log(`   Total JS:  ${totalJS.toFixed(2)} KB`);
  console.log(`   Total CSS: ${totalCSS.toFixed(2)} KB`);
  console.log(`   Total:     ${(totalJS + totalCSS).toFixed(2)} KB`);

  // Recommendations
  if (hasErrors || hasWarnings) {
    console.log('\n💡 Recommendations:\n');

    if (hasErrors) {
      console.log('   ❌ ERRORS FOUND:');
      console.log('      - Bundle size exceeds error threshold');
      console.log('      - Review code splitting strategy');
      console.log('      - Consider lazy loading heavy features');
      console.log('      - Check for duplicate dependencies\n');
    }

    if (hasWarnings) {
      console.log('   ⚠️  WARNINGS:');
      console.log('      - Bundle size approaching limits');
      console.log('      - Monitor bundle growth');
      console.log('      - Run `npm run analyze` for detailed breakdown\n');
    }
  } else {
    console.log('\n✅ All checks passed!\n');
  }

  console.log('═'.repeat(60) + '\n');

  // Exit with error code in CI mode if thresholds exceeded
  if (isCI && hasErrors) {
    console.error('❌ Performance check failed in CI mode\n');
    process.exit(1);
  }

  if (hasWarnings && !isCI) {
    console.warn('⚠️  Performance warnings detected\n');
  }
}

// Run the check
performanceCheck();
