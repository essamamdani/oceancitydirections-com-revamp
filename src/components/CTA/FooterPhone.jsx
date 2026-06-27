import { useEffect, useState } from "react";

export default function FloatingCTA() {
  const [show, setShow] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ctaClosed') !== 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined' && window.scrollY > 200 && localStorage.getItem('ctaClosed') !== 'true') {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleClose = () => {
    setShow(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ctaClosed', 'true');
    }
  };
  return (
    <div
      className={`position-fixed bg-white shadow-lg border border-secondary p-4 rounded-lg transition-opacity ${show ? "opacity-100" : "opacity-0"}`}
      style={{
        bottom: "10px",
        right: "10px",
        width: "25rem",
        zIndex: 999
      }}
    >
      <button
        onClick={handleClose}
        className="position-absolute top-0 end-0 m-2 text-secondary border-0 bg-transparent fs-4"
      >
        &times;
      </button>
      <h3 className="text-center">Do you have questions?</h3>
      <p className="text-center text-muted">Call or text today, we are here to help!</p>
      <div className="d-flex justify-content-center align-items-center mt-3">
        <span className="text-primary fs-4">📞</span>
        <a href="tel:+12405171653" className="fs-5 fw-bold ms-2" style={{
          color: "var(--mainColor)"
        }}>
          240-517-1653
        </a>
      </div>
    
    </div>
  );
}