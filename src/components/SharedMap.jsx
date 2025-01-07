import React, { useState, createContext, useContext } from "react";
import { GoogleMap } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100vh", // Ocupa toda la altura de la ventana
};


const defaultCenter = {
  lat: 40.4168,
  lng: -3.7038,
};

const MapContext = createContext(null);

export const useMap = () => useContext(MapContext);

const SharedMap = ({ children }) => {
  const [map, setMap] = useState(null);

  const handleOnLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleOnUnmount = () => {
    setMap(null);
  };

  return (
    <MapContext.Provider value={map}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={handleOnLoad}
        onUnmount={handleOnUnmount}
      >
        {children}
      </GoogleMap>
    </MapContext.Provider>
  );
};

export default SharedMap;
