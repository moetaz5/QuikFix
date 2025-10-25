import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import "./ServiceAdmin.css";

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

  const toggleEtat = async (id, etatActuel) => {
    const nouveauEtat = etatActuel === "actif" ? "inactif" : "actif";
    try {
      await axios.put(
        `http://localhost:5000/admin/services/${id}/etat`,
        { etat: nouveauEtat },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices();
      setMessage(
        `✅ Service ${nouveauEtat === "actif" ? "activé" : "désactivé"} avec succès`
      );
    } catch (err) {
      console.error(err);
      setMessage("Erreur changement d'état");
    }
  };

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
    <div className="service-admin-container">
      <h2>Gestion des Services</h2>

      {message && <p className="message">{message}</p>}

      <table className="service-admin-table">
        <thead>
          <tr>
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
              <td className={`etat ${service.etat}`}>
                {service.etat === "actif" ? (
                  <CheckCircle size={18} /> 
                ) : (
                  <XCircle size={18} />
                )}
                {service.etat}
              </td>
              <td className="actions">
                {editService?.id === service.id ? (
                  <>
                    <button onClick={() => handleEdit(service.id)} title="Enregistrer">
                      <Save size={16} />
                    </button>
                    <button onClick={() => setEditService(null)} title="Annuler">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditService(service)} title="Modifier">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleEtat(service.id, service.etat)}
                      title={service.etat === "actif" ? "Désactiver" : "Activer"}
                    >
                      {service.etat === "actif" ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                    </button>
                    <button onClick={() => handleDelete(service.id)} title="Supprimer" className="delete-btn">
                      <Trash2 size={16} />
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
