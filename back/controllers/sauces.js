// importation des modules requis
const jwt = require("jsonwebtoken"); // JSW pour gérer les json web token,
const mongoose = require("mongoose"); // gestion de mongoose
const { unlink } = require("fs/promises");

// on définit un schéma mongoose, pour le modele "schemaProduit"

const schemaProduit = new mongoose.Schema({
  userId: String,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: Number,
  likes: Number,
  dislikes: Number,
  usersLiked: [String],
  usersDisliked: [String],
});

//creation d'un modele mongoose "produit" basé sur le schéma definit au dessus
const Product = mongoose.model("Product", schemaProduit);

//fonction pour récupérer tous les produits dans la db, et renvoyer une réponse
function recupSauces(req, res) {
  // console.log("token validé");
  Product.find({})
    .then((products) => res.send(products))
    .catch((error) => res.status(500).send(error));
}

//fonction pour récupérer un produit grace à son ID
function recupProduit(req, res) {
  const { id } = req.params;
  return Product.findById(id);
}

//focntion async pour récupérer un produit avec l'id, et repondre ua client

async function recupProduitParId(req, res) {
  recupProduit(req, res)
    .then((product) => reponseClient(product, res))
    .catch((err) => res.status(500).send(err));
  // .catch((err) => res.status);
  // .then((product) => reponseClient(product, res))
}

//fonction pour répondre au client, selon les produits récupérés
function reponseClient(product, res) {
  if (product == null) {
    // console.log("rien à màj");
    return res.status(404).send({ message: "objet introuvable" });
  }
  console.log("réponse correcte : ", product);
  return Promise.resolve(res.status(200).send(product)).then(() => product);
}

//fonction pour supprimer un article, et son image
function suppressionSauce(req, res) {
  const { id } = req.params;
  Product.findByIdAndDelete(id)
    .then((product) => reponseClient(product, res))
    .then((item) => suppressionImage(item))
    .then((res) => console.log("Fichier(s) supprimé(s)", res))
    .catch((err) => res.status(500).send({ message: err }));
}

//fonction pour supprimer les images des produits supprimés/modifiés
function suppressionImage(product) {
  if (product == null) return;
  const imageToDelete = product.imageUrl.split("/").at(-1);
  return unlink("images/" + imageToDelete);
}



//fonction pour modifier un produit
function modifSauce(req, res) {
  const {
    params: { id },
  } = req;
  const { body } = req;
  const hasNewImage = req.file != null;
  const payload = makeBack(hasNewImage, req);

  Product.findByIdAndUpdate(id, payload)
    .then((dbResponse) => reponseClient(dbResponse, res))
    .then((product) => suppressionImage(product))
    .then((res) => console.log("image(s) supprimée(s)", res))
    .catch((err) => console.error("problème de modification", err));
}

// creation d'un payload pour un produit, si oui ou non il y a une image
//si pas de nouvelle image => retourne le body actuel de la requête

function makeBack(hasNewImage, req) {
  if (!hasNewImage) return req.body;
  const payload = JSON.parse(req.body.sauce);
  payload.imageUrl = generateUrlImage(req, req.file.fileName);
  return payload;
}

//génère un url pour les images

function generateUrlImage(req, fileName) {
  return `${req.protocol}://${req.get("host")}/images/${fileName}`;
}

function generateUrlImage(req, fileName) {
  return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

//gère la creation de nouveaux produits
//extrait les data nécessaires depuis la req
//créé une nouvelle instance 'produit' avec les données extraites
//sauvegarde le nouveau produit dans la db, et envoie une réponse selon le déroulement
function creationSauce(req, res) {
  const { body, file } = req;
  const { fileName } = file;
  const sauce = JSON.parse(body.sauce);
  const { name, manufacturer, description, mainPepper, heat, userId } = sauce;

  const product = new Product({
    userId,
    name,
    manufacturer,
    description,
    mainPepper,
    imageUrl: generateUrlImage(req, fileName),
    heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });

  product
    .save()
    .then((message) => {
      res.status(201).send({ message });
      // console.log("Produit enregistré", message);
    })
    .catch((err) => res.status(500).send(err));
}

//fonction pour gérer les likes/dislikes
//vérifie si la valeur du like est valide (1 pour like, -1 pour dislike, 0 pour rien)
//recupérer le produit en utilisant "recupProduit", et met à jour les votes du produits en utilisant majVote
function likeSauce(req, res) {
  const { like, userId } = req.body;
  if (![1, -1, 0].includes(like)) {
    return res.status(403).send({ message: "Donnée like/dislike invalide" });
  }

  recupProduit(req, res)
    .then((product) => majVote(product, like, userId, res))
    .then((pr) => pr.save())
    .then((prod) => reponseClient(prod, res))
    .catch((err) => res.status(500).send(err));
}

//détermine si c'est un like; dislike, ou une mise à zéro, en se basant sur la valeur de "like"
function majVote(product, like, userId, res) {
  if (like === 1 || like === -1) {
    return upVote(product, userId, like);
  }
  return deleteVote(product, userId, res);
}

//supprimé le vote d'un utilisateur sur un produit

function deleteVote(product, userId, res) {
  const { usersLiked, usersDisliked } = product;

  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) {
    return Promise.reject("l'utilisateur a voté like/dislike en même temps");
  }

  if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) {
    return Promise.reject("l'utilisateur n'a pas voté");
  }

  if (usersLiked.includes(userId)) {
    //pré increment, l'operation est effectuée à la fin du block de code
    --product.likes;
    product.usersLiked = product.usersLiked.filter((id) => id !== userId);
  } else {
    --product.dislikes;
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId);
  }

  return product;
}

//incrémente le vote en like ou dislike, selon la valeur de "like"
function upVote(product, userId, like) {
  const { usersLiked, usersDisliked } = product;
  const votersArray = like === 1 ? usersLiked : usersDisliked;

  if (votersArray.includes(userId)) {
    return product;
  }

  votersArray.push(userId);

  like === 1 ? ++product.likes : ++product.dislikes;
  return product;
}

//on exporte tous le modules nécessaires
module.exports = {
  recupSauces,
  creationSauce,
  recupProduitParId,
  suppressionSauce,
  modifSauce,
  likeSauce,
  recupProduit,
};
