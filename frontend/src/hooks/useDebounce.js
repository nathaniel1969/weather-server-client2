/**
 * @file useDebounce.js
 * Custom React hook for debouncing a value with a specified delay.
 */

import { useState, useEffect } from "react";

/**
 * Debounces a value by updating it only after a specified delay.
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} delay - Delay in milliseconds before updating debounced value.
 * @returns {T} The debounced value.
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default useDebounce;
