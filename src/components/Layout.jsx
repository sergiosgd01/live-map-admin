import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  const HEADER_HEIGHT = 60;

  // Contenedor general ocupando el 100% de la pantalla
  const layoutStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column"
  };

  // Header fijo en la parte superior
  const headerStyle = {
    height: `${HEADER_HEIGHT}px`,
    flexShrink: 0,
    backgroundColor: "#fff",
  };

  // Aquí no fijamos la altura, dejamos que cada hijo decida (SharedMap, etc.)
  const mainStyle = {
    flex: 1,
    // SUGERENCIA: si no quieres scroll, pon overflow: "hidden"
    overflow: "hidden" 
  };

  return (
    <div style={layoutStyle}>
      <div style={headerStyle}>
        <Header />
      </div>
      <div style={mainStyle}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
