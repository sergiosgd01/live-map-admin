import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import SharedMap from "../../../components/SharedMap";
import EditRoute from "./EditRoute";
import Spinner from "../../../components/Spinner";
import { fetchEventByCode } from "../../../services/eventService";

const EditRoutePage = () => {
  const { eventCode, deviceID } = useParams();
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

  // Construcción de los breadcrumbs basados en la data del evento
  const organizationCode = eventData?.organizationCode || "";
  const breadcrumbs = [
    { label: "Organizaciones", path: "/organizations" },
    { label: "Eventos", path: `/organizations/${organizationCode}/events` },
    { label: "Rutas", path: `/events/${eventCode}/route` },
    { label: "Editar Ruta", path: "" },
  ];

  // Mientras está cargando, mostramos el Spinner
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
        <EditRoute eventCode={eventCode} deviceID={deviceID} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default EditRoutePage;