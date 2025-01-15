import React from "react";
import SharedMap from "../../../components/SharedMap";
import EditService from "./EditService";
import { useParams } from "react-router-dom";

const EditServicePage = () => {
  const { eventCode } = useParams();

  return (
    <SharedMap>
      <EditService eventCode={eventCode} />
    </SharedMap>
  );
};

export default EditServicePage;
