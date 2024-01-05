const express = require("express");

const {
  recupSauces,
  creationSauce,
  recupProduitParId,
  suppressionSauce,
  modifSauce,
  likeSauce,
  recupProduit,
} = require("../controllers/sauces");

const { logUtilisateur } = require("../middleware/auth");

const { createUser, logUser } = require("../controllers/users");

const bodyParser = require("body-parser");
const saucesRouter = express.Router();
const { upload } = require("../middleware/multer");

saucesRouter.use(bodyParser.json());
saucesRouter.use(logUtilisateur);

saucesRouter.get("/", recupSauces);
saucesRouter.post("/", upload.single("image"), creationSauce);
saucesRouter.get("/:id", recupProduitParId);
saucesRouter.delete("/:id",logUtilisateur,  suppressionSauce);
saucesRouter.put("/:id", upload.single("image"), modifSauce);

saucesRouter.post("/:id/like", likeSauce);

module.exports = { saucesRouter };
