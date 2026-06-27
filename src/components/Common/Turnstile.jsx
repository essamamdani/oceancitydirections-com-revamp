'use client';
import React, { useEffect, useRef } from 'react';

const Turnstile = ({ onVerify, siteKey: customSiteKey }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    // Priority: 1. Passed prop (from DB) 2. Test Key (v2 fallback)
    const siteKey = customSiteKey || '1x00000000000000000000AA';

    const loadTurnstile = () => {
      if (window.turnstile) {
        if (containerRef.current && !widgetIdRef.current) {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              if (onVerify) onVerify(token);
            },
          });
        }
      }
    };

    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = loadTurnstile;
      document.head.appendChild(script);
    } else {
      loadTurnstile();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        // Optional: window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onVerify]);

  return <div ref={containerRef} className="cf-turnstile mt-3 mb-3"></div>;
};

export default Turnstile;
