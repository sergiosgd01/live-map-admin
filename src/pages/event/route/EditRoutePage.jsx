import React from "react";
import SharedMap from "../../../components/SharedMap";
import EditRoute from "./EditRoute";
import { useParams } from "react-router-dom";

const EditRoutePage = () => {
  const { eventCode } = useParams();

  return (
    <SharedMap>
      <EditRoute eventCode={eventCode} />
    </SharedMap>
  );
};

export default EditRoutePage;
