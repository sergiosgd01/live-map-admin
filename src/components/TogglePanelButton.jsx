// src/components/TogglePanelButton.jsx
import React from 'react';

const TogglePanelButton = ({ showPanel, togglePanel }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '10px',
        bottom: '10px',
        zIndex: 9999,
      }}
    >
      <button
        className="btn btn-primary btn-sm"
        onClick={togglePanel}
      >
        {showPanel ? "Ocultar Dispositivos" : "Ver Dispositivos"}
      </button>
    </div>
  );
};

export default TogglePanelButton;
