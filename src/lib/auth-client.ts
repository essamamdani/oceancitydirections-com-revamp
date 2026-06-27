// Better Auth client for Universal Auth (same as videohomes)
import { createAuthClient } from "better-auth/client"

// Create the auth client for central auth
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.realtydirections.com",
  fetchOptions: {
    onRequest: (context) => {
      // Add Authorization token for cross-origin requests (bypasses 3rd party cookie blocking)
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth-token");
        if (token) {
          context.headers.set("Authorization", `Bearer ${token}`);
        } else {
          // Fallback to reading from document.cookie
          const match = document.cookie.match(new RegExp('(^| )auth-token=([^;]+)'));
          if (match) {
            context.headers.set("Authorization", `Bearer ${match[2]}`);
          }
        }
      }
    }
  }
})

// Helper functions
export const signIn = async (email: string, password: string) => {
  return await authClient.signIn.email({
    email,
    password,
    callbackURL: "/",
  })
}

export const signUp = async (email: string, password: string, name: string) => {
  return await authClient.signUp.email({
    email,
    password,
    name,
    callbackURL: "/",
  })
}

export const signOut = async () => {
  return await authClient.signOut()
}

export const getSession = async () => {
  return await authClient.getSession()
}
