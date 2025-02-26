import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../services/userService";
import "../../styles/Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
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
    setErrors({});
  
    try {
      const response = await loginUser(formData.email, formData.password);
  
      if (response.success) {
        // Verificar permisos
        const user = response.user;
        
        // Si no es superAdmin y no tiene organizaciones para administrar
        if (!user.isSuperAdmin && (!user.adminOf || user.adminOf.length === 0)) {
          setLoginFailed(true);
          setErrorMessage("No tienes permisos para acceder al panel de administrador");
          // No establecer mensajes de error en los campos individuales
          // Limpiar localStorage por si acaso
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
  
        // Guardar datos en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
  
        // Redirigir según el tipo de usuario
        console.log(user);
        if (user.isSuperAdmin) {
          window.location.href = "/home";
        } else {
          window.location.href = "/organizations";
        }
      } else {
        setErrorMessage("Credenciales incorrectas. Por favor, verifica tu email y contraseña.");
        setLoginFailed(true);
      }
    } catch (error) {
      setLoginFailed(true);
      setErrorMessage("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
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
                <div className="error-message">
                  {errorMessage}
                </div>
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
                <Link to="/forgot-password" className="forgot-password">
                  ¿Has olvidado la contraseña?
                </Link>
              </div>
              <div className="login-button-container">
                <button type="submit" className="login-button" disabled={loading}>
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
      </div>
    </div>
  );
};

export default Login;