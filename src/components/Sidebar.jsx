// src/components/Sidebar.jsx
import React from 'react';

const Sidebar = () => {
  return (
    <nav className="sidebar-wrapper">
      {/* Aquí va el contenido completo de la barra lateral */}
      <div className="sidebar-custom-nav">
        <a href="support.html">
          <i className="bi bi-headset"></i>
          <span>Support</span>
        </a>
        <a href="subscribers.html">
          <i className="bi bi-bar-chart-line"></i>
          <span>Subscribers</span>
        </a>
        <a href="account-settings.html">
          <i className="bi bi-gear"></i>
          <span>Settings</span>
        </a>
        <a href="invoice-list.html">
          <i className="bi bi-graph-up-arrow"></i>
          <span>Invoices</span>
        </a>
      </div>
      <div className="sidebar-menu">
        <div className="sidebarMenuScroll">
          <ul>
            {/* Aquí se incluyen los items del menú */}
            <li className="sidebar-dropdown">
              <a href="#">
                <i className="bi bi-house"></i>
                <span className="menu-text">Dashboards</span>
              </a>
              <div className="sidebar-submenu">
                <ul>
                  <li><a href="index.html">Analytics</a></li>
                  <li><a href="dashboard2.html">Sales</a></li>
                  <li><a href="dashboard3.html">CRM</a></li>
                  <li><a href="dashboard4.html">Projects</a></li>
                  <li><a href="dashboard5.html">Statistics</a></li>
                </ul>
              </div>
            </li>
            {/* Agrega el resto de elementos del menú */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
