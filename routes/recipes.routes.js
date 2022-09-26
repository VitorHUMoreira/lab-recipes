const express = require("express");
const router = express.Router();

const UserModel = require("../models/User.model");
const RecipeModel = require("../models/Recipe.model");

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");

router.post("/create", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
  try {
    const newRecipe = await RecipeModel.create({ ...req.body });

    return res.status(201).json(newRecipe);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/all", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const allRecipes = await RecipeModel.find();
    return res.status(200).json(allRecipes);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/recipe/:idRecipe", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { idRecipe } = req.params;
    const oneRecipe = await RecipeModel.findById(idRecipe);
    return res.status(200).json(oneRecipe);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.post(
  "/createMany",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const newRecipes = await RecipeModel.insertMany([...req.body]);

      return res.status(201).json(newRecipes);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.get(
  "/allFavs/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idRecipe } = req.params;

      const allFavs = await UserModel.find({ favorites: idRecipe });

      delete allFavs._doc.passwordHash;
      delete allFavs._doc.__v;

      return res.status(200).json(allFavs);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.get(
  "/allDislikes/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idRecipe } = req.params;

      const allDislikes = await UserModel.find({ dislikes: idRecipe });

      delete allDislikes._doc.passwordHash;
      delete allDislikes._doc.__v;

      return res.status(200).json(allDislikes);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.delete(
  "/delete/:idRecipe",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const { idRecipe } = req.params;

      const deleteRecipe = await RecipeModel.findByIdAndDelete(idRecipe);

      await UserModel.updateMany(
        { $or: [{ favorites: idRecipe }, { dislikes: idRecipe }] },
        {
          $pull: { favorites: idRecipe, dislikes: idRecipe },
        },
        { new: true }
      );

      return res.status(200).json(deleteRecipe);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.put(
  "/edit/:idRecipe",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const { idRecipe } = req.params;

      const editedRecipe = await RecipeModel.findByIdAndUpdate(
        idRecipe,
        {
          ...req.body,
        },
        { new: true, runValidators: true }
      );
      return res.status(200).json(editedRecipe);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

module.exports = router;
