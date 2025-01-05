import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GoogleMapsProvider from "../components/GoogleMapsProvider";
import Home from "../pages/Home";
import Users from "../pages/Users";
import EditUser from "../pages/EditUser";
import Organizations from "../pages/Organizations";
import Events from "../pages/Events";
import EditEvent from "../pages/EditEvent";
import EditRoutePage from "../pages/EditRoutePage";
import EditLocationPage from "../pages/EditLocationPage";
import EditServicePage from "../pages/EditServicePage";
import GetLocations from "../pages/GetLocations";

const AppRoutes = () => (
  <GoogleMapsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id/edit" element={<EditUser />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route
          path="/organizations/:organizationCode/events"
          element={<Events />}
        />
        <Route path="/events/:id/edit" element={<EditEvent />} />
        <Route path="/events/:id/locations" element={<GetLocations />} />
        <Route path="/events/:id/edit-route" element={<EditRoutePage />} />
        <Route path="/events/:id/edit-location" element={<EditLocationPage />} />
        <Route path="/events/:id/edit-service" element={<EditServicePage />} />
      </Routes>
    </Router>
  </GoogleMapsProvider>
);

export default AppRoutes;
