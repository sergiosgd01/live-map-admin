import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalHeaderLayout from '../../components/LocalHeaderLayout'; 
import { updateUser } from '../../services/userService'; 
import useAuth from '../../hooks/useAuth';
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert';
import colors from '../../utils/colors';

const Profile = () => {
  const navigate = useNavigate();
  const { userData, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  // Estado para los switches
  const [switches, setSwitches] = useState({
    desktopNotifications: false,
    emailNotifications: true,
    chatNotifications: false,
    purchaseHistory: false,
    orders: false,
    alerts: false
  });
  
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

  // Efecto para configurar los datos del formulario cuando userData esté disponible
  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        password: ''
      });
    }
  }, [userData]);

  // Manejador para los cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpiar errores cuando el usuario comienza a escribir
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  // Manejador para los cambios en los switches
  const handleSwitchChange = (e) => {
    const { id, checked } = e.target;
    setSwitches({
      ...switches,
      [id]: checked
    });
  };

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio.';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El email debe tener un formato válido.';
    }

    // Validar contraseña si se proporciona
    if (formData.password && formData.password.trim() !== '') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y mínimo 6 caracteres.';
      }
    }

    // Actualizar el estado de errores
    setErrors(newErrors);

    // Si no hay errores, el formulario es válido
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setLoading(true);
  
    try {
      // Construir el objeto de usuario actualizado
      const updatedUser = {
        username: formData.username,
        email: formData.email,
        isAdmin: userData?.isAdmin || 0
      };
  
      // Solo incluir la contraseña si se proporciona un valor nuevo
      if (formData.password && formData.password.trim() !== '') {
        updatedUser.password = formData.password;
      }
  
      const userId = userData?.id || userData?._id;
  
      // Llamar al servicio para actualizar los datos del usuario
      await updateUser(userId, updatedUser);
  
      // Actualizar los datos del usuario en localStorage
      const userDataFromStorage = localStorage.getItem('user');
      if (userDataFromStorage) {
        const parsedUserData = JSON.parse(userDataFromStorage);
        const updatedUserData = {
          ...parsedUserData,
          username: formData.username,
          email: formData.email
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
      }
  
      setAlert({ type: 'success', message: 'Usuario actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error.message);
      
      // Si el error es de email duplicado, también actualizar los errores de validación
      if (error.message.includes('email ya está en uso')) {
        setErrors(prev => ({
          ...prev,
          email: 'El email ya está en uso por otro usuario.'
        }));
      }
      
      setAlert({ type: 'danger', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Cambiar entre pestañas
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Función para determinar y mostrar el tipo de usuario
  const getUserType = () => {
    if (userData?.isSuperAdmin) {
      return "Super Administrador";
    } else if (userData?.adminOf && userData.adminOf.length > 0) {
      return `Administrador de ${userData.adminOf.join(', ')}`;
    } else if (userData?.isAdmin === 1) {
      return "Admin";
    } else {
      return "Usuario sin permisos de administrador";
    }
  };

  // Mostrar spinner mientras carga la autenticación
  if (authLoading || loading) return <Spinner />;

  // Si no hay datos de usuario, redirigir al login
  if (!userData && !authLoading) {
    navigate('/login');
    return null;
  }

  // Obtener el nombre de usuario
  const username = userData?.username || 'Usuario';
  // Obtener iniciales
  const initials = getInitials(username);

  return (
    <LocalHeaderLayout breadcrumbs={[{ label: "Perfil de Usuario", path: "" }]}>
      <div className="page-wrapper">
        <div className="main-wrapper">
          <div className="content-wrapper-scroll">
            <div className="content-wrapper" style={{ paddingBottom: '50px' }}>
              {alert && (
                <Alert 
                  type={alert.type} 
                  message={alert.message} 
                  onClose={() => setAlert(null)} 
                />
              )}
              <div className="subscribe-header">
                <img src="assets/images/bg.jpg" className="img-fluid w-100" alt="Admin & Dashboards" />
              </div>
              <div className="subscriber-body">
                {/* Row start */}
                <div className="row justify-content-center mt-4">
                  <div className="col-xl-10 col-lg-12">
                    {/* Row start */}
                    <div className="row align-items-end">
                      <div className="col-auto">
                        {/* Reemplazar la imagen con el avatar de iniciales */}
                        <div 
                          style={{
                            backgroundColor: colors.purple,
                            color: '#fff',
                            width: '120px',          // Aumentado de 80px a 120px
                            height: '120px',         // Aumentado de 80px a 120px
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '48px',        // Aumentado de 32px a 48px
                            border: '4px solid white', // Opcional: añadir un borde para destacarlo
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)' // Opcional: añadir sombra
                          }}
                        >
                          {initials}
                        </div>
                      </div>
                      <div className="col">
                        <h6>{getUserType()}</h6>
                        <h4 className="m-0">{userData?.username || "Usuario desconocido"}</h4>
                      </div>
                    </div>
                    {/* Row end */}
                  </div>
                </div>
                {/* Row end */}

                {/* Row start */}
                <div className="row justify-content-center mt-4">
                  <div className="col-xl-10 col-lg-12">
                    <div className="card light">
                      <div className="card-body">
                        <div className="custom-tabs-container">
                          <ul className="nav nav-tabs" id="customTab2" role="tablist">
                            <li className="nav-item" role="presentation">
                              <button 
                                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`} 
                                onClick={() => handleTabChange('general')}
                              >
                                General
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button 
                                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} 
                                onClick={() => handleTabChange('settings')}
                              >
                                Ajustes
                              </button>
                            </li>
                          </ul>
                          <div className="tab-content h-350">
                            <div className={`tab-pane fade ${activeTab === 'general' ? 'show active' : ''}`}>
                              {/* Aquí integramos el contenido del modal */}
                              <div className="card">
                                <div className="card-header">
                                  <h5 className="card-title">Editar Usuario</h5>
                                </div>
                                <div className="card-body">
                                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                    <div className="row gx-3">
                                      {/* Username */}
                                      <div className="col-12 mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                          type="text"
                                          className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                          id="username"
                                          name="username"
                                          value={formData.username}
                                          onChange={handleInputChange}
                                          placeholder="Username"
                                          required
                                        />
                                        {errors.username && (
                                          <div className="invalid-feedback">{errors.username}</div>
                                        )}
                                      </div>
                                      {/* Email */}
                                      <div className="col-12 mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                          type="email"
                                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                          id="email"
                                          name="email"
                                          value={formData.email}
                                          onChange={handleInputChange}
                                          placeholder="Email"
                                          required
                                        />
                                        {errors.email && (
                                          <div className="invalid-feedback">{errors.email}</div>
                                        )}
                                      </div>
                                      {/* Nueva contraseña */}
                                      <div className="col-12 mb-3">
                                        <label htmlFor="password" className="form-label">Nueva contraseña</label>
                                        <input
                                          type="password"
                                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                          id="password"
                                          name="password"
                                          value={formData.password}
                                          onChange={handleInputChange}
                                          placeholder="Introduce una nueva contraseña"
                                        />
                                        {errors.password && (
                                          <div className="invalid-feedback">{errors.password}</div>
                                        )}
                                        <div className="form-text">Dejar en blanco para mantener la contraseña actual</div>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <button type="submit" className="btn btn-success">
                                        Guardar Cambios
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                            <div className={`tab-pane fade ${activeTab === 'settings' ? 'show active' : ''}`}>
                              <div className="card-body">
                                {/* Row start */}
                                <div className="row gx-3">
                                  <div className="col-sm-6 col-12 mb-3">
                                    {/* Card start */}
                                    <div className="card">
                                      <div className="card-header">
                                        <h5 className="card-title">Preferencias de usuario</h5>
                                      </div>
                                      <div className="card-body">
                                        <ul className="list-group">
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Modo oscuro
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                id="darkMode"
                                                checked={switches.darkMode || false}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Activar notificaciones
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch" 
                                                id="enableNotifications"
                                                checked={switches.enableNotifications || false}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Recordar usuario
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                id="rememberUser"
                                                checked={switches.rememberUser || false}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                    {/* Card end */}
                                  </div>
                                  <div className="col-sm-6 col-12">
                                    {/* Card start */}
                                    <div className="card">
                                      <div className="card-header">
                                        <h5 className="card-title">Idioma</h5>
                                      </div>
                                      <div className="card-body">
                                        <div className="mb-3">
                                          <label htmlFor="languageSelect" className="form-label">Seleccionar idioma</label>
                                          <select 
                                            id="languageSelect" 
                                            className="form-select" 
                                            value={formData.language || 'es'}
                                            onChange={(e) => setFormData({...formData, language: e.target.value})}
                                          >
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                            <option value="it">Italiano</option>
                                            <option value="pt">Português</option>
                                          </select>
                                          <div className="form-text mt-2">
                                            El cambio de idioma se aplicará la próxima vez que inicies sesión.
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="row mt-3">
                                  <div className="col-12 text-end">
                                    <button type="button" className="btn btn-secondary me-2">
                                      Restablecer ajustes
                                    </button>
                                    <button type="button" className="btn btn-primary">
                                      Guardar ajustes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>





                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalHeaderLayout>
  );
};

export default Profile;