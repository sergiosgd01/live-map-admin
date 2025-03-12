import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import EditLocation from "./EditLocation";
import SharedMap from "../../../components/SharedMap";
import Spinner from "../../../components/Spinner";
import { fetchEventByCode } from "../../../services/eventService";

const EditLocationPage = () => {
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
  const isMultiDevice = !!eventData?.multiDevice;
  
  // Construimos los breadcrumbs según si es multiDevice o no
  const breadcrumbs = [
    { label: "Organizaciones", path: "/organizations" },
    { label: "Eventos", path: `/organizations/${organizationCode}/events` },
  ];
  
  // Si es multiDevice, incluimos el paso "Ubicaciones" en el breadcrumb
  if (isMultiDevice) {
    breadcrumbs.push(
      { label: "Ubicaciones", path: `/events/${eventCode}/location` }
    );
    breadcrumbs.push(
      { label: "Editar Ubicación", path: "" }
    );
  } else {
    // Si no es multiDevice, vamos directo a "Editar Ubicación" sin mostrar "Ubicaciones"
    breadcrumbs.push(
      { label: "Editar Ubicación", path: "" }
    );
  }

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

  // Renderizamos la vista normal si no hay errores
  return (
    <LocalHeaderLayout breadcrumbs={breadcrumbs}>
      <SharedMap>
        <EditLocation eventCode={eventCode} deviceID={deviceID} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default EditLocationPage;