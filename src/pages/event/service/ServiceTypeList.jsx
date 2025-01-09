import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchServiceTypes, deleteServiceType } from "../../../services/serviceTypeService";

const ServiceTypeList = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este tipo de servicio?")) {
      try {
        await deleteServiceType(id);
        alert("Tipo de servicio eliminado exitosamente.");
        setServiceTypes(serviceTypes.filter((type) => type._id !== id));
      } catch (err) {
        console.error("Error al eliminar el tipo de servicio:", err);
        alert("Error al eliminar el tipo de servicio.");
      }
    }
  };

  if (loading) return <p>Cargando tipos de servicios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Administrar Tipos de Servicios</h1>
      <button
        onClick={() => navigate("/services/add-type")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Insertar Nuevo Tipo de Servicio
      </button>
      <table style={{ margin: "0 auto", border: "1px solid black", width: "80%" }}>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Nombre</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {serviceTypes.map((type) => (
            <tr key={type._id}>
              <td>{type.type}</td>
              <td>{type.name}</td>
              <td>
                <img src={type.image} alt={type.name} style={{ width: "50px", height: "50px" }} />
              </td>
              <td>
                <button
                  onClick={() => handleDelete(type._id)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTypeList;
