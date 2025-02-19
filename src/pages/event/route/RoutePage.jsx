import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import SharedMap from "../../../components/SharedMap";
import Route from "./Route";
import Spinner from "../../../components/Spinner"; 
import { fetchEventByCode } from "../../../services/eventService";

const RoutePage = () => {
  const { eventCode } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const fetchedEvent = await fetchEventByCode(eventCode);
        if (!fetchedEvent) {
          setError(`No se encontró el evento con el código: ${eventCode}`);
        } else {
          setEventData(fetchedEvent);
        }
      } catch (err) {
        setError(err.message || "Error al cargar el evento");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventCode]);

  // Construimos los breadcrumbs
  const organizationCode = eventData?.organizationCode || "";
  const breadcrumbs = [
    { label: "Organizaciones", path: "/organizations" },
    { label: "Eventos", path: `/organizations/${organizationCode}/events` },
    { label: "Rutas", path: "" },
  ];

  // Mientras está cargando, mostramos el Spinner a pantalla completa
  if (loading) {
    return <Spinner />;
  }

  // Si hubo algún error, mostramos un mensaje
  if (error) {
    return (
      <LocalHeaderLayout breadcrumbs={[]}>
        <div className="p-3 text-danger">
          <h5>Hubo un problema al cargar el evento:</h5>
          <p>{error}</p>
        </div>
      </LocalHeaderLayout>
    );
  }

  return (
    <LocalHeaderLayout breadcrumbs={breadcrumbs}>
      <SharedMap>
        <Route eventCode={eventCode} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default RoutePage;


