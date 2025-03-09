import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { userData } = useAuth(); // Usa el hook centralizado
  
  // Función para manejar el logout
  const handleLogout = () => {
    // Eliminar el token y los datos del usuario del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirigir al usuario a la página de login
    navigate('/login');
  };

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
                <span className="user-name d-none d-md-block">
                  {userData?.username || 'Usuario'}
                </span> 
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