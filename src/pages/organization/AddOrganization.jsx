import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addOrganization } from '../../services/organizationService';

const AddOrganization = () => {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState({ name: '' }); // Elimina el campo `code`
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setOrganization({ ...organization, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!organization.name || organization.name.trim() === '') {
      newErrors.name = 'El nombre no puede estar vacío';
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
      await addOrganization(organization); // No envía `code`, solo `name`
      alert('Organización creada exitosamente');
      navigate('/organizations');
    } catch (err) {
      console.error('Error al crear la organización:', err);
      alert('Error al crear la organización');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Agregar Nueva Organización</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', width: '50%' }}>
        <label>
          Nombre:
          <input
            type="text"
            value={organization.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.name && <p style={{ color: 'red', margin: 0 }}>{errors.name}</p>}
        </label>
        <br />
        <button
          type="submit"
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Crear Organización
        </button>
      </form>
    </div>
  );
};

export default AddOrganization;
