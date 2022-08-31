//Dit que l'on a besoin du modèle, du schéma de données "./models/sauces"
const app = require("../app");
const Sauce = require("../models/sauces");

// createSauce permet au site de créer une sauce à partir du modèle plus haut
// Ici, on l'exporte pour pouvoir l'utiliser dans ./routes/sauces.js
exports.createSauce = (req, res, next) => {
  const parseSauce = JSON.parse(req.body.Sauce);
  delete parseSauce._id;
  delete parseSauce._userId;
  // Ici, on crée une nouvelle instance de Sauce qu'on appelle sauce (sans majuscule)
  // Cela correspond en fait à un nouveau modèle modifié par l'utilisateur
  const sauce = new Sauce({
    // L'opérateur spread va aller copier les champs présents dans le corps de la requête
    // Donc le corps de la requête est ici le modèle que l'on va chercher en haut,
    // *nouvelle instance de Sauce = sauce*
    ...parseSauce,
    userId: res.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  // console.log(req);
  // .save() va enregistrer cette instance dans la base, renvoie une promesse donc .then() + .catch()
  sauce
    .save()
    // Renvoyer un code signalant la bonne création de l'objet en format json
    .then(() => res.status(201).json({ message: "objet enregistré" }))
    // Renvoyer un code signalant une erreur en format json
    .catch((error) => res.status(400).json({ error }));
};

exports.updateOne = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(404).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet supprimé !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction getSauces permettant à l'utilisateur d'afficher les différentes sauces en allant les chercher
// dans la base de données avec la méthode .find()
// On renvoie toujours un code de validation ou d'erreur en format json
// Ici, pas de 201 mais un 200 car il ne s'agit pas de la création d'un objet mais de la "lecture" de la BDD
exports.getSauces = (req, res, next) => {
  Sauce.find()
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }));
};

// Ce qui a été écrit ici aurait très bien pu aller dans ./routes/sauces
// Par soucis de clarté et de praticité nous écrivons nos CONTROLLERS ici qu'on appelle ensuite dans ./routes/*
// Mais un CONTROLLER n'est pas une ROUTE, c'est en fait une fonction qui permet de controller les données
// On utilise ensuite les CONTROLLERS dans nos routes pour savoir ce que la requête doit aller chercher ou pas
// en gros, c'est juste une fonction qui a un effet sur les données et dont on se sert dans les routes
// pour le traitement des requêtes
