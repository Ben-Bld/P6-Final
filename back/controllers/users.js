//importation des modules nécessaires

const User = require("../mongo").User; 
const bcrypt = require("bcrypt"); //librairie pour hasher des mots de pass
const jwt = require("jsonwebtoken"); //librairie pour créer et vérifier les JWT (json web tokens)



//fonction asynchrone qui gère la creation de nouveaux utilisateurs
async function createUser(req, res) {
  try {
    const email = req.body.email; //on récupère email et password de la requete
    const password = req.body.password;

    const hashedPassword = await hashPassword(password); //on hash le mdp 

    const user = new User({ email, password: hashedPassword }); //on crée un nouvel user avec l'email, et le mdp hashé

    await user.save(); //on sauvegerde l'user dans la db
    res.status(201).send({ message: "Utilisateur confirmé" }); //réponse si tout marche
  } catch (err) {
    res.status(409).send({ message: "Utilisateur non enregistré", error: err.message }); //reponse si erreur
  }
}

function hashPassword(password) { //fonction pour hasher le mdp
  const saltRounds = 10; // nombre de rounds = indique le niveau de complexité de l'encryption
  return bcrypt.hash(password, saltRounds);
}

async function logUser(req, res) {
  try {
    const email = req.body.email; // récupère email et password de la requête body
    const password = req.body.password;
    const user = await User.findOne({ email }); //trouve tous les utilisateurs avec un email correspondant dans la db

    //compare le mot de passe donné avec le mdp hashé dans la db
    const isPasswordOkay = await bcrypt.compare(password, user.password); 

    //si mdp correct, génère un JWT avec "createToken"
    if (!isPasswordOkay) {
      res.status(403).send({ message: "Mot de passe incorrect" });
    } else {
      const token = createToken(email);
      res.status(200).send({ userId: user?._id, token });
    }
    //sinon, erreur 500
  } catch (err) {
    res.status(500).send({ message: "Erreur interne" });
  }
}

function createToken(email) {
  const jwtPassword = process.env.JWT_PASSWORD;
  //utilise le JWT présent dans le .env
  //             !! Changer expiration!
  const token = jwt.sign({ email }, jwtPassword, { expiresIn: "3000h" }); // gère le délai d'expiration du token
  return token;
}
//on exporte les fonction requises ailleurs
module.exports = { createUser, logUser };