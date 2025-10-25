import React, { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Wrench,
  MessageSquare,
  CreditCard,
  FileText,
  User,
  Users,
  BarChart2,
  Bell,
  LogOut,
  Star,
  Inbox
} from "lucide-react";
import { AuthContext } from "./AuthContext";
import "./dashboard.css";

const Dashboard = () => {
  const { logout, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">
      {/* 🔹 Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="brand">QuickFix</span>
          <p className="subtitle">Plateforme de Services</p>
        </div>

        <ul className="nav-menu">
          {/* 🔸 CLIENT */}
          {role === "client" && (
            <>
              <li><Link to="/dashboard/accueil"><Home size={18}/> Accueil</Link></li>
              <li><Link to="/dashboard/ServiceClient"><Wrench size={18}/> Services</Link></li>
              <li><Link to="/dashboard/demandeclient"><FileText size={18}/> Mes Demandes</Link></li>
              <li><Link to="/dashboard/ConversationsList"><MessageSquare size={18}/> Messagerie</Link></li>
              <li><Link to="/dashboard/paiement"><CreditCard size={18}/> Paiement</Link></li>
              <li><Link to="/dashboard/historique"><Inbox size={18}/> Historique</Link></li>
              <li><Link to="/dashboard/profil"><User size={18}/> Profil</Link></li>
            </>
          )}

          {/* 🔸 TRAVAILLEUR */}
          {role === "travailleur" && (
            <>
              <li><Link to="/dashboard/accueil"><Home size={18}/> Accueil</Link></li>
              <li><Link to="/dashboard/ServiceTravailleur"><Wrench size={18}/> Mes Services</Link></li>
              <li><Link to="/dashboard/ajouterservice"><Wrench size={18}/> Ajouter un service</Link></li>
              <li><Link to="/dashboard/DemandeTravailleur"><Inbox size={18}/> Demandes Reçues</Link></li>
              <li><Link to="/dashboard/ConversationsList"><MessageSquare size={18}/> Messagerie</Link></li>
              <li><Link to="/dashboard/mes-travaux"><FileText size={18}/> Mes Travaux</Link></li>
              <li><Link to="/dashboard/paiements"><CreditCard size={18}/> Paiements</Link></li>
              <li><Link to="/dashboard/avis"><Star size={18}/> Avis</Link></li>
              <li><Link to="/dashboard/profil"><User size={18}/> Profil</Link></li>
            </>
          )}

          {/* 🔸 ADMIN */}
          {role === "admin" && (
            <>
              <li><Link to="/dashboard/utilisateurs"><Users size={18}/> Utilisateurs</Link></li>
              <li><Link to="/dashboard/ServiceAdmin"><Wrench size={18}/> Gestion des Services</Link></li>
              <li><Link to="/dashboard/DemandeAdmin"><Inbox size={18}/> Gestion Des Demandes</Link></li>
              <li><Link to="/dashboard/paiements"><CreditCard size={18}/> Paiements</Link></li>
              <li><Link to="/dashboard/statistiques"><BarChart2 size={18}/> Statistiques</Link></li>
              <li><Link to="/dashboard/notifications"><Bell size={18}/> Notifications</Link></li>
              <li><Link to="/dashboard/profil"><User size={18}/> Profil Admin</Link></li>
            </>
          )}
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* 🔹 Contenu principal */}
      <main className="main-content">
        <header className="top-bar glass-top-bar">
          <div className="top-links">
            <span>AIDE</span>
            <span>FAQ</span>
            <span>SUPPORT</span>

            {/* Notifications */}
            <div className="notification-container">
              <Bell className="bell-icon" size={22} />
              <span className="notif-badge">3</span>
            </div>
          </div>
        </header>

        {/* ✅ Ici s’affichent toutes les pages enfants (ServiceClient, Demande, etc.) */}
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
