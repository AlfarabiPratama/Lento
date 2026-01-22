/**
 * Touch Target Audit Script
 * 
 * Scans all interactive elements and reports those below WCAG 2.5.5 minimum size (44x44px).
 * 
 * WCAG 2.5.5 - Target Size (Level AAA): Interactive elements should be at least 44x44 CSS pixels.
 * (Level AA allows 24x24px, but 44x44px is recommended for better accessibility)
 * 
 * Run: npm run audit:touch-targets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIN_SIZE = 44; // WCAG AAA recommendation
const WARN_SIZE = 24; // WCAG AA minimum

// Patterns to match interactive elements
const INTERACTIVE_PATTERNS = [
  /className\s*=\s*["`]([^"`]*\bw-(\d+)\b[^"`]*)["`]/g,
  /className\s*=\s*["`]([^"`]*\bh-(\d+)\b[^"`]*)["`]/g,
  /className\s*=\s*["`]([^"`]*\bsize-(\d+)\b[^"`]*)["`]/g,
  /<button[^>]*>/gi,
  /<a[^>]*>/gi,
  /<input[^>]*type=["'](?:button|submit|reset|checkbox|radio)["'][^>]*>/gi,
];

const ELEMENT_TAGS = ['button', 'a', 'input', 'select', 'textarea', '[role="button"]'];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Extract component/file name
  const fileName = path.basename(filePath);
  
  // Scan for size classes (w-8 = 32px, w-10 = 40px, w-12 = 48px)
  // Tailwind: 1 unit = 0.25rem = 4px
  const sizeRegex = /className\s*=\s*["`{]([^"`}]*\b(?:w|h|size)-(\d+)\b[^"`}]*)["`}]/g;
  const lines = content.split('\n');
  
  lines.forEach((line, lineNum) => {
    const matches = [...line.matchAll(sizeRegex)];
    
    matches.forEach(match => {
      const className = match[1];
      const size = parseInt(match[2]);
      const pixels = size * 4; // Tailwind size to pixels
      
      // Check if line contains interactive element
      const isInteractive = ELEMENT_TAGS.some(tag => line.toLowerCase().includes(tag));
      
      if (isInteractive) {
        if (pixels < WARN_SIZE) {
          issues.push({
            file: fileName,
            line: lineNum + 1,
            size: pixels,
            className: className.substring(0, 80),
            severity: 'error',
            message: `Touch target too small: ${pixels}px (minimum: ${MIN_SIZE}px recommended, ${WARN_SIZE}px required)`
          });
        } else if (pixels < MIN_SIZE) {
          issues.push({
            file: fileName,
            line: lineNum + 1,
            size: pixels,
            className: className.substring(0, 80),
            severity: 'warning',
            message: `Touch target below recommended size: ${pixels}px (recommended: ${MIN_SIZE}px)`
          });
        }
      }
    });
  });
  
  return issues;
}

function scanDirectory(dir, extensions = ['.jsx', '.tsx', '.js', '.ts']) {
  const allIssues = [];
  
  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, build, dist
        if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
          walk(filePath);
        }
      } else {
        // Scan component files
        if (extensions.some(ext => filePath.endsWith(ext))) {
          const issues = scanFile(filePath);
          if (issues.length > 0) {
            allIssues.push(...issues);
          }
        }
      }
    });
  }
  
  walk(dir);
  return allIssues;
}

// Main execution
const srcPath = path.join(__dirname, '../src');
console.log('🔍 Scanning for touch target accessibility issues...\n');

const issues = scanDirectory(srcPath);

// Group by severity
const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');

// Report
console.log('📊 Touch Target Audit Results\n');
console.log(`Total issues found: ${issues.length}`);
console.log(`  ❌ Errors (< ${WARN_SIZE}px): ${errors.length}`);
console.log(`  ⚠️  Warnings (< ${MIN_SIZE}px): ${warnings.length}\n`);

if (errors.length > 0) {
  console.log('❌ ERRORS - Touch targets below WCAG AA minimum (24px):\n');
  errors.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    Size: ${issue.size}px`);
    console.log(`    ${issue.message}`);
    console.log(`    Class: ${issue.className}\n`);
  });
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS - Touch targets below recommended size (44px):\n');
  warnings.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    Size: ${issue.size}px`);
    console.log(`    ${issue.message}`);
    console.log(`    Class: ${issue.className}\n`);
  });
}

if (issues.length === 0) {
  console.log('✅ No touch target issues found! All interactive elements meet WCAG AAA (44x44px)');
} else {
  console.log('💡 Recommendations:');
  console.log('  1. Change w-8 (32px) → w-11 (44px) for buttons');
  console.log('  2. Change w-10 (40px) → w-11 (44px) for icon buttons');
  console.log('  3. Add padding to increase touch area without changing icon size');
  console.log('  4. Use min-w-11 min-h-11 for flexible sizing\n');
}

// Exit with error code if errors found
process.exit(errors.length > 0 ? 1 : 0);
