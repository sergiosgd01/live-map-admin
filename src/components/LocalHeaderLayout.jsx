import React from "react";
import Layout from "./Layout";

const LocalHeaderLayout = ({ title, children }) => {
  const GLOBAL_HEADER_HEIGHT = 60;
  const LOCAL_HEADER_HEIGHT = 60;

  const contentStyle = {
    width: "100%",
    height: `calc(100vh - ${GLOBAL_HEADER_HEIGHT}px - ${LOCAL_HEADER_HEIGHT}px)`,
    overflow: "hidden"
  };

  return (
    <div className="page-wrapper fullscreen">
      <Layout>
        {/* Header con ícono y título */}
        <div
          className="main-header d-flex align-items-center justify-content-between position-relative"
          style={{ height: `${LOCAL_HEADER_HEIGHT}px` }}
        >
          <div className="d-flex align-items-center justify-content-center">
            <div className="page-icon pe-3">
              <i className="bi bi-stickies"></i>
            </div>
            <div className="page-title d-none d-md-block">
              <h5>{title}</h5>
            </div>
          </div>
        </div>

        {/* Contenedor para el contenido */}
        <div style={contentStyle}>
          {children}
        </div>
      </Layout>
    </div>
  );
};

export default LocalHeaderLayout;
