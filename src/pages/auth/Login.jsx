import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../services/userService";
import ConfirmationModal from "../../components/ConfirmationModal"; // Importa el componente
import "../../styles/Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
    setLoginFailed(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    setLoading(true);
    setLoginFailed(false);
    setErrorMessage("");

    try {
      const response = await loginUser(formData.email, formData.password);

      if (response.success) {
        const user = response.user;

        if (!user.isSuperAdmin && (!user.adminOf || user.adminOf.length === 0)) {
          setLoginFailed(true);
          setErrorMessage(
            "No tienes permisos para acceder al panel de administrador"
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return;
        }

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        if (user.isSuperAdmin) {
          window.location.href = "/home";
        } else {
          window.location.href = "/organizations";
        }
      } else {
        setErrorMessage(
          "Credenciales incorrectas. Por favor, verifica tu email y contraseña."
        );
        setLoginFailed(true);
      }
    } catch (error) {
      setLoginFailed(true);
      setErrorMessage("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="login-container">
      <div className="container">
        <form onSubmit={handleSubmit} className="login-form-wrapper" noValidate>
          <div className="login-box">
            <div className="login-form">
              <div className="logo-container">
                <img
                  src="/assets/images/liveMap.svg"
                  alt="LiveMap Logo"
                  className="login-logo"
                />
              </div>
              <h5 className="login-title">Inicia sesión con tu cuenta</h5>
              {loginFailed && (
                <div className="error-message">{errorMessage}</div>
              )}
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  id="yEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Introduce tu email"
                  required
                />
              </div>
              <div className="form-group password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="yPwd"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Introduce tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <i className="bi bi-eye-slash"></i>
                  ) : (
                    <i className="bi bi-eye"></i>
                  )}
                </button>
              </div>
              <div className="form-options">
                {/* Enlace para abrir el modal */}
                <span
                  className="forgot-password"
                  style={{ cursor: "pointer" }}
                  onClick={openModal}
                >
                  ¿Has olvidado la contraseña?
                </span>
              </div>
              <div className="login-button-container">
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Inicia sesión"}
                </button>
              </div>
              <div className="signup-option">
                <span>¿No estás registrado?</span>
                <Link to="/register" className="signup-link">
                  Crea una cuenta
                </Link>
              </div>
            </div>
          </div>
        </form>

        {/* Modal de recuperación de contraseña */}
        {isModalOpen && (
          <ConfirmationModal
            title="Recuperación de contraseña"
            message={
              <>
                Para solicitar una nueva contraseña, por favor, ponte en contacto
                con el administrador de la aplicación.
                <br />
                Puedes enviar un correo electrónico a:{" "}
                <a href="mailto:admin@liveMap.com">admin@liveMap.com</a>
              </>
            }
            onCancel={closeModal} 
            onConfirm={closeModal} 
          />
        )}
      </div>
    </div>
  );
};

export default Login;