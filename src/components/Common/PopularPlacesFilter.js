"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const PopularPlacesFilter = () => {
  const searchParams = useSearchParams();
  const [submitUrl, setSubmitUrl] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isRealty, setIsRealty] = useState(false);

  useEffect(() => {
    const isRealtyPage = window.location.href.includes('realty');
    setIsRealty(isRealtyPage);
    setSubmitUrl(isRealtyPage ? '/realty' : '/business');
    setInputValue(searchParams.get('q') || searchParams.get('ask') || '');
  }, [searchParams]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update state as user types
  };

  return (
    <>
      <form action={submitUrl} method="get">
        <div className='row m-0 align-items-center'>
          <div className='col-lg-10 col-md-24 p-0'>
            <div className='form-group position-relative'>
              <label>
                <i className='flaticon-search'></i>
              </label>

              <input
                type="text"
                className="form-control pe-5"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={
                  submitUrl === "/realty" ? "Find your dream home... (AI Powered)" : "Find a restaurant, hotel, or business..."
                }
                name={isRealty ? "ask" : "q"}
              />
              {/* AI Powered Badge */}
              {isRealty && (
                <span 
                  className="position-absolute"
                  style={{
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '10px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    zIndex: 10
                  }}
                >
                  ✨ AI Powered
                </span>
              )}
            </div>
          </div>

          <div className='col-lg-2 col-md-12 p-0'>
            <div className='submit-btn'>
              <button type='submit'>Search Now</button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default PopularPlacesFilter;