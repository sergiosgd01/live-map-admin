// src/components/Layout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />
      <div className="main-container">
        {children}
      </div>
    </div>
  );
};

export default Layout;
