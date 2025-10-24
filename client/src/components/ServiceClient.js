import React, { useEffect, useState } from "react";
import axios from "axios";

const ServiceClient = () => {
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/allservices");

        if (res.data.length === 0) {
          setMessage("Aucun service disponible pour le moment.");
        } else {
          setServices(res.data);
        }
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement des services");
      }
    };

    fetchAllServices();
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "50px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Liste des services disponibles</h2>

      {message && <p style={{ textAlign: "center", color: "gray" }}>{message}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {services.map((service) => (
          <div
            key={service.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: "8px" }}>{service.nomservice}</h3>
            <p style={{ margin: "5px 0", color: "#555" }}>
              <strong>Travailleur :</strong> {service.nom_travailleur}
            </p>
            <p style={{ margin: "5px 0", color: "#555" }}>
              <strong>Description :</strong> {service.description}
            </p>
            <p style={{ margin: "5px 0", color: "#888" }}>
              <strong>Date :</strong>{" "}
              {new Date(service.created_at).toLocaleDateString("fr-FR")}
            </p>
            {service.avis ? (
              <p style={{ color: "green", marginTop: "5px" }}>
                <strong>Avis client :</strong> {service.avis}
              </p>
            ) : (
              <p style={{ color: "gray", fontStyle: "italic", marginTop: "5px" }}>
                Aucun avis pour le moment
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceClient;
