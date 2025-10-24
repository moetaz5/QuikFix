import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./style.css";

const RegisterComponent = () => {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cin: "",
    sexe: "",
    telephone: "",
    datn: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/register", formData);
      console.log("Réponse serveur register:", res.data);

      if (res.data?.token) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        setError("Aucun token reçu du serveur");
      }
    } catch (err) {
      console.error("Erreur register axios:", err);
      const msg = err.response?.data?.message || "Erreur serveur";
      setError(msg);
    }
  };

  return (
    <div className="container">
      <h1>Inscription</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <input name="name" placeholder="Nom complet" value={formData.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
        <input name="cin" placeholder="CIN" value={formData.cin} onChange={handleChange} required />
        <input name="sexe" placeholder="Sexe" value={formData.sexe} onChange={handleChange} />
        <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} />
        <input name="datn" type="date" placeholder="Date de naissance" value={formData.datn} onChange={handleChange} />
        <button className="primary" type="submit">S'inscrire</button>
      </form>
      <p>Déjà un compte ? <a href="/login">Connectez-vous</a></p>
    </div>
  );
};

export default RegisterComponent;
