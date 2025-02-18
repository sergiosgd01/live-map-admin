import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  fetchDevicesByEventCode, 
  deleteDeviceById, 
  updateDevice 
} from "../../../services/deviceService";
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { SketchPicker } from "react-color";

const Device = () => {
  const { eventCode } = useParams();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  // Estado para el dispositivo que se va a editar y los errores de validación
  const [selectedDeviceForEdit, setSelectedDeviceForEdit] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  // Cargar dispositivos asociados al eventCode
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const data = await fetchDevicesByEventCode(eventCode);
        setDevices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDevices();
  }, [eventCode]);

  // Auto-ocultar alertas después de 3 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Manejo de eliminación: se invoca cuando se confirma en el modal
  const handleDelete = async () => {
    if (deviceToDelete) {
      try {
        await deleteDeviceById(deviceToDelete._id);
        setDevices(devices.filter((d) => d._id !== deviceToDelete._id));
        setAlert({ type: "success", message: "Dispositivo eliminado correctamente." });
        setDeviceToDelete(null);
      } catch (err) {
        setAlert({ type: "danger", message: "Error al eliminar el dispositivo: " + err.message });
      }
    }
  };

  // Manejo del envío del formulario de edición con validación inline
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedDeviceForEdit) {
      let errors = {};
      if (!selectedDeviceForEdit.name || selectedDeviceForEdit.name.trim() === "") {
        errors.name = "El nombre es obligatorio.";
      }
      if (!selectedDeviceForEdit.order || isNaN(selectedDeviceForEdit.order)) {
        errors.order = "El orden es obligatorio y debe ser un número.";
      }
      if (!selectedDeviceForEdit.color || selectedDeviceForEdit.color.trim() === "") {
        errors.color = "El color es obligatorio.";
      }
      if (Object.keys(errors).length > 0) {
        setEditErrors(errors);
        return;
      } else {
        setEditErrors({});
      }
      try {
        await updateDevice(
          selectedDeviceForEdit.deviceID,
          selectedDeviceForEdit.eventCode,
          selectedDeviceForEdit
        );
        setDevices(devices.map(d => 
          d._id === selectedDeviceForEdit._id ? selectedDeviceForEdit : d
        ));
        setAlert({ type: "success", message: "Dispositivo actualizado correctamente." });
        // Cerrar el modal
        const modalEl = document.getElementById("editDeviceModal");
        if (modalEl) {
          const modal = window.bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
        setSelectedDeviceForEdit(null);
      } catch (err) {
        setAlert({ type: "danger", message: "Error al actualizar el dispositivo: " + err.message });
      }
    }
  };

  return (
    <LocalHeaderLayout title="Administrar Dispositivos">
      <div className="content-wrapper" style={{ padding: "20px" }}>
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-center mt-5 text-danger">Error: {error}</p>
        ) : (
          <div className="card mt-3">
            <div className="card-body">
              <table className="table table-striped table-bordered w-100">
                <thead className="table-dark text-center">
                  <tr>
                    <th className="fw-bold">Nombre</th>
                    <th className="fw-bold">Order</th>
                    <th className="fw-bold">Color</th>
                    <th className="fw-bold">ID</th>
                    <th className="fw-bold">Código del Evento</th>
                    <th className="fw-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-center align-middle">
                  {devices.map((device) => (
                    <tr key={device._id}>
                      <td className="fw-bold">{device.name}</td>
                      <td className="fw-bold">{device.order}</td>
                      <td>
                        <span
                          style={{
                            backgroundColor: device.color,
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color: "#fff",
                          }}
                        >
                          {device.color}
                        </span>
                      </td>
                      <td>{device.deviceID}</td>
                      <td>{device.eventCode}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedDeviceForEdit(device);
                            setEditErrors({});
                            const modalEl = document.getElementById("editDeviceModal");
                            if (modalEl) {
                              const formEl = modalEl.querySelector("form");
                              if (formEl) formEl.classList.remove("was-validated");
                              const modal = new window.bootstrap.Modal(modalEl);
                              modal.show();
                            } else {
                              console.error("No se encontró el modal 'editDeviceModal'");
                            }
                          }}
                          className="btn btn-primary"
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            marginRight: "10px",
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => setDeviceToDelete(device)}
                          className="btn btn-danger"
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deviceToDelete && (
                <ConfirmationModal
                  id="deleteDeviceModal"
                  title="Confirmar Eliminación"
                  message={`¿Estás seguro de que deseas eliminar el dispositivo "${deviceToDelete.name}"?`}
                  onConfirm={handleDelete}
                  onCancel={() => setDeviceToDelete(null)}
                  extraContent={null}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para editar / agregar dispositivo */}
      <div
        className="modal fade"
        id="editDeviceModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="editDeviceModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={handleEditSubmit} className="needs-validation" noValidate>
              <div className="modal-header">
                <h5 className="modal-title" id="editDeviceModalLabel">
                  {selectedDeviceForEdit && selectedDeviceForEdit._id ? "Editar Dispositivo" : "Agregar Dispositivo"}
                </h5>
                <button
                  type="button"
                  className="btn btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedDeviceForEdit && (
                  <div className="row">
                    {/* Columna Izquierda */}
                    <div className="col-12 col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="deviceName" className="form-label">
                          Nombre
                        </label>
                        <input
                          type="text"
                          className={`form-control ${editErrors.name ? "is-invalid" : ""}`}
                          id="deviceName"
                          value={selectedDeviceForEdit.name}
                          onChange={(e) =>
                            setSelectedDeviceForEdit({
                              ...selectedDeviceForEdit,
                              name: e.target.value,
                            })
                          }
                          placeholder="Nombre del dispositivo"
                          required
                        />
                        {editErrors.name && <div className="invalid-feedback">{editErrors.name}</div>}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="deviceOrder" className="form-label">
                          Order
                        </label>
                        <input
                          type="number"
                          className={`form-control ${editErrors.order ? "is-invalid" : ""}`}
                          id="deviceOrder"
                          value={selectedDeviceForEdit.order}
                          onChange={(e) =>
                            setSelectedDeviceForEdit({
                              ...selectedDeviceForEdit,
                              order: e.target.value,
                            })
                          }
                          placeholder="Orden del dispositivo"
                          required
                        />
                        {editErrors.order && <div className="invalid-feedback">{editErrors.order}</div>}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="deviceIcon" className="form-label">
                          Icon URL
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="deviceIcon"
                          value={selectedDeviceForEdit.icon || ""}
                          onChange={(e) =>
                            setSelectedDeviceForEdit({
                              ...selectedDeviceForEdit,
                              icon: e.target.value,
                            })
                          }
                          placeholder="URL del icono"
                        />
                      </div>
                    </div>
                    {/* Columna Derecha */}
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Color</label>
                        <SketchPicker
                          color={selectedDeviceForEdit.color || "#000000"}
                          onChangeComplete={(color) =>
                            setSelectedDeviceForEdit({
                              ...selectedDeviceForEdit,
                              color: color.hex,
                            })
                          }
                          width="250px"
                        />
                        {editErrors.color && <div className="invalid-feedback d-block">{editErrors.color}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  {selectedDeviceForEdit && selectedDeviceForEdit._id ? "Guardar Cambios" : "Crear Dispositivo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LocalHeaderLayout>
  );
};

export default Device;
