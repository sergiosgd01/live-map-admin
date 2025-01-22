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
import EventDetails from "../pages/event/EventDetails";
import EditEvent from "../pages/event/EditEvent";
import AddEvent from "../pages/event/AddEvent";

import RoutePage from "../pages/event/route/RoutePage";
import EditRoutePage from "../pages/event/route/EditRoutePage";
import LocationPage from "../pages/event/location/LocationPage";
import EditLocationPage from "../pages/event/location/EditLocationPage";
import RawLocations from "../pages/event/location/RawLocations";

import EditServicePage from "../pages/event/service/EditServicePage";
import Device from "../pages/event/device/Device";
import EditDevice from "../pages/event/device/EditDevice";
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
        <Route path="/events/:eventCode" element={<EventDetails />} />
        <Route path="/events/:eventCode/edit" element={<EditEvent />} />
        <Route path="/organizations/:organizationCode/add-event" element={<AddEvent />} />

        <Route path="/events/:eventCode/route" element={<RoutePage />} />
        <Route path="/events/:eventCode/route/:deviceID/edit" element={<EditRoutePage />} />
        <Route path="/events/:eventCode/location" element={<LocationPage />} />
        <Route path="/events/:eventCode/location/:deviceID/edit" element={<EditLocationPage />} />
        <Route path="/events/:eventCode/raw-locations" element={<RawLocations />} />

        <Route path="/events/:eventCode/edit-service" element={<EditServicePage />} />
        <Route path="/events/:eventCode/devices" element={<Device />} />
        <Route path="/devices/:deviceId/:eventCode/edit" element={<EditDevice />} />

        <Route path="/services" element={<ServiceTypeList />} />
        <Route path="/services/add-type" element={<AddServiceType />} />
      </Routes>
    </Router>
  </GoogleMapsProvider>
);

export default AppRoutes;