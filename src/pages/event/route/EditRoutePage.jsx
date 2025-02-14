import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Layout from "../../../components/Layout";
import SharedMap from "../../../components/SharedMap";
import EditRoute from "./EditRoute";
import { fetchEventByCode } from "../../../services/eventService";

const EditRoutePage = () => {
  const { eventCode, deviceID } = useParams();
  const [eventDetails, setEventDetails] = useState(null);

  // Se obtiene la información del evento (incluyendo el nombre de la organización y del evento)
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetchEventByCode(eventCode);
        setEventDetails(data);
      } catch (error) {
        console.error("Error al obtener los detalles del evento:", error);
      }
    };
    fetchDetails();
  }, [eventCode]);

  // Altura del header global y del header local
  const GLOBAL_HEADER_HEIGHT = 60;
  const LOCAL_HEADER_HEIGHT = 60;

  // Estilos para el header local (Breadcrumbs)
  const localHeaderStyle = {
    height: `${LOCAL_HEADER_HEIGHT}px`,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    paddingLeft: "1rem",
    paddingRight: "1rem"
  };

  // Estilos para el contenedor del mapa (ocupa el resto de la pantalla)
  const mapWrapperStyle = {
    width: "100%",
    height: `calc(100vh - ${GLOBAL_HEADER_HEIGHT}px - ${LOCAL_HEADER_HEIGHT}px)`,
    overflow: "hidden"
  };

  return (
    <div className="page-wrapper fullscreen">
      <Layout>
        {/* Header local: Breadcrumbs */}
        <div style={localHeaderStyle}>
          <nav aria-label="breadcrumb" style={{ width: "100%" }}>
            <ol
              className="breadcrumb mb-0"
              style={{
                backgroundColor: "transparent",
                padding: 0,
                margin: 0
              }}
            >
              <li className="breadcrumb-item">
                <Link
                  to="/organizaciones"
                  style={{ textDecoration: "none", color: "#007bff" }}
                >
                  {eventDetails && eventDetails.organizationName
                    ? eventDetails.organizationName
                    : "Organizaciones"}
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link
                  to="/eventos"
                  style={{ textDecoration: "none", color: "#007bff" }}
                >
                  {eventDetails && eventDetails.name
                    ? eventDetails.name
                    : "Eventos"}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Editar Rutas
              </li>
            </ol>
          </nav>
        </div>

        {/* Contenedor para el mapa */}
        <div style={mapWrapperStyle}>
          <SharedMap>
            {/* El componente EditLocation se coloca sobre el mapa */}
            <EditRoute eventCode={eventCode} deviceID={deviceID} />
          </SharedMap>
        </div>
      </Layout>
    </div>
  );
};

export default EditRoutePage;

