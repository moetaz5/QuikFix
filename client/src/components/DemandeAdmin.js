import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import { CheckCircle, XCircle, Clock, ClipboardList } from "lucide-react";
import "./DemandeAdmin.css";

const DemandeAdmin = () => {
  const { token } = useContext(AuthContext);
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/demandes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemandes(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes", error);
    }
  };

  const handleEtatChange = async (id, newEtat) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/demandes/${id}`,
        { etat: newEtat },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDemandes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, etat: newEtat } : d))
      );
    } catch (error) {
      console.error("Erreur modification état :", error);
    }
  };

  const renderEtat = (etat) => {
    if (!etat) etat = "en attente";
    const e = etat.toLowerCase();

    if (e === "acceptée" || e === "acceptee") {
      return (
        <span className="etat-acceptee">
          <CheckCircle size={16} style={{ marginRight: "5px" }} />
          Acceptée
        </span>
      );
    } else if (e === "refusée" || e === "refusee") {
      return (
        <span className="etat-refusee">
          <XCircle size={16} style={{ marginRight: "5px" }} />
          Refusée
        </span>
      );
    } else {
      return (
        <span className="etat-enattente">
          <Clock size={16} style={{ marginRight: "5px" }} />
          En attente
        </span>
      );
    }
  };

  return (
    <div className="demande-admin-container">
      <h2>
        <ClipboardList size={24} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Demandes clients
      </h2>

      {demandes.length === 0 ? (
        <p className="demande-message">Aucune demande pour le moment.</p>
      ) : (
        <table className="demande-admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Travailleur</th>
              <th>Service</th>
              <th>Description</th>
              <th>État</th>
              <th>Modifier État</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((demande) => (
              <tr key={demande.id}>
                <td>{demande.id}</td>
                <td>{demande.nom_client}</td>
                <td>{demande.nom_travailleur}</td>
                <td>{demande.nomservice}</td>
                <td>{demande.description}</td>
                <td>{renderEtat(demande.etat)}</td>
                <td>
                  <select
                    value={demande.etat || "en_attente"}
                    onChange={(e) =>
                      handleEtatChange(demande.id, e.target.value)
                    }
                    className="etat-select"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="acceptée">Acceptée</option>
                    <option value="refusée">Refusée</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DemandeAdmin;
