const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

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

router.put("/edit/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const editedUser = await UserModel.findByIdAndUpdate(
      idUser,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json(editedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const userLikes = await UserModel.find(
      {
        _id: new ObjectId(`${idUser}`),
      },
      {
        favorites: 1,
      }
    );

    userLikes.forEach(async (likedRecipe) => {
      await RecipeModel.findByIdAndUpdate(
        likedRecipe,
        {
          $inc: { likes: -1 },
        },
        { new: true }
      );
    });

    const userDislikes = await UserModel.find(
      {
        _id: new ObjectId(`${idUser}`),
      },
      {
        dislikes: 1,
      }
    );

    userDislikes.forEach(async (dislikedRecipe) => {
      await RecipeModel.findByIdAndUpdate(
        dislikedRecipe,
        {
          $inc: { dislikes: -1 },
        },
        { new: true }
      );
    });

    const deletedUser = await UserModel.findByIdAndDelete(idUser);

    return res.status(200).json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

module.exports = router;
