import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserById, updateUser } from '../services/userService';

const EditUser = () => {
  const { id } = useParams(); // Obtén el ID del usuario desde la URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserById(id);
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(id, user);
      alert('Usuario actualizado exitosamente');
      navigate('/users');
    } catch (err) {
      alert('Error al actualizar el usuario: ' + err.message);
    }
  };

  if (loading) return <p>Cargando usuario...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No se encontró el usuario.</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Editar Usuario</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
        <label>
          Username:
          <input 
            type="text" 
            value={user.username} 
            onChange={(e) => setUser({ ...user, username: e.target.value })} 
          />
        </label>
        <br />
        <label>
          Email:
          <input 
            type="email" 
            value={user.email} 
            onChange={(e) => setUser({ ...user, email: e.target.value })} 
          />
        </label>
        <br />
        <label>
          Contraseña:
          <input 
            type="password" 
            value={user.password} 
            onChange={(e) => setUser({ ...user, password: e.target.value })} 
          />
        </label>
        <br />
        <label>
          Admin:
          <select 
            value={user.admin} 
            onChange={(e) => setUser({ ...user, admin: e.target.value === '1' })}
          >
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </label>
        <br />
        <button type="submit" style={{ marginTop: '10px' }}>Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditUser;
