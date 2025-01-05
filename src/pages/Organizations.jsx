import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrganizations } from '../services/organizationService';

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
              <td>
                <Link to={`/organizations/${org.code}/events`}>
                  <button style={{ padding: '5px 10px' }}>Ver Eventos</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Organizations;
