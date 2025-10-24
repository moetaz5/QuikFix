import React, { useEffect, useState } from "react";
import axios from "axios";

const ServiceAdmin = () => {
  const [services, setServices] = useState([]);
  const [editService, setEditService] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors du chargement des services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ✅ Modifier service
  const handleEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/services/${id}`,
        {
          nomservice: editService.nomservice,
          description: editService.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditService(null);
      fetchServices();
      setMessage("✅ Service modifié avec succès !");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la modification");
    }
  };

  // 🚫 Activer / Désactiver
  const toggleEtat = async (id, etatActuel) => {
    const nouveauEtat = etatActuel === "actif" ? "inactif" : "actif";
    try {
      await axios.put(
        `http://localhost:5000/admin/services/${id}/etat`,
        { etat: nouveauEtat },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices();
      setMessage(`✅ Service ${nouveauEtat === "actif" ? "activé" : "désactivé"} avec succès`);
    } catch (err) {
      console.error(err);
      setMessage("Erreur changement d'état");
    }
  };

  // 🗑️ Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce service ?")) return;

    try {
      await axios.delete(`http://localhost:5000/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
      setMessage("🗑️ Service supprimé avec succès !");
    } catch (err) {
      console.error(err);
      setMessage("Erreur suppression service");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "50px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Gestion des Services</h2>

      {message && (
        <p style={{ textAlign: "center", color: "green", fontWeight: "bold" }}>{message}</p>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
            <th>ID</th>
            <th>Travailleur</th>
            <th>Nom du service</th>
            <th>Description</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.id}</td>
              <td>{service.nom_travailleur}</td>
              <td>
                {editService?.id === service.id ? (
                  <input
                    type="text"
                    value={editService.nomservice}
                    onChange={(e) =>
                      setEditService({ ...editService, nomservice: e.target.value })
                    }
                  />
                ) : (
                  service.nomservice
                )}
              </td>
              <td>
                {editService?.id === service.id ? (
                  <textarea
                    value={editService.description}
                    onChange={(e) =>
                      setEditService({ ...editService, description: e.target.value })
                    }
                  />
                ) : (
                  service.description
                )}
              </td>
              <td
                style={{
                  color: service.etat === "actif" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {service.etat}
              </td>
              <td>
                {editService?.id === service.id ? (
                  <>
                    <button
                      onClick={() => handleEdit(service.id)}
                      style={{ marginRight: "5px" }}
                    >
                      ✅ Enregistrer
                    </button>
                    <button onClick={() => setEditService(null)}>❌ Annuler</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditService(service)}
                      style={{ marginRight: "5px" }}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => toggleEtat(service.id, service.etat)}
                      style={{ marginRight: "5px" }}
                    >
                      {service.etat === "actif" ? "🚫 Désactiver" : "✅ Activer"}
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      style={{ color: "red" }}
                    >
                      🗑️ Supprimer
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceAdmin;
