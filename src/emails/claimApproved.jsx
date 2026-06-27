import React from 'react'
import { Html } from '@react-email/components'

export const ClaimApprovedEmail = ({ businessName, businessId, userEmail, siteUrl, siteName }) => {
  const domain = siteUrl ? siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '') : null;
  const finalSiteName = domain || (siteName ? siteName.replace(/\s+/g, '') : 'RealtyDirections.com');
  return (
  <Html>
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, border: '1px solid #ddd', borderRadius: 5, fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: 10, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <h2>Claim Approved on {finalSiteName}</h2>
      </div>
      <div style={{ padding: 20 }}>
        <p>Hello,</p>
        <p>Your claim has been approved.</p>
        <p><strong>Business:</strong> {businessName}</p>
        <p><strong>ID:</strong> {businessId}</p>
        <p>You can now manage your listing.</p>
        <p>
          <a href={`${siteUrl}/dashboard`} style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: 5 }}>
            Go to Dashboard
          </a>
        </p>
      </div>
      <div style={{ marginTop: 20, fontSize: 12, color: '#777', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} {finalSiteName}</p>
      </div>
    </div>
  </Html>
)}

export default ClaimApprovedEmail

