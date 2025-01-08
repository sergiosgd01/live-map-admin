import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, deleteUser } from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]); // Estado para almacenar los usuarios
  const [loading, setLoading] = useState(true); // Estado para mostrar el indicador de carga
  const [error, setError] = useState(null); // Estado para errores
  const navigate = useNavigate(); // Para la navegación

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(user => user._id !== id)); // Actualiza el estado eliminando el usuario
        alert('Usuario eliminado exitosamente.');
      } catch (err) {
        alert('Error al eliminar el usuario: ' + err.message);
      }
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Listado de Usuarios</h1>
      <table style={{ margin: '0 auto', border: '1px solid black', width: '80%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.admin ? 'Sí' : 'No'}</td>
              <td>
                <button 
                  style={{ padding: '5px 10px', marginRight: '5px' }} 
                  onClick={() => navigate(`/users/${user._id}/edit`)}
                >
                  Editar
                </button>
                <button 
                  style={{ padding: '5px 10px', backgroundColor: 'red', color: 'white' }} 
                  onClick={() => handleDelete(user._id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón flotante para añadir usuarios */}
      <button
        onClick={() => navigate('/users/add')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'green',
          color: 'white',
          fontSize: '24px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        +
      </button>
    </div>
  );
};

export default Users;
