import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrganizations, deleteOrganization } from '../../services/organizationService';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations();
        setOrganizations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta organización?')) {
      try {
        await deleteOrganization(id);
        alert('Organización eliminada exitosamente');
        setOrganizations(organizations.filter((org) => org._id !== id));
      } catch (err) {
        console.error('Error al eliminar la organización:', err);
        alert('Error al eliminar la organización: ' + err.message);
      }
    }
  };

  if (loading) return <p>Cargando organizaciones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Organizaciones</h1>
      <table style={{ margin: '0 auto', border: '1px solid black', width: '80%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Código</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org._id}>
              <td>{org._id}</td>
              <td>{org.name}</td>
              <td>{org.code}</td>
              <td style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Link to={`/organizations/${org._id}/edit`}>
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}>
                    Editar
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(org._id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
                <Link to={`/organizations/${org.code}/events`}>
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}>
                    Ver Eventos
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/organizations/add">
        <button style={{
          padding: '10px 20px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
        }}>
          +
        </button>
      </Link>
    </div>
  );
};

export default Organizations;
