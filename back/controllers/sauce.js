//Dit que l'on a besoin du modèle, du schéma de données "./models/sauces"
const app = require("../app");
const Sauce = require("../models/sauces");
const fs = require("fs");

// Fonction getSauces permettant à l'utilisateur d'afficher les différentes sauces en allant les chercher
// dans la base de données avec la méthode .find()
// On renvoie toujours un code de validation ou d'erreur en format json
// Ici, pas de 201 mais un 200 car il ne s'agit pas de la création d'un objet mais de la "lecture" de la BDD
exports.getSauces = (req, res, next) => {
  Sauce.find()
  // 200 signifie que la requête a bien été effectuée
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((things) => res.status(200).json(things))
    // 404 signifie que le serveur n'a pas trouvé la ressource demandée
    .catch((error) => res.status(404).json({ error }));
};

// createSauce permet au site de créer une sauce à partir du modèle plus haut
// Ici, on l'exporte pour pouvoir l'utiliser dans ./routes/sauces.js
exports.createSauce = (req, res, next) => {
  const parseSauce = JSON.parse(req.body.sauce);
  delete parseSauce._id;
  delete parseSauce._userId;
  console.log(req.body.sauce);
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
  // recherche la sauce correspondant a l'id passé en param
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        // 403 pour interdiction d'effectuer la requête car dans ce cas, l'utilisateur n'est pas le bon
        res.status(403).json({ message: "unauthorized request." });
      }
      // si req.file != null alors on a passé une nouvelle image
      let sauceObject = null;
      if (req.file != null) {
        // ici, on supprime l'ancienne image
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {});

        sauceObject = {
          ...JSON.parse(req.body.sauce),
          // front qui décide
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        };
        console.log(sauceObject);
      } else {
        console.log("coucou :)");
        console.log(req.body);
        // si on arrive là, on n'a pas passé d'image dans la MaJ
        sauceObject = req.body;
        // ce n'est pas du json
      }

      Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: "Objet modifié" }))
        .catch((error) => res.status(401).json({ error }));
    })
    .catch();
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

exports.likeSauce = (req, res, next) => {
  const sauceId = req.params.id;
  // id d'une sauce dans l'URL
  const userId = req.body.userId;
  // Récupération de l'userId dans le corps de la requête (middleware auth)
  const like = req.body.like;
  // création d'une valeur like qu'on peut diminuer ou incrémenter

  // > Quand on met un like
  if (like === 1) {
    // telle ou telle sauce
    Sauce.updateOne(
      // _id contenant l'id d'une sauce en particulier
      { _id: sauceId },
      {
        // $inc = fonction mongodb pour incrémenter une valeur
        $inc: { likes: 1 },
        // $push pour push une valeur dans un tableau (ici, schéma usersLiked = userId pour correspondance)
        $push: { usersLiked: userId },
      }
    )
      // quand tout se passe bien, on renvoie un 200
      .then((sauce) => res.status(200).json({ message: "Vous avez liké" }))
      // quand il y a une erreur on renvoie un 500
      .catch((error) => res.status(500).json({ error }));
  }
  // > Quand on met un dislike
  else if (like === -1) {
    // telle ou telle sauce
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Vous avez disliké" }))
      .catch((error) => res.status(500).json({ error }));
  }
  // > On veut retirer son like
  else {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            // $pull enlève une valeur, ici on enlève un 'likes' en l'incrémentant de -1, correspond avec l'userId
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Vous avez enlevé votre like" });
            })
            .catch((error) => res.status(500).json({ error }));
        }
        // .includes() cherche si une valeur se trouve dans un tableau et si elle y est, renvoie true
        // On cherche ici la valeur userId pour faire la correspondance
        // > On veut retirer son dislike
        else if (sauce.usersDisliked.includes(userId)) {
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
            .catch((error) => res.status(500).json({ error }));
        }
      })
      .catch((error) => res.status(401).json({ error }));
  }
};
