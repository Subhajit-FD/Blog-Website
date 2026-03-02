/**
 * lib/helpers/performance.ts
 *
 * Debounce & Throttle utilities — both vanilla functions and React hooks.
 * Import what suits the context:
 *   - Raw functions  → helpers, event handlers outside React
 *   - React hooks   → useDebouncedValue, useThrottle inside components
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Vanilla Functions ───────────────────────────────────────────────────────

/**
 * Debounce: Delays execution until `delay` ms have passed since the last call.
 * Best for: Search inputs, resize handlers, autocomplete.
 *
 * @example
 * const debouncedFetch = debounce(fetchResults, 400);
 * input.addEventListener("input", (e) => debouncedFetch(e.target.value));
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle: Guarantees the function runs at most once per `limit` ms.
 * Best for: Button spam prevention, scroll listeners, like buttons.
 *
 * @example
 * const throttledSave = throttle(saveToServer, 2000);
 * button.addEventListener("click", throttledSave);
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ─── React Hooks ──────────────────────────────────────────────────────────────

/**
 * useDebouncedValue: Returns a debounced copy of `value` after `delay` ms.
 * Ideal for controlled search inputs — fires the search only after the user
 * stops typing, not on every keystroke.
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebouncedValue(query, 400);
 * useEffect(() => { fetchPosts(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // Cleanup on re-render
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle: Returns a stable callback that can only fire once per `limit` ms.
 * Ideal for like buttons, form submissions, or any action that shouldn't be
 * triggered more than once in quick succession.
 *
 * @example
 * const throttledLike = useThrottle(handleLike, 2000);
 * <button onClick={throttledLike}>Like</button>
 */
export function useThrottle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  const inThrottleRef = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        func(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [func, limit],
  );
}
