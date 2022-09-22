const express = require("express");
const router = express.Router();

const UserModel = require("../models/User.model");
const RecipeModel = require("../models/Recipe.model");

router.post("/create", async (req, res) => {
  try {
    const newUser = await UserModel.create({ ...req.body });

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    const allUsers = await UserModel.find();
    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/user/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;
    const oneUser = await UserModel.findById(idUser);
    return res.status(200).json(oneUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/user/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;
    const oneUser = await UserModel.findById(idUser);
    return res.status(200).json(oneUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/addFav/:idUser/:idRecipe", async (req, res) => {
  try {
    const { idUser, idRecipe } = req.params;

    const addFav = await UserModel.findByIdAndUpdate(
      idUser,
      {
        $push: { favorites: idRecipe },
      },
      { new: true }
    );

    await RecipeModel.findByIdAndUpdate(
      idRecipe,
      {
        $inc: { likes: 1 },
      },
      { new: true }
    );

    return res.status(200).json(addFav);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/addDislike/:idUser/:idRecipe", async (req, res) => {
  try {
    const { idUser, idRecipe } = req.params;

    const addDislike = await UserModel.findByIdAndUpdate(
      idUser,
      {
        $push: { dislikes: idRecipe },
      },
      { new: true }
    );

    await RecipeModel.findByIdAndUpdate(
      idRecipe,
      {
        $inc: { dislikes: 1 },
      },
      { new: true }
    );

    return res.status(200).json(addDislike);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/removeFav/:idUser/:idRecipe", async (req, res) => {
  try {
    const { idUser, idRecipe } = req.params;

    const removeFav = await UserModel.findByIdAndUpdate(
      idUser,
      {
        $pull: { favorites: idRecipe },
      },
      { new: true }
    );

    await RecipeModel.findByIdAndUpdate(
      idRecipe,
      {
        $inc: { likes: -1 },
      },
      { new: true }
    );

    return res.status(200).json(removeFav);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/removeDislike/:idUser/:idRecipe", async (req, res) => {
  try {
    const { idUser, idRecipe } = req.params;

    const removeDislike = await UserModel.findByIdAndUpdate(
      idUser,
      {
        $pull: { dislikes: idRecipe },
      },
      { new: true }
    );

    await RecipeModel.findByIdAndUpdate(
      idRecipe,
      {
        $inc: { dislikes: -1 },
      },
      { new: true }
    );

    return res.status(200).json(removeDislike);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

module.exports = router;
