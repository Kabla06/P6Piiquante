const express = require("express");
const mongoose = require("mongoose");
const app = express(); //body-parser = permet d'accéder au corps des requêtes

const sauce = require("./models/sauces");
const userRoutes = require("./routes/user");

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://Hugopinpio:Ub9zKP0DY8YKD1fa@cluster0.byahfys.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
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

app.use("/api/sauces", (req, res, next) => {
  const stuff = [
    {
      _id: "oeihfzeoi",
      userId: "qsomihvqios",
      name: "Mon premier objet",
      manufacturer: "Ok mon gars",
      description: "Les infos de mon premier objet",
      mainPepper: "TMTC",
      imageUrl:
        "https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg",
      heat: 3,
      likes: 4,
      dislikes: 1,
      usersLiked: ["Coucou"],
      usersDisliked: ["Cucu"],
    },
    {
      _id: "oeihfzeomoihi",
      userId: "qsomihvqios",
      name: "Mon deuxième objet",
      manufacturer: "Ok mon gars",
      description: "Les infos de mon deuxième objet",
      mainPepper: "TMTC",
      imageUrl:
        "https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg",
      heat: 3,
      likes: 2,
      dislikes: 1,
      usersLiked: ["Coucou"],
      usersDisliked: ["Cucu"],
    },
  ];
  res.status(200).json(stuff);
});

app.use("/api/sauces", (req, res, next) => {
  delete req.body.userId;
  const truc = new truc({
    ...req.body,
  });
  truc
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré" }))
    .catch((error) => res.status(400).json({ error }));
});

app.use("/api/auth", userRoutes);

module.exports = app;
