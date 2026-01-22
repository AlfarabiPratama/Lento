/**
 * Skip to Content Link Component
 * 
 * Provides keyboard users a shortcut to skip navigation and go directly to main content.
 * Appears on Tab key press, hidden otherwise.
 * 
 * WCAG 2.4.1 - Bypass Blocks (Level A)
 */

import { useEffect, useState, useRef } from 'react';

export function SkipToContent() {
  const [showOnFocus, setShowOnFocus] = useState(false);

  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      onFocus={() => setShowOnFocus(true)}
      onBlur={() => setShowOnFocus(false)}
      className={`
        fixed top-4 left-4 z-[9999]
        bg-primary text-white px-6 py-3 rounded-lg
        font-medium text-body
        focus:outline-none focus:ring-4 focus:ring-primary/50
        transition-transform duration-200
        ${showOnFocus ? 'translate-y-0' : '-translate-y-full sr-only'}
      `}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}

/**
 * Focus Trap Hook
 * 
 * Traps focus within a modal/dialog, preventing tab navigation outside.
 * Essential for accessible modals and drawers.
 * 
 * Usage:
 *   const trapRef = useFocusTrap(isOpen);
 *   <div ref={trapRef}>Modal content</div>
 */

export function useFocusTrap(isActive: boolean) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = element.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstFocusable?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab (backwards)
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab (forwards)
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Allow parent to handle escape (close modal)
        element.dispatchEvent(new CustomEvent('escape-key'));
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return elementRef;
}

/**
 * Focus Visible Utility
 * 
 * Shows focus indicators only for keyboard navigation (not mouse clicks).
 * Improves visual clarity while maintaining accessibility.
 */

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    let hadKeyboardEvent = false;

    const handleKeyDown = () => {
      hadKeyboardEvent = true;
    };

    const handlePointerDown = () => {
      hadKeyboardEvent = false;
    };

    const handleFocus = () => {
      if (hadKeyboardEvent) {
        setIsFocusVisible(true);
      }
    };

    const handleBlur = () => {
      setIsFocusVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('mousedown', handlePointerDown, true);
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('touchstart', handlePointerDown, true);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('mousedown', handlePointerDown, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('touchstart', handlePointerDown, true);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  return isFocusVisible;
}

/**
 * Roving Tab Index Hook
 * 
 * Manages keyboard navigation within a list/grid of items.
 * Only one item is tabbable at a time, arrow keys move focus.
 * 
 * Usage:
 *   const { focusedIndex, setFocusedIndex, handleKeyDown } = useRovingTabIndex(items.length);
 *   
 *   items.map((item, i) => (
 *     <button
 *       tabIndex={i === focusedIndex ? 0 : -1}
 *       onKeyDown={handleKeyDown}
 *       onClick={() => setFocusedIndex(i)}
 *     >
 *       {item}
 *     </button>
 *   ))
 */

export function useRovingTabIndex(itemCount: number, orientation: 'horizontal' | 'vertical' = 'vertical') {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    if (e.key === nextKey) {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % itemCount);
    } else if (e.key === prevKey) {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusedIndex(itemCount - 1);
    }
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}
