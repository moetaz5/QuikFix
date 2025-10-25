import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import "./ServiceTravailleur.css";

const ServiceTravailleur = () => {
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Veuillez vous connecter pour voir vos services.");
          return;
        }

        const res = await axios.get("http://localhost:5000/myservices", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.length === 0) {
          setMessage("Vous n'avez encore ajouté aucun service.");
        } else {
          setServices(res.data);
        }
      } catch (err) {
        console.error(err);
        setMessage(
          err.response?.data?.message || "Erreur lors du chargement des services"
        );
      }
    };

    fetchServices();
  }, []);

  const renderEtat = (etat) => {
    if (etat === "actif") {
      return (
        <span className="etat-actif">
          <CheckCircle size={18} style={{ marginRight: "5px" }} /> Actif
        </span>
      );
    } else if (etat === "inactif") {
      return (
        <span className="etat-inactif">
          <XCircle size={18} style={{ marginRight: "5px" }} /> Inactif
        </span>
      );
    } else {
      return (
        <span className="etat-alert">
          <AlertCircle size={18} style={{ marginRight: "5px" }} /> {etat}
        </span>
      );
    }
  };

  return (
    <div className="service-container">
      <h2>
        <ClipboardList size={24} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Mes Services
      </h2>

      {message && <p className="service-message">{message}</p>}

      <div className="service-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`service-card ${service.etat === "inactif" ? "inactif" : ""}`}
          >
            <h3>{service.nomservice}</h3>
            <p>
              <strong>Description :</strong> {service.description}
            </p>
            <p>
              <strong>Ajouté le :</strong>{" "}
              {new Date(service.created_at).toLocaleDateString("fr-FR")}
            </p>

            {service.etat === "inactif" && (
              <p className="service-alert">
                ⚠️ Ce service a été désactivé par l’administrateur.
              </p>
            )}

            {service.avis && (
              <p className="service-avis">
                <strong>Avis client :</strong> {service.avis}
              </p>
            )}

            <p className="service-etat">{renderEtat(service.etat)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTravailleur;
