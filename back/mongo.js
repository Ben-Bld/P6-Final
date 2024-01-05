const mongoose = require("mongoose"); //importation de mongoose
const uniqueValidator = require("mongoose-unique-validator"); //importe le pluggin "mongoose unique validator"
const password = process.env.DB_PASSWORD; //récupère les infos du .env
const username = process.env.DB_USER;
const db = process.env.DB_NAME;
const uri = `mongodb+srv://${username}:${password}@cluster0.o1kxqsm.mongodb.net/${db}?retryWrites=true&w=majority`; //construit l'uri en utilisant l'username, le mdp, et le nom de la db, 

//initialise la connection à mongo
mongoose
  .connect(uri)
  .then(() => console.log("connecté à mongodb"))
  .catch((err) => console.error("Erreur de connexion à mongo", err));

const userSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
});
userSchema.plugin(uniqueValidator);

//cration d'un modele mongo nommé "User" basé sur userschema
const User = mongoose.model("User", userSchema);


// on exporte le nécessaire
module.exports = { mongoose, User };
