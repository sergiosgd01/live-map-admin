import React from "react";
import colors from "../utils/colors";

function ImproveLocationButton({ improveLocation, setImproveLocation }) {
  
  return (
    <button
      onClick={() => setImproveLocation(!improveLocation)}
      className="improve-button"
      style={{
        backgroundColor: improveLocation ? colors.purple : colors.white,
        color: improveLocation ? colors.white : colors.purple,
        border: `1px solid ${colors.purple}`,
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        fontWeight: "500",
        fontSize: "14px",
        transition: "background-color 0.2s, color 0.2s"
      }}
    >
      {improveLocation ? (
        <>
          <i className="bi bi-check-circle me-2"></i>
          Mejorar ubicación
        </>
      ) : (
        <>
          <i className="bi bi-geo-alt me-2"></i>
          Mejorar ubicación
        </>
      )}
    </button>
  );
}

export default ImproveLocationButton;