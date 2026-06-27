import React from 'react';
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';


export const ClaimedBusinessEmail = ({ businessName, businessId, userEmail, siteUrl, siteName }) => {
  const domain = siteUrl ? siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '') : null;
  const finalSiteName = domain || (siteName ? siteName.replace(/\s+/g, '') : 'RealtyDirections.com');
  return (
  <Html>
    <div className="container" style={{ maxWidth: 600, margin: '0 auto', padding: 20, border: '1px solid #ddd', borderRadius: 5, fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
      <div className="header" style={{ backgroundColor: '#f8f9fa', padding: 10, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <h2>Business Claimed from {finalSiteName}</h2>
      </div>
      <div className="content" style={{ padding: 20 }}>
        <p>Hello Admin,</p>
        <p>A new business claim has been submitted.</p>
        <p><strong>Business Name:</strong> {businessName}</p>
        <p><strong>Business ID:</strong> {businessId}</p>
        <p><strong>Claimed By:</strong> {userEmail}</p>
      </div>
      <div className="footer" style={{ marginTop: 20, fontSize: 12, color: '#777', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} {finalSiteName}. All rights reserved.</p>
      </div>
    </div>
  </Html>
)};

export default ClaimedBusinessEmail;
