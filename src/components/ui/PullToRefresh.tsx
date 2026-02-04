/**
 * Pull-to-Refresh Component
 * Native-like pull-to-refresh functionality for mobile
 */

import { useState, useEffect, useRef, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Pull-to-Refresh wrapper component
 * 
 * @example
 * <PullToRefresh onRefresh={async () => {
 *   await fetchLatestData();
 * }}>
 *   <YourContent />
 * </PullToRefresh>
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  className = '',
}) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || refreshing) return;

    // Only enable pull-to-refresh when at top of scroll
    if (window.scrollY === 0 && containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      if (scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || refreshing) return;

    // Check if we're at the top of scroll
    const isAtTop = window.scrollY === 0 && 
                    (!containerRef.current || containerRef.current.scrollTop === 0);

    // If not at top, reset and allow normal scroll
    if (!isAtTop) {
      startY.current = 0;
      setPulling(false);
      setPullDistance(0);
      return;
    }

    // Only proceed if we have a valid startY (user touched at top)
    if (startY.current === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    // Only pull down, and only if distance is meaningful
    if (distance > 0) {
      setPulling(true);
      // Apply resistance effect: the further you pull, the harder it gets
      const resistance = Math.min(distance, maxPullDistance);
      const easedDistance = resistance * 0.5; // 50% resistance
      setPullDistance(easedDistance);

      // Only prevent default if we're actively pulling (past threshold)
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled) return;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setRefreshing(false);
      }
    }

    setPulling(false);
    setPullDistance(0);
    startY.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing, disabled]);

  const pullPercentage = Math.min((pullDistance / threshold) * 100, 100);
  const spinnerRotation = (pullPercentage / 100) * 360;

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-50"
        style={{
          height: `${pullDistance}px`,
          opacity: pulling || refreshing ? 1 : 0,
          transform: `translateY(-${refreshing ? 0 : threshold - pullDistance}px)`,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {refreshing ? (
            // Spinning loader during refresh
            <svg
              className="w-6 h-6 animate-spin text-teal-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            // Arrow that rotates based on pull distance
            <svg
              className="w-6 h-6 text-teal-600 transition-transform duration-200"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{
                transform: `rotate(${spinnerRotation}deg)`,
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          
          {/* Pull status text */}
          <span className="text-xs text-ink-600 dark:text-ink-400 font-medium">
            {refreshing
              ? 'Refreshing...'
              : pullPercentage >= 100
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pulling && !refreshing ? pullDistance * 0.5 : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
