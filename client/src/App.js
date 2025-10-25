import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./components/AuthContext";

import LoginComponent from "./components/login";
import RegisterComponent from "./components/register";
import Dashboard from "./components/dashboard";
import Profil from "./components/profil";
import AjouterService from "./components/ajouterservice";
import ServiceTravailleur from "./components/servicetravailleur";
import ServiceClient from "./components/ServiceClient";
import ServiceAdmin from "./components/serviceadmin";
import Demande from "./components/Demande";
import DemandeClient from "./components/demandeclient";
import DemandeTravailleur from "./components/DemandeTravailleur";
import DemandeAdmin from "./components/DemandeAdmin";
import ConversationsList from "./components/ConversationsList";
import ChatBox from "./components/ChatBox";





function App() {
  const { token, role } = useContext(AuthContext);

  // 🧩 Cas 1 : pas encore connecté → accès limité
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<RegisterComponent />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 🧩 Cas 2 : connecté → redirection selon le rôle
  return (
    <Routes>
      <Route
        path="/"
        element={
          role === "admin"
            ? <Navigate to="/dashboard/admin" replace />
            : role === "travailleur"
            ? <Navigate to="/dashboard/travailleur" replace />
            : <Navigate to="/dashboard/client" replace />
        }
      />

      {/* 🔹 Routes principales sous le dashboard */}
      <Route path="/dashboard" element={<Dashboard />}>
        {/* ✅ Accessible à tous les rôles */}
        <Route path="profil" element={<Profil />} />
        <Route path="Demande" element={<Demande />} />

        {/* 🔸 ADMIN */}
        {role === "admin" && (
          <>
            <Route path="ServiceAdmin" element={<ServiceAdmin />} />
            <Route path="DemandeAdmin" element={<DemandeAdmin />} />

          </>
        )}

        {/* 🔸 CLIENT */}
        {role === "client" && (
          <>
            <Route path="ServiceClient" element={<ServiceClient />} />
            <Route path="ajouterservice" element={<AjouterService />} />
            {/* ✅ Affiche la page Demande spécifique après clic sur un service */}
            <Route path="demande/:id" element={<Demande />} />
            <Route path="demandeclient" element={<DemandeClient />} />
            <Route path="ConversationsList" element={<ConversationsList />} />
            <Route path="ChatBox" element={<ChatBox />} />



          </>
        )}

        {/* 🔸 TRAVAILLEUR */}
        {role === "travailleur" && (
          <>
            <Route path="ServiceTravailleur" element={<ServiceTravailleur />} />
            <Route path="ajouterservice" element={<AjouterService />} />
            <Route path="DemandeTravailleur" element={<DemandeTravailleur />} />
            <Route path="ConversationsList" element={<ConversationsList />} />
            <Route path="ChatBox" element={<ChatBox />} />
          </>
        )}

        {/* 🔹 Redirection par défaut */}
        <Route path="*" element={<Navigate to="/dashboard/profil" replace />} />
      </Route>

      {/* Sécurité : toute autre route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
