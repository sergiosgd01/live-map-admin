import React from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import EditLocation from "./EditLocation";
import SharedMap from "../../../components/SharedMap";

const EditLocationPage = () => {
  const { eventCode, deviceID } = useParams();

  return (
    <LocalHeaderLayout title="Editar Ubicaciones">
      <SharedMap>
        <EditLocation eventCode={eventCode} deviceID={deviceID} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default EditLocationPage;
