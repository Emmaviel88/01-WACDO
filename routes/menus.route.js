const express = require('express');
const { createMenu, createMenuLine, deleteMenuLine, changeMenuPrice, listMenus } = require('../controllers/menus.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Gestion des menus
 */

// Route de création d'un nouveau menu (à protéger par le middleware d'authentification qui vérifie que l'utilisateur est connecté et a le rôle de "ADMIN")
// Note : le middleware d'authentification auth doit être appliqué avant les contrôleurs pour protéger les routes
/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Création d'un nouveau menu (réservé aux administrateurs)
 *     tags: [Menus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Menu créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 menu:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *       400:
 *         description: Requête invalide, données manquantes ou incorrectes
 *       401:
 *         description: Non autorisé, l'utilisateur n'est pas connecté ou n'a pas le rôle d'administrateur
 *       500:
 *         description: Erreur serveur
*/
router.post('/', createMenu);

// Route d'ajout d'une ligne à un menu existant (à protéger par le middleware d'authentification)
// Note : le middleware d'authentification auth doit être appliqué avant les contrôleurs pour protéger les routes
/**
 * @swagger
 * /api/menus/addLine/{menuId}:
 *   post:
 *     summary: Ajout d'une ligne à un menu existant (réservé aux administrateurs)
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: menuId
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
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *      200:
 *       description: Ligne ajoutée au menu avec succès
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               menu:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   lines:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: string
 *                         quantity:
 *                           type: number
 *                   price:
 *                     type: number
 *      500:
 *        description: Erreur serveur
 *   
 */
router.post('/addLine/:menuId', createMenuLine);

// Route de suppression d'une ligne d'un menu existant (à protéger par le middleware d'authentification)
// Note : le middleware d'authentification auth doit être appliqué avant les contrôleurs pour protéger les routes
/**
 * @swagger
 * /api/menus/deleteLine/{menuId}:
 *   delete:
 *     summary: Suppression d'une ligne d'un menu existant (réservé aux administrateurs)
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: menuId
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
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ligne supprimée du menu avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 menu:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     lines:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                     price:
 *                       type: number
 *       500:
 *         description: Erreur serveur lors de la suppression
 *         content:
 *           application/json:
 *             schema: 
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     message:
 *                       type: string
 *                     stack:
 *                       type: string
 * 
 */
router.delete('/deleteLine/:menuId', deleteMenuLine);

// Route de modification du prix d'un menu existant (à protéger par le middleware d'authentification)
// Note : le middleware d'authentification auth doit être appliqué avant les contrôleurs pour protéger les routes
/**
 * @swagger
 * /api/menus/updatePrice/{menuId}:
 *   put:
 *     summary: Route de modification du prix d'un menu existant (réservé aux administrateurs)
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: menuId
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
 *               newPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Prix du menu mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 menu:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *       500:
 *         description: Erreur serveur
 */
router.put('/updatePrice/:menuId', changeMenuPrice);

 // Route de récupération de tous les menus (accessible à tous les utilisateurs, pas besoin d'authentification)
 /**
  * @swagger
  * /api/menus/list:
  *   get:
  *     summary: Route de liste des menus avec leurs contenus respectifs
  *     tags: [Menus]
  *     responses:
  *       200:
  *         description: Liste détaillée de chaque menu
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
  *                   lines:
  *                     type: array
  *                     items:
  *                       type: object
  *                       properties:
  *                         productId:
  *                           type: string
  *                         quantity:
  *                           type: number
  *                   price:
  *                     type: number
  *       500:
  *         description: Erreur serveur  
  */
 router.get('/list', listMenus);

module.exports = router;