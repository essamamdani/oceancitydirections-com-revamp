"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/Auth/LoginModal";
import { getClientUser, subscribeAuth } from "@/utils/auth/session";

const AddBusinessCTA = () => {
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

  const handleAddBusiness = (e) => {
    e.preventDefault();
    if (user) {
        router.push('/dashboard/add-business');
    } else {
        setShowLoginModal(true);
    }
  };

  return (
    <div className="container my-5">
      <section className="manage-your-business-area bg-main-color">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <div className="manage-your-business-image">
                <Image
                  src="/images/woman.jpg"
                  alt="image"
                  width={795}
                  height={960}
                />
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="manage-your-business-content">
                <h2>
                Add Your Business Today!
                </h2>

                <p>
                Join thousands of businesses and grow your reach
                </p>

                <a href="#" onClick={handleAddBusiness} className="default-btn">
                  <i className="flaticon-more"></i> Add Business
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => {
        setShowLoginModal(false);
        router.push('/dashboard/add-business');
      }} />
    </div>
  );
};

export default AddBusinessCTA;
