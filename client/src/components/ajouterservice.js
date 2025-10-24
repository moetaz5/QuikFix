import React, { useState } from "react";
import axios from "axios";

const AjouterService = () => {
  const [nomservice, setNomService] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // ✅ récupère le token JWT stocké après login

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
      setMessage(err.response?.data?.message || "Erreur lors de l’ajout du service");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2>Ajouter un service</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom du service :</label>
          <input
            type="text"
            value={nomservice}
            onChange={(e) => setNomService(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />
        </div>

        <div>
          <label>Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", height: "100px", margin: "10px 0" }}
          />
        </div>

        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px" }}>
          Ajouter
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", color: "green", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AjouterService;
