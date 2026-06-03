const express = require('express');
const { createProduct, updateProduct, deleteProduct, updateProductStock, getAllProducts } = require('../controllers/products.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestion des produits
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Route de création d'un produit (réservé aux administrateurs)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Le nom du produit
 *               description:
 *                 type: string
 *                 description: Texte expliquant le contenu ou la composition du produit
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum:
 *                   - BEVERAGES
 *                   - VEGIS
 *                   - MEATS
 *                   - DESSERTS
 *               stock:
 *                 type: number
 *               isOption:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Création réussie, retourne un objet avec les données du produit créé.
 *       500:
 *         description: Erreur serveur
 */
// Route de création d'un nouveau produit (protégée par le middleware d'authentification qui vérifie que l'utilisateur est connecté et a le rôle de "ADMIN")
router.post('/', auth, createProduct);

/**
 * @swagger
 * /api/products/updateStock/{productId}:
 *   put:
 *     summary: Route de mise à jour de la quantité en stock d'un produit (suite à la vente)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qtySold:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quantité en stock mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 imageUrl:
 *                   type: string
 *                 category:
 *                   type: string
 *                   enum:
 *                     - BEVERAGES
 *                     - VEGIS
 *                     - MEATS
 *                     - DESSERTS
 *                 stock:
 *                   type: number
 *                 isOption:
 *                   type: boolean
 *       404:
 *         description: Erreur (Produit non trouvé)
 *       500:
 *         description: Erreur serveur
 */
// Route de mise à jour du stock d'un produit (appelée lorsqu'une commande est validée pour réduire le stock du produit commandé)
router.put('/updateStock/:id', updateProductStock);

// Route de modification d'un produit existant (protégée par le middleware d'authentification)
router.put('/edit/:id', auth, updateProduct);

// Route de suppression d'un produit (protégée par le middleware d'authentification)
router.delete('/delete/:id', auth, deleteProduct);

/**
 * @swagger
 * /api/products/list:
 *   get:
 *     summary: Route de liste des produits avec leurs données (_id, name, description, ...)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Liste détaillée de chaque produit
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   imageUrl:
 *                     type: string
 *                   category:
 *                     type: string
 *                     enum:
 *                       - BEVERAGES
 *                       - VEGIS
 *                       - MEATS
 *                       - DESSERTS
 *                   stock:
 *                     type: number
 *                   isOption:
 *                     type: boolean
 *       500:
 *         description: Erreur serveur
 */
// Route de liste des produits
router.get('/list', getAllProducts);

module.exports = router;
