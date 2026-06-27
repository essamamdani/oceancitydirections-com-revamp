// Better Auth session management with proper subscription support
import { authClient } from "@/lib/auth-client";

const authListeners = new Set();
let lastSession = null;

// Internal function to check session and notify listeners if changed
async function checkAndNotify() {
  try {
    const { data } = await authClient.getSession();
    let currentSession = data || null;
    
    // If no session from Better Auth, try local storage fallback (app uses this pattern)
    if (!currentSession && typeof window !== 'undefined') {
      try {
        if (document.cookie.includes('auth-token=')) {
          const userStr = localStorage.getItem('auth-user');
          if (userStr) {
            currentSession = { user: JSON.parse(userStr) };
          }
        }
      } catch (e) {
        // Ignore fallback errors
      }
    }
    
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
  } catch (err) {
    console.error('Session check error:', err);
  }
}

// Get current user from Better Auth or local fallback
export async function getClientUser() {
  try {
    const { data } = await authClient.getSession();
    if (data?.user) return { user: data.user };
  } catch (err) {
    console.error('getSession error:', err);
  }
  
  // Fallback to local storage (app uses this pattern heavily due to cross-domain auth)
  if (typeof window !== 'undefined') {
    try {
      if (!document.cookie.includes('auth-token=')) {
        localStorage.removeItem('auth-user');
        localStorage.removeItem('auth-token');
        return { user: null };
      }
      const userStr = localStorage.getItem('auth-user');
      if (userStr) {
        return { user: JSON.parse(userStr) };
      }
    } catch (e) {
      return { user: null };
    }
  }
  
  return { user: null };
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
