const mongoose = require("mongoose");
// Unique validator pour 1 seule adresse mail
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Veuillez entrer votre adresse mail"],
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Veuillez entrer une adresse email correcte",
    ],
  },
  password: {
    type: String,
    required: [true, "Veuillez choisir un mot de passe"],
  },
});

userSchema.plugin(uniqueValidator);

// userSchema.pre
module.exports = mongoose.model("User", userSchema);
