// Requires
const mongoose = require("mongoose");

// Creating Schema
const sauceSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mainPepper: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  heat: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  likes: {
    type: Number,
    required: true,
    default: 0,
  },
  dislikes: {
    type: Number,
    required: true,
    default: 0,
  },
  usersLiked: {
    type: [String],
    required: true,
    default: [],
  },
  usersDisliked: {
    type: [String],
    required: true,
    default: [],
  },
  // mettre un champ bidon pour faire planter
});

// sauceSchema.pre
// Exporting Sauce Schema
module.exports = mongoose.model("sauces", sauceSchema);
