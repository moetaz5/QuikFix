import React, { useState } from "react";
import axios from "axios";
import { PlusCircle } from "lucide-react";
import "./AjouterService.css";

const AjouterService = () => {
  const [nomservice, setNomService] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/addservice",
        { nomservice, description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);
      setNomService("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l’ajout du service");
    }
  };

  return (
    <div className="ajouter-service-container">
      <h2>
        <PlusCircle size={24} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Ajouter un service
      </h2>

      <form onSubmit={handleSubmit} className="ajouter-service-form">
        <div className="form-group">
          <label>Nom du service :</label>
          <input
            type="text"
            value={nomservice}
            onChange={(e) => setNomService(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-ajouter">
          Ajouter
        </button>
      </form>

      {message && <p className="message-success">{message}</p>}
      {error && <p className="message-error">{error}</p>}
    </div>
  );
};

export default AjouterService;
