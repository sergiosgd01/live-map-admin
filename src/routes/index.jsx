import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GoogleMapsProvider from "../components/GoogleMapsProvider";
import Home from "../pages/Home";
import Users from "../pages/user/Users";
import EditUser from "../pages/user/EditUser";
import AddUser from "../pages/user/AddUser";

import Organizations from "../pages/organization/Organizations";
import EditOrganization from "../pages/organization/EditOrganization";
import AddOrganization from "../pages/organization/AddOrganization";

import Events from "../pages/event/Events";
import EditEvent from "../pages/event/EditEvent";
import AddEvent from "../pages/event/AddEvent";
import EditRoutePage from "../pages/event/route/EditRoutePage";
import EditLocationPage from "../pages/event/location/EditLocationPage";
import EditServicePage from "../pages/event/service/EditServicePage";
import GetLocations from "../pages/event/location/GetLocations";
import AddServiceType from "../pages/event/service/AddServiceType";
import ServiceTypeList from "../pages/event/service/ServiceTypeList"; 

const AppRoutes = () => (
  <GoogleMapsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id/edit" element={<EditUser />} />
        <Route path="/users/add" element={<AddUser />} />

        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id/edit" element={<EditOrganization />} />
        <Route path="/organizations/add" element={<AddOrganization />} />

        <Route path="/organizations/:organizationCode/events" element={<Events />} />
        <Route path="/events/:id/edit" element={<EditEvent />} />
        <Route path="/organizations/:organizationCode/add-event" element={<AddEvent />} />
        <Route path="/events/:id/locations" element={<GetLocations />} />
        <Route path="/events/:id/edit-route" element={<EditRoutePage />} />
        <Route path="/events/:id/edit-location" element={<EditLocationPage />} />
        <Route path="/events/:id/edit-service" element={<EditServicePage />} />
        <Route path="/services" element={<ServiceTypeList />} /> 
        <Route path="/services/add-type" element={<AddServiceType />} />
      </Routes>
    </Router>
  </GoogleMapsProvider>
);

export default AppRoutes;
