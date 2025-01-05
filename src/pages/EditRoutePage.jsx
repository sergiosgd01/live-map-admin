import React from "react";
import SharedMap from "../components/SharedMap";
import EditRoute from "./EditRoute";
import { useParams } from "react-router-dom";

const EditRoutePage = () => {
  const { id } = useParams();

  return (
    <SharedMap>
      <EditRoute id={id} />
    </SharedMap>
  );
};

export default EditRoutePage;
