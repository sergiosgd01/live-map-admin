// src/pages/LocationPage.jsx
import React from "react";
import { useParams } from "react-router-dom";

import Layout from "../../../components/Layout";
import SharedMap from "../../../components/SharedMap";
import Location from "./Location";

const LocationPage = () => {
  const { eventCode } = useParams();

  // Altura de tu header local
  const LOCAL_HEADER_HEIGHT = 60;

  // Estilos para el header local
  const localHeaderStyle = {
    height: `${LOCAL_HEADER_HEIGHT}px`,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    paddingLeft: "1rem" // ejemplo de padding
  };

  // Estilos para el contenedor donde va el mapa
  // Restamos 60px global + 60px local => 120px total
  const mapWrapperStyle = {
    width: "100%",
    height: `calc(100vh - 60px - ${LOCAL_HEADER_HEIGHT}px)`, 
    // sin scroll
    overflow: "hidden"
  };

  return (
    <div className="page-wrapper fullscreen">
      <Layout>
        {/* Header local */}
        <div style={localHeaderStyle}>
          <div className="page-icon pe-3">
            <i className="bi bi-stickies"></i>
          </div>
          <div className="page-title d-none d-md-block">
            <h5>Edición de Ubicaciones</h5>
          </div>
        </div>

        <div style={mapWrapperStyle}>
          <SharedMap>
            <Location eventCode={eventCode} />
          </SharedMap>
        </div>
      </Layout>
    </div>
  );
};

export default LocationPage;
