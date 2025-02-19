import React from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";

const LocalHeaderLayout = ({ breadcrumbs = [], children }) => {
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
          className="main-header d-flex align-items-center justify-content-between position-relative border-top"
          style={{ height: `${LOCAL_HEADER_HEIGHT}px` }}
        >
          <div className="d-flex align-items-center justify-content-center">
            <div className="page-icon pe-3">
              <i className="bi bi-stickies"></i>
            </div>
            <div className="page-title d-none d-md-block">
             {/* Derecha: cadena completa de breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <li
                        key={index}
                        className={`breadcrumb-item${isLast ? " active" : ""}`}
                        aria-current={isLast ? "page" : undefined}
                      >
                        {isLast ? (
                          // Último ítem: estilo "normal"
                          <div className="page-title d-none d-md-block">
                            <h5 style={{ margin: 0, color: "#333" }}>
                              {crumb.label}
                            </h5>
                          </div>
                        ) : (
                          // Ítems intermedios: gris + hover controlado por <style> arriba
                          <Link to={crumb.path}>
                            <div className="page-title d-none d-md-block">
                              <h5
                                style={{
                                  margin: 0,
                                  color: "#888",
                                }}
                              >
                                {crumb.label}
                              </h5>
                            </div>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            )}
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
