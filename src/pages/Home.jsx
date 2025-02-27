import React from 'react';
import Layout from '../components/Layout';

const cardHeight = '400px';

const Home = () => {
  return (
    <>      
      <Layout>
        <div className="content-wrapper-scroll">
          <div className="content-wrapper">
            {/* Sección superior: fondo azul */}
            <div className="hero-header shade-primary"></div>

            {/* Sección inferior: fondo blanco con cartas centradas */}
            <div className="hero-body" style={{ minHeight: '70vh' }}>
              <div className="d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
                <div className="container">
                  <div className="row justify-content-center align-items-stretch g-4">
                    
                    {/* Tarjeta Usuarios - Ajustamos el tamaño de columna */}
                    <div className="col-12 col-md-8 col-lg-6 mb-4">
                    <a 
                        href="/organizations" 
                        className="tile-link d-flex flex-column align-items-center text-center rounded-2 p-5"
                        style={{ 
                          height: cardHeight,
                          transition: 'transform 0.3s ease',
                          ':hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <div 
                          className="icon-container" 
                          style={{ width: '120px', height: '120px' }}
                        >
                          <img 
                            src="assets/images/group.svg" 
                            alt="Admin Dashboards" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            className="img-fluid"
                          />
                        </div>
                        <div 
                          className="content mt-4 d-flex flex-column justify-content-center w-100"
                          style={{ flex: 1 }}
                        >
                          <h5 className="fw-bold fs-1 mb-3">Organizaciones</h5>
                          <p 
                            className="fs-4 mb-0"
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            Gestiona las organizaciones
                          </p>
                        </div>
                      </a>
                    </div>
                    
                    {/* Tarjeta Organizaciones - Ajustamos el tamaño de columna */}
                    <div className="col-12 col-md-8 col-lg-6 mb-4">
                    <a 
                        href="/users" 
                        className="tile-link d-flex flex-column align-items-center text-center rounded-2 p-5"
                        style={{ 
                          height: cardHeight,
                          transition: 'transform 0.3s ease',
                          ':hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <div 
                          className="icon-container" 
                          style={{ width: '120px', height: '120px' }}
                        >
                          <img 
                            src="assets/images/users.svg" 
                            alt="Admin Dashboards" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            className="img-fluid"
                          />
                        </div>
                        <div 
                          className="content mt-4 d-flex flex-column justify-content-center w-100"
                          style={{ flex: 1 }}
                        >
                          <h5 className="fw-bold fs-1 mb-3">Usuarios</h5>
                          <p 
                            className="fs-4 mb-0"
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            Gestiona los usuarios
                          </p>
                        </div>
                      </a>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
