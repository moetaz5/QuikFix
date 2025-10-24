import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import "./profil.css";

const Profil = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [passwordData, setPasswordData] = useState({ newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🔹 Récupérer les infos du user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setProfileData({
          username: res.data.username,
          cin: res.data.cin,
          sexe: res.data.sexe,
          telephone: res.data.telephone,
          datn: res.data.datn?.slice(0, 10),
        });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Erreur serveur");
      }
    };
    fetchUser();
  }, [token]);

  // 🔹 Gestion modification profil
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    setMessage(""); setError("");
    try {
      const res = await axios.put("http://localhost:5000/update-profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setUser({ ...user, ...profileData });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur mise à jour profil");
    }
  };

  // 🔹 Changer mot de passe
  const handlePasswordChange = (e) => {
    setPasswordData({ newPassword: e.target.value });
  };

  const handlePasswordUpdate = async () => {
    setMessage(""); setError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/change-password",
        { email: user.email, newPassword: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setPasswordData({ newPassword: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur changement mot de passe");
    }
  };

  if (!user) return <p>Chargement du profil...</p>;

  return (
    <div className="profil-container">
      <h2>Mon Profil</h2>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="profil-card">
        <label>Nom :</label>
        <input name="username" value={profileData.username} onChange={handleProfileChange} />

        <label>CIN :</label>
        <input name="cin" value={profileData.cin} onChange={handleProfileChange} />

        <label>Sexe :</label>
        <input name="sexe" value={profileData.sexe} onChange={handleProfileChange} />

        <label>Téléphone :</label>
        <input name="telephone" value={profileData.telephone} onChange={handleProfileChange} />

        <label>Date de naissance :</label>
        <input type="date" name="datn" value={profileData.datn} onChange={handleProfileChange} />

        <button className="primary" onClick={handleProfileUpdate}>Mettre à jour profil</button>
      </div>

      <div className="profil-card">
        <h3>Changer le mot de passe</h3>
        <label>Nouveau mot de passe :</label>
        <input type="password" value={passwordData.newPassword} onChange={handlePasswordChange} />
        <button className="secondary" onClick={handlePasswordUpdate}>Changer mot de passe</button>
      </div>
    </div>
  );
};
export default Profil;
