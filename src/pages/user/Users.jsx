import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { fetchAllUsers, deleteUser, updateUser, addUser } from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

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

  // Función para abrir el modal de confirmación de eliminación
  const confirmDelete = (user) => {
    setUserToDelete(user);
    const modalEl = document.getElementById("deleteConfirmModal");
    if (modalEl) {
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
    } else {
      console.error("No se encontró el modal de eliminación");
    }
  };

  // Función para ejecutar la eliminación cuando se confirma en el modal
  const handleDeleteConfirmed = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete._id);
        setUsers(users.filter(user => user._id !== userToDelete._id));
        const modalEl = document.getElementById("deleteConfirmModal");
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        setUserToDelete(null);
      } catch (err) {
        console.error('Error al eliminar el usuario:', err.message);
      }
    }
  };

  // Función única para manejar tanto la actualización como la creación
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }
    const modalEl = document.getElementById("editContact");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    
    if (selectedUser._id) {
      try {
        await updateUser(selectedUser._id, selectedUser);
        setUsers(users.map(u => u._id === selectedUser._id ? selectedUser : u));
        if (modal) modal.hide();
      } catch (err) {
        console.error("Error al actualizar el usuario:", err.message);
      }
    } else {
      try {
        await addUser(selectedUser);
        const data = await fetchAllUsers();
        setUsers(data);
        if (modal) modal.hide();
      } catch (err) {
        console.error("Error al crear el usuario:", err.message);
      }
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error) return <p>Error: {error}</p>;

  return (
    <Layout>
      {/* Encabezado interno de la página */}
      <div className="main-header d-flex align-items-center justify-content-between position-relative">
        <div className="d-flex align-items-center justify-content-center">
          <div className="page-icon pe-3">
            <i className="bi bi-stickies"></i>
          </div>
          <div className="page-title d-none d-md-block">
            <h5>Usuarios</h5>
          </div>
        </div>
      </div>

      {/* Lista de usuarios en tarjetas */}
      <div style={{ height: "calc(100vh - 66px)", overflowY: "auto" }}>
        <div className="container-fluid">
          <div className="row gx-3">
            {users.map(user => (
              <div key={user._id} className="col-sm-4 col-12">
                <div className="card card-cover rounded-2" style={{ backgroundImage: "url('/assets/images/food/default-bg.jpg')" }}>
                  <div className="contact-card">
                    {/* Botón de editar: además de setSelectedUser, removemos la clase 'was-validated' */}
                    <a
                      href="#"
                      className="edit-contact-card"
                      data-bs-toggle="modal"
                      data-bs-target="#editContact"
                      onClick={() => {
                        setSelectedUser(user);
                        const modalEl = document.getElementById("editContact");
                        if (modalEl) {
                          const formEl = modalEl.querySelector("form");
                          if (formEl) {
                            formEl.classList.remove("was-validated");
                          }
                        }
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </a>
                    <h5>{user.username}</h5>
                    <ul className="list-group">
                      <li className="list-group-item"><span>ID: </span>{user._id}</li>
                      <li className="list-group-item"><span>Username: </span>{user.username}</li>
                      <li className="list-group-item"><span>Email: </span>{user.email}</li>
                      <li className="list-group-item"><span>Admin: </span>{user.admin ? 'Sí' : 'No'}</li>
                    </ul>
                    <div style={{ marginTop: "10px" }}>
                      <button type="button" className="btn btn-danger" onClick={() => confirmDelete(user)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para editar / agregar usuario */}
      <div className="modal fade" id="editContact" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="editContactLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              <div className="modal-header">
                <h5 className="modal-title" id="editContactLabel">
                  {selectedUser && selectedUser._id ? "Editar Usuario" : "Agregar Usuario"}
                </h5>
                <button type="button" className="btn btn-close" data-bs-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true"></span>
                </button>
              </div>
              <div className="modal-body">
                {selectedUser && (
                  <>
                    <div className="row gx-3">
                      <div className="col-sm-6 col-12">
                        <div className="mb-3">
                          <label htmlFor="fullName" className="form-label">Username</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="fullName" 
                            value={selectedUser.username}
                            onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                            placeholder="Username"
                            tabIndex="1"
                            required
                            pattern="^[A-Za-z]+$"
                            title="El username solo puede contener letras"
                          />
                          <div className="invalid-feedback">
                            Por favor, ingresa un username válido (solo letras).
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6 col-12">
                        <div className="mb-3">
                          <label htmlFor="emailId" className="form-label">Email</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            id="emailId" 
                            value={selectedUser.email}
                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            placeholder="Email"
                            tabIndex="2"
                            required
                          />
                          <div className="invalid-feedback">
                            Por favor, ingresa un email válido.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row gx-3">
                      <div className="col-sm-6 col-12">
                        <div className="mb-3">
                          <label htmlFor="contactNumber" className="form-label">Contraseña</label>
                          <input 
                            type="password" 
                            className="form-control" 
                            id="contactNumber" 
                            value={selectedUser.password || ""}
                            onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                            placeholder="Contraseña"
                            tabIndex="3"
                            required
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$"
                            title="La contraseña debe tener entre 6 y 20 caracteres, contener al menos una mayúscula, una minúscula y un número"
                          />
                          <div className="invalid-feedback">
                            Por favor, ingresa una contraseña válida (6-20 caracteres, al menos una mayúscula, una minúscula y un número).
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6 col-12">
                        <div className="mb-3">
                          <label htmlFor="adminSelect" className="form-label">Admin</label>
                          <select 
                            id="adminSelect" 
                            className="form-select"
                            value={selectedUser.admin ? '1' : '0'}
                            onChange={(e) => setSelectedUser({ ...selectedUser, admin: e.target.value === '1' })}
                            tabIndex="4"
                          >
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-success">
                  {selectedUser && selectedUser._id ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <div className="modal fade" id="deleteConfirmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteConfirmModalLabel">Confirmar Eliminación</h5>
              <button type="button" className="btn btn-close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"></span>
              </button>
            </div>
            <div className="modal-body">
              {userToDelete && (
                <p>
                  ¿Estás seguro de que deseas eliminar el usuario <strong>{userToDelete.username}</strong>?
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirmed}>Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón “+” para agregar un nuevo usuario */}
      <button
        onClick={() => {
          // Reiniciamos los errores y establecemos un usuario vacío sin activar la validación
          setSelectedUser({ username: '', email: '', admin: false, password: '' });
          const modalEl = document.getElementById("editContact");
          if (modalEl) {
            const formEl = modalEl.querySelector("form");
            if (formEl) {
              formEl.classList.remove("was-validated");
            }
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
          } else {
            console.error("No se encontró el modal 'editContact'");
          }
        }}
        className="btn btn-primary rounded-circle"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          fontSize: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        +
      </button>
    </Layout>
  );
};

export default Users;
