import React from 'react';
import { useParams } from "react-router-dom";
import SharedMap from '../../../components/SharedMap';
import EditLocation from './EditLocation'; 

const EditLocationPage = () => {
  const { eventCode } = useParams();
  const { deviceID } = useParams();

  return (
    <SharedMap>
      <EditLocation eventCode={eventCode} deviceID={deviceID} />
    </SharedMap>
  );
};

export default EditLocationPage;
