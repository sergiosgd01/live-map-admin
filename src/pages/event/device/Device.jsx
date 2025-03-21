import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  fetchDevicesByEventCode, 
  deleteDeviceById, 
  updateDevice,
  createDevice // <-- Asegúrate de que createDevice exista en el service
} from "../../../services/deviceService";
import { fetchEventByCode } from "../../../services/eventService"; 
import LocalHeaderLayout from "../../../components/LocalHeaderLayout";
import Alert from "../../../components/Alert";
import Spinner from "../../../components/Spinner";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { SketchPicker } from "react-color";
import FloatingAddButton from "../../../components/FloatingAddButton";

const Device = () => {
  const { eventCode } = useParams();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [alert, setAlert] = useState(null);
  const [organizationCode, setOrganizationCode] = useState(''); 

  // Estado para el dispositivo que se va a editar/agregar y los errores de validación
  const [selectedDeviceForEdit, setSelectedDeviceForEdit] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const breadcrumbs = [
    { label: "Organizaciones", path: "/organizations" },
    { 
      label: "Eventos", 
      path: organizationCode ? `/organizations/${organizationCode}/events` : '#'
    },
    { label: "Dispositivos", path: "" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventData = await fetchEventByCode(eventCode);
        if (eventData && eventData.organizationCode) {
          setOrganizationCode(eventData.organizationCode);
        }
        const deviceData = await fetchDevicesByEventCode(eventCode);
        setDevices(deviceData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedDeviceForEdit) {
      let errors = {};
      if (!selectedDeviceForEdit.name || selectedDeviceForEdit.name.trim() === "") {
        errors.name = "El nombre es obligatorio.";
      }
      // Solo se valida "order" si se está editando, ya que en creación se asigna automáticamente
      if (selectedDeviceForEdit._id && (!selectedDeviceForEdit.order || isNaN(selectedDeviceForEdit.order))) {
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
        if (selectedDeviceForEdit._id) {
          // Modo edición
          await updateDevice(
            selectedDeviceForEdit.deviceID,
            selectedDeviceForEdit.eventCode,
            selectedDeviceForEdit
          );
          setDevices(devices.map(d => 
            d._id === selectedDeviceForEdit._id ? selectedDeviceForEdit : d
          ));
          setAlert({ type: "success", message: "Dispositivo actualizado correctamente." });
        } else {
          // Modo creación: eliminamos order para usar el valor autogenerado por el backend
          const deviceData = { ...selectedDeviceForEdit };
          delete deviceData.order;
          // Opcional: si deviceID es requerido, se puede asignar un valor o dejarlo null
          // deviceData.deviceID = deviceData.deviceID || null;
          const newDevice = await createDevice(deviceData);
          setDevices([...devices, newDevice]);
          setAlert({ type: "success", message: "Dispositivo creado correctamente." });
        }
        // Cerrar el modal
        const modalEl = document.getElementById("editDeviceModal");
        if (modalEl) {
          const modal = window.bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
        setSelectedDeviceForEdit(null);
      } catch (err) {
        const action = selectedDeviceForEdit._id ? "actualizar" : "crear";
        setAlert({ type: "danger", message: `Error al ${action} el dispositivo: ` + err.message });
      }
    }
  };

  const handleAdd = () => {
    setSelectedDeviceForEdit({
        name: "",
        deviceID: "DEVICE_" + Date.now(), // Agrega un valor único para deviceID
        order: "",
        color: "#000000",
        icon: "",
        eventCode: eventCode
    });
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
  };

  return (
    <LocalHeaderLayout breadcrumbs={breadcrumbs}>
      <div className="content-wrapper" style={{ padding: "50px" }}>
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
        ) : devices.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center my-5">
            <i className="bi bi-exclamation-circle text-muted fs-1 mb-3"></i>
            <p className="text-muted fs-5 m-0">
              No hay dispositivos registrados para este evento.
            </p>
          </div>
        ) : (
          <div className="card mt-3">
            <div className="card-body">
              <table className="table table-striped table-bordered w-100">
                <thead className="table-dark text-center">
                  <tr>
                    <th className="fw-bold">Nombre</th>
                    <th className="fw-bold">Order</th>
                    <th className="fw-bold">Color</th>
                    <th className="fw-bold">Icono</th>
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
                      <td>
                        {device.icon ? (
                          <img 
                            src={device.icon} 
                            alt="Icono" 
                            style={{ maxHeight: '30px', maxWidth: '30px' }} 
                          />
                        ) : (
                          <span className="text-muted">Sin icono</span>
                        )}
                      </td>
                      <td>{device.eventCode}</td>
                      <td>
                        <div className="d-flex flex-column flex-md-row justify-content-center">
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
                            className="btn btn-primary mb-2 mb-md-0 me-md-2"
                            style={{
                              padding: "5px 10px",
                              borderRadius: "5px",
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
                        </div>
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

      {/* Botón flotante para agregar dispositivo */}
      <FloatingAddButton onClick={handleAdd} />
    </LocalHeaderLayout>
  );
};

export default Device;