"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className = "" }) => {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <>
        <li className="custom-nav-item">
          <Link href="/dashboard" className={`custom-nav-link ${className}`}>
            Dashboard
          </Link>
        </li>
        <li className="custom-nav-item">
          <button 
            onClick={signOut} 
            className={`custom-nav-link ${className}`} 
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none' }}
          >
            Logout
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      <li className="custom-nav-item">
        <Link href="/login" className={`custom-nav-link ${className}`}>
          Login
        </Link>
      </li>
      <li className="custom-nav-item">
        <Link href="/signup" className={`custom-nav-link ${className}`}>
          Sign Up
        </Link>
      </li>
    </>
  );
};

export default UserMenu;
