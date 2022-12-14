const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  emailConfirm: { type: Boolean, default: false },
  picture: {
    type: String,
    default:
      "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
  },
});

const ClientModel = mongoose.model("Client", clientSchema);

module.exports = ClientModel;
