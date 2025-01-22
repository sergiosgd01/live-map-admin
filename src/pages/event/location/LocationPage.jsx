import React from "react";
import SharedMap from "../../../components/SharedMap";
import Location from "./Location";
import { useParams } from "react-router-dom";

const LocationPage = () => {
  const { eventCode } = useParams();

  return (
    <SharedMap>
      <Location eventCode={eventCode} />
    </SharedMap>
  );
};

export default LocationPage;
