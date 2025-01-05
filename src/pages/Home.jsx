import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>Página Principal</h1>
    <div>
      <Link to="/users">
        <button style={{ margin: '10px', padding: '10px 20px' }}>Usuarios</button>
      </Link>
      <Link to="/organizations">
        <button style={{ margin: '10px', padding: '10px 20px' }}>Organizaciones</button>
      </Link>
    </div>
  </div>
);

export default Home;
