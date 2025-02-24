import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalHeaderLayout from '../../components/LocalHeaderLayout';
import { getCurrentUser, updateUser } from '../../services/userService'; // Importa servicios para obtener y actualizar datos del usuario

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null); // Estado para almacenar los datos del usuario
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
  const [formData, setFormData] = useState({}); // Estado para manejar los datos del formulario
  const [errors, setErrors] = useState({});

  // Efecto para cargar los datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser(); // Llamar al servicio para obtener los datos del usuario
        console.log('Datos del usuario:', user); // Depuración
        setUserData(user); // Almacenar los datos del usuario en el estado
        setFormData({
          username: user.username || '',
          email: user.email || '',
          password: '', // Inicialmente vacío porque es para una nueva contraseña
        }); // Inicializar el estado del formulario con los datos del usuario
      } catch (error) {
        console.error('No se pudo cargar los datos del usuario:', error.message);
        setUserData(null); // Manejar el caso de error
      }
    };
    // Verificar si hay un token antes de intentar cargar los datos del usuario
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      navigate('/login'); // Redirigir al login si no hay token
    }
  }, [navigate]);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Limpiar errores cuando el usuario comience a escribir
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
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
        newErrors.password =
          'La contraseña debe tener al menos una mayúscula, una minúscula, un número y mínimo 6 caracteres.';
      }
    }

    // Actualizar el estado de errores
    setErrors(newErrors);

    // Si no hay errores, el formulario es válido
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log('Datos del formulario:', formData);
      console.log('Datos del usuario:', userData);
      // Construir el objeto de usuario actualizado
      const updatedUser = {
        username: formData.username,
        email: formData.email,
        isAdmin: userData?.admin || 0, // Mantener el valor original de admin
      };
  
      // Solo incluir la contraseña si se proporciona un valor nuevo
      if (formData.password && formData.password.trim() !== '') {
        updatedUser.password = formData.password;
      }
  
      const userId = userData?._id;
  
      console.log('Datos actualizados del usuario:', updatedUser);
  
      // Llamar al servicio para actualizar los datos del usuario
      await updateUser(userId, updatedUser);
  
      // Actualizar los datos del usuario en el estado
      setUserData((prevData) => ({
        ...prevData,
        ...updatedUser,
      }));
  
      // Cerrar el modal
      setIsModalOpen(false);
  
      alert('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el usuario:', error.message);
      alert('Error al actualizar el usuario');
    }
  };

  return (
    <LocalHeaderLayout breadcrumbs={[{ label: "Perfil de Usuario", path: "" }]}>
      <div className="page-wrapper">
        <div className="main-container">
          <div className="content-wrapper-scroll">
            <div className="content-wrapper">
              <div className="subscribe-header">
                <img
                  src="assets/images/bg.jpg"
                  className="img-fluid w-100"
                  alt="Admin & Dashboards"
                />
              </div>
              {/* Subscriber body */}
              <div className="subscriber-body">
                {/* Row start */}
                <div className="row justify-content-center mt-4">
                  <div className="col-xl-10 col-lg-12">
                    {/* Row start */}
                    <div className="row align-items-end">
                      {/* Profile picture */}
                      <div className="col-auto">
                        <img
                          src={userData?.avatar || "/assets/images/user.png"} // Usar la imagen del usuario o una predeterminada
                          className="img-7xx rounded-circle"
                          alt="Profile Picture"
                        />
                      </div>
                      {/* User details */}
                      <div className="col">
                        {/* Mostrar el rol del usuario */}
                        <h6>{userData?.isAdmin === 1 ? "Admin" : "Usuario sin permisos de administrador"}</h6>
                        {/* Mostrar el nombre de usuario */}
                        <h4 className="m-0">{userData?.username || "Usuario desconocido"}</h4>
                      </div>
                      {/* Edit button */}
                      <div className="col-12 col-md-auto">
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <i className="bi bi-pencil-fill me-2"></i>
                          Editar
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

      {/* Overlay oscuro */}
      {isModalOpen && (
        <div
          className="modal-backdrop show"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1040 }}
        ></div>
      )}

      {/* Modal para editar usuario */}
      {isModalOpen && (
          <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content">
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <div className="modal-header">
                    <h5 className="modal-title">Editar Usuario</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setIsModalOpen(false)} // Cerrar el modal
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Todos los campos en una sola columna */}
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
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setIsModalOpen(false)} // Cerrar el modal
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-success">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </LocalHeaderLayout>
  );
};

export default Profile;