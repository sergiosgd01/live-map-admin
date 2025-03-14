import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ type, message, onClose }) => {
  // Función para definir las clases y el título según el tipo de alerta en español
  const getAlertProps = (type) => {
    switch (type) {
      case 'danger':
        return { className: 'box-bdr-red text-red', title: '¡Peligro!' };
      case 'success':
        return { className: 'box-bdr-green text-green', title: '¡Éxito!' };
      case 'warning':
        return { className: 'box-bdr-yellow text-yellow', title: '¡Advertencia!' };
      case 'info':
        return { className: 'box-bdr-blue text-blue', title: '¡Información!' };
      default:
        return { className: '', title: '' };
    }
  };

  const { className, title } = getAlertProps(type);

  // Estilos para el contenedor fijo que posiciona la alerta en la parte superior
  const fixedContainerStyle = {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1050,
    padding: '0 1rem',
    textAlign: 'center',
    maxWidth: '90%',
  };

  // Estilos para que el alert aparezca centrado y se ajuste el contenido
  const containerStyle = {
    backgroundColor: '#fff',
    padding: '15px 20px',
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  // Estilo para el contenido del alert (texto)
  const contentStyle = {
    flex: 1,
    marginRight: '10px',
    wordWrap: 'break-word',
  };

  // Estilo para el botón de cierre
  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    lineHeight: '1',
    cursor: 'pointer',
    color: '#000',
  };

  return (
    <div style={fixedContainerStyle}>
      <div style={containerStyle} className={`alert ${className} alert-dismissible fade show`} role="alert">
        <div style={contentStyle}>
          <strong>{title}</strong> {message}
        </div>
        <button
          type="button"
          style={closeButtonStyle}
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

Alert.propTypes = {
  // Tipos permitidos: 'danger', 'success', 'warning' o 'info'
  type: PropTypes.oneOf(['danger', 'success', 'warning', 'info']).isRequired,
  // Mensaje a mostrar
  message: PropTypes.string.isRequired,
  // Función opcional a ejecutar al cerrar la alerta
  onClose: PropTypes.func,
};

export default Alert;