import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/userService";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Verificación inicial - comprobamos si hay un token en localStorage
  // Si existe, consideramos al usuario autenticado provisionalmente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Pre-autenticamos si hay token y datos de usuario almacenados
    // Esto evita redirecciones durante el período de verificación
    if (token && storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error al parsear datos de usuario:", e);
      }
    } else {
      // Si no hay token o usuario, aseguramos que isAuthenticated sea false
      setIsAuthenticated(false);
    }
    
    const checkAuth = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        console.log("[useAuth] Verificando token con backend...");
        const user = await getCurrentUser();
        
        if (user) {
          setUserData(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // Limpiamos datos si la respuesta fue exitosa pero no devolvió un usuario
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        // Limpiamos tokens y autenticación en caso de cualquier error de autenticación
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    // Verificamos con el backend, pero ya establecimos el estado provisional
    checkAuth();
  }, []);

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserData(null);
  };

  return { isAuthenticated, loading, userData, logout };
};

export default useAuth;