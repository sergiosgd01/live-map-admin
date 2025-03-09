import React from "react";

function UpdateMarkersButton({ fetchData }) {
  return (
    <button
      onClick={fetchData}
      className="update-button"
      style={{
        backgroundColor: "#007BFF",
        color: "#ffffff",
        border: "none",
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
      🔄 Actualizar marcadores
    </button>
  );
}

export default UpdateMarkersButton;