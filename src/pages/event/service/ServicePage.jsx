import React from "react";
import SharedMap from "../../../components/SharedMap";
import Service from "./Service";
import { useParams } from "react-router-dom";

const ServicePage = () => {
  const { eventCode } = useParams();

  return (
    <SharedMap>
      <Service eventCode={eventCode} />
    </SharedMap>
  );
};

export default ServicePage;
