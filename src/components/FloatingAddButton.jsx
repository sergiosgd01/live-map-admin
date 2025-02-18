import React from 'react';

const FloatingAddButton = ({ onClick, style = {} }) => {
  return (
    <button
      onClick={onClick}
      className="btn btn-primary rounded-circle"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "70px",
        height: "70px",
        fontSize: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        ...style,
      }}
    >
      <i className="bi bi-plus"></i>
    </button>
  );
};

export default FloatingAddButton;
