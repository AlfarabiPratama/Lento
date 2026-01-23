/**
 * Color Blind Testing Guide
 * 
 * This component demonstrates all color-blind accessible patterns used in Lento.
 * Open this page in development to visually test color blindness simulation.
 * 
 * Usage: Navigate to /dev/color-blind-test in development mode
 */

import React, { useState } from 'react';
import { StatusBadge, ProgressRing, TrendIndicator } from '../ui/StatusBadge';
import { 
  simulateColorBlindness, 
  testColorPalette, 
  validatePalette,
  LENTO_PALETTE 
} from '../../utils/colorBlindSimulator';

type ColorBlindnessType = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export function ColorBlindTestPage() {
  const [simulation, setSimulation] = useState<ColorBlindnessType>('normal');
  const [showValidation, setShowValidation] = useState(false);

  const validationIssues = validatePalette();

  // Apply color blindness filter to entire page
  const filterStyle = {
    normal: 'none',
    deuteranopia: 'url(#deuteranopia)',
    protanopia: 'url(#protanopia)',
    tritanopia: 'url(#tritanopia)',
  };

  return (
    <div className="min-h-screen bg-paper-warm p-6">
      {/* SVG Filters for color blindness simulation */}
      <svg className="hidden">
        <defs>
          <filter id="deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0   0 0
                      0.7   0.3   0   0 0
                      0     0.3   0.7 0 0
                      0     0     0   1 0"
            />
          </filter>
          <filter id="protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0   0 0
                      0.558 0.442 0   0 0
                      0     0.242 0.758 0 0
                      0     0     0   1 0"
            />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.95  0.05  0   0 0
                      0     0.433 0.567 0 0
                      0     0.475 0.525 0 0
                      0     0     0   1 0"
            />
          </filter>
        </defs>
      </svg>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="card">
          <h1 className="text-h1 text-ink mb-2">Color Blind Accessibility Test</h1>
          <p className="text-body text-ink-muted mb-6">
            Verify that all UI elements are distinguishable without relying on color alone.
          </p>

          {/* Simulation controls */}
          <div className="flex flex-wrap gap-2">
            {(['normal', 'deuteranopia', 'protanopia', 'tritanopia'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSimulation(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  simulation === type
                    ? 'bg-primary text-white'
                    : 'bg-surface text-ink-muted hover:bg-paper-warm'
                }`}
              >
                {type === 'normal' ? '👁️ Normal' : `🔴 ${type}`}
              </button>
            ))}
            
            <button
              onClick={() => {
                testColorPalette();
                setShowValidation(true);
              }}
              className="px-4 py-2 rounded-lg font-medium bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              🧪 Run Validation
            </button>
          </div>

          {showValidation && validationIssues.length > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-h3 text-amber-900 mb-2">⚠️ Validation Issues</h3>
              <ul className="space-y-2">
                {validationIssues.map((issue, i) => (
                  <li key={i} className="text-small text-amber-800">
                    <strong>{issue.category}:</strong> {issue.issue}
                    <br />
                    <span className="text-xs">💡 {issue.suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Content with simulation applied */}
        <div style={{ filter: filterStyle[simulation] }}>
          {/* Status Badges */}
          <div className="card">
            <h2 className="text-h2 text-ink mb-4">Status Badges</h2>
            <p className="text-small text-ink-muted mb-4">
              Each status has unique icon + text, not just color
            </p>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" label="Completed" />
              <StatusBadge status="paid" label="Lunas" />
              <StatusBadge status="warning" label="Due Soon" />
              <StatusBadge status="error" label="Overdue" />
              <StatusBadge status="overdue" label="Lewat jatuh tempo" />
              <StatusBadge status="info" label="Information" />
              <StatusBadge status="neutral" label="Pending" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <StatusBadge status="success" label="Small" size="sm" />
              <StatusBadge status="warning" label="Medium" size="md" />
              <StatusBadge status="error" label="Large" size="lg" />
            </div>
          </div>

          {/* Progress Rings */}
          <div className="card">
            <h2 className="text-h2 text-ink mb-4">Progress Rings</h2>
            <p className="text-small text-ink-muted mb-4">
              Dashed pattern + numeric value for accessibility
            </p>
            <div className="flex flex-wrap gap-6">
              <ProgressRing value={3} max={7} size="sm" label="Small" />
              <ProgressRing value={5} max={10} size="md" label="Medium" />
              <ProgressRing value={8} max={12} size="lg" label="Large" />
            </div>
          </div>

          {/* Trend Indicators */}
          <div className="card">
            <h2 className="text-h2 text-ink mb-4">Trend Indicators</h2>
            <p className="text-small text-ink-muted mb-4">
              Arrow icons show direction, not just color
            </p>
            <div className="flex flex-wrap gap-4">
              <TrendIndicator value={25} label="Increased" />
              <TrendIndicator value={0} label="No change" />
              <TrendIndicator value={-15} label="Decreased" />
            </div>
          </div>

          {/* Color Palette */}
          <div className="card">
            <h2 className="text-h2 text-ink mb-4">Lento Color Palette</h2>
            <p className="text-small text-ink-muted mb-4">
              Primary colors as they appear in current simulation
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(LENTO_PALETTE).map(([category, colors]) => (
                <div key={category}>
                  <h3 className="text-small font-semibold text-ink mb-2 capitalize">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(colors).map(([name, color]) => {
                      if (typeof color !== 'string') return null;
                      return (
                        <div
                          key={name}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <div>
                            <div className="font-medium text-ink">{name}</div>
                            <div className="text-ink-muted">{color}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finance Action Buttons */}
          <div className="card">
            <h2 className="text-h2 text-ink mb-4">Finance Actions</h2>
            <p className="text-small text-ink-muted mb-4">
              Icon badges with background color for clear differentiation
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/30">
                  <span className="text-xs text-red-600">−</span>
                </div>
                <span>Expense</span>
              </button>
              <button className="btn-secondary">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-950/30">
                  <span className="text-xs text-green-600">+</span>
                </div>
                <span>Income</span>
              </button>
              <button className="btn-secondary">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                  <span className="text-xs text-primary">⇄</span>
                </div>
                <span>Transfer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-h3 text-blue-900 mb-3">📋 Testing Checklist</h3>
          <ul className="space-y-2 text-small text-blue-800">
            <li>✓ All status badges have unique icons</li>
            <li>✓ Progress indicators show numeric values</li>
            <li>✓ Trends use directional arrows</li>
            <li>✓ Finance actions have icon badges + text</li>
            <li>✓ No information conveyed by color alone</li>
            <li>✓ Test with all 3 simulation types</li>
            <li>✓ Run validation to check contrast ratios</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
