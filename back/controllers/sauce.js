//Dit que l'on a besoin du modèle, du schéma de données "./models/sauces"
const app = require("../app");
const Sauce = require("../models/sauces");
const fs = require("fs");

// createSauce permet au site de créer une sauce à partir du modèle plus haut
// Ici, on l'exporte pour pouvoir l'utiliser dans ./routes/sauces.js
exports.createSauce = (req, res, next) => {
  const parseSauce = JSON.parse(req.body.sauce);
  delete parseSauce._id;
  delete parseSauce._userId;
  // Ici, on crée une nouvelle instance de Sauce qu'on appelle sauce (sans majuscule)
  // Cela correspond en fait à un nouveau modèle modifié par l'utilisateur
  const sauce = new Sauce({
    // L'opérateur spread va aller copier les champs présents dans le corps de la requête
    // Donc le corps de la requête est ici le modèle que l'on va chercher en haut,
    // *nouvelle instance de Sauce = sauce*
    ...parseSauce,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  // .save() va enregistrer cette instance dans la base, renvoie une promesse donc .then() + .catch()
  sauce
    .save()
    // Renvoyer un code signalant la bonne création de l'objet en format json
    .then(() => res.status(201).json({ message: "objet enregistré" }))
    // Renvoyer un code signalant une erreur en format json
    .catch((error) => res.status(400).json({ error }));
};

exports.updateOne = (req, res, next) => {
  const sauceObjet = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete sauceObjet._userId;

  Sauce.findOne({ _id: req.params.id })
    // On récupère l'objet sauce et l'userId qui lui correspond en bdd,
    // Si ça ne correspond pas avec le token (auth) = message d'erreur
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // Si c'est bon, alors on update l'objet
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObjet, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(404).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauceDelete) => {
    if (sauceDelete.userId != req.auth.userId) {
      res.status(401).json({ message: "Non autorisé" });
    } else {
      const filename = sauceDelete.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Objet supprimé" });
          })
          .catch((error) => res.status(401).json({ error }));
      });
    }
  });
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

exports.likeSauce = (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const like = req.body.like;

  if (like === 1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { likes: like },
        $push: { usersLiked: userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Vous avez liké" }))
      .catch((err) => res.status(500).json({ err }));
  } else if (like === -1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { dislikes: -1 * like },
        $push: { usersDisliked: userId },
      }
    )
      .then((sauce) =>
        res.status(200).json({ message: "Vous avez enlevé votre dislike" })
      )
      .catch((err) => res.status(500).json({ err }));
  } else {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Vous avez disliké" });
            })
            .catch((err) => res.status(500).json({ err }));
        } else if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              $pull: { usersDisliked: userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(
              res
                .status(200)
                .json({ message: "Vous avez enlevé votre dislike" })
            )
            .catch((err) => res.status(500).json({ err }));
        }
      })
      .catch((err) => res.status(401).json({ err }));
  }
};
