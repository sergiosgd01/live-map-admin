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
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword); // Alternar entre mostrar y ocultar la contraseña
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    setLoginFailed(false);
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
    setErrors({});
  
    try {
      const response = await loginUser(formData.email, formData.password);
  
      if (response.success) {
        // Guardar el token en localStorage
        if (response.token) {
          localStorage.setItem('token', response.token); // Guarda el token
          console.log("Token guardado en localStorage:", response.token); // Depuración
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user)); // Guarda el usuario
          console.log("Usuario guardado en localStorage:", response.user); // Depuración
        }
        window.location.href = "/home"; // Forzar recarga
      } else {
        setErrors({
          email: "Credenciales incorrectas.",
          password: "Credenciales incorrectas.",
        });
        setLoginFailed(true);
      }
    } catch (error) {
      setLoginFailed(true);
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
                  Credenciales incorrectas. Por favor, verifica tu email y contraseña.
                </div>
              )}
              <div className="form-group">
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="yEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Introduce tu email"
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="form-group password-input">
                <input
                  type={showPassword ? "text" : "password"} // Cambiar el tipo de entrada
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  id="yPwd"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Introduce tu contraseña"
                  required
                />
                {/* Botón para mostrar/ocultar la contraseña */}
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <i className="bi bi-eye-slash"></i> // Ícono de ojo tachado
                  ) : (
                    <i className="bi bi-eye"></i> // Ícono de ojo
                  )}
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
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