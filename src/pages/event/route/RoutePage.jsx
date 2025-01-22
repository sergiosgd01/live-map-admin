import React from "react";
import SharedMap from "../../../components/SharedMap";
import Route from "./Route";
import { useParams } from "react-router-dom";

const RoutePage = () => {
  const { eventCode } = useParams();

  return (
    <SharedMap>
      <Route eventCode={eventCode} />
    </SharedMap>
  );
};

export default RoutePage;
