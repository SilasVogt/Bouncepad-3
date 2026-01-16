// Shared hooks that can be used across platforms
// These hooks contain platform-agnostic logic

import { useState, useCallback } from "react";

// Async operation hook with loading and error states
export function useAsync<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, loading, error, data };
}

// Toggle hook
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse, setValue };
}
