const express = require("express");
const router = express.Router();

const UserModel = require("../models/User.model");
const RecipeModel = require("../models/Recipe.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const generateToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "Hotmail",
  auth: {
    secure: false,
    user: "lab-recipes@hotmail.com",
    pass: process.env.MAIL_PASSWORD,
  },
});

router.post("/sign-up", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#_!])[0-9a-zA-Z$*&@#_!]{8,}$/
      )
    ) {
      return res.status(400).json({ message: "Senha inválida." });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: passwordHash,
    });

    delete newUser._doc.passwordHash;

    const mailOptions = {
      from: '"🔪 Lab Recipes Mailer" <lab-recipes@hotmail.com>',
      to: email,
      subject: "Ative sua conta do Lab Recipes",
      html: `<h2>Bem vindo ao Lab Recipes ${newUser.name}</h2><h5>Clique <a href=http://localhost:4000/users/activate-account/${newUser._id} target="_blank">AQUI</a> para ativar sua conta<h5>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/activate-account/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const user = await UserModel.findById(idUser);

    if (!user) {
      return res.send("Erro na ativação da conta");
    }

    await UserModel.findByIdAndUpdate(idUser, {
      emailConfirm: true,
    });

    res.send(`<h1>Usuário ativado</h1>`);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor informe e-mail e senha." });
    }

    const user = await UserModel.findOne({ email: email });

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      const token = generateToken(user);
      return res.status(200).json({ user: user, token: token });
    } else {
      return res.status(400).json({ message: "E-mail ou senha incorretos!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    if (!loggedInUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const user = await UserModel.findById(loggedInUser._id);

    delete user._doc.passwordHash;
    delete user._doc.__v;
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/all", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
  try {
    const allUsers = await UserModel.find({}, { passwordHash: 0, __v: 0 });
    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const idUser = req.currentUser._id;

    const newName = req.body.name;

    const editedUser = await UserModel.findByIdAndUpdate(
      idUser,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    delete editedUser._doc.passwordHash;
    delete editedUser._doc.__v;

    return res.status(200).json(editedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const idUser = req.currentUser._id;

    const userLikes = await UserModel.findOne(
      {
        _id: idUser,
      },
      {
        favorites: 1,
      }
    );

    userLikes.favorites.forEach(async (likedRecipe) => {
      await RecipeModel.findByIdAndUpdate(
        likedRecipe,
        {
          $inc: { likes: -1 },
        },
        { new: true }
      );
    });

    const userDislikes = await UserModel.findOne(
      {
        _id: idUser,
      },
      {
        dislikes: 1,
      }
    );

    userDislikes.dislikes.forEach(async (dislikedRecipe) => {
      await RecipeModel.findByIdAndUpdate(
        dislikedRecipe,
        {
          $inc: { dislikes: -1 },
        },
        { new: true }
      );
    });

    const deletedUser = await UserModel.findByIdAndDelete(idUser);

    delete deletedUser._doc.passwordHash;
    delete deletedUser._doc.__v;

    return res.status(200).json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/addFav/:idRecipe", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { idRecipe } = req.params;
    const idUser = req.currentUser._id;

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

    delete addFav._doc.passwordHash;
    delete addFav._doc.__v;

    return res.status(200).json(addFav);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put(
  "/addDislike/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idRecipe } = req.params;
      const idUser = req.currentUser._id;

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

      delete addDislike._doc.passwordHash;
      delete addDislike._doc.__v;

      return res.status(200).json(addDislike);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.put(
  "/removeFav/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idRecipe } = req.params;
      const idUser = req.currentUser._id;

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

      delete removeFav._doc.passwordHash;
      delete removeFav._doc.__v;

      return res.status(200).json(removeFav);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.put(
  "/removeDislike/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idRecipe } = req.params;
      const idUser = req.currentUser._id;

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

      delete removeDislike._doc.passwordHash;
      delete removeDislike._doc.__v;

      return res.status(200).json(removeDislike);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

module.exports = router;
