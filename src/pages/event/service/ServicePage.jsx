import React from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import SharedMap from "../../../components/SharedMap";
import Service from "./Service";

const ServicePage = () => {
  const { eventCode } = useParams();

  return (
    <LocalHeaderLayout title="Edición Servicios">
      <SharedMap>
        <Service eventCode={eventCode} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default ServicePage;