const passwordSchema = require("../models/password");

module.exports = (req, res, next) => {
  if (!passwordSchema.validate(req.body.password)) {
    res
      .status(401)
      .json({
        error: new Error(
          "8 caractères minimum. Au moins 1 majuscule et 1 minuscule. Pas d'espaces."
        ),
      });
  } else {
    next();
  }
};
