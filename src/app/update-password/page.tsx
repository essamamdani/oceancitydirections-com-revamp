'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { authClient } from '@/lib/auth-client'
import Navbar from "@/components/Layouts/Navbar";
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
    <div className="min-h-screen bg-gradient-to-br from-[#dfeee9] via-[#fbfaf7] to-[#dfeee9]/30 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">Update Password</h3>
            <p className="text-xs font-semibold text-slate-400">
              Enter your new password below to update your account
            </p>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200 placeholder-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your new password"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#08738a] hover:bg-[#075362] text-white rounded-xl py-3.5 font-bold transition text-xs uppercase tracking-wider shadow-md shadow-[#08738a]/20 transform hover:-translate-y-0.5 duration-200" 
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function UpdatePassword() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="pt-100 pb-100 text-center">Loading...</div>
      </>
    }>
      <UpdatePasswordForm />
    </Suspense>
  )
}
