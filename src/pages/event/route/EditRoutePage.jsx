import React from "react";
import SharedMap from "../../../components/SharedMap";
import EditRoute from "./EditRoute";
import { useParams } from "react-router-dom";

const EditRoutePage = () => {
  const { eventCode } = useParams();
  const { deviceID } = useParams();

  return (
    <SharedMap>
      <EditRoute eventCode={eventCode} deviceID={deviceID} />
    </SharedMap>
  );
};

export default EditRoutePage;
