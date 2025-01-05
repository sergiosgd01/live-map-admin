import React from "react";
import SharedMap from "../components/SharedMap";
import EditService from "./EditService";
import { useParams } from "react-router-dom";

const EditServicePage = () => {
  const { id } = useParams();

  return (
    <SharedMap>
      <EditService id={id} />
    </SharedMap>
  );
};

export default EditServicePage;
