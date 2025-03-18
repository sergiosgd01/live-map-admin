import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import colors from '../utils/colors';

const Header = () => {
  const navigate = useNavigate();
  const { userData } = useAuth(); // Usa el hook centralizado
  
  // Función para obtener las iniciales del nombre de usuario
  const getInitials = (username) => {
    if (!username) return "U";
    
    // Si el nombre tiene espacios (nombre y apellido)
    if (username.includes(' ')) {
      const parts = username.split(' ');
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    // Si es una sola palabra, usar la primera y segunda letra o solo la primera
    return username.length > 1 
      ? username.substring(0, 2).toUpperCase() 
      : username[0].toUpperCase();
  };
  
  // Función para manejar el logout
  const handleLogout = () => {
    // Eliminar el token y los datos del usuario del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirigir al usuario a la página de login
    navigate('/login');
  };

  // Obtener el nombre de usuario
  const username = userData?.username || 'Usuario';
  // Obtener iniciales
  const initials = getInitials(username);

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
                  {username}
                </span> 
                <span className="avatar">
                  {/* Reemplazar la imagen con el avatar de iniciales */}
                  <div 
                    style={{
                      backgroundColor: colors.purple,
                      color: '#fff',
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    {initials}
                  </div>
                  <span className="status online"></span>
                </span>
              </a>
              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="userSettings">
                <div className="header-profile-actions">
                  <a href="/profile">Perfil</a>
                  {/* Botón de Logout */}
                  <a href="#!" onClick={handleLogout}>
                    Cerrar sesión
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