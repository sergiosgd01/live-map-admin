import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GoogleMapsProvider from "../components/GoogleMapsProvider";

import Home from "../pages/Home";

import Users from "../pages/user/Users";

import Organizations from "../pages/organization/Organizations";

import Events from "../pages/event/Events";

import RoutePage from "../pages/event/route/RoutePage";
import EditRoutePage from "../pages/event/route/EditRoutePage";

import LocationPage from "../pages/event/location/LocationPage";
import EditLocationPage from "../pages/event/location/EditLocationPage";

import RawLocations_ from "../pages/event/location/RawLocations_";

import ServicePage from "../pages/event/service/ServicePage";

import AddServiceType from "../pages/event/service/AddServiceType";
import ServiceTypeList from "../pages/event/service/ServiceTypeList";

import Device from "../pages/event/device/Device";
import EditDevice from "../pages/event/device/EditDevice";

const AppRoutes = () => (
  <GoogleMapsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/users" element={<Users />} />

        <Route path="/organizations" element={<Organizations />} />

        <Route path="/organizations/:organizationCode/events" element={<Events />} />

        <Route path="/events/:eventCode/route" element={<RoutePage />} />
        <Route path="/events/:eventCode/route/:deviceID/edit" element={<EditRoutePage />} />

        <Route path="/events/:eventCode/location" element={<LocationPage />} />
        <Route path="/events/:eventCode/location/:deviceID/edit" element={<EditLocationPage />} />

        <Route path="/events/:eventCode/raw-locations" element={<RawLocations_ />} />

        <Route path="/events/:eventCode/service" element={<ServicePage />} />

        <Route path="/services" element={<ServiceTypeList />} />
        <Route path="/services/add-type" element={<AddServiceType />} />

        <Route path="/events/:eventCode/devices" element={<Device />} />
        <Route path="/devices/:deviceId/:eventCode/edit" element={<EditDevice />} />
      </Routes>
    </Router>
  </GoogleMapsProvider>
);

export default AppRoutes;