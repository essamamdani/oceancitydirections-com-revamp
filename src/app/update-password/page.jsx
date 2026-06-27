'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { authClient } from '@/lib/auth-client'
import NavbarTwo from '@/components/Layouts/NavbarTwo'
import Footer from '@/components/Layouts/Footer'
import { useAuth } from '@/contexts/AuthContext'

function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signOut } = useAuth()

  // Force logout when they land on this page to clear old session
  // This ensures the navbar shows "Login/Sign Up" instead of "Dashboard"
  useEffect(() => {
    // Clear storage manually
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-user')
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    // Clear context state silently to force navbar update
    if (signOut) {
      // Small hack to clear context without triggering the full signOut flow
      const event = new Event('storage');
      window.dispatchEvent(event);
    }
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Fallback: Manually get token from URL if Better Auth doesn't auto-detect
    const token = searchParams.get('token')
    if (!token) {
      toast.error('Invalid link: No token found in URL. Please request a new password reset email.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token: token, // Explicitly pass the token
      });

      if (error) {
        toast.error(error.message || 'Failed to update password')
        setLoading(false)
      } else {
        toast.success('Password updated successfully! Please login with your new password.')
        
        // Redirect to login
        router.push('/login')
      }
    } catch (err) {
      toast.error('An error occurred while updating password')
      setLoading(false)
    }
  }

  return (
    <>
      <NavbarTwo />
      <div className="pt-100 pb-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h3 className="text-center mb-4">Update Password</h3>
                  <form onSubmit={handleUpdatePassword}>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Enter your new password"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="default-btn w-100" 
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function UpdatePassword() {
  return (
    <Suspense fallback={
      <>
        <NavbarTwo />
        <div className="pt-100 pb-100 text-center">Loading...</div>
      </>
    }>
      <UpdatePasswordForm />
    </Suspense>
  )
}
