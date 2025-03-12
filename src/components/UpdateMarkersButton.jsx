import React from "react";
import colors from "../utils/colors";

function UpdateMarkersButton({ fetchData }) {
  
  return (
    <button
      onClick={fetchData}
      className="update-button"
      style={{
        backgroundColor: colors.purple,
        color: colors.white,
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
      <i 
        className="bi bi-arrow-clockwise" 
        style={{ 
          marginRight: "8px",
          fontSize: "16px"
        }}
      ></i>
      Actualizar marcadores
    </button>
  );
}

export default UpdateMarkersButton;