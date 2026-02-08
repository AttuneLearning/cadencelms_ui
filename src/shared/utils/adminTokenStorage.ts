/**
 * Admin Token Storage - Memory Only
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * CRITICAL SECURITY: Admin tokens are stored in MEMORY ONLY, NEVER persisted
 * to localStorage, sessionStorage, or cookies. This prevents XSS attacks from
 * stealing admin tokens.
 *
 * TRADEOFFS:
 * - Admin tokens are LOST on page refresh (acceptable security tradeoff)
 * - Users must re-escalate after refresh (better than XSS vulnerability)
 * - Auto-expires after timeout for additional security
 *
 * Usage:
 * - Call setAdminToken() after successful admin password verification
 * - Call getAdminToken() to retrieve current admin token
 * - Call clearAdminToken() to manually clear admin session
 * - Call hasAdminToken() to check if admin session is active
 */

// ============================================================================
// Memory-Only Storage (NEVER persisted)
// ============================================================================

/**
 * Admin token stored in memory only - lost on page refresh
 */
let adminToken: string | null = null;

/**
 * Admin token expiry timestamp
 */
let adminTokenExpiry: Date | null = null;

/**
 * Auto-clear timeout handle
 */
let adminTokenTimeout: NodeJS.Timeout | null = null;

// ============================================================================
// Public API
// ============================================================================

/**
 * Set admin token with auto-expiry
 *
 * SECURITY: Token is stored in memory only and will be lost on page refresh.
 * This is an intentional security tradeoff to prevent XSS attacks.
 *
 * @param token - Admin JWT token string
 * @param expiresIn - Expiration time in seconds (default: 900 = 15 minutes)
 *
 * @example
 * ```ts
 * // After successful admin password verification
 * setAdminToken(response.adminToken, 900); // 15 minute session
 * ```
 */
export function setAdminToken(token: string, expiresIn: number = 900): void {
  if (!token) {
    throw new Error('Admin token cannot be empty');
  }

  if (expiresIn <= 0) {
    throw new Error('Expiration time must be positive');
  }

  // Clear any existing timeout
  if (adminTokenTimeout) {
    clearTimeout(adminTokenTimeout);
  }

  // Store token in memory
  adminToken = token;
  adminTokenExpiry = new Date(Date.now() + expiresIn * 1000);

  // Set auto-clear timeout
  adminTokenTimeout = setTimeout(() => {
    clearAdminToken();
  }, expiresIn * 1000);
}

/**
 * Get current admin token if valid
 *
 * Checks expiration and returns null if expired.
 * Does NOT check localStorage - admin tokens are NEVER persisted.
 *
 * @returns Admin token string or null if not set/expired
 *
 * @example
 * ```ts
 * const token = getAdminToken();
 * if (token) {
 *   // Use token for admin API call
 *   headers.Authorization = `Bearer ${token}`;
 * }
 * ```
 */
export function getAdminToken(): string | null {
  // Check if token exists
  if (!adminToken) {
    return null;
  }

  // Check expiration
  if (adminTokenExpiry && new Date() > adminTokenExpiry) {
    clearAdminToken();
    return null;
  }

  return adminToken;
}

/**
 * Clear admin token and cancel auto-expiry timeout
 *
 * Call this when:
 * - User de-escalates from admin
 * - User logs out
 * - Admin session needs to be terminated
 *
 * @example
 * ```ts
 * // Manual de-escalation
 * clearAdminToken();
 * ```
 */
export function clearAdminToken(): void {
  adminToken = null;
  adminTokenExpiry = null;

  if (adminTokenTimeout) {
    clearTimeout(adminTokenTimeout);
    adminTokenTimeout = null;
  }
}

/**
 * Check if admin token exists and is valid
 *
 * @returns true if valid admin token exists, false otherwise
 *
 * @example
 * ```ts
 * if (hasAdminToken()) {
 *   // Show admin UI elements
 * }
 * ```
 */
export function hasAdminToken(): boolean {
  return getAdminToken() !== null;
}

/**
 * Get admin token expiry time
 *
 * @returns Date object of expiry or null if no token
 */
export function getAdminTokenExpiry(): Date | null {
  if (!adminToken || !adminTokenExpiry) {
    return null;
  }

  return adminTokenExpiry;
}

/**
 * Get time remaining until admin token expires
 *
 * @returns milliseconds until expiration, or 0 if expired/not set
 */
export function getTimeUntilExpiration(): number {
  const expiry = getAdminTokenExpiry();
  if (!expiry) {
    return 0;
  }

  const timeRemaining = expiry.getTime() - Date.now();
  return Math.max(0, timeRemaining);
}

// ============================================================================
// Security Documentation
// ============================================================================

/**
 * SECURITY NOTES:
 *
 * 1. WHY MEMORY ONLY?
 *    - localStorage/sessionStorage are vulnerable to XSS attacks
 *    - Admin tokens grant elevated privileges
 *    - Memory-only storage prevents XSS token theft
 *
 * 2. TRADEOFFS:
 *    - Token lost on page refresh → User must re-escalate
 *    - Token lost on tab close → User must re-escalate
 *    - This is ACCEPTABLE for admin sessions
 *
 * 3. AUTO-EXPIRY:
 *    - Default 15 minute sessions
 *    - Automatic cleanup with setTimeout
 *    - User must re-authenticate after expiry
 *
 * 4. NEVER PERSIST:
 *    - Do NOT add localStorage fallback
 *    - Do NOT add sessionStorage fallback
 *    - Do NOT add cookie storage
 *    - Memory only is INTENTIONAL security design
 */
