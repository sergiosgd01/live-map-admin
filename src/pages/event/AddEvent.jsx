import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addEvent } from '../../services/eventService';
import { fetchOrganizations, fetchOrganizationByCode } from '../../services/organizationService';

const AddEvent = () => {
  const { organizationCode } = useParams(); 
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    name: '',
    postalCode: '',
    time: '',
    startDate: '',
    endDate: '',
    image: '',
    icon: '',
    organizationCode: organizationCode || '',
  });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [defaultOrganizationName, setDefaultOrganizationName] = useState('');

  useEffect(() => {
    console.log('organizationCode:', organizationCode);
    const loadOrganizations = async () => {
      try {
        const orgs = await fetchOrganizations();
        setOrganizations(orgs);

        if (organizationCode) {
          const defaultOrg = await fetchOrganizationByCode(organizationCode);
          console.log('defaultOrg:', defaultOrg);
          setDefaultOrganizationName(defaultOrg?.name || '');
        }
      } catch (err) {
        console.error('Error al cargar las organizaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [organizationCode]);

  const handleInputChange = (field, value) => {
    setEvent({ ...event, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!event.name || event.name.trim() === '') {
      newErrors.name = 'El nombre no puede estar vacío';
    }

    if (!event.postalCode || event.postalCode.trim() === '') {
      newErrors.postalCode = 'El código postal no puede estar vacío';
    }

    if (!event.time || isNaN(event.time)) {
      newErrors.time = 'El tiempo de actualización debe ser un número';
    }

    if (!event.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }

    if (!event.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }

    if (event.startDate && event.endDate) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      if (start > end) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!event.organizationCode || event.organizationCode === '') {
      newErrors.organizationCode = 'Debe seleccionar un código de organización';
    }

    if (
      event.image &&
      !event.image.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/)
    ) {
      newErrors.image = 'Debe ser una URL válida de imagen (terminada en jpg, jpeg, png, webp o gif).';
    }

    if (
      event.icon &&
      !event.icon.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/)
    ) {
      newErrors.icon = 'Debe ser una URL válida de icono (terminada en jpg, jpeg, png, webp o gif).';
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
      await addEvent(event);
      alert('Evento creado exitosamente');
      navigate(`/organizations/${event.organizationCode}/events`);  
    } catch (err) {
      console.error('Error al crear el evento:', err);
      alert('Error al crear el evento: ' + err.message);
    }
  };

  if (loading) return <p>Cargando organizaciones...</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Agregar Nuevo Evento</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', width: '60%' }}>
        <label>
          Nombre:
          <input
            type="text"
            value={event.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.name && <p style={{ color: 'red', margin: 0 }}>{errors.name}</p>}
        </label>
        <br />
        <label>
          Código Postal:
          <input
            type="text"
            value={event.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.postalCode && <p style={{ color: 'red', margin: 0 }}>{errors.postalCode}</p>}
        </label>
        <br />
        <label>
          Tiempo actualización (segundos):
          <input
            type="number"
            value={event.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.time && <p style={{ color: 'red', margin: 0 }}>{errors.time}</p>}
        </label>
        <br />
        <label>
          Fecha de Inicio:
          <input
            type="datetime-local"
            value={event.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value + ':00')}
            style={{ width: '100%' }}
          />
          {errors.startDate && <p style={{ color: 'red', margin: 0 }}>{errors.startDate}</p>}
        </label>
        <br />
        <label>
          Fecha de Fin:
          <input
            type="datetime-local"
            value={event.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value + ':00')}
            style={{ width: '100%' }}
          />
          {errors.endDate && <p style={{ color: 'red', margin: 0 }}>{errors.endDate}</p>}
        </label>
        <br />
        <label>
          Imagen (URL):
          <input
            type="text"
            value={event.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.image && <p style={{ color: 'red', margin: 0 }}>{errors.image}</p>}
        </label>
        <br />
        <label>
          Icono (URL):
          <input
            type="text"
            value={event.icon}
            onChange={(e) => handleInputChange('icon', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.icon && <p style={{ color: 'red', margin: 0 }}>{errors.icon}</p>}
        </label>
        <br />
        <label>
          Organización:
          <select
            value={event.organizationCode}
            onChange={(e) => handleInputChange('organizationCode', e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="" disabled>
              Selecciona una organización
            </option>
            {organizations.map((org) => (
              <option key={org.code} value={org.code}>
                {org.code === organizationCode ? `${org.name} (Por defecto)` : org.name}
              </option>
            ))}
          </select>
          {errors.organizationCode && <p style={{ color: 'red', margin: 0 }}>{errors.organizationCode}</p>}
        </label>
        <br />
        <button
          type="submit"
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Crear Evento
        </button>
      </form>
    </div>
  );
};

export default AddEvent;
