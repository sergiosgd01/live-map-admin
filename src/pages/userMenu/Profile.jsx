import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalHeaderLayout from '../../components/LocalHeaderLayout'; 
import { getCurrentUser, updateUser } from '../../services/userService'; 
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
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

  // Efecto para cargar los datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const user = await getCurrentUser();
        setUserData(user);
        
        setFormData({
          username: user.username || '',
          email: user.email || '',
          password: ''
        });
      } catch (error) {
        console.error('No se pudo cargar los datos del usuario:', error.message);
        navigate('/login');
      } finally {
        setLoading(false); // Desactivamos el loading cuando termine la carga
      }
    };

    fetchUserData();
  }, [navigate]);

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

      const userId = userData?._id;

      // Llamar al servicio para actualizar los datos del usuario
      await updateUser(userId, updatedUser);

      // Actualizar los datos del usuario en el estado
      setUserData({
        ...userData,
        ...updatedUser
      });

      setAlert({ type: 'success', message: 'Usuario actualizado correctamente' });

    } catch (error) {
      console.error('Error al actualizar el usuario:', error.message);
      setAlert({ type: 'danger', message: 'Error al actualizar el usuario: ' + error.message });
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

  if (loading) return <Spinner />;

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
                        <img 
                          src={userData?.avatar || "assets/images/user2.png"} 
                          className="img-7xx rounded-circle" 
                          alt="User" 
                        />
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
                                Settings
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
                                  <div className="col-sm-6 col-12">
                                    {/* Card start */}
                                    <div className="card">
                                      <div className="card-body">
                                        <ul className="list-group">
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Show desktop notifications
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                id="desktopNotifications"
                                                checked={switches.desktopNotifications}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Show email notifications
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch" 
                                                id="emailNotifications"
                                                checked={switches.emailNotifications}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Show chat notifications
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                id="chatNotifications"
                                                checked={switches.chatNotifications}
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
                                      <div className="card-body">
                                        <ul className="list-group">
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Show purchase history
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                id="purchaseHistory"
                                                checked={switches.purchaseHistory}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Show orders
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                id="orders"
                                                checked={switches.orders}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                          <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Show alerts
                                            <div className="form-check form-switch m-0">
                                              <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                id="alerts"
                                                checked={switches.alerts}
                                                onChange={handleSwitchChange}
                                              />
                                            </div>
                                          </li>
                                        </ul>
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
        </div>
      </div>
    </LocalHeaderLayout>
  );
};

export default Profile;