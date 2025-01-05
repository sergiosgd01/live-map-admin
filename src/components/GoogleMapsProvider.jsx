import React, { createContext, useContext } from "react";
import { LoadScript } from "@react-google-maps/api";

const GoogleMapsContext = createContext(null);

export const useGoogleMaps = () => useContext(GoogleMapsContext);

const GoogleMapsProvider = ({ children }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API Key is missing.");
    return <div>Error: Missing API Key</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMapsContext.Provider value={true}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};

export default GoogleMapsProvider;
