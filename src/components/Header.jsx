// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="header">
    <div className="page-header">
      {/* Sidebar brand starts */}
      <div className="brand">
        <Link to="/" className="logo">
          <img src="/assets/images/liveMap.svg" className="d-none d-md-block me-4" alt="Admin Dashboards" />
          <img src="/assets/images/liveMap-sm.svg" className="d-block d-md-none me-4" alt="Admin Dashboards" />
        </Link>
      </div>
      {/* Sidebar brand ends */}
      <div className="toggle-sidebar" id="toggle-sidebar">
        <i className="bi bi-list"></i>
      </div>
      {/* Header actions container */}
      <div className="header-actions-container">
        {/* Search container */}
        <div className="search-container me-4 d-xl-block d-lg-none">
          <div className="input-group">
            <input type="text" className="form-control" id="searchAny" placeholder="Search" />
            <button className="btn btn-outline-secondary" type="button">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
        {/* Header actions */}
        <div className="header-actions d-xl-flex d-lg-none gap-4">
          <div className="dropdown">
            <a className="dropdown-toggle" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="bi bi-envelope-open fs-5 lh-1"></i>
              <span className="count-label">9</span>
            </a>
            <div className="dropdown-menu dropdown-menu-end shadow-lg">
              {/* Aquí se listan las notificaciones */}
              <div className="dropdown-item">
                <div className="d-flex py-2 border-bottom">
                  <img src="/assets/images/user.png" className="img-3x me-3 rounded-3" alt="Admin Dashboards" />
                  <div className="m-0">
                    <h6 className="mb-1 fw-semibold">Sophie Michiels</h6>
                    <p className="mb-1">Membership has been ended.</p>
                    <p className="small m-0 text-secondary">Today, 07:30pm</p>
                  </div>
                </div>
              </div>
              {/* ... otros items */}
              <div className="d-grid mx-3 my-1">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    // Aquí puedes agregar la lógica que necesites
                  }}
                >
                  View all
                </button>
              </div>
            </div>
          </div>
          <a
            href="account-settings.html"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            data-bs-custom-class="custom-tooltip-blue"
            data-bs-title="Settings"
          >
            <i className="bi bi-gear font-1xx"></i>
          </a>
        </div>
        {/* Header profile */}
        <div className="header-profile d-flex align-items-center">
          <div className="dropdown">
            <a href="#" id="userSettings" className="user-settings" data-toggle="dropdown" aria-haspopup="true">
              <span className="user-name d-none d-md-block">Michelle White</span>
              <span className="avatar">
                <img src="/assets/images/user2.png" alt="Admin Templates" />
                <span className="status online"></span>
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="userSettings">
              <div className="header-profile-actions">
                <a href="profile.html">Profile</a>
                <a href="account-settings.html">Settings</a>
                <a href="login.html">Logout</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Header;
