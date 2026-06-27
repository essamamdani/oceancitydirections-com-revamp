import React from 'react';
import {
  Html,
} from '@react-email/components';

export const BusinessAddedEmail = ({ businessData, userEmail, siteUrl, siteName }) => {
  const domain = siteUrl ? siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '') : null;
  const finalSiteName = domain || (siteName ? siteName.replace(/\s+/g, '') : 'RealtyDirections.com');
  return (
  <Html>
    <div className="container" style={{ maxWidth: 600, margin: '0 auto', padding: 20, border: '1px solid #ddd', borderRadius: 5, fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
      <div className="header" style={{ backgroundColor: '#f8f9fa', padding: 10, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <h2>New Business Added to {finalSiteName}</h2>
      </div>
      <div className="content" style={{ padding: 20 }}>
        <p>Hello Admin,</p>
        <p>A new business has been added and is awaiting approval.</p>
        <div style={{ backgroundColor: '#fff', padding: 15, border: '1px solid #eee', borderRadius: 4, marginTop: 10 }}>
          <p><strong>Business Title:</strong> {businessData.title}</p>
          <p><strong>Category:</strong> {businessData.category}</p>
          <p><strong>Phone:</strong> {businessData.phone}</p>
          <p><strong>Email:</strong> {businessData.email}</p>
          <p><strong>Website:</strong> {businessData.website}</p>
          <p><strong>Address:</strong> {businessData.address}</p>
          <p><strong>City:</strong> {businessData.city}</p>
          <p><strong>State:</strong> {businessData.state}</p>
          <p><strong>Zip:</strong> {businessData.zip}</p>
        </div>
        <p style={{ marginTop: 20 }}><strong>Added By:</strong> {userEmail}</p>
        <p>Please log in to the admin dashboard to review and approve this submission.</p>
      </div>
      <div className="footer" style={{ marginTop: 20, fontSize: 12, color: '#777', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} {finalSiteName}. All rights reserved.</p>
      </div>
    </div>
  </Html>
)};

export default BusinessAddedEmail;
