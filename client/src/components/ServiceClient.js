import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ServiceClient.css";

const ServiceClient = () => {
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/allservices");
        if (res.data.length === 0) setMessage("Aucun service disponible");
        else setServices(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement des services");
      }
    };
    fetchAllServices();
  }, []);

  const handleClick = (service) => {
    navigate(`/dashboard/demande/${service.id}`, { state: { service } });
  };

  return (
    <div className="service-container">
      <h2>Liste des services disponibles</h2>
      {message && <p className="service-message">{message}</p>}

      <div className="service-list">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => handleClick(service)}
          >
            <h3>{service.nomservice}</h3>
            <p><strong>Travailleur :</strong> {service.nom_travailleur}</p>
            <p><strong>Description :</strong> {service.description}</p>
            <p className="date">
              {new Date(service.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceClient;
