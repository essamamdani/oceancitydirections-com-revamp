"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ConfirmModal = ({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "420px",
          margin: "0 16px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "18px 22px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h5 style={{ margin: 0, fontSize: "17px", fontWeight: 600, color: "#1a1a2e" }}>
            {title}
          </h5>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "22px", color: "#888", lineHeight: 1, padding: "0 2px",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px 24px" }}>
          <p style={{ margin: "0 0 24px", color: "#444", fontSize: "15px", lineHeight: "1.65", whiteSpace: "pre-line" }}>
            {message}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "9px 20px", borderRadius: "8px", border: "1px solid #ddd",
                background: "#f5f5f5", color: "#555", fontSize: "14px", fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                padding: "9px 22px", borderRadius: "8px", border: "none",
                background: "#00a86b", color: "#fff", fontSize: "14px", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
