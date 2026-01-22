/**
 * Accessible Announcer Component
 * 
 * Announces dynamic content changes to screen readers using ARIA live regions.
 * Used for toast notifications, form validation, loading states.
 * 
 * WCAG 4.1.3 - Status Messages (Level AA)
 */

import { useEffect, useRef } from 'react';

interface AnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number; // milliseconds
}

export function Announcer({ message, politeness = 'polite', clearAfter = 5000 }: AnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !announcerRef.current) return;

    // Clear after timeout
    const timer = setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, clearAfter);

    return () => clearTimeout(timer);
  }, [message, clearAfter]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={politeness === 'assertive' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Live Region Hook
 * 
 * Creates a live region that announces changes to screen readers.
 * 
 * Usage:
 *   const { announce } = useLiveRegion();
 *   
 *   // Announce success
 *   announce('Habit completed!', 'polite');
 *   
 *   // Announce error
 *   announce('Failed to save', 'assertive');
 */

export function useLiveRegion() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      // Cleanup on unmount
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;

    announcerRef.current.setAttribute('aria-live', politeness);
    announcerRef.current.textContent = message;

    // Clear after 5 seconds
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, 5000);
  };

  return { announce };
}

/**
 * Form Error Announcer
 * 
 * Announces form validation errors to screen readers.
 * Associates error messages with form fields using aria-describedby.
 */

interface FormErrorProps {
  fieldId: string;
  error?: string;
  touched?: boolean;
}

export function FormError({ fieldId, error, touched }: FormErrorProps) {
  if (!error || !touched) return null;

  return (
    <div
      id={`${fieldId}-error`}
      role="alert"
      aria-live="polite"
      className="text-danger text-small mt-1"
    >
      {error}
    </div>
  );
}

/**
 * Loading Announcer
 * 
 * Announces loading states to screen readers.
 * Important for async operations like data fetching.
 */

interface LoadingAnnouncerProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingAnnouncer({ isLoading, message = 'Loading...' }: LoadingAnnouncerProps) {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isLoading ? 'true' : 'false'}
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Success/Error Toast Announcer
 * 
 * Wrapper around toast notifications to announce them to screen readers.
 */

interface ToastAnnouncerProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  visible: boolean;
}

export function ToastAnnouncer({ type, message, visible }: ToastAnnouncerProps) {
  const politeness = type === 'error' ? 'assertive' : 'polite';

  if (!visible) return null;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={politeness === 'assertive' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
    >
      {`${type}: ${message}`}
    </div>
  );
}

/**
 * Progress Announcer
 * 
 * Announces progress updates for long-running operations.
 * Useful for file uploads, multi-step forms, etc.
 */

interface ProgressAnnouncerProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressAnnouncer({ current, total, label = 'Progress' }: ProgressAnnouncerProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={String(current)}
      aria-valuemin="0"
      aria-valuemax={String(total)}
      aria-label={label}
      className="sr-only"
    >
      <span className="sr-only">{`${label}: ${percentage}% complete`}</span>
    </div>
  );
}
