//importation de JWT
const jwt = require("jsonwebtoken");


function logUtilisateur(req, res, next) {
  console.log("auth utilisateur");


  const header = req.header("Authorization"); //recupère le header 'Authorization' dans les requêtes entrantes

  //si le header est présent, erreur 403
  if (!header) {
    return res.status(403).send({ message: "Header manquant" });
  }

  // extrait la partie authorization du header, en enlevant le reste ("Hearer ...")
  const tokenRes = header.split(" ")[1];

  //vérifie si un token est présent, sinon, erreur 403
  if (!tokenRes) {
    return res.status(403).send({ message: "Header manquant dans le token" });
  }

  //on utilise jsonwebtoken pour vérifier, en utilisant le token dans .env
  jwt.verify(tokenRes, process.env.JWT_PASSWORD, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Token invalide " + err.message });
    } else {
      console.log("Token validé, suivant");
      next();
    }
  });
}

//si le otken est invaliden, erreur 403
//sinon, log "token validé", et continue avec "next"


//on exporte logUtilisateur
module.exports = {
  logUtilisateur
};