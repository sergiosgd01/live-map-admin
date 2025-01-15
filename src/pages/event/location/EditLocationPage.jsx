import React from "react";
import SharedMap from "../../../components/SharedMap";
import EditLocation from "./EditLocation";
import { useParams } from "react-router-dom";

const EditLocationPage = () => {
  const { eventCode } = useParams();

  return (
    <SharedMap>
      <EditLocation eventCode={eventCode} />
    </SharedMap>
  );
};

export default EditLocationPage;
