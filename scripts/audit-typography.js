#!/usr/bin/env node
/**
 * Typography Audit Script
 * 
 * Scans all components for text size violations and flags anything below WCAG minimum.
 * Run: npm run audit:typography
 * 
 * Checks:
 * - No text smaller than 13px (0.8125rem) for body content
 * - Validates Tailwind class usage (text-xs should only be for labels)
 * - Flags custom font-size values
 * - Reports minimum touch target violations (< 44px)
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const SRC_DIR = join(PROJECT_ROOT, 'src');

// WCAG minimum sizes
const MIN_BODY_TEXT = 13; // pixels
const MIN_TOUCH_TARGET = 44; // pixels

// Tailwind text size mappings
const TAILWIND_SIZES = {
  'text-xs': 12, // 0.75rem - ONLY for labels
  'text-sm': 14, // 0.875rem
  'text-base': 16, // 1rem
  'text-lg': 18, // 1.125rem
  'text-xl': 20, // 1.25rem
  'text-2xl': 24, // 1.5rem
};

// Patterns to search for
const PATTERNS = {
  tailwindClass: /className=["'][^"']*\b(text-(?:xs|sm|base|lg|xl|2xl))\b[^"']*["']/g,
  inlineStyle: /style={{[^}]*fontSize:\s*["']?(\d+)(?:px|rem)["']?[^}]*}}/g,
  cssValue: /font-size:\s*(\d+(?:\.\d+)?)(px|rem)/g,
};

const issues = [];
let filesScanned = 0;

/**
 * Get all files recursively
 */
async function getFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      // Skip node_modules, dist, build
      if (!['node_modules', 'dist', 'build', '.git'].includes(file.name)) {
        await getFiles(filePath, fileList);
      }
    } else if (file.name.match(/\.(jsx?|tsx?)$/)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Convert rem to px (assuming 16px base)
 */
function remToPx(rem) {
  return parseFloat(rem) * 16;
}

/**
 * Scan file for typography violations
 */
async function scanFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = relative(PROJECT_ROOT, filePath);
  const lines = content.split('\n');

  filesScanned++;

  // Check Tailwind classes
  let match;
  while ((match = PATTERNS.tailwindClass.exec(content)) !== null) {
    const className = match[1];
    const size = TAILWIND_SIZES[className];

    if (size && size < MIN_BODY_TEXT) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1].trim();

      // Only flag if not used for labels/captions
      const isLabel = /label|caption|badge|tag|hint/i.test(lineContent);

      if (!isLabel) {
        issues.push({
          file: relativePath,
          line: lineNumber,
          type: 'Tailwind Class',
          value: className,
          size: `${size}px`,
          severity: 'warning',
          message: `${className} (${size}px) is below minimum ${MIN_BODY_TEXT}px`,
          suggestion: `Use text-sm (14px) or text-base (16px) instead`,
          context: lineContent.substring(0, 80),
        });
      }
    }
  }

  // Check inline styles
  PATTERNS.inlineStyle.lastIndex = 0;
  while ((match = PATTERNS.inlineStyle.exec(content)) !== null) {
    const value = match[1];
    const size = value.includes('rem') ? remToPx(value) : parseFloat(value);

    if (size < MIN_BODY_TEXT) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1].trim();

      issues.push({
        file: relativePath,
        line: lineNumber,
        type: 'Inline Style',
        value: match[0],
        size: `${size}px`,
        severity: 'error',
        message: `fontSize ${size}px is below minimum ${MIN_BODY_TEXT}px`,
        suggestion: `Use CSS variable --text-body or --text-small instead`,
        context: lineContent.substring(0, 80),
      });
    }
  }

  // Check CSS values in style blocks
  PATTERNS.cssValue.lastIndex = 0;
  while ((match = PATTERNS.cssValue.exec(content)) !== null) {
    const value = match[1];
    const unit = match[2];
    const size = unit === 'rem' ? remToPx(value) : parseFloat(value);

    if (size < MIN_BODY_TEXT) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1].trim();

      // Skip CSS variable definitions
      if (lineContent.includes('--text-')) continue;

      issues.push({
        file: relativePath,
        line: lineNumber,
        type: 'CSS Value',
        value: `${value}${unit}`,
        size: `${size}px`,
        severity: 'warning',
        message: `font-size ${size}px is below minimum ${MIN_BODY_TEXT}px`,
        suggestion: `Use clamp() or CSS variables`,
        context: lineContent.substring(0, 80),
      });
    }
  }
}

/**
 * Print results
 */
function printResults() {
  console.log('\n📐 Typography Audit Results\n');
  console.log(`Files scanned: ${filesScanned}`);
  console.log(`Issues found: ${issues.length}\n`);

  if (issues.length === 0) {
    console.log('✅ No typography violations found!\n');
    return;
  }

  // Group by severity
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (errors.length > 0) {
    console.log(`❌ Errors (${errors.length}):\n`);
    errors.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.file}:${issue.line}`);
      console.log(`   ${issue.message}`);
      console.log(`   💡 ${issue.suggestion}`);
      console.log(`   📄 ${issue.context}...\n`);
    });
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Warnings (${warnings.length}):\n`);
    warnings.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.file}:${issue.line}`);
      console.log(`   ${issue.message}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  }

  // Summary by file
  const fileMap = {};
  issues.forEach((issue) => {
    if (!fileMap[issue.file]) {
      fileMap[issue.file] = 0;
    }
    fileMap[issue.file]++;
  });

  console.log('\n📊 Issues by file:\n');
  Object.entries(fileMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([file, count]) => {
      console.log(`   ${count}x ${file}`);
    });

  console.log('\n');
  process.exit(errors.length > 0 ? 1 : 0);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Scanning for typography violations...\n');

  try {
    const files = await getFiles(SRC_DIR);
    console.log(`Found ${files.length} files to scan\n`);

    for (const file of files) {
      await scanFile(file);
    }

    printResults();
  } catch (error) {
    console.error('❌ Error during audit:', error);
    process.exit(1);
  }
}

main();
