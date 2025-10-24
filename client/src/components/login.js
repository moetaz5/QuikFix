import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./style.css";

const LoginComponent = () => {
  const { setToken, setRole } = useContext(AuthContext); // ✅ récupérer setRole du contexte
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      console.log("Réponse serveur login:", res.data);

      if (res.data?.token && res.data?.role) {
        // ✅ Enregistrer le token et le rôle
        setToken(res.data.token);
        setRole(res.data.role);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        // ✅ Redirection vers le dashboard
        navigate("/dashboard");
      } else {
        setError("Aucun token ou rôle reçu du serveur");
      }
    } catch (err) {
      console.error("Erreur login axios:", err);
      const msg = err.response?.data?.message || "Erreur serveur";
      setError(msg);
    }
  };

  return (
    <div className="container">
      <h1>Connexion</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="primary" type="submit">
          Se connecter
        </button>
      </form>
      <p>
        Pas de compte ? <a href="/register">Inscrivez-vous</a>
      </p>
    </div>
  );
};

export default LoginComponent;
