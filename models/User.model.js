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
  favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
});

const ClientModel = mongoose.model("Client", clientSchema);

module.exports = ClientModel;
