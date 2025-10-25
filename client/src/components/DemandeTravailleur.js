import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { ClipboardList, CheckCircle, XCircle, Clock, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import "./DemandeTravailleur.css";

function DemandeTravailleur() {
  const { token } = useContext(AuthContext);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDemandes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/travailleur/demandes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemandes(res.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDemandes();
  }, [token]);

  const handleEtat = async (id, etat) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous vraiment ${etat === "acceptee" ? "accepter" : "refuser"} cette demande ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `http://localhost:5000/travailleur/demandes/${id}`,
          { etat },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDemandes((prev) =>
          prev.map((d) => (d.id === id ? { ...d, etat } : d))
        );
        Swal.fire("Succès", `Demande ${etat === "acceptee" ? "acceptée" : "refusée"} !`, "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Erreur", "Impossible de mettre à jour la demande", "error");
      }
    }
  };

  const renderEtat = (etat) => {
    if (!etat) etat = "en attente";
    const e = etat.toLowerCase();

    if (e === "acceptee") {
      return (
        <span className="etat-acceptee">
          <CheckCircle size={18} style={{ marginRight: "5px" }} /> Acceptée
        </span>
      );
    } else if (e === "refusee") {
      return (
        <span className="etat-refusee">
          <XCircle size={18} style={{ marginRight: "5px" }} /> Refusée
        </span>
      );
    } else {
      return (
        <span className="etat-enattente">
          <Clock size={18} style={{ marginRight: "5px" }} /> En attente
        </span>
      );
    }
  };

  if (loading) return <p className="demande-message">Chargement des demandes...</p>;
  if (error) return <p className="demande-message">{error}</p>;

  return (
    <div className="demande-container">
      <h2>
        <ClipboardList size={24} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Demandes reçues
      </h2>

      {demandes.length === 0 ? (
        <p className="demande-message">Aucune demande pour le moment.</p>
      ) : (
        <table className="demande-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Nom du service</th>
              <th>Description</th>
              <th>Date</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nom_client}</td>
                <td>{d.nomservice}</td>
                <td>{d.description}</td>
                <td>{new Date(d.created_at).toLocaleString()}</td>
                <td>{renderEtat(d.etat)}</td>
                <td className="actions-buttons">
                  <button
                    onClick={() => handleEtat(d.id, "acceptee")}
                    className="btn-accepter"
                  >
                    <Check size={16} style={{ marginRight: "4px" }} /> Accepter
                  </button>
                  <button
                    onClick={() => handleEtat(d.id, "refusee")}
                    className="btn-refuser"
                  >
                    <X size={16} style={{ marginRight: "4px" }} /> Refuser
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DemandeTravailleur;
