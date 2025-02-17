import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addServiceType } from "../../../services/serviceTypeService";

const AddServiceType = () => {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState({ name: "", image: "" });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setServiceType({ ...serviceType, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!serviceType.name || serviceType.name.trim() === "") {
      newErrors.name = "El nombre no puede estar vacío.";
    }

    if (!serviceType.image || !serviceType.image.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/)) {
      newErrors.image = "Debe ser una URL válida de imagen (terminada en jpg, jpeg, png, webp o gif).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Por favor, corrija los errores antes de continuar.");
      return;
    }

    try {
      await addServiceType(serviceType);
      alert("Tipo de servicio creado exitosamente.");
      navigate(-1);
    } catch (err) {
      console.error("Error al crear el tipo de servicio:", err);
      alert("Error al crear el tipo de servicio: " + err.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Crear Tipo de Servicio</h1>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left", width: "60%" }}>
        <label>
          Nombre:
          <input
            type="text"
            value={serviceType.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            style={{ width: "100%" }}
          />
          {errors.name && <p style={{ color: "red", margin: 0 }}>{errors.name}</p>}
        </label>
        <br />
        <label>
          Imagen (URL):
          <input
            type="text"
            value={serviceType.image}
            onChange={(e) => handleInputChange("image", e.target.value)}
            style={{ width: "100%" }}
          />
          {errors.image && <p style={{ color: "red", margin: 0 }}>{errors.image}</p>}
        </label>
        <br />
        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Crear Tipo de Servicio
        </button>
      </form>
    </div>
  );
};

export default AddServiceType;
