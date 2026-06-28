"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItem {
  href: string;
  icon: string;
  label: string;
}

interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

const DashboardSidebar = ({ user: userProp }: { user?: any }) => {
  const pathname = usePathname();
  const { user: authUser, signOut } = useAuth();
  const user = userProp || authUser;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href) && href !== '/';
  };

  const groups: SidebarGroup[] = [
    {
      items: [
        { href: '/', icon: 'bx-home-alt', label: 'Home' }
      ]
    },
    {
      title: 'Produce',
      items: [
        { href: '/dashboard/videos', icon: 'bx-video', label: 'My Videos' },
        { href: '/dashboard/new-video', icon: 'bx-plus-circle', label: 'New Video' },
        { href: '/dashboard/media-library', icon: 'bx-folder', label: 'Media Library' },
        { href: '/dashboard/drafts', icon: 'bx-edit', label: 'Drafts' }
      ]
    },
    {
      title: 'Distribute',
      items: [
        { href: '/dashboard', icon: 'bx-store-alt', label: 'My Businesses' },
        { href: '/dashboard/add-business', icon: 'bx-plus', label: 'Add Business' },
        { href: '/dashboard/requests', icon: 'bx-message-square-detail', label: 'My Requests' }
      ]
    },
    {
      title: 'Account',
      items: [
        { href: '/dashboard/profile', icon: 'bx-user', label: 'Profile' },
        { href: '/dashboard/messages', icon: 'bx-message', label: 'Messages' },
        { href: '/dashboard/settings', icon: 'bx-cog', label: 'Settings' }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-6 font-sans" aria-label="Dashboard navigation">
      <div className="space-y-6">
        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-md shrink-0 shadow-sm border border-orange-500">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs truncate">
                {user.name || 'John Doe'}
              </div>
              <div className="text-slate-400 text-[10px] truncate">
                {user.email || '@username'}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Nav Groups */}
        <nav className="space-y-4">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.title && (
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-4 mb-2 mt-4">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      href={item.href}
                      key={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                        active
                          ? 'bg-orange-50 text-orange-700 font-bold shadow-xs'
                          : 'text-slate-650 hover:text-orange-700 hover:bg-slate-50'
                      }`}
                    >
                      <i className={`bx ${item.icon} text-lg`}></i>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-red-100 hover:border-red-650 hover:bg-red-650 hover:text-white text-red-650 font-bold text-xs cursor-pointer transition duration-200 justify-center"
        >
          <i className="bx bx-log-out text-lg"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
