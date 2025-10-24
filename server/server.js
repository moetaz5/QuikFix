const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ROOT",
  database: "quicfix",
});

db.connect((err) => {
  if (err) return console.error("❌ Erreur DB :", err);
  console.log("✅ Connecté à MySQL");
});

// 🛡️ Middleware JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).send("Aucun token fourni");

  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.status(403).send("Token invalide");
    req.user = user;
    next();
  });
};

// 📝 INSCRIPTION (rôle par défaut = client)
app.post("/register", async (req, res) => {
  const { name, email, cin, password, sexe, telephone, datn } = req.body;

  if (!name || !email || !cin || !password) {
    return res.status(400).send({ message: "Champs requis manquants" });
  }

  db.query("SELECT * FROM users WHERE email = ? OR cin = ?", [email, cin], async (err, result) => {
    if (err) return res.status(500).send({ message: err.sqlMessage || "Erreur serveur" });
    if (result.length > 0) return res.status(400).send({ message: "Email ou CIN déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRole = "client"; // ✅ rôle par défaut

    db.query(
      "INSERT INTO users (name, email, password, cin, sexe, telephone, datn, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, cin, sexe, telephone, datn, defaultRole],
      (err) => {
        if (err) return res.status(500).send({ message: err.sqlMessage || "Erreur insertion" });

        // ✅ Générer token avec le rôle
        const token = jwt.sign({ email, cin, role: defaultRole }, "secretkey", { expiresIn: "1h" });
        return res.status(200).send({
          message: "Inscription réussie",
          token,
          role: defaultRole, // ✅ renvoyer aussi le rôle
        });
      }
    );
  });
});

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage || "Erreur serveur" });
    if (result.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    // ✅ token + role dans la réponse
    const token = jwt.sign(
      { userId: user.id, email: user.email, cin: user.cin, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      role: user.role, // ✅ renvoyer aussi le rôle
    });
  });
});

// ✏️ UPDATE PROFILE
app.put("/update-profile", authenticateToken, (req, res) => {
  const { username, cin, sexe, telephone, datn } = req.body;
  const userEmail = req.user.email;

  db.query(
    "UPDATE users SET name = ?, cin = ?, sexe = ?, telephone = ?, datn = ? WHERE email = ?",
    [username, cin, sexe, telephone, datn, userEmail],
    (err) => {
      if (err) {
        console.error("Erreur UPDATE:", err);
        return res.status(500).json({ message: err.sqlMessage || "Erreur de mise à jour" });
      }
      res.status(200).json({ message: "Profil mis à jour" });
    }
  );
});

// 🔑 CHANGE PASSWORD
app.post("/change-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (err) => {
      if (err) {
        console.error("Erreur UPDATE password:", err);
        return res.status(500).json({ message: err.sqlMessage || "Erreur mot de passe" });
      }
      res.status(200).json({ message: "Mot de passe changé" });
    });
  } catch (error) {
    console.error("Erreur bcrypt hash:", error);
    res.status(500).json({ message: "Erreur serveur lors du hashage" });
  }
});

// 👤 ROUTE /me (récupérer les infos de l'utilisateur connecté)
app.get("/me", authenticateToken, (req, res) => {
  const { email } = req.user;
  db.query(
    "SELECT id, name AS username, email, cin, sexe, telephone, datn, role FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || "Erreur serveur" });
      if (results.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
      res.status(200).json(results[0]);
    }
  );
});
// ✅ Ajouter un service (travailleur connecté)
app.post("/addservice", authenticateToken, (req, res) => {
  const { nomservice, description } = req.body;

  // Vérifier le rôle du user connecté
  if (req.user.role !== "travailleur") {
    return res.status(403).json({ message: "Accès refusé : réservé aux travailleurs" });
  }

  // Récupération automatique depuis le token JWT
  const id_travailleur = req.user.userId;
  const nom_travailleur = req.user.email; // tu peux aussi faire une requête SQL pour récupérer le vrai nom

  // 🔍 On va chercher le nom du travailleur dans la table users (pour l’avoir à jour)
  db.query("SELECT name FROM users WHERE id = ?", [id_travailleur], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération du nom :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const nom_travailleur = result[0]?.name || "Inconnu";

    const sql = `
      INSERT INTO service (id_travailleur, nom_travailleur, nomservice, description, avis)
      VALUES (?, ?, ?, ?, NULL)
    `;

    db.query(sql, [id_travailleur, nom_travailleur, nomservice, description], (err, result) => {
      if (err) {
        console.error("Erreur lors de l’ajout du service :", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.json({ message: "✅ Service ajouté avec succès" });
    });
  });
});
// 📋 Récupérer les services du travailleur connecté
app.get("/myservices", authenticateToken, (req, res) => {
  if (req.user.role !== "travailleur") {
    return res.status(403).json({ message: "Accès refusé : réservé aux travailleurs" });
  }

  const id_travailleur = req.user.userId;
  const sql = "SELECT * FROM service WHERE id_travailleur = ?";
  db.query(sql, [id_travailleur], (err, result) => {
    if (err) {
      console.error("Erreur récupération services :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(result);
  });
});

// 📋 Récupérer les services du travailleur connecté
app.get("/myservices", authenticateToken, (req, res) => {
  if (req.user.role !== "travailleur") {
    return res
      .status(403)
      .json({ message: "Accès refusé : réservé aux travailleurs" });
  }

  const id_travailleur = req.user.userId;

  const sql = "SELECT * FROM service WHERE id_travailleur = ?";
  db.query(sql, [id_travailleur], (err, result) => {
    if (err) {
      console.error("Erreur récupération services :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(result);
  });
});


// 🌍 Récupérer uniquement les services *actifs* pour les clients
app.get("/allservices", (req, res) => {
  const sql =
    "SELECT * FROM service WHERE etat = 'actif' ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Erreur récupération services actifs :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(result);
  });
});


// ✅ Récupérer tous les services (admin)
app.get("/admin/services", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé : réservé à l'administrateur" });
  }

  db.query("SELECT * FROM service ORDER BY created_at DESC", (err, result) => {
    if (err) {
      console.error("Erreur récupération services :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(result);
  });
});

// ✏️ Modifier un service
app.put("/admin/services/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const { id } = req.params;
  const { nomservice, description } = req.body;

  db.query(
    "UPDATE service SET nomservice = ?, description = ? WHERE id = ?",
    [nomservice, description, id],
    (err) => {
      if (err) {
        console.error("Erreur update service :", err);
        return res.status(500).json({ message: "Erreur lors de la modification" });
      }
      res.json({ message: "✅ Service modifié avec succès" });
    }
  );
});

// 🚫 Activer / Désactiver un service
app.put("/admin/services/:id/etat", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const { id } = req.params;
  const { etat } = req.body; // 'actif' ou 'inactif'

  db.query("UPDATE service SET etat = ? WHERE id = ?", [etat, id], (err) => {
    if (err) {
      console.error("Erreur changement etat :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ message: `Service ${etat === "actif" ? "activé" : "désactivé"} avec succès` });
  });
});

// 🗑️ Supprimer un service
app.delete("/admin/services/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const { id } = req.params;

  db.query("DELETE FROM service WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Erreur suppression service :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ message: "🗑️ Service supprimé avec succès" });
  });
});



app.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
