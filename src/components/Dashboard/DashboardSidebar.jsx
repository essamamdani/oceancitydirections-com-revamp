"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const DashboardSidebar = ({ user: userProp }) => {
  const pathname = usePathname();
  const { user: authUser, signOut } = useAuth();
  const user = userProp || authUser;

  const isActive = (path) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const menuItems = [
    { href: '/dashboard', icon: 'bx-layer', label: 'My Businesses' },
    { href: '/dashboard/add-business', icon: 'bx-plus-circle', label: 'Add Business' },
    { href: '/dashboard/profile', icon: 'bx-user-circle', label: 'Edit Profile' },
  ];

  return (
    <div className="dashboard-sidebar">
      {user && (
        <div className="sidebar-user mb-4 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="user-avatar" style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--mainColor)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
            }}>
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || 'My Account'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email || ''}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-menu">
        <ul>
          {menuItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href) ? 'active' : ''}
              >
                <i className={`bx ${item.icon}`}></i> {item.label}
              </Link>
            </li>
          ))}
          <li style={{ marginTop: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
            <button
              onClick={signOut}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                color: '#dc3545', fontSize: 16, fontWeight: 600,
                padding: '12px 20px', borderRadius: 5,
                border: '1px solid #f8d7da', background: 'transparent',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#dc3545'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc3545'; }}
            >
              <i className="bx bx-log-out" style={{ marginRight: 10, fontSize: 18, position: 'relative', top: 2 }}></i> Sign Out
            </button>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .dashboard-sidebar {
          background: #fff;
          box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.05);
          padding: 30px;
          border-radius: 5px;
          height: 100%;
        }
        .dashboard-menu ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        .dashboard-menu ul li {
          margin-bottom: 10px;
        }
        .dashboard-menu ul li:last-child {
          margin-bottom: 0;
        }
        .dashboard-menu ul li a {
          display: block;
          color: #212529;
          font-size: 16px;
          font-weight: 600;
          padding: 12px 20px;
          border-radius: 5px;
          transition: all 0.3s ease-in-out;
          border: 1px solid #eeeeee;
          text-decoration: none;
        }
        .dashboard-menu ul li a i {
          margin-right: 10px;
          font-size: 18px;
          position: relative;
          top: 2px;
        }
        .dashboard-menu ul li a:hover,
        .dashboard-menu ul li a.active {
          background-color: var(--mainColor);
          color: #fff;
          border-color: var(--mainColor);
        }
      `}</style>
    </div>
  );
};

export default DashboardSidebar;
