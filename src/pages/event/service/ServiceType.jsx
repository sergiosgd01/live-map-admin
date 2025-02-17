import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchServiceTypes, deleteServiceType, addServiceType } from "../../../services/serviceTypeService";
import ConfirmationModal from "../../../components/ConfirmationModal";
import Layout from "../../../components/Layout";
import Alert from "../../../components/Alert";

const ServiceType = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServiceType, setNewServiceType] = useState({ name: "", image: "" });
  const [addErrors, setAddErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // Cargar la lista de tipos
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const types = await fetchServiceTypes();
        setServiceTypes(types);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadServiceTypes();
  }, []);

  // Autooculta las alertas después de 3 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleDelete = async (id) => {
    try {
      await deleteServiceType(id);
      setAlert({ type: "success", message: "Tipo de servicio eliminado exitosamente." });
      setServiceTypes(serviceTypes.filter((type) => type._id !== id));
    } catch (err) {
      console.error("Error al eliminar el tipo de servicio:", err);
      setAlert({ type: "danger", message: "Error al eliminar el tipo de servicio." });
    }
  };

  // Manejo de cambios en el formulario del modal de agregar
  const handleAddInputChange = (field, value) => {
    setNewServiceType({ ...newServiceType, [field]: value });
    setAddErrors({ ...addErrors, [field]: "" });
  };

  // Validación del formulario de agregar
  const validateAddForm = () => {
    const errors = {};
    if (!newServiceType.name || newServiceType.name.trim() === "") {
      errors.name = "El nombre no puede estar vacío.";
    }
    if (
      !newServiceType.image ||
      !newServiceType.image.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/)
    ) {
      errors.image = "Debe ser una URL válida de imagen (terminada en jpg, jpeg, png, webp o gif).";
    }
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envío del formulario del modal de agregar
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) {
      setAlert({ type: "warning", message: "Por favor, corrija los errores antes de continuar." });
      return;
    }
    try {
      await addServiceType(newServiceType);
      setAlert({ type: "success", message: "Tipo de servicio creado exitosamente." });
      const types = await fetchServiceTypes();
      setServiceTypes(types);
      setShowAddModal(false);
      setNewServiceType({ name: "", image: "" });
    } catch (err) {
      console.error("Error al crear el tipo de servicio:", err);
      setAlert({ type: "danger", message: "Error al crear el tipo de servicio: " + err.message });
    }
  };

  return (
    <Layout>
      {/* Bloque de estilos para el botón de eliminar */}
      <style>{`
        .delete-btn {
          background-color: #dc3545;
          border: none;
          color: #fff;
          width: clamp(30px, 5vw, 50px);
          height: clamp(30px, 5vw, 50px);
          font-size: clamp(16px, 2vw, 24px);
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .delete-btn:hover {
          background-color: #c82333;
          transform: scale(1.1);
        }
      `}</style>

      <div className="content-wrapper">
        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        )}
        <div className="row gx-3">
          <div className="col-sm-12">
            <div className="card mt-3">
              <div className="card-header text-center">
                <div 
                  className="card-title fw-bold" 
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)" }}
                >
                  Administrar Tipos de Servicios
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <p className="text-center mt-5">Cargando tipos de servicios...</p>
                ) : error ? (
                  <p className="text-center mt-5 text-danger">Error: {error}</p>
                ) : (
                  <>
                    <table className="table table-striped table-bordered w-100">
                      <thead className="table-dark text-center">
                        <tr>
                          <th className="fw-bold" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>Tipo</th>
                          <th className="fw-bold" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>Nombre</th>
                          <th className="fw-bold" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>Imagen</th>
                          <th className="fw-bold" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="text-center align-middle" style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)" }}>
                        {serviceTypes.map((type) => (
                          <tr key={type._id}>
                            <td className="fw-bold">{type.type}</td>
                            <td className="fw-bold">{type.name}</td>
                            <td>
                              <img
                                src={type.image}
                                alt={type.name}
                                style={{ width: "clamp(30px, 5vw, 50px)", height: "clamp(30px, 5vw, 50px)" }}
                              />
                            </td>
                            <td>
                              <button
                                onClick={() => setTypeToDelete(type)}
                                className="delete-btn"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {typeToDelete && (
                      <ConfirmationModal
                        id="deleteTypeModal"
                        title="Confirmar eliminación"
                        message={`¿Estás seguro de que deseas eliminar el tipo de servicio "${typeToDelete.name}"? Ten en cuenta que podrían existir eventos asociados a este servicio.`}
                        onConfirm={async () => {
                          setTypeToDelete(null);
                          await handleDelete(typeToDelete._id);
                        }}
                        onCancel={() => setTypeToDelete(null)}
                        extraContent={null}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón circular para abrir el modal de agregar nuevo tipo de servicio */}
      <button
        onClick={() => setShowAddModal(true)}
        className="btn btn-primary rounded-circle"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "clamp(30px, 5vw, 50px)",
          height: "clamp(30px, 5vw, 50px)",
          fontSize: "clamp(16px, 2vw, 24px)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}
      >
        +
      </button>

      {/* Modal para agregar un nuevo tipo de servicio */}
      {showAddModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            id="addServiceTypeModal"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="addServiceTypeModalLabel"
            aria-hidden="true"
            role="dialog"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content">
                <form onSubmit={handleAddSubmit} className="needs-validation" noValidate>
                  <div className="modal-header">
                    <h5 
                      className="modal-title fw-bold" 
                      id="addServiceTypeModalLabel" 
                      style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)" }}
                    >
                      Agregar Tipo de Servicio
                    </h5>
                    <button
                      type="button"
                      className="btn btn-close"
                      onClick={() => setShowAddModal(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                    <div className="mb-3">
                      <label htmlFor="serviceTypeName" className="form-label fw-bold" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>
                        Nombre
                      </label>
                      <input
                        type="text"
                        className={`form-control ${addErrors.name ? "is-invalid" : ""}`}
                        id="serviceTypeName"
                        value={newServiceType.name}
                        onChange={(e) => handleAddInputChange("name", e.target.value)}
                        placeholder="Nombre del tipo de servicio"
                        required
                        style={{ fontWeight: "bold" }}
                      />
                      {addErrors.name && (
                        <div className="invalid-feedback">{addErrors.name}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="serviceTypeImage" className="form-label fw-bold" style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}>
                        Imagen (URL)
                      </label>
                      <input
                        type="text"
                        className={`form-control ${addErrors.image ? "is-invalid" : ""}`}
                        id="serviceTypeImage"
                        value={newServiceType.image}
                        onChange={(e) => handleAddInputChange("image", e.target.value)}
                        placeholder="URL de la imagen"
                        required
                        style={{ fontWeight: "bold" }}
                      />
                      {addErrors.image && (
                        <div className="invalid-feedback">{addErrors.image}</div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-success">
                      Crear Tipo de Servicio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </Layout>
  );
};

export default ServiceType;
