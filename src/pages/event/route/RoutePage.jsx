import React from "react";
import { useParams } from "react-router-dom";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import SharedMap from "../../../components/SharedMap";
import Route from "./Route";

const RoutePage = () => {
  const { eventCode } = useParams();

  return (
    <LocalHeaderLayout title="Rutas">
      <SharedMap>
        <Route eventCode={eventCode} />
      </SharedMap>
    </LocalHeaderLayout>
  );
};

export default RoutePage;


