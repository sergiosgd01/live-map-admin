import React from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import Location from "./Location";
import SharedMap from "../../../components/SharedMap";

const LocationPage = () => {
  const { eventCode } = useParams();

  return (
    <LocalHeaderLayout title="Ubicaciones">
      <SharedMap>
        <Location eventCode={eventCode} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default LocationPage;
