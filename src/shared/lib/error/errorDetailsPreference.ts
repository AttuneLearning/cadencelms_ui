const STORAGE_KEY = 'cadence:error-details-enabled';

const listeners = new Set<() => void>();

export function getErrorDetailsPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function setErrorDetailsPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

export function subscribeErrorDetailsPreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getErrorDetailsStorageKey(): string {
  return STORAGE_KEY;
}
