"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const ErrorContent = () => {
  return (
    <>
      <section className="error-area bg-f9f9f9 ptb-100 d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
        <div className="container">
          <div className="error-content">
            <Image
              src="/images/error.png"
              alt="image"
              width={500}
              height={198}
              loading="eager"
            />
            <h3>Error 404 : Page Not Found</h3>
            <p>
              The page you are looking for might have been removed had its name
              changed or is temporarily unavailable.
            </p>
            <Link href="/" className="default-btn">
              Back to Homepage
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ErrorContent;
