"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Layouts/Navbar";
import Link from "next/link";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import toast from 'react-hot-toast';

// Simple function to get user from localStorage
function getUserFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    if (!document.cookie.includes('auth-token=')) {
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-token');
      return null;
    }
    const userStr = localStorage.getItem('auth-user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

import VideoUploadModal from "@/components/Common/VideoUploadModal";

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  const handleForceLogout = async () => {
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
      const { authClient } = await import('@/lib/auth-client');
      await authClient.signOut();
    } catch(e) {}
    window.location.href = '/login?next=/dashboard';
  };

  useEffect(() => {
    async function checkAuth() {
      const cachedUser = getUserFromStorage();
      if (cachedUser) {
        setUser(cachedUser);
        loadData(cachedUser.id);
        return;
      }

      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            localStorage.setItem('auth-user', JSON.stringify(data.user));
            setUser(data.user);
            loadData(data.user.id);
            return;
          }
        } else if (response.status === 401 || response.status === 403) {
          handleForceLogout();
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }

      window.location.href = '/login?next=/dashboard';
    }

    checkAuth();
  }, []);

  const processPendingActions = async () => {
    let actionsProcessed = false;

    // Process Pending Claim
    try {
      const pendingClaimStr = localStorage.getItem('pending_claim_business');
      if (pendingClaimStr) {
        const pendingClaim = JSON.parse(pendingClaimStr);
        const { saveBusinessEditAction } = await import('./actions');
        const result = await saveBusinessEditAction(pendingClaim);
        if (result.success) {
          toast.success("Pending business claim has been submitted successfully!");
        } else {
          toast.error("Failed to submit pending claim: " + result.error);
        }
        localStorage.removeItem('pending_claim_business');
        actionsProcessed = true;
      }
    } catch (e) {
      console.error('Failed to process pending claim:', e);
      localStorage.removeItem('pending_claim_business');
    }

    // Process Pending Claim from grid
    try {
      const claimBusinessId = localStorage.getItem('claim_business_id');
      if (claimBusinessId) {
        const res = await fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: parseInt(claimBusinessId) }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Claim request submitted! Admin will review shortly.");
        } else {
          toast.error(data.error || "Failed to submit claim");
        }
        localStorage.removeItem('claim_business_id');
        localStorage.removeItem('claim_redirect');
        actionsProcessed = true;
      }
    } catch (e) {
      console.error('Failed to process grid claim:', e);
      localStorage.removeItem('claim_business_id');
      localStorage.removeItem('claim_redirect');
    }

    // Process Pending Info Request
    try {
      const pendingInfoStr = localStorage.getItem('pending_info_request');
      if (pendingInfoStr) {
        const pendingInfo = JSON.parse(pendingInfoStr);
        const { submitPendingRequestAction } = await import('./actions');
        const result = await submitPendingRequestAction(pendingInfo);
        if (result.success) {
          toast.success("Pending information request has been submitted successfully!");
        } else {
          toast.error("Failed to submit pending info request: " + result.error);
        }
        localStorage.removeItem('pending_info_request');
        actionsProcessed = true;
      }
    } catch (e) {
      console.error('Failed to process pending info request:', e);
      localStorage.removeItem('pending_info_request');
    }

    // Process Pending Removal Request
    try {
      const pendingRemovalStr = localStorage.getItem('pending_removal_request');
      if (pendingRemovalStr) {
        const pendingRemoval = JSON.parse(pendingRemovalStr);
        const { submitPendingRequestAction } = await import('./actions');
        const result = await submitPendingRequestAction({
          ...pendingRemoval,
          type: 'removal',
          remarks: pendingRemoval.reason
        });
        if (result.success) {
          toast.success("Pending removal request has been submitted successfully!");
        } else {
          toast.error("Failed to submit pending removal request: " + result.error);
        }
        localStorage.removeItem('pending_removal_request');
        actionsProcessed = true;
      }
    } catch (e) {
      console.error('Failed to process pending removal request:', e);
      localStorage.removeItem('pending_removal_request');
    }

    return actionsProcessed;
  };

  const loadData = async (userId: string) => {
    try {
      await processPendingActions();
      
      await Promise.all([
        fetchClaims(),
        fetchSubmissions(),
        fetchBusinesses(userId),
        fetchRequests()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { getUserRequestsAction } = await import('./actions');
      const res = await getUserRequestsAction();
      if (!res.error && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Error fetching user requests:', err);
    }
  };

  const fetchBusinesses = async (userId: string) => {
    try {
      const { getUserApprovedBusinessesAction } = await import('./actions');
      const res = await getUserApprovedBusinessesAction();
      if (!res.error && res.data) {
        setBusinesses(res.data);
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims/list', { cache: 'no-store' });
      if (!res.ok) { setClaims([]); return; }
      const data = await res.json();
      setClaims(data.data?.filter((c: any) => c.status !== 'approved') || []);
    } catch (err) {
      console.error("Error fetching claims:", err);
      setClaims([]);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions/list', { cache: 'no-store' });
      if (!res.ok) { setSubmissions([]); return; }
      const data = await res.json();
      setSubmissions(data.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setSubmissions([]);
    }
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-3 text-sm text-slate-500 font-semibold">Loading dashboard...</p>
        </div>
      </>
    );
  }

  const pendingBusinessIds = new Set(
    claims.filter(c => c.status === 'pending' && c.business_id).map(c => c.business_id)
  );

  const filteredBusinesses = businesses.filter(b => !pendingBusinessIds.has(b.id));

  const allItems: any[] = [
    ...filteredBusinesses.map(b => {
        const isAddedByYou = b._claim?.proposed_data?.category || false;
        const isVideoHomes = b._claim?.source === 'videohomes' || b._claim?.siteurl?.includes('videohomes');
        return {
            id: b.id,
            title: b.title || b.name,
            location: `${b.city}, ${b.state}`,
            status: 'approved',
            type: 'business',
            source: isAddedByYou ? 'submission' : isVideoHomes ? 'videohomes' : 'claim',
            slug: b.slug,
            _claim: b._claim,
            _video: b._video || null
        };
    }),
    ...claims.map(c => ({
        id: c.id,
        title: c.business?.title || c.business?.name || c.proposed_data?.title || (c.type === 'new' ? 'New Business Registration' : 'Claim Request'),
        location: c.business ? `${c.business.city}, ${c.business.state}` : (c.proposed_data?.city ? `${c.proposed_data.city}, ${c.proposed_data.state}` : 'Location Unknown'),
        status: c.status,
        type: c.type === 'new' ? 'submission' : 'claim',
        source: c.type === 'new' ? 'submission' : 'claim',
        businessId: c.business_id,
        _video: c.proposed_data?.video_thumbnail ? { thumbnail: c.proposed_data.video_thumbnail, is_video_approved: false } : null
    })),
    ...submissions.map(s => ({
        id: s.id,
        title: s.submission_data?.title || s.submission_data?.name || 'New Submission',
        location: `${s.submission_data?.city || ''}, ${s.submission_data?.state || ''}`,
        status: s.status,
        type: 'submission',
        source: 'submission',
        _video: s.submission_data?.video_thumbnail ? { thumbnail: s.submission_data.video_thumbnail, is_video_approved: false } : null
    }))
  ];

  const videosList = allItems.filter(item => item._video);
  const businessesList = allItems.filter(item => item.type === 'business' || item.type === 'claim');
  const pendingRequestsList = requests.filter(req => req.status === 'pending');

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-8 font-sans text-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Dashboard Left Sidebar */}
          <DashboardSidebar user={user} />

          {/* Main Dashboard Space */}
          <main className="flex-1 space-y-8">
            
            {/* Top Bar Header & Chips */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <div className="space-y-1.5">
                <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Welcome back, {user.name || 'John'}! 👋</h1>
                <p className="text-xs font-medium text-slate-400">Create powerful content and grow your business with video.</p>
              </div>

              {/* Status metrics chips */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] px-4 py-2 rounded-2xl text-xs font-bold shadow-xs">
                  <i className="bx bx-video text-lg"></i>
                  <span>{videosList.length} Videos</span>
                </div>
                
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 rounded-2xl text-xs font-bold shadow-xs">
                  <i className="bx bx-store-alt text-lg"></i>
                  <span>{businessesList.length} Businesses</span>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] px-4 py-2 rounded-2xl text-xs font-bold shadow-xs">
                  <i className="bx bx-time text-lg"></i>
                  <span>{pendingRequestsList.length} Pending Requests</span>
                </div>

                <Link
                  href="/dashboard/add-business"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-2xl transition duration-200 text-xs shadow-sm flex items-center gap-1.5"
                >
                  <i className="bx bx-plus text-sm"></i> New Video
                </Link>
              </div>
            </div>

            {/* Split Content layout (8 cols / 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Your Videos */}
                <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 font-serif">Your Videos</h2>
                    <Link href="/dashboard/videos" className="text-xs font-bold text-orange-605 hover:underline">
                      View All Videos &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videosList.slice(0, 3).map((item, idx) => (
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-250 flex flex-col" key={idx}>
                        <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
                          {item._video?.thumbnail && (
                            <img
                              src={item._video.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider ${
                              item._video?.is_video_approved ? 'bg-orange-600' : 'bg-amber-500'
                            }`}>
                              {item._video?.is_video_approved ? 'Live' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                          <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</h3>
                          <div className="text-[10px] text-slate-400 font-medium">
                            <div>0 views &bull; 0 likes</div>
                            <div className="mt-0.5">Published {new Date().toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!videosList.length && (
                      <div className="col-span-full py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                        <i className="bx bx-video-off text-3xl mb-1.5 block"></i>
                        <span>No videos added or uploaded yet.</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Distribution Overview */}
                <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 font-serif">Distribution Overview</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="border border-slate-150 p-5 rounded-2xl shadow-xs space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-900 flex items-center justify-center font-bold">
                        <i className="bx bx-layer"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900 font-serif">{businessesList.length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Listings</div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Active across directory</span>
                      </div>
                    </div>
                    
                    <div className="border border-slate-150 p-5 rounded-2xl shadow-xs space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                        <i className="bx bx-show-alt"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900 font-serif">156</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Across all listings</span>
                      </div>
                    </div>

                    <div className="border border-slate-150 p-5 rounded-2xl shadow-xs space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <i className="bx bx-star"></i>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900 font-serif">4.8</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Rating</div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">From customer reviews</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity list */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Activity</h3>
                    <div className="space-y-3">
                      {businessesList.slice(0, 3).map((biz, idx) => (
                        <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-b-0" key={idx}>
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="text-slate-650">Business claimed: <strong>{biz.title}</strong></span>
                          </div>
                          <span className="text-slate-400 font-semibold text-[10px]">Approved &bull; {idx + 1} day ago</span>
                        </div>
                      ))}
                      {!businessesList.length && (
                        <div className="text-slate-400 text-xs italic">No recent claims or activity.</div>
                      )}
                    </div>
                  </div>
                </section>

              </div>

              {/* Right Column (4 cols) */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Your Businesses */}
                <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 font-serif">Your Businesses</h2>
                    <Link href="/dashboard" className="text-xs font-bold text-orange-605 hover:underline">
                      Manage All &rarr;
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {businessesList.slice(0, 3).map((item, idx) => (
                      <div className="bg-[#F8FAFC] border border-slate-150 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-slate-300 transition" key={idx}>
                        <div>
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="font-bold text-slate-900 text-xs truncate flex-1">{item.title}</h4>
                            <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-105 shrink-0">
                              Claimed
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal truncate">{item.location}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Status: <strong className="text-orange-600">Approved</strong></span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-150 gap-2">
                          <Link 
                            href={`/dashboard/edit-business/${item.id}`} 
                            className="text-[10px] font-bold text-slate-700 hover:text-white bg-white hover:bg-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-lg transition"
                          >
                            Edit Business
                          </Link>
                          <Link 
                            href={`/s/${item.slug}`} 
                            className="text-[10px] font-semibold text-orange-705 hover:underline shrink-0"
                            target="_blank"
                          >
                            View Listing
                          </Link>
                        </div>
                      </div>
                    ))}
                    {!businessesList.length && (
                      <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                        <i className="bx bx-store-alt text-3xl mb-1.5 block"></i>
                        <span>No businesses claimed.</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* My Requests */}
                <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 font-serif">My Requests</h2>
                    <Link href="/dashboard/requests" className="text-xs font-bold text-orange-605 hover:underline">
                      View All &rarr;
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {requests.slice(0, 3).map((req, idx) => (
                      <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-3" key={idx}>
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-slate-900 text-xs">
                            {req.type === 'removal' ? 'Removal Request' : req.type === 'report' ? 'Report Request' : 'Information Update'}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            req.status === 'approved' ? 'bg-orange-50 text-orange-700' : 
                            req.status === 'rejected' ? 'bg-red-50 text-red-700' : 
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          <strong>Business:</strong> {req.business?.title || `Business ID: ${req.business_id}`}
                        </div>
                      </div>
                    ))}
                    {!requests.length && (
                      <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                        <i className="bx bx-message-square-detail text-3xl mb-1.5 block"></i>
                        <span>No suggestions or requests.</span>
                      </div>
                    )}
                  </div>
                </section>

              </div>

            </div>

          </main>

        </div>
      </div>

      <VideoUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
            setUploadModalOpen(false);
            setSelectedBusiness(null);
        }}
        business={selectedBusiness}
        onSuccess={() => {
            toast.success("Video uploaded! Refreshing...");
            setUploadModalOpen(false);
            setSelectedBusiness(null);
            window.location.reload();
        }}
      />
    </>
  );
}
