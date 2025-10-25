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
// 📨 Ajouter une demande (client -> travailleur)
app.post("/demande", authenticateToken, (req, res) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Accès réservé aux clients" });
  }

  const { id_service } = req.body;

  // 🔍 Récupérer les infos du service
  db.query("SELECT * FROM service WHERE id = ?", [id_service], (err, result) => {
    if (err || result.length === 0) {
      console.error("Erreur récupération service :", err);
      return res.status(404).json({ message: "Service introuvable" });
    }

    const service = result[0];
    const id_client = req.user.userId;

    // 🔍 Récupérer le nom du client
    db.query("SELECT name FROM users WHERE id = ?", [id_client], (err, result2) => {
      if (err) return res.status(500).json({ message: "Erreur client" });
      const nom_client = result2[0].name;

      const sql = `
        INSERT INTO demande (id_client, id_travailleur, id_service, nom_client, nom_travailleur, telephone_travailleur, nomservice, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [
          id_client,
          service.id_travailleur,
          service.id,
          nom_client,
          service.nom_travailleur,
          null, // téléphone à récupérer ensuite
          service.nomservice,
          service.description,
        ],
        (err3) => {
          if (err3) {
            console.error("Erreur ajout demande :", err3);
            return res.status(500).json({ message: "Erreur serveur" });
          }

          res.json({ message: "✅ Demande envoyée avec succès" });
        }
      );
    });
  });
});
// 📋 Récupérer les demandes du client connecté
app.get("/mesdemandes", authenticateToken, (req, res) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Accès réservé aux clients" });
  }

  const id_client = req.user.userId;
  db.query("SELECT * FROM demande WHERE id_client = ? ORDER BY created_at DESC", [id_client], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(result);
  });
});
// 📋 Récupérer les demandes reçues par un travailleur
app.get("/travailleur/demandes", authenticateToken, (req, res) => {
  if (req.user.role !== "travailleur") {
    return res.status(403).json({ message: "Accès réservé aux travailleurs" });
  }

  const id_travailleur = req.user.userId;
  db.query("SELECT * FROM demande WHERE id_travailleur = ?", [id_travailleur], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(result);
  });
});
// ✅ / 🚫 Accepter ou refuser une demande + création automatique conversation si acceptée
app.put("/travailleur/demandes/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "travailleur") {
    return res.status(403).json({ message: "Accès réservé aux travailleurs" });
  }

  const { id } = req.params;
  const { etat } = req.body; // 'acceptee' ou 'refusee'

  // 1️⃣ Mettre à jour l'état de la demande
  db.query("UPDATE demande SET etat = ? WHERE id = ?", [etat, id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    // Si la demande est acceptée, créer une conversation
    if (etat === "acceptee") {
  db.query("SELECT * FROM demande WHERE id = ?", [id], (err2, result) => {
    if (err2 || result.length === 0) {
      return res.status(500).json({ message: "Erreur récupération demande" });
    }

    const demande = result[0];
    const clientId = demande.id_client;
    const travailleurId = req.user.userId;
    const serviceId = demande.id_service;

    // Vérifier si une conversation existe déjà
    db.query(
      "SELECT id FROM conversation WHERE service_id = ? AND client_id = ?",
      [serviceId, clientId],
      (err3, convResult) => {
        if (err3) return console.error(err3);

        if (convResult.length === 0) {
          // Créer conversation
          db.query(
            "INSERT INTO conversation (service_id, client_id) VALUES (?, ?)",
            [serviceId, clientId],
            (err4, insertResult) => {
              if (err4) return console.error(err4);

              const conversationId = insertResult.insertId;

              // Ajouter les participants
              db.query(
                "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
                [conversationId, clientId, conversationId, travailleurId]
              );

              // 🔥 Message automatique
              const message = `✅ Votre demande de service "${demande.nomservice}" a été acceptée. Vous pouvez discuter avec ${demande.nom_travailleur}.`;
              db.query(
                "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
                [conversationId, travailleurId, message]
              );
            }
          );
        }
      }
    );
  });
}

    // Réponse finale
    res.json({ message: `Demande ${etat} avec succès` });
  });
});
//recuprer les duscution
// ✅ Récupérer les conversations de l'utilisateur (client ou travailleur)
// ✅ Récupérer les conversations de l'utilisateur (client ou travailleur)
app.get("/conversations", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const sql = `
    SELECT 
      c.id, 
      c.service_id, 
      s.nomservice,
      u1.name AS client_name, 
      u2.name AS travailleur_name
    FROM conversation c
    JOIN service s ON c.service_id = s.id
    JOIN users u1 ON c.client_id = u1.id
    JOIN users u2 ON s.id_travailleur = u2.id
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    WHERE cp.user_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des conversations :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    // 🔥 Construire un champ combiné "nom_affichage"
    const formatted = results.map(conv => ({
      ...conv,
      nom_affichage: `${conv.nomservice} - ${conv.travailleur_name}`,
    }));

    res.json(formatted);
  });
});

//recuprer les messge
app.get("/conversations/:id/messages", authenticateToken, (req, res) => {
  const conversationId = req.params.id;
  const sql = `
    SELECT m.id, m.content, m.sender_id, u.name AS sender_name, m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `;
  db.query(sql, [conversationId], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(results);
  });
});
//pour envoyer message
app.post("/conversations/:id/messages", authenticateToken, (req, res) => {
  const conversationId = req.params.id;
  const { content } = req.body;
  const senderId = req.user.userId;

  db.query(
    "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
    [conversationId, senderId, content],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json({ message: "Message envoyé", messageId: result.insertId });
    }
  );
});


// 📋 Récupérer toutes les demandes (admin)
app.get("/admin/demandes", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé : réservé à l'admin" });
  }

  const sql = "SELECT * FROM demande ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération demandes :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
});

// ✏️ Modifier l'état d'une demande (admin)
app.put("/admin/demandes/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé : réservé à l'admin" });
  }

  const { id } = req.params;
  const { etat } = req.body; // 'en_attente', 'acceptée', 'refusée'

  db.query("UPDATE demande SET etat = ? WHERE id = ?", [etat, id], (err) => {
    if (err) {
      console.error("Erreur modification état demande :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ message: `État de la demande modifié en "${etat}"` });
  });
});



app.listen(5000, () => console.log("🚀 Serveur lancé sur http://localhost:5000"));
