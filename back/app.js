// Importation du package Express
const express = require("express");
// Pour la gestion des images
const path = require("path");
const mongoose = require("mongoose");
const helmet = require("helmet");
const app = express();

app.use(express.json()); //body-parser = permet d'accéder au corps des requêtes
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");

// Ajout de dotenv pour sécuriser le token et la conenxion à la base de données
require("dotenv").config();
// console.log(process.env)

mongoose
  // connexion à MongoDB avec mon .env, pas en visible
  .connect(
    process.env.DB_CO, 
    {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Middleware permettant à l'utilisateur de communiquer avec l'API depuis n'importe où,
// Respecte une liste de requêtes "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"
app.use((req, res, next) => {
  console.log(req.body);
  // comm front to back => api contactable par n'importe quel domaine
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "same-site",
    },
  })
);

// Gestion des routes principales
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", saucesRoutes);

module.exports = app;
