import React from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import SharedMap from "../../../components/SharedMap";
import EditRoute from "./EditRoute";

const EditRoutePage = () => {
  const { eventCode, deviceID } = useParams();

  return (
    <LocalHeaderLayout title="Edición Ruta">
      <SharedMap>
        <EditRoute eventCode={eventCode} deviceID={deviceID} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default EditRoutePage;