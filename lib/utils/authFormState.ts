/**
 * Auth Form State Utility
 * 
 * Manages form field persistence between auth pages (login/signup)
 * Uses localStorage to carry over common fields like email
 */

const STORAGE_KEY = "auth_form_state";

interface AuthFormState {
  email?: string;
  name?: string;
}

/**
 * Save form state to localStorage
 */
export function saveAuthFormState(state: Partial<AuthFormState>): void {
  if (typeof window === "undefined") return;
  
  try {
    const existing = getAuthFormState();
    const updated = { ...existing, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    // Silently fail if localStorage is not available
    console.warn("Failed to save auth form state:", error);
  }
}

/**
 * Get form state from localStorage
 */
export function getAuthFormState(): AuthFormState {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as AuthFormState;
  } catch (error) {
    return {};
  }
}

/**
 * Clear form state from localStorage
 */
export function clearAuthFormState(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Silently fail if localStorage is not available
  }
}

/**
 * Get default values for react-hook-form from stored state
 */
export function getAuthFormDefaults(): Partial<AuthFormState> {
  return getAuthFormState();
}
