// Better Auth session management with proper subscription support
import { authClient } from "@/lib/auth-client";

const authListeners = new Set();
let lastSession = null;

function getStoredAuthToken() {
  if (typeof window === 'undefined') return null;

  try {
    const localToken = localStorage.getItem('auth-token');
    if (localToken) return localToken;

    const match = document.cookie.match(new RegExp('(^| )auth-token=([^;]+)'));
    return match?.[2] || null;
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
  } catch {
    // Ignore storage access failures.
  }
}

function getLocalSessionFallback() {
  if (typeof window === 'undefined') return null;

  try {
    const token = getStoredAuthToken();
    if (!token) {
      clearStoredAuth();
      return null;
    }

    const userStr = localStorage.getItem('auth-user');
    return userStr ? { user: JSON.parse(userStr) } : null;
  } catch {
    return null;
  }
}

async function readClientSession() {
  const localSession = getLocalSessionFallback();

  // Avoid cross-origin auth calls for anonymous local users. The public site
  // should render as signed-out instead of surfacing a fetch/CORS console error.
  if (!getStoredAuthToken()) return null;

  try {
    const { data } = await authClient.getSession();
    return data || localSession;
  } catch {
    return localSession;
  }
}

// Internal function to check session and notify listeners if changed
async function checkAndNotify() {
  try {
    const currentSession = await readClientSession();

    // Check if user changed (login/logout)
    const lastUserId = lastSession?.user?.id;
    const currentUserId = currentSession?.user?.id;
    
    if (lastUserId !== currentUserId) {
      lastSession = currentSession;
      // Notify all listeners about the auth state change
      authListeners.forEach(handler => {
        try {
          handler('auth-change', currentSession);
        } catch (err) {
          console.error('Auth listener error:', err);
        }
      });
    }
  } catch {
    // Treat auth-service failures as signed-out state on public pages.
  }
}

// Get current user from Better Auth or local fallback
export async function getClientUser() {
  const session = await readClientSession();
  return { user: session?.user ?? null };
}

// Subscribe to auth state changes with automatic polling
export function subscribeAuth(handler) {
  authListeners.add(handler);
  
  // No polling - rely on manual refreshAuthState() calls after login/logout
  // Polling was causing 429 Too Many Requests on the auth server
  if (authListeners.size === 1) {
    // Immediate initial check only
    checkAndNotify();
  }
  
  return {
    unsubscribe: () => {
      authListeners.delete(handler);
    },
  };
}

// Sign out and immediately notify all listeners
export async function signOut() {
  const result = await authClient.signOut();
  // Force immediate check and notify
  await checkAndNotify();
  return result;
}

// Manual refresh function (can be called after login to force immediate update)
export async function refreshAuthState() {
  await checkAndNotify();
}
