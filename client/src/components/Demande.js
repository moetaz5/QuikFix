import React from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Demande.css";

const Demande = () => {
  const { state } = useLocation();
  const { service } = state || {};

  const handleDemande = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Veuillez vous connecter");

    try {
      const res = await axios.post(
        "http://localhost:5000/demande",
        { id_service: service.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’envoi de la demande");
    }
  };

  if (!service) return <p style={{ textAlign: "center", color: "gray", marginTop: "50px" }}>Aucun service sélectionné</p>;

  return (
    <div className="demande-container">
      <h2>Détails du service</h2>
      <div className="demande-card">
        <p><strong>Nom du service :</strong> {service.nomservice}</p>
        <p><strong>Description :</strong> {service.description}</p>
        <p><strong>Travailleur :</strong> {service.nom_travailleur}</p>
        <p><strong>Numéro :</strong> {service.telephone_travailleur || "Non disponible"}</p>
      </div>
      <button className="demande-button" onClick={handleDemande}>
        Envoyer une demande
      </button>
    </div>
  );
};

export default Demande;
