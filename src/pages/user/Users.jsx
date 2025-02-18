import React, { useEffect, useState } from "react";
import { fetchAllUsers, deleteUser, updateUser, addUser } from "../../services/userService";
import LocalHeaderLayout from "../../components/LocalHeaderLayout";
import Alert from "../../components/Alert";
import Spinner from "../../components/Spinner"; // Importa el Spinner
import ConfirmationModal from "../../components/ConfirmationModal"; // Importa el ConfirmationModal
import FloatingAddButton from "../../components/FloatingAddButton"; // Importa el botón extraído

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

  // Abre el modal de confirmación de eliminación (ahora simplemente estableciendo el usuario a eliminar)
  const confirmDelete = (user) => {
    setUserToDelete(user);
  };

  // Ejecuta la eliminación cuando se confirma en el modal
  const handleDeleteConfirmed = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete._id);
        setUsers(users.filter(user => user._id !== userToDelete._id));
        setUserToDelete(null);
      } catch (err) {
        setError(`Error al eliminar el usuario: ${err.message}`);
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
        setError(`Error al actualizar el usuario: ${err.message}`);
      }
    } else {
      try {
        await addUser(selectedUser);
        const data = await fetchAllUsers();
        setUsers(data);
        if (modal) modal.hide();
      } catch (err) {
        setError(`Error al crear el usuario: ${err.message}`);
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <LocalHeaderLayout title="Usuarios">
      {error && <Alert type="danger" message={`Error: ${error}`} onClose={() => setError(null)} />}
      
      {/* Lista de usuarios en tarjetas */}
      <div className="content-wrapper" style={{ padding: '20px', paddingBottom: '50px' }}>
        <div className="row gx-3 justify-content-center align-items-stretch">
          {users.map(user => (
            <div key={user._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
              <div className="card card-cover rounded-2" style={{ backgroundImage: "url('/assets/images/food/default-bg.jpg')" }}>
                <div className="contact-card">
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
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label htmlFor="fullName" className="form-label">Username</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="fullName" 
                            value={selectedUser.username}
                            onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                            placeholder="Username"
                            required
                            pattern="^[A-Za-z]+$"
                            title="El username solo puede contener letras"
                          />
                          <div className="invalid-feedback">
                            Por favor, ingresa un username válido (solo letras).
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label htmlFor="emailId" className="form-label">Email</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            id="emailId" 
                            value={selectedUser.email}
                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            placeholder="Email"
                            required
                          />
                          <div className="invalid-feedback">
                            Por favor, ingresa un email válido.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row gx-3">
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label htmlFor="contactNumber" className="form-label">Contraseña</label>
                          <input 
                            type="password" 
                            className="form-control" 
                            id="contactNumber" 
                            value={selectedUser.password || ""}
                            onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                            placeholder="Contraseña"
                            required
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$"
                            title="La contraseña debe tener entre 6 y 20 caracteres, contener al menos una mayúscula, una minúscula y un número"
                          />
                          <div className="invalid-feedback">
                            Por favor, ingresa una contraseña válida.
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label htmlFor="adminSelect" className="form-label">Admin</label>
                          <select 
                            id="adminSelect" 
                            className="form-select"
                            value={selectedUser.admin ? '1' : '0'}
                            onChange={(e) => setSelectedUser({ ...selectedUser, admin: e.target.value === '1' })}
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

      {/* Modal de confirmación de eliminación usando ConfirmationModal */}
      {userToDelete && (
        <ConfirmationModal 
          id="deleteConfirmModal"
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar el usuario ${userToDelete.username}?`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setUserToDelete(null)}
          extraContent={null}
        />
      )}

      {/* Botón “+” para agregar un nuevo usuario usando FloatingAddButton */}
      <FloatingAddButton
        onClick={() => {
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
      />
    </LocalHeaderLayout>
  );
};

export default Users;
