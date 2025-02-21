import React, { useState } from "react";
import { Link } from "react-router-dom";
import { addUser } from "../../services/userService";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [registerFailed, setRegisterFailed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setRegisterFailed(false);
    e.target.classList.remove('is-valid', 'is-invalid');
    if (name === 'confirmPassword') {
      e.target.setCustomValidity('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const confirmPasswordInput = form.querySelector('#confirmPassword');

    if (formData.password !== formData.confirmPassword) {
      confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
    } else {
      confirmPasswordInput.setCustomValidity('');
    }

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    setLoading(true);
    setRegisterFailed(false);
    try {
      const userData = {
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
      };
      const response = await addUser(userData);
      if (response.success) {
        console.log("Usuario registrado exitosamente:", response.user);
        if (response.token) localStorage.setItem('token', response.token);
        if (response.user) localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = "/home";
      } else {
        setRegisterFailed(true);
      }
    } catch (error) {
      console.error("Error al registrar el usuario:", error.message);
      setRegisterFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="container">
        <form onSubmit={handleSubmit} className="login-form-wrapper needs-validation" noValidate>
          <div className="login-box">
            <div className="login-form">
              <div className="logo-container">
                <img src="/assets/images/liveMap.svg" alt="LiveMap Logo" className="login-logo" />
              </div>
              <h5 className="login-title">Crear una nueva cuenta</h5>
              {registerFailed && (
                <div className="alert alert-danger">
                  Error al crear la cuenta. Por favor, inténtalo de nuevo.
                </div>
              )}
              {/* Nombre Completo */}
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Introduce tu nombre completo"
                  required
                  pattern="^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$"
                  title="El nombre solo puede contener letras y espacios"
                />
                <div className="invalid-feedback">
                  Por favor, introduce un nombre válido (solo letras y espacios).
                </div>
              </div>
              {/* Email */}
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Introduce tu email"
                  required
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                />
                <div className="invalid-feedback">
                  Por favor, introduce un email válido.
                </div>
              </div>
              {/* Contraseña */}
              <div className="form-group password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Introduce tu contraseña"
                  required
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$"
                  title="La contraseña debe tener entre 6 y 20 caracteres, contener al menos una mayúscula, una minúscula y un número"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePasswordVisibility();
                  }}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <i className="bi bi-eye-slash"></i>
                  ) : (
                    <i className="bi bi-eye"></i>
                  )}
                </button>
                <div className="invalid-feedback">
                  La contraseña debe tener entre 6 y 20 caracteres, contener al menos una mayúscula, una minúscula y un número.
                </div>
              </div>
              {/* Confirmar Contraseña */}
              <div className="form-group password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleConfirmPasswordVisibility();
                  }}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <i className="bi bi-eye-slash"></i>
                  ) : (
                    <i className="bi bi-eye"></i>
                  )}
                </button>
                <div className="invalid-feedback">
                  Las contraseñas no coinciden.
                </div>
              </div>
              <div className="login-button-container">
                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </div>
              <div className="signup-option">
                <span>¿Ya tienes una cuenta?</span>
                <Link to="/login" className="signup-link">
                  Inicia sesión
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;