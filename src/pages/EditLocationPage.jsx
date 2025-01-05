import React from "react";
import SharedMap from "../components/SharedMap";
import EditLocation from "./EditLocation";
import { useParams } from "react-router-dom";

const EditLocationPage = () => {
  const { id } = useParams();

  return (
    <SharedMap>
      <EditLocation id={id} />
    </SharedMap>
  );
};

export default EditLocationPage;
