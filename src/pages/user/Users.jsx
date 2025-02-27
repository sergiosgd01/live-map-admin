import React, { useEffect, useState } from "react";
import { fetchAllUsers, deleteUser, updateUser, addUser } from "../../services/userService";
import LocalHeaderLayout from "../../components/LocalHeaderLayout";
import Alert from "../../components/Alert";
import Spinner from "../../components/Spinner";
import ConfirmationModal from "../../components/ConfirmationModal";
import FloatingAddButton from "../../components/FloatingAddButton";
import { fetchOrganizations } from '../../services/organizationService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [alert, setAlert] = useState(null);
  // Nuevo estado para el ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const breadcrumbs = [
    { label: "Usuarios", path: "" }
  ];

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations();
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

  // Auto-ocultar alertas después de 3 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Confirmar eliminación
  const confirmDelete = (user) => {
    setUserToDelete(user);
  };

  // Ejecuta la eliminación cuando se confirma en el modal
  const handleDeleteConfirmed = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setUserToDelete(null);
        setAlert({ type: 'success', message: 'Usuario eliminado correctamente' });
      } catch (err) {
        setAlert({ type: 'danger', message: `Error al eliminar el usuario: ${err.message}` });
      }
    }
  };

  // Seleccionar un usuario para editar
  const editUser = (user) => {
    setSelectedUser({
      ...user,
      password: '',
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
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  // Nueva función para manejar el ordenamiento
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Función para obtener los usuarios ordenados
  const getSortedUsers = () => {
    if (!sortConfig.key) return users;

    return [...users].sort((a, b) => {
      // Manejar campos anidados como 'adminOf'
      if (sortConfig.key === 'adminOf') {
        const aValue = a.adminOf && a.adminOf.length > 0 ? a.adminOf.map(org => org.name).join(', ') : '';
        const bValue = b.adminOf && b.adminOf.length > 0 ? b.adminOf.map(org => org.name).join(', ') : '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }
      
      // Para cualquier otro campo
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Validar contraseña
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
  
    // Validación del formulario
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
        setUsers(users.map(u => u.id === selectedUser.id ? {
          ...response.user,
          id: response.user.id || response.user._id || selectedUser.id // Asegura que el ID se mantenga
        } : u));        
        setAlert({ type: 'success', message: 'Usuario actualizado correctamente' });
        if (modal) modal.hide();
      } else {
        // Crear nuevo usuario
        const newUserData = {
          username: selectedUser.username,
          email: selectedUser.email,
          password: selectedUser.password,
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

  // Componente para el encabezado de la columna ordenable
  const SortableHeader = ({ label, columnKey }) => {
    return (
      <th 
        className="fw-bold" 
        onClick={() => requestSort(columnKey)}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex justify-content-center align-items-center">
          {label}
          {sortConfig.key === columnKey && (
            <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill ms-1`}></i>
          )}
        </div>
      </th>
    );
  };

  if (loading) return <Spinner />;

  // Obtener los usuarios ordenados
  const sortedUsers = getSortedUsers();

  const getUserRole = (user) => {
    if (user.isSuperAdmin) {
      return { text: "Super Admin", color: "#dc3545" }; // Rojo
    } else if (user.adminOf && user.adminOf.length > 0) {
      return { text: "Administrador de Organización", color: "#007bff" }; // Azul
    } else {
      return { text: "Usuario Normal", color: "#6c757d" }; // Gris
    }
  };

  return (
    <LocalHeaderLayout breadcrumbs={breadcrumbs}>
      <div className="content-wrapper" style={{ paddingBottom: "50px" }}>
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        
        {error ? (
          <p className="text-center mt-5 text-danger">Error: {error}</p>
        ) : users.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center my-5">
            <i className="bi bi-exclamation-circle text-muted fs-1 mb-3"></i>
            <p className="text-muted fs-5 m-0">
              No hay usuarios registrados en el sistema.
            </p>
          </div>
        ) : (
          <div className="card mt-3">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table table-striped table-bordered w-100" style={{ borderRadius: "8px", overflow: "hidden" }}>
                <thead className="table-dark text-center">
                  <tr>
                    <SortableHeader label="Username" columnKey="username" />
                    <SortableHeader label="Email" columnKey="email" />
                    <SortableHeader label="Permisos" columnKey="isSuperAdmin" />
                    <SortableHeader label="Organizaciones" columnKey="adminOf" />
                    <th>Contraseña</th>
                    <th className="fw-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-center align-middle">
                  {sortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="fw-bold">{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        {(() => {
                          const { text, color } = getUserRole(user);
                          return (
                            <span
                              style={{
                                backgroundColor: color,
                                padding: "5px 10px",
                                borderRadius: "5px",
                                color: "#fff",
                              }}
                            >
                              {text}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        {user.adminOf && user.adminOf.length > 0 
                          ? user.adminOf.map(org => org.name).join(', ')
                          : <span className="text-muted">Ninguna</span>
                        }
                      </td>
                      <td>{user.password}</td>
                      <td>
                        <div className="d-flex flex-column flex-md-row justify-content-center">
                          <button
                            onClick={() => editUser(user)}
                            className="btn btn-primary mb-2 mb-md-0 me-md-2"
                            style={{
                              padding: "5px 10px",
                              borderRadius: "5px",
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => confirmDelete(user)}
                            className="btn btn-danger"
                            style={{
                              padding: "5px 10px",
                              borderRadius: "5px",
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
                <button type="button" className="btn btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                          />
                          <div className="invalid-feedback">
                            Por favor, ingresa un username.
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
                            required={!selectedUser.id}
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
                                        if (!currentAdminOf.some(item => item.id === org._id)) {
                                          return {
                                            ...prev,
                                            adminOf: [...currentAdminOf, { id: org._id, name: org.name }]
                                          };
                                        }
                                      } else {
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