import { fetchUpdateVisitedStatus } from '../services/routeService';

export const getNearestRouteLocations = async (
  locationMarkers,
  routeMarkers
) => {
  const MAX_DISTANCE = 15;

  // 1) Buscar qué puntos están dentro del rango
  const pointsToUpdate = routeMarkers.filter((marker) =>
    locationMarkers.some(
      (location) => calculateDistance(location, marker) <= MAX_DISTANCE
    )
  );

  // 2) Si no hay puntos para visitar, solo retornamos los que ya estaban "visited"
  if (pointsToUpdate.length === 0) {
    return routeMarkers.filter((marker) => marker.visited);
  }

  // 3) Último punto que debe marcarse como visitado
  const lastVisitedPoint = pointsToUpdate[pointsToUpdate.length - 1];
  const lastVisitedIndex = routeMarkers.indexOf(lastVisitedPoint);

  // 4) Tomamos todos los puntos "previos" (hasta ese índice) para setearlos a visited
  const pointsToUpdateIds = routeMarkers
    .slice(0, lastVisitedIndex + 1)
    .map((marker) => marker._id);

  try {
    if (pointsToUpdateIds.length > 0) {
      // a) Actualizamos en el backend (una sola llamada para todos esos puntos)
      await fetchUpdateVisitedStatus(pointsToUpdateIds);

      // b) **Evitamos** volver a descargar la ruta
      //    Simplemente clonamos 'routeMarkers' y marcamos visited=true
      const updatedRoute = routeMarkers.map((marker) => {
        if (pointsToUpdateIds.includes(marker._id)) {
          return {
            ...marker,
            visited: true,
          };
        }
        return marker;
      });

      // c) Retornamos solo los visited
      return updatedRoute.filter((marker) => marker.visited);
    }

    // Si por alguna razón no hay puntos que actualizar,
    // devolvemos los visited actuales
    return routeMarkers.filter((marker) => marker.visited);
  } catch (error) {
    console.error('Error actualizando puntos visitados:', error);
    // Si falla la petición, devolvemos la ruta "como estaba"
    return routeMarkers;
  }
};

// Función para calcular la distancia entre dos puntos geográficos
const calculateDistance = (
  point1,
  point2
) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
};