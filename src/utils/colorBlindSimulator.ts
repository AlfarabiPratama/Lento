/// <reference types="vite/client" />

/**
 * Color Blind Simulator Utility
 * 
 * Simulates color blindness using matrix transformations to ensure
 * Lento's teal + amber color palette remains accessible.
 * 
 * Usage:
 *   import { simulateColorBlindness, testColorPalette } from '@/utils/colorBlindSimulator';
 *   
 *   const deuteranopiaColor = simulateColorBlindness('#14b8a6', 'deuteranopia');
 *   testColorPalette(); // Log all colors in different simulations
 * 
 * @see https://www.color-blindness.com/coblis-color-blindness-simulator/
 */

type ColorBlindnessType = 'deuteranopia' | 'protanopia' | 'tritanopia';

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Color blindness transformation matrices
 * Based on research by Brettel, Viénot and Mollon (CVRL)
 */
const COLOR_BLINDNESS_MATRICES = {
  // Deuteranopia (green-blind, ~6% of males)
  deuteranopia: [
    0.625, 0.375, 0.0,
    0.7, 0.3, 0.0,
    0.0, 0.3, 0.7,
  ],
  // Protanopia (red-blind, ~2.5% of males)
  protanopia: [
    0.567, 0.433, 0.0,
    0.558, 0.442, 0.0,
    0.0, 0.242, 0.758,
  ],
  // Tritanopia (blue-blind, ~0.001% rare)
  tritanopia: [
    0.95, 0.05, 0.0,
    0.0, 0.433, 0.567,
    0.0, 0.475, 0.525,
  ],
};

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex: string): RGB {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Convert RGB object to hex color
 */
function rgbToHex(rgb: RGB): string {
  const r = Math.round(Math.max(0, Math.min(255, rgb.r)));
  const g = Math.round(Math.max(0, Math.min(255, rgb.g)));
  const b = Math.round(Math.max(0, Math.min(255, rgb.b)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Apply color blindness matrix transformation
 */
function applyMatrix(rgb: RGB, matrix: number[]): RGB {
  return {
    r: rgb.r * matrix[0] + rgb.g * matrix[1] + rgb.b * matrix[2],
    g: rgb.r * matrix[3] + rgb.g * matrix[4] + rgb.b * matrix[5],
    b: rgb.r * matrix[6] + rgb.g * matrix[7] + rgb.b * matrix[8],
  };
}

/**
 * Simulate color blindness for a given color
 * 
 * @param color - Hex color code (e.g., '#14b8a6')
 * @param type - Type of color blindness to simulate
 * @returns Simulated hex color
 */
export function simulateColorBlindness(
  color: string,
  type: ColorBlindnessType
): string {
  const rgb = hexToRgb(color);
  const matrix = COLOR_BLINDNESS_MATRICES[type];
  const transformed = applyMatrix(rgb, matrix);
  return rgbToHex(transformed);
}

/**
 * Lento's core color palette
 */
export const LENTO_PALETTE = {
  // Primary colors
  teal: {
    light: '#5eead4', // teal-300
    default: '#14b8a6', // teal-500
    dark: '#0d9488', // teal-600
  },
  amber: {
    light: '#fcd34d', // amber-300
    default: '#f59e0b', // amber-500
    dark: '#d97706', // amber-600
  },
  // UI colors
  background: {
    light: '#ffffff',
    dark: '#121212', // OLED black
  },
  ink: {
    light: '#1e293b', // slate-800
    muted: '#64748b', // slate-500
  },
  // Status colors
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
};

/**
 * Test entire color palette for color blindness
 * Logs results to console for manual review
 */
export function testColorPalette(): void {
  console.group('🎨 Lento Color Palette - Color Blindness Simulation');

  const types: ColorBlindnessType[] = ['deuteranopia', 'protanopia', 'tritanopia'];

  Object.entries(LENTO_PALETTE).forEach(([categoryName, category]) => {
    console.group(`\n📦 ${categoryName.toUpperCase()}`);

    Object.entries(category).forEach(([colorName, originalColor]) => {
      if (typeof originalColor !== 'string') return;

      console.log(`\n🎯 ${colorName}: ${originalColor}`);
      console.log(`%c██ Original`, `color: ${originalColor}; font-size: 16px;`);

      types.forEach((type) => {
        const simulated = simulateColorBlindness(originalColor, type);
        console.log(
          `%c██ ${type}`,
          `color: ${simulated}; font-size: 16px;`,
          simulated
        );
      });
    });

    console.groupEnd();
  });

  console.groupEnd();
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula
 * 
 * @returns Contrast ratio (1-21)
 */
export function calculateContrast(color1: string, color2: string): number {
  const getLuminance = (rgb: RGB): number => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color pair meets WCAG AA/AAA standards
 */
export function checkContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): { passes: boolean; ratio: number; required: number } {
  const ratio = calculateContrast(foreground, background);
  const required = level === 'AAA' ? 7 : 4.5; // Normal text

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

/**
 * Get pattern suggestion for status indicators
 * Provides non-color visual cues for color-blind users
 */
export function getPatternForStatus(
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
): {
  icon: string;
  pattern: string;
  ariaLabel: string;
} {
  const patterns = {
    success: {
      icon: '✓',
      pattern: 'solid',
      ariaLabel: 'Success',
    },
    warning: {
      icon: '⚠',
      pattern: 'diagonal-stripes',
      ariaLabel: 'Warning',
    },
    error: {
      icon: '✕',
      pattern: 'cross-hatch',
      ariaLabel: 'Error',
    },
    info: {
      icon: 'ℹ',
      pattern: 'dots',
      ariaLabel: 'Information',
    },
    neutral: {
      icon: '○',
      pattern: 'none',
      ariaLabel: 'Neutral',
    },
  };

  return patterns[status];
}

/**
 * Validate entire app color palette
 * Returns array of issues found
 */
export function validatePalette(): Array<{
  category: string;
  color: string;
  issue: string;
  suggestion: string;
}> {
  const issues: Array<{
    category: string;
    color: string;
    issue: string;
    suggestion: string;
  }> = [];

  // Check teal vs amber contrast (used together frequently)
  const tealAmberContrast = calculateContrast(
    LENTO_PALETTE.teal.default,
    LENTO_PALETTE.amber.default
  );
  if (tealAmberContrast < 3) {
    issues.push({
      category: 'Color Pairing',
      color: 'teal + amber',
      issue: `Low contrast: ${tealAmberContrast.toFixed(2)}:1`,
      suggestion: 'Add border/icon to differentiate when used adjacent',
    });
  }

  // Check if teal and amber appear similar to color-blind users
  const types: ColorBlindnessType[] = ['deuteranopia', 'protanopia'];
  types.forEach((type) => {
    const tealSim = simulateColorBlindness(LENTO_PALETTE.teal.default, type);
    const amberSim = simulateColorBlindness(LENTO_PALETTE.amber.default, type);
    const simContrast = calculateContrast(tealSim, amberSim);

    if (simContrast < 1.5) {
      issues.push({
        category: 'Color Blindness',
        color: `teal + amber (${type})`,
        issue: `Colors appear too similar: ${simContrast.toFixed(2)}:1`,
        suggestion: 'Use pattern indicators or icons to differentiate',
      });
    }
  });

  // Check text contrast on dark background
  const textContrast = checkContrast(
    LENTO_PALETTE.ink.light,
    LENTO_PALETTE.background.dark,
    'AA'
  );
  if (!textContrast.passes) {
    issues.push({
      category: 'Text Contrast',
      color: 'ink-light on dark background',
      issue: `Contrast ${textContrast.ratio}:1 < ${textContrast.required}:1`,
      suggestion: 'Use lighter text color or add stroke',
    });
  }

  return issues;
}

// Export for development console testing
if (import.meta.env.DEV) {
  (window as any).lentoColorBlind = {
    test: testColorPalette,
    simulate: simulateColorBlindness,
    validate: validatePalette,
    checkContrast,
  };
  console.log('💡 Color blind testing available: window.lentoColorBlind');
}
