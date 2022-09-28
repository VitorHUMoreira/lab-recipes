const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  title: { type: String, required: true, unique: true },
  level: {
    type: String,
    enum: ["Easy Peasy", "Amateur", "Chef", "UltraPro Chef"],
  },
  ingredients: [[String]],
  cuisine: { type: String, required: true },
  dishType: {
    type: String,
    enum: [
      "breakfast",
      "main_course",
      "soup",
      "snack",
      "drink",
      "dessert",
      "other",
    ],
  },
  image: {
    type: String,
    default: "https://images.media-allrecipes.com/images/75131.jpg",
  },
  duration: { type: Number, min: 0 },
  creator: { type: String },
  created: { type: Date, default: Date.now },
  likes: { type: Number, default: 0, min: 0 },
  dislikes: { type: Number, default: 0, min: 0 },
  picture: {
    type: String,
    default:
      "https://www.foodiesfeed.com/wp-content/uploads/2021/11/fresh-beef-burger-takeaway.jpg",
  },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
