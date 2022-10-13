const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  // Pour le mot de passe, puis-je utiliser un regex que je stock dans un .env et que j'appelle ici? Ou je mets juste mon regex et ça va?
  // Ou alors est-ce que je dois coder un petit algo qui génère un mot de passe fort directement? ça me semble compliqué de base et encore plus complexe sans toucher au front, est-ce seulement possible pour ce projet?..
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        // 201 pour la bonne création d'une nouvelle ressource
        .then(() => res.status(201).json({ message: "User créé" }))
        // Code 400 pour bad request. Le serveur ne comprend pas la requête à cause d'une erreur de syntaxe (Ex : )
        .catch((error) => res.status(400).json({ error }));
    })
    // 500 indique que le serveur a rencontré une erreur inattendue et qu'il ne sait pas la traiter, on détail un peu plus lorsqu'on enregistre les erreurs
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          // 401 = unauthorized, c'est une erreur liée à l'authentification, le client n'est pas autorisé à performer la requête suite à un manque d'information ou à une erreur (ici identifiant ou mot de passe)
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({ message: "Paire identifiant/mot de passe incorrecte" });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  {
                    userId: user._id,
                  },
                  process.env.RT_S,
                  { expiresIn: "24h" }
                ),
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
