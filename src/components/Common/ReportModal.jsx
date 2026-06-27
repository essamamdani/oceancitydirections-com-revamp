'use client';
import React, { useState } from 'react';
import { validateEmail } from '@/lib/validation';
import toast from 'react-hot-toast';
import Turnstile from './Turnstile';
import { useSites } from '@/contexts/SitesContext';

const ReportModal = ({ isOpen, onClose, businessId, businessTitle }) => {
  const { site } = useSites();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [cfToken, setCfToken] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!cfToken) {
      toast.error("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/report-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessId,
          businessTitle,
          cf_token: cfToken
        }),
      });

      if (response.ok) {
        toast.success('Report submitted successfully');
        onClose();
        setFormData({ name: '', email: '', message: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Report Business: {businessTitle}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows="4"
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <Turnstile onVerify={setCfToken} siteKey={site?.turnstile_site_key} />

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
