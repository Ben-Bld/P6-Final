// Importation du fichier .env avec les infos pour se log
require("dotenv").config();

//importation des modules requis
const express = require("express"); // framework pour gérer les requetes et reponses http
const bodyParser = require("body-parser"); //middleware pour parser le body des requêtes
const cors = require("cors"); // middleware qui authorise le cors (cross origin ressource sharing)
const multer = require("multer"); //middleware qui gère les mages
const path = require("path"); //module express pour gérer les répertoires des fichiers et dossiers
const { saucesRouter } = require("./routers/saucesRouter");
const { authRouter } = require("./routers/authRouter");

//importation des fonctions présentes dans d'autres fichiers

// on initialise express
const app = express() 
// on utilise le port 3000
const port = 3000;

//mise en place des middlewares
app.use(cors());
app.use(express.json()); //parse les bodies reçus en requêtes
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use("/api/sauces", saucesRouter);
app.use("/api/auth", authRouter);


//on indique qu'on est connecté au port
app.use("/images", express.static(path.join(__dirname, "images")));
app.listen(port, () => console.log(`Connecté au port ${port}`));
