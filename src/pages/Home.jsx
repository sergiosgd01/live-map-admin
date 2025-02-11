import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';

const cardHeight = '300px'; // Ajusta este valor según tu diseño

const Home = () => {
  return (
    <>      
      <Layout>
        <div className="content-wrapper-scroll">
          <div className="content-wrapper">
            {/* Sección superior: fondo azul */}
            <div className="hero-header shade-primary"></div>

            {/* Sección inferior: fondo blanco con cartas centradas */}
            <div className="hero-body" style={{ minHeight: '50vh' }}>
              {/* Contenedor para centrar vertical y horizontalmente */}
              <div className="d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
                <div className="container">
                  <div className="row justify-content-center align-items-stretch">
                    
                    {/* Tarjeta Usuarios */}
                    <div className="col-12 col-md-6 col-lg-5 mb-4">
                      <a 
                        href="/users" 
                        className="tile-link d-flex flex-column align-items-center text-center rounded-2 p-5"
                        style={{ height: cardHeight }}
                      >
                        <div 
                          className="icon-container" 
                          style={{ width: '80px', height: '80px' }}
                        >
                          <img 
                            src="assets/images/users.svg" 
                            alt="Admin Dashboards" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            className="img-fluid"
                          />
                        </div>
                        <div 
                          className="content mt-3 d-flex flex-column justify-content-center w-100"
                          style={{ flex: 1 }}
                        >
                          <h5 className="fw-bold fs-2 mb-2">Usuarios</h5>
                          <p 
                            className="fs-5 mb-0"
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis' /*, whiteSpace: 'nowrap' si solo quieres una línea */ }}
                          >
                            Gestiona los usuarios
                          </p>
                        </div>
                      </a>
                    </div>
                    
                    {/* Tarjeta Organizaciones */}
                    <div className="col-12 col-md-6 col-lg-5 mb-4">
                      <a 
                        href="/organizations" 
                        className="tile-link d-flex flex-column align-items-center text-center rounded-2 p-5"
                        style={{ height: cardHeight }}
                      >
                        <div 
                          className="icon-container" 
                          style={{ width: '80px', height: '80px' }}
                        >
                          <img 
                            src="assets/images/group.svg" 
                            alt="Admin Dashboards" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            className="img-fluid"
                          />
                        </div>
                        <div 
                          className="content mt-3 d-flex flex-column justify-content-center w-100"
                          style={{ flex: 1 }}
                        >
                          <h5 className="fw-bold fs-2 mb-2">Organizaciones</h5>
                          <p 
                            className="fs-5 mb-0"
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            Gestiona las organizaciones
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
