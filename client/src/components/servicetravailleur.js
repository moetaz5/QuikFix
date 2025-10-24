import React, { useEffect, useState } from "react";
import axios from "axios";

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

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Mes Services</h2>

      {message && <p style={{ textAlign: "center", color: "gray" }}>{message}</p>}

      <div style={{ display: "grid", gap: "20px" }}>
        {services.map((service) => (
          <div
            key={service.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              backgroundColor:
                service.etat === "inactif" ? "#fff0f0" : "#f9f9f9",
              boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "5px 0" }}>{service.nomservice}</h3>
            <p style={{ margin: "5px 0", color: "#555" }}>
              <strong>Description :</strong> {service.description}
            </p>
            <p style={{ margin: "5px 0", color: "#888" }}>
              <strong>Ajouté le :</strong>{" "}
              {new Date(service.created_at).toLocaleDateString("fr-FR")}
            </p>

            {/* 🔴 Message si le service est inactif */}
            {service.etat === "inactif" && (
              <p
                style={{
                  color: "red",
                  fontWeight: "bold",
                  marginTop: "10px",
                  borderTop: "1px solid #ddd",
                  paddingTop: "8px",
                }}
              >
                ⚠️ Ce service a été désactivé par l’administrateur.
              </p>
            )}

            {/* 🟢 Affichage d’un avis s’il existe */}
            {service.avis && (
              <p style={{ margin: "5px 0", color: "green" }}>
                <strong>Avis client :</strong> {service.avis}
              </p>
            )}

            {/* État du service */}
            <p
              style={{
                color: service.etat === "actif" ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              État : {service.etat}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTravailleur;
