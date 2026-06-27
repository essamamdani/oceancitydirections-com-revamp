"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/Auth/LoginModal";
import { getClientUser, subscribeAuth } from "@/utils/auth/session";

const AddBusinessButton = ({ className = "default-btn" }) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
        const { user } = await getClientUser();
        setUser(user);
    };
    init();
    const subscription = subscribeAuth((_event, session) => {
        setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    if (user) {
        router.push('/dashboard/add-business');
    } else {
        setShowLoginModal(true);
    }
  };

  return (
    <>
      <a href="#" onClick={handleClick} className={className}>
        <i className="flaticon-more"></i> Add Business
      </a>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={() => {
            setShowLoginModal(false);
            router.push('/dashboard/add-business');
        }} 
      />
    </>
  );
};

export default AddBusinessButton;
