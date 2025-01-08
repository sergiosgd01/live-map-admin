import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../../services/userService';

const AddUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    admin: false,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setUser({ ...user, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación del nombre de usuario
    if (!user.username || user.username.trim() === '') {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }

    // Validación del email
    if (!user.email || user.email.trim() === '') {
      newErrors.email = 'El email es obligatorio';
    } else {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(user.email)) {
        newErrors.email = 'El email no es válido';
      }
    }

    // Validación de la contraseña
    if (!user.password || user.password.trim() === '') {
      newErrors.password = 'La contraseña es obligatoria';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!passwordRegex.test(user.password)) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Por favor, corrija los errores antes de enviar el formulario.');
      return;
    }

    try {
      await addUser(user);
      alert('Usuario creado exitosamente');
      navigate('/users');
    } catch (err) {
      alert('Error al crear el usuario: ' + err.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Crear Usuario</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', width: '50%' }}>
        <label>
          Nombre de Usuario:
          <input
            type="text"
            value={user.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.username && <p style={{ color: 'red', margin: 0 }}>{errors.username}</p>}
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={user.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.email && <p style={{ color: 'red', margin: 0 }}>{errors.email}</p>}
        </label>
        <br />
        <label>
          Contraseña:
          <input
            type="password"
            value={user.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.password && <p style={{ color: 'red', margin: 0 }}>{errors.password}</p>}
        </label>
        <br />
        <label>
          Admin:
          <select
            value={user.admin ? '1' : '0'}
            onChange={(e) => handleInputChange('admin', e.target.value === '1')}
            style={{ width: '100%' }}
          >
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </label>
        <br />
        <button
          type="submit"
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Crear Usuario
        </button>
      </form>
    </div>
  );
};

export default AddUser;
