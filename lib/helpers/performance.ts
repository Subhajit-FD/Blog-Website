/**
 * Debounce: Delays execution until 'delay' ms have passed since the last call.
 * Best for: Search bar inputs, window resizing.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle: Guarantees execution at a regular interval ('limit' ms), dropping in-between calls.
 * Best for: Scroll listeners, button spamming.
 */
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}