// PanelDeBotones.jsx
import React from 'react';

const EditPanel = ({
  title,
  mode,
  setMode,
  handleInsertPoints,
  handleDeleteSelectedPoints,
  setShowDeleteAllModal,
}) => {
  return (
    <div
      className="card shadow rounded"
      style={{
        position: 'absolute',
        left: '10px',
        bottom: '10px',
        zIndex: 9999,
        width: '340px',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="card-header text-center"
        style={{
          backgroundColor: '#fff',
          borderRadius: '0.25rem 0.25rem 0 0',
          padding: '0.5rem 1rem',
        }}
      >
        <h5 className="mb-0">{title}</h5>
      </div>

      <div
        className="card-body"
        style={{
          overflowY: 'auto',
          flex: 1,
          padding: '0.5rem 1rem',
        }}
      >
        <div className="d-flex justify-content-between mb-2">
          <button
            onClick={() => {
              console.log(`Botón 'Insertar Puntos' clicado en ${title}`);
              setMode((prev) => (prev === 'insert' ? '' : 'insert'));
            }}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, marginRight: '5px' }}
          >
            {mode === 'insert' ? 'Cancelar Inserción' : 'Insertar Puntos'}
          </button>

          <button
            onClick={() => {
              console.log(`Botón 'Eliminar Puntos' clicado en ${title}`);
              setMode((prev) => (prev === 'delete' ? '' : 'delete'));
            }}
            className="btn btn-danger btn-sm"
            style={{ flex: 1, marginLeft: '5px' }}
          >
            {mode === 'delete' ? 'Cancelar Eliminación' : 'Eliminar Puntos'}
          </button>
        </div>

        <button
          onClick={() => {
            console.log(`Botón 'Eliminar Todas' clicado en ${title}`);
            setShowDeleteAllModal(true);
          }}
          className="btn btn-danger btn-sm w-100"
        >
          Eliminar Todas
        </button>
      </div>

      <div
        className="card-footer text-center"
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #e0e0e0',
          padding: '0.5rem 1rem',
        }}
      >
        {mode === 'insert' && (
          <button
            onClick={handleInsertPoints}
            className="btn btn-success btn-sm w-100"
          >
            Confirmar Inserción
          </button>
        )}
        {mode === 'delete' && (
          <button
            onClick={handleDeleteSelectedPoints}
            className="btn btn-success btn-sm w-100"
          >
            Confirmar Eliminación
          </button>
        )}
      </div>
    </div>
  );
};

export default EditPanel;
