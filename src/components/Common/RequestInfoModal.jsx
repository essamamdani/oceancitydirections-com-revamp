'use client';
import React, { useState } from 'react';
import { validateEmail } from '@/lib/validation';
import toast from 'react-hot-toast';
import { getClientUser } from '@/utils/auth/session';
import { useRouter } from 'next/navigation';
import Turnstile from './Turnstile';
import { useSites } from '@/contexts/SitesContext';

const RequestInfoModal = ({ isOpen, onClose, businessTitle, businessUrl, businessId }) => {
  const { site } = useSites();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    remarks: '',
    type: 'information'
  });
  const [loading, setLoading] = useState(false);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };
  const [cfToken, setCfToken] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.phone.replace(/\D/g, '').length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (!cfToken) {
      toast.error("Please complete the security check.");
      return;
    }

    const { user } = await getClientUser();

    setLoading(true);
    try {
      const response = await fetch('/api/request-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessTitle,
          businessUrl,
          businessId,
          cf_token: cfToken
        }),
      });

      if (response.ok) {
        toast.success('Request sent successfully');
        onClose();
        setFormData({ name: '', email: '', phone: '', remarks: '', type: 'information' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Request info error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Request Suggestions</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="alert mb-3" style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              <strong>Suggest an Edit</strong> — Use this form if you want to <em>suggest</em> a correction or update to this business listing. Our team will review your suggestion.<br />
              <span style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>
                <strong>Own this business?</strong> Use the <em>Claim Business</em> option on the listing page instead to get direct management access.
              </span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Request Type</label>
                <select 
                  className="form-select"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="information">Suggest an Edit</option>
                  <option value="removal">Removal Request</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone <span className="text-danger">*</span></label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                  placeholder="(555) 555-5555"
                  maxLength={14}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Remarks (Optional)</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder='Please provide updates or edit suggestions.'
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                ></textarea>
              </div>

              <Turnstile onVerify={setCfToken} siteKey={site?.turnstile_site_key} />

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestInfoModal;
