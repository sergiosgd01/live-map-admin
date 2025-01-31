// src/utils/mapCentering.js
import postalCodes from './postalCodes'; // Asegúrate de ajustar la ruta según tu estructura de carpetas

const defaultCenter = { lat: 40.4168, lng: -3.7038 }; // Madrid

/**
 * Centra el mapa basado en la presencia de marcadores y el código postal del evento.
 *
 * @param {object} map - Instancia del mapa de Google Maps.
 * @param {boolean} hasMarkers - Indica si hay marcadores en el mapa.
 * @param {string} eventPostalCode - Código postal del evento.
 */
export const centerMapBasedOnMarkers = (map, hasMarkers, eventPostalCode) => {
  if (hasMarkers) {
    // Si hay marcadores, asumimos que los bounds ya están establecidos en el componente.
    return;
  }

  if (eventPostalCode && postalCodes[eventPostalCode]) {
    const { lat, lng } = postalCodes[eventPostalCode];
    map.setCenter({ lat, lng });
    map.setZoom(14); // Ajusta el nivel de zoom según prefieras
  } else {
    // Centrar en Madrid si el código postal no está en el archivo
    map.setCenter(defaultCenter);
    map.setZoom(10);
  }
};
