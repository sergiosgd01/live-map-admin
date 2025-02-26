import React, { useEffect, useState } from "react";
import { fetchAllUsers, deleteUser, updateUser, addUser } from "../../services/userService";
import LocalHeaderLayout from "../../components/LocalHeaderLayout";
import Alert from "../../components/Alert";
import Spinner from "../../components/Spinner"; // Importa el Spinner
import ConfirmationModal from "../../components/ConfirmationModal"; // Importa el ConfirmationModal
import FloatingAddButton from "../../components/FloatingAddButton"; // Importa el botón extraído
import { fetchOrganizations } from '../../services/organizationService';

const Users = () => {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [alert, setAlert] = useState(null);

  const breadcrumbs = [
    { label: "Usuarios", path: "" }
  ];

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations(); // Necesitarás importar esta función
        setOrganizations(data);
      } catch (err) {
        setAlert({ type: 'danger', message: err.message });
      }
    };
    loadOrganizations();
  }, []);

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
        await deleteUser(userToDelete.id); // Cambiado de _id a id
        setUsers(users.filter(user => user.id !== userToDelete.id)); // Cambiado de _id a id
        setUserToDelete(null);
        setAlert({ type: 'success', message: 'Usuario eliminado correctamente' });
      } catch (err) {
        setAlert({ type: 'danger', message: `Error al eliminar el usuario: ${err.message}` });
      }
    }
  };

  // Modificamos la función que maneja la selección del usuario a editar
  const editUser = (user) => {
    setSelectedUser({
      ...user,
      password: '', // Seteamos el password vacío al cargar el usuario
      adminOf: user.adminOf.map(org => ({
        id: org._id || org.id,
        name: org.name
      }))
    });
    const modalEl = document.getElementById("editContact");
    if (modalEl) {
      const formEl = modalEl.querySelector("form");
      if (formEl) {
        formEl.classList.remove("was-validated");
      }
    }
  };
  // Modificamos el handleSubmit para manejar el caso del password
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Si hay contraseña, validar que cumpla con el patrón
    if (selectedUser.password) {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/;
      if (!passwordPattern.test(selectedUser.password)) {
        setAlert({ 
          type: 'danger', 
          message: 'La contraseña debe cumplir con los requisitos de formato' 
        });
        return;
      }
    }
  
    // Para nuevos usuarios, la contraseña es obligatoria
    if (!selectedUser.id && !selectedUser.password) {
      setAlert({ 
        type: 'danger', 
        message: 'La contraseña es obligatoria para nuevos usuarios' 
      });
      return;
    }
  
    // Validación del resto del formulario
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }
  
    const modalEl = document.getElementById("editContact");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    
    try {
      if (selectedUser.id) {
        // Actualizar usuario existente
        const userDataToUpdate = {
          username: selectedUser.username,
          email: selectedUser.email,
          isSuperAdmin: selectedUser.isSuperAdmin,
          adminOf: selectedUser.adminOf?.map(org => org.id) || []
        };
        
        // Solo incluir password si se ha introducido uno nuevo
        if (selectedUser.password) {
          userDataToUpdate.password = selectedUser.password;
        }
        
        const response = await updateUser(selectedUser.id, userDataToUpdate);
        setUsers(users.map(u => u.id === selectedUser.id ? response.user : u));
        setAlert({ type: 'success', message: 'Usuario actualizado correctamente' });
        if (modal) modal.hide();
      } else {
        // Crear nuevo usuario
        const newUserData = {
          username: selectedUser.username,
          email: selectedUser.email,
          password: selectedUser.password, // Aquí la contraseña es obligatoria
          isSuperAdmin: selectedUser.isSuperAdmin || false,
          adminOf: selectedUser.adminOf?.map(org => org.id) || []
        };
  
        const response = await addUser(newUserData);
        const updatedUsers = await fetchAllUsers();
        setUsers(updatedUsers);
        setAlert({ type: 'success', message: 'Usuario creado correctamente' });
        if (modal) modal.hide();
      }
    } catch (err) {
      setAlert({ 
        type: 'danger', 
        message: `Error al ${selectedUser.id ? 'actualizar' : 'crear'} el usuario: ${err.message}` 
      });
    }
  };

  if (loading) return <Spinner />;

  return (
    <LocalHeaderLayout breadcrumbs={breadcrumbs}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      
      {/* Lista de usuarios en tarjetas */}
      <div className="content-wrapper" style={{ padding: '20px', paddingBottom: '50px' }}>
        <div className="row gx-3 justify-content-center align-items-stretch">
          {users.map(user => (
            <div key={user.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
              <div className="card card-cover rounded-2" style={{ backgroundImage: "url('/assets/images/food/default-bg.jpg')" }}>
                <div className="contact-card">
                  <a
                    href="#"
                    className="edit-contact-card"
                    data-bs-toggle="modal"
                    data-bs-target="#editContact"
                    onClick={() => editUser(user)}
                  >
                    <i className="bi bi-pencil"></i>
                  </a>
                  <h5>{user.username}</h5>
                  <ul className="list-group">
                    <li className="list-group-item"><span>ID: </span>{user.id}</li>
                    <li className="list-group-item"><span>Username: </span>{user.username}</li>
                    <li className="list-group-item"><span>Email: </span>{user.email}</li>
                    <li className="list-group-item">
                      <span>Permisos: </span>
                      {user.isSuperAdmin ? 'Super Admin' : 'Usuario Normal'}
                    </li>
                    {user.adminOf && user.adminOf.length > 0 && (
                      <li className="list-group-item">
                        <span>Administra: </span>
                        {user.adminOf.map(org => org.name).join(', ')}
                      </li>
                    )}
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
                  {selectedUser && selectedUser.id ? "Editar Usuario" : "Agregar Usuario"}
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
                          <label htmlFor="username" className="form-label">Username</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="username" 
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
                          <label htmlFor="email" className="form-label">Email</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
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
                          <label htmlFor="password" className="form-label">
                            {selectedUser.id ? "Contraseña (dejar vacío para mantener la actual)" : "Contraseña"}
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={selectedUser.password}
                            onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                            placeholder={selectedUser.id ? "Nueva contraseña (opcional)" : "Contraseña"}
                            required={!selectedUser.id} // Solo requerido si es nuevo usuario
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$"
                            title="La contraseña debe tener entre 6 y 20 caracteres, contener al menos una mayúscula, una minúscula y un número"
                          />
                          <div className="invalid-feedback">
                            {selectedUser.id 
                              ? "Si desea cambiar la contraseña, debe cumplir con el formato requerido"
                              : "La contraseña debe tener entre 6 y 20 caracteres, contener al menos una mayúscula, una minúscula y un número"
                            }
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="mb-3">
                          <label htmlFor="isSuperAdmin" className="form-label">Super Admin</label>
                          <select 
                            id="isSuperAdmin" 
                            className="form-select"
                            value={selectedUser.isSuperAdmin ? '1' : '0'}
                            onChange={(e) => setSelectedUser({ 
                              ...selectedUser, 
                              isSuperAdmin: e.target.value === '1' 
                            })}
                          >
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="row gx-3">
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">Organizaciones que administra</label>
                          <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
  {organizations?.map(org => (
    <div key={org.id} className="form-check mb-2">
      <input
        type="checkbox"
        className="form-check-input"
        id={`org-${org.id}`}
        checked={selectedUser.adminOf?.some(selected => selected.id === org._id)}
        onChange={(e) => {
          const isChecked = e.target.checked;
          setSelectedUser(prev => {
            const currentAdminOf = prev.adminOf || [];
            if (isChecked) {
              // Añadir la organización si no está ya en la lista
              if (!currentAdminOf.some(item => item.id === org._id)) {
                return {
                  ...prev,
                  adminOf: [...currentAdminOf, { id: org._id, name: org.name }]
                };
              }
            } else {
              // Remover la organización si está desmarcada
              return {
                ...prev,
                adminOf: currentAdminOf.filter(item => item.id !== org._id)
              };
            }
            return prev;
          });
        }}
      />
      <label className="form-check-label" htmlFor={`org-${org.id}`}>
        {org.name}
      </label>
    </div>
  ))}
</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-success">
                  {selectedUser && selectedUser.id ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
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

      {/* Botón para agregar nuevo usuario */}
      <FloatingAddButton
        onClick={() => {
          setSelectedUser({ 
            username: '', 
            email: '', 
            password: '',
            isSuperAdmin: false,
            adminOf: []
          });
          const modalEl = document.getElementById("editContact");
          if (modalEl) {
            const formEl = modalEl.querySelector("form");
            if (formEl) {
              formEl.classList.remove("was-validated");
            }
            const modal = new window.bootstrap.Modal(modalEl);
            modal.show();
          }
        }}
      />
    </LocalHeaderLayout>
  );
};

export default Users;
