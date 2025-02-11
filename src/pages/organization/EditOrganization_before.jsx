import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrganizationById, updateOrganization, fetchOrganizations } from '../../services/organizationService';

const EditOrganization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState({ name: '', code: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const data = await fetchOrganizationById(id);
        setOrganization(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id]);

  const handleInputChange = (field, value) => {
    setOrganization({ ...organization, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = async () => {
    const newErrors = {};
    if (!organization.name || organization.name.trim() === '') {
      newErrors.name = 'El nombre no puede estar vacío';
    }

    if (!organization.code || isNaN(Number(organization.code))) {
      newErrors.code = 'El código debe ser un número';
    } else if (organization.code.toString().length > 3) {
      newErrors.code = 'El código no puede tener más de 3 cifras';
    } else {
      try {
        const organizations = await fetchOrganizations();
        const isDuplicate = organizations.some(
          (org) => org.code === Number(organization.code) && org._id !== id
        );
        if (isDuplicate) {
          newErrors.code = 'El código ya existe en la base de datos';
        }
      } catch (err) {
        console.error('Error al verificar el código:', err);
        newErrors.code = 'Error al verificar el código, inténtelo nuevamente';
      }
    }    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) {
      alert('Por favor, corrija los errores antes de enviar el formulario.');
      return;
    }

    try {
      await updateOrganization(id, organization);
      alert('Organización actualizada exitosamente');
      navigate('/organizations');
    } catch (err) {
      console.error('Error al actualizar la organización:', err);
      alert('Error al actualizar la organización');
    }
  };

  if (loading) return <p>Cargando organización...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Editar Organización</h1>
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
        <label>
          Código:
          <input
            type="text"
            value={organization.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.code && <p style={{ color: 'red', margin: 0 }}>{errors.code}</p>}
        </label>
        <br />
        <button
          type="submit"
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditOrganization;
