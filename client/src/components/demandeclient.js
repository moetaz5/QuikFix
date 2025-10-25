import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { CheckCircle, XCircle, Clock, ClipboardList } from "lucide-react"; // ← ajout ClipboardList
import "./DemandeClient.css";

function DemandeClient() {
  const { token } = useContext(AuthContext);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/mesdemandes", {
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
    if (token) fetchDemandes();
  }, [token]);

  const renderEtat = (etat) => {
    if (!etat) etat = "en attente";
    const e = etat.toLowerCase();

    if (e === "acceptée" || e === "acceptee") {
      return (
        <span className="etat-acceptee">
          <CheckCircle size={20} style={{ marginRight: "5px" }} />
          Acceptée
        </span>
      );
    } else if (e === "refusée" || e === "refusee") {
      return (
        <span className="etat-refusee">
          <XCircle size={20} style={{ marginRight: "5px" }} />
          Refusée
        </span>
      );
    } else {
      return (
        <span className="etat-enattente">
          <Clock size={20} style={{ marginRight: "5px" }} />
          En attente
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
        Mes demandes
      </h2>

      {demandes.length === 0 ? (
        <p className="demande-message">Aucune demande trouvée.</p>
      ) : (
        <table className="demande-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom du service</th>
              <th>Description</th>
              <th>Date</th>
              <th>État</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nomservice}</td>
                <td>{d.description}</td>
                <td>{new Date(d.created_at).toLocaleString()}</td>
                <td>{renderEtat(d.etat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DemandeClient;
