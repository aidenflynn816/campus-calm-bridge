
import { useEffect } from 'react';

export const useDebounce = (
  callback: () => void,
  delay: number,
  dependencies: any[] = []
) => {
  useEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [...dependencies, delay]);
};
