import { useCallback, useEffect, useState } from 'react';
import {
  getErrorDetailsPreference,
  setErrorDetailsPreference,
  subscribeErrorDetailsPreference,
  getErrorDetailsStorageKey,
} from '@/shared/lib/error/errorDetailsPreference';

export function useErrorDetailsPreference(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabledState] = useState(getErrorDetailsPreference);

  useEffect(() => {
    const unsubscribe = subscribeErrorDetailsPreference(() => {
      setEnabledState(getErrorDetailsPreference());
    });

    const storageKey = getErrorDetailsStorageKey();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setEnabledState(getErrorDetailsPreference());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setErrorDetailsPreference(next);
  }, []);

  return [enabled, setEnabled];
}
