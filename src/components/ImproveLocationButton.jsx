import React from "react";

function ImproveLocationButton({ improveLocation, setImproveLocation }) {
  return (
    <button
      onClick={() => setImproveLocation(!improveLocation)}
      className="improve-button"
      style={{
        backgroundColor: improveLocation ? "#4CAF50" : "#ffffff",
        color: improveLocation ? "#ffffff" : "#333333",
        border: "1px solid #cccccc",
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        fontWeight: "500",
        fontSize: "14px",
      }}
    >
      {improveLocation ? "✓ Mejorar ubicación" : "Mejorar ubicación"}
    </button>
  );
}

export default ImproveLocationButton;