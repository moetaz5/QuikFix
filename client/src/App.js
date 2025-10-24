import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./components/AuthContext";

import LoginComponent from "./components/login";
import RegisterComponent from "./components/register";
import Dashboard from "./components/dashboard";
import Profil from "./components/profil"; // ✅ importer le composant Profil
import AjouterService from "./components/ajouterservice";
import ServiceTravailleur from "./components/servicetravailleur";
import ServiceClient from "./components/ServiceClient";
import ServiceAdmin from "./components/serviceadmin";



function App() {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginComponent />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : <RegisterComponent />}
      />

      {/* 🔹 Dashboard avec routes enfants */}
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" replace />}>
        <Route path="profil" element={<Profil />} /> 
        <Route path="ajouterservice" element={<AjouterService />} /> 
        <Route path="servicetravailleur" element={<ServiceTravailleur />} />
        <Route path="ServiceClient" element={<ServiceClient />} />
        <Route path="serviceadmin" element={<ServiceAdmin />} />
        {/* Tu pourras ajouter d'autres routes enfants ici, ex: services, demandes, etc. */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
