// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/userService';

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(''); // Estado para almacenar el nombre del usuario

  // Función para manejar el logout
  const handleLogout = () => {
    // Eliminar el token y los datos del usuario del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirigir al usuario a la página de login
    navigate('/login');
  };

  // Efecto para cargar el nombre del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(); // Llamar al servicio para obtener los datos del usuario
        console.log('Datos del usuario:', userData); // Depuración
        setUserName(userData.username || 'Usuario'); // Usar el nombre del usuario o un valor predeterminado
      } catch (error) {
        console.error('No se pudo cargar el nombre del usuario:', error.message);
        setUserName('Usuario'); // Valor predeterminado si hay un error
      }
    };

    // Verificar si hay un token antes de intentar cargar los datos del usuario
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <div className="header">
      <div className="page-header">
        {/* Sidebar brand starts */}
        <div className="brand">
          <Link to="/" className="logo">
            <img src="/assets/images/liveMap.svg" className="d-none d-md-block me-4" alt="Admin Dashboards" />
            <img src="/assets/images/liveMap-sm.svg" className="d-block d-md-none me-4" alt="Admin Dashboards" />
          </Link>
        </div>
        {/* Header actions container */}
        <div className="header-actions-container">
          {/* Header profile */}
          <div className="header-profile d-flex align-items-center">
            <div className="dropdown">
              <a href="#" id="userSettings" className="user-settings" data-toggle="dropdown" aria-haspopup="true">
                <span className="user-name d-none d-md-block">{userName}</span> 
                <span className="avatar">
                  <img src="/assets/images/user2.png" alt="Admin Templates" />
                  <span className="status online"></span>
                </span>
              </a>
              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="userSettings">
                <div className="header-profile-actions">
                  <a href="/profile">Profile</a>
                  {/* Botón de Logout */}
                  <a href="#!" onClick={handleLogout}>
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;