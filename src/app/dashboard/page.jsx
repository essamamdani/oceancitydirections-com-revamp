"use client";
import React, { useEffect, useState } from "react";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Link from "next/link";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import toast from 'react-hot-toast';

// Simple function to get user from localStorage
function getUserFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    // Ensure cookie exists, otherwise invalid state
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
  const [businesses, setBusinesses] = useState([]);
  const [claims, setClaims] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

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
    // Check if user is logged in via Better Auth cookies
    async function checkAuth() {
      // First check localStorage
      const cachedUser = getUserFromStorage();
      if (cachedUser) {
        setUser(cachedUser);
        loadData(cachedUser.id);
        return;
      }

      // If no cached user, verify with auth server
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Store in localStorage for faster future checks
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

      // No valid session, redirect to login
      window.location.href = '/login?next=/dashboard';
    }

    checkAuth();
  }, []);

  const processPendingActions = async () => {
    let actionsProcessed = false;

    // Process Pending Claim (from SingleListingsContent business detail page)
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

    // Process Pending Claim (from GridBlock listing cards — stores only business ID)
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
        // Map fields to match action expectation
        const result = await submitPendingRequestAction({
          ...pendingRemoval,
          type: 'removal',
          remarks: pendingRemoval.reason // Map reason to remarks for database
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

  const loadData = async (userId) => {
    try {
      const actionsProcessed = await processPendingActions();
      
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

  const fetchBusinesses = async (userId) => {
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
      setClaims(data.data?.filter(c => c.status !== 'approved') || []);
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
        <NavbarTwo />
        <div className="pt-100 pb-100 text-center">
          <div className="container">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3">Loading...⏳</p>
          </div>
        </div>
      </>
    );
  }

  // Find business IDs with pending claims (edits waiting for approval)
  const pendingBusinessIds = new Set(
    claims.filter(c => c.status === 'pending' && c.business_id).map(c => c.business_id)
  );

  // Filter approved businesses to exclude those with pending edits
  const filteredBusinesses = businesses.filter(b => !pendingBusinessIds.has(b.id));

  // Combine items into a unified list
  const allItems = [
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

  return (
    <>
      <NavbarTwo />
      <section className="dashboard-area ptb-100 bg-f9f9f9">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DashboardSidebar user={user} />
            </div>
            <div className="col-lg-9">
              <div className="dashboard-content bg-transparent p-0">
                <div className="mb-4">
                    <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>My Businesses</h2>
                    <p className="text-muted">Manage your claimed and added businesses</p>
                </div>
                
                <div className="row g-4">
                  {allItems.length > 0 ? allItems.map((item, idx) => {
                    const isVideoHomes = item._claim?.source === 'videohomes' || item._claim?.siteurl?.includes('videohomes');
                    return (
                    <div key={`${item.type}-${item.id}-${idx}`} className="col-md-6">
                      <div className="card h-100 border-0 shadow-sm rounded-4 bg-white position-relative overflow-hidden">
                        {/* Video Thumbnail */}
                        {item._video?.thumbnail ? (
                          <div className="position-relative" style={{ height: '160px', background: '#000' }}>
                            <img
                              src={item._video.thumbnail}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                            />
                            <div className="position-absolute bottom-0 start-0 m-2">
                              <span className={`badge rounded-pill px-2 py-1 fw-semibold ${item._video.is_video_approved ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.68rem' }}>
                                <i className="bx bx-video me-1"></i>{item._video.is_video_approved ? 'Video Live' : 'Video Under Review'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '160px' }}>
                            <div className="text-center text-muted">
                              <i className="bx bx-video-off" style={{ fontSize: '2rem' }}></i>
                              <p className="small mb-0 mt-1">No video uploaded</p>
                            </div>
                          </div>
                        )}

                        <div className="p-4">
                        {/* Header with Title and Badge */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h4 className="fw-bold text-dark m-0 pe-4" style={{ fontSize: '1.2rem', lineHeight: '1.4' }}>
                            {item.title}
                          </h4>
                          <span className={`badge rounded-pill px-3 py-2 fw-semibold ${
                            item.source === 'claim' ? 'bg-success text-white' : 
                            isVideoHomes ? 'bg-info text-white' :
                            'bg-primary text-white'
                          }`} style={{ fontSize: '0.75rem', minWidth: '80px' }}>
                            {item.source === 'claim' ? 'Claimed by You' : 
                             isVideoHomes ? 'VideoHomes' : 'Added by You'}
                          </span>
                        </div>

                        <p className="text-muted small mb-4">
                          {item.location}
                          <br />
                          {isVideoHomes && (
                            <span className="mt-1 d-inline-block badge rounded-pill fw-semibold bg-info-subtle text-info border border-info" style={{ fontSize: '0.70rem', background: 'transparent' }}>
                              VideoHomes Platform
                            </span>
                          )}
                          <span className={`mt-1 d-inline-block badge rounded-pill fw-semibold ${
                            item.status === 'approved' ? 'text-success border border-success' : 
                            item.status === 'rejected' ? 'text-danger border border-danger' : 
                            'text-info border border-info'
                          }`} style={{ fontSize: '0.70rem', background: 'transparent' }}>
                            Status: {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending Edit'}
                          </span>
                        </p>

                        {/* Actions Footer */}
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <div className="d-flex gap-2">
                            <Link 
                                href={
                                    item.type === 'business' ? `/dashboard/edit-business/${item.id}` :
                                    item.type === 'claim' ? `/dashboard/edit-business/${item.businessId}` :
                                    `/dashboard/edit-submission/${item.id}`
                                } 
                                className="btn btn-outline-dark px-4 py-2 fw-medium rounded-2 border-2 hover-bg-dark"
                                style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}
                            >
                                Edit Business
                            </Link>
                            
                            {item.status === 'approved' && (user?.role === 'videographer' || user?.roles?.includes('media-pro')) && (
                                <button
                                    className="btn btn-outline-primary px-3 py-2 fw-medium rounded-2 border-2"
                                    style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}
                                    onClick={() => {
                                        const biz = businesses.find(b => String(b.id) === String(item.id));
                                        if (biz) {
                                            setSelectedBusiness(biz);
                                            setUploadModalOpen(true);
                                        }
                                    }}
                                >
                                    <i className="bx bx-video me-1"></i>
                                    Upload Video
                                </button>
                            )}
                          </div>

                          {item.status === 'approved' ? (
                            <Link 
                                href={item.slug ? `/s/${item.slug}` : '#'} 
                                className="text-decoration-underline text-dark fw-medium small"
                                target="_blank"
                            >
                                View Listing
                            </Link>
                          ) : (
                            <span className="text-muted small italic">
                                {item.status === 'pending' ? 'Awaiting Review' : 'Rejected'}
                            </span>
                          )}
                        </div>
                        </div>{/* end p-4 */}
                      </div>
                    </div>
                    );
                  }) : (
                    <div className="col-12">
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                            <i className='bx bx-store-alt text-muted' style={{ fontSize: '3rem' }}></i>
                            <p className="mt-2 text-muted text-lg">No businesses found.</p>
                            <Link href="/dashboard/add-business" className="default-btn mt-3">Add Your First Business</Link>
                        </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 mb-4 border-top pt-4">
                    <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>My Requests</h2>
                    <p className="text-muted">Track your Information and Removal requests</p>
                </div>
                
                <div className="row g-4">
                  {requests && requests.length > 0 ? requests.map((req, idx) => (
                    <div key={`req-${req.id}-${idx}`} className="col-md-6">
                      <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white position-relative overflow-hidden">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h4 className="fw-bold text-dark m-0 pe-4" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>
                            {req.type === 'removal' ? 'Removal Request' : req.type === 'report' ? 'Report Request' : 'Information Update'}
                          </h4>
                          <span className={`badge rounded-pill px-3 py-1 fw-semibold ${
                            req.status === 'approved' ? 'bg-success text-white' : 
                            req.status === 'rejected' ? 'bg-danger text-white' : 
                            'bg-warning text-dark'
                          }`} style={{ fontSize: '0.70rem' }}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-muted small mb-2">
                          <strong>Business:</strong> {req.business?.title || `Business ID: ${req.business_id}`}
                        </p>
                        
                        <p className="text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          <strong>Remarks:</strong> {req.remarks || 'No remarks provided.'}
                        </p>

                        <div className="mt-auto pt-3 border-top">
                          <span className="text-muted small">
                            <i className="bx bx-calendar me-1"></i>
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-12">
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
                            <i className='bx bx-message-square-detail text-muted' style={{ fontSize: '3rem' }}></i>
                            <p className="mt-2 text-muted text-lg">No pending or past requests found.</p>
                        </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

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
            // Refresh the list
            window.location.reload();
        }}
      />

      <style jsx>{`
        .hover-bg-dark:hover {
            background-color: #000 !important;
            color: #fff !important;
        }
        .rounded-4 {
            border-radius: 1rem !important;
        }
        .bg-f9f9f9 {
            background-color: #f9f9f9 !important;
        }
        .bg-info-subtle {
            background-color: #e0f7fa !important;
            color: #00838f !important;
        }
      `}</style>
    </>
  );
}
