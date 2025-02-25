import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/userService"; // Importa la función getCurrentUser desde tu servicio

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Llamar al servicio para verificar el token y obtener los datos del usuario
        const user = await getCurrentUser();
        console.log('Datos del usuario:', user); // Depuración
        setIsAuthenticated(!!user); // Si hay datos, el token es válido
      } catch (error) {
        console.error('Error al verificar el token:', error.message);
        setIsAuthenticated(false); // Token inválido o expirado
      } finally {
        setLoading(false); // Finalizar la carga
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, loading };
};

export default useAuth;