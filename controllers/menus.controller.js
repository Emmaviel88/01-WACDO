const mongoose = require('mongoose');
const Menu = require('../models/menu.model');
const Product = require('../models/product.model');

// Crée un nouveau menu
exports.createMenu = async (req, res) => {
    try {
        // TODO: Vérifier que l'utilisateur a le rôle "ADMIN" avant de permettre la création du menu
        // Ajouter le middleware d'authentification dans les routes pour récupérer l'utilisateur connecté et vérifier son rôle
        // const connectedUser = req.user; // Récupérer l'utilisateur connecté à partir du middleware d'authentification
        // if (!connectedUser || connectedUser.role.toUpperCase() !== 'ADMIN') {
        //     return res.status(403).json({ message: 'Accès refusé. Le rôle "ADMIN" est requis pour créer une ligne de menu.' });
        // }

        const { name, lines, price } = req.body;
        const menu = new Menu({ name: name, lines: lines, price: price });
        const savedMenu = await menu.save();
        res.status(201).json({message: 'Menu créé avec succès', menu: savedMenu});
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du menu', error: error.message });
    }
};

// Ajoute une ligne de menu à un menu existant
exports.createMenuLine = async (req, res) => {
    try {
        // TODO: Vérifier que l'utilisateur a le rôle "ADMIN" avant de permettre la création du menu
        // Ajouter le middleware d'authentification dans les routes pour récupérer l'utilisateur connecté et vérifier son rôle
        // const connectedUser = req.user; // Récupérer l'utilisateur connecté à partir du middleware d'authentification
        // if (!connectedUser || connectedUser.role.toUpperCase() !== 'ADMIN') {
        //     return res.status(403).json({ message: 'Accès refusé. Le rôle "ADMIN" est requis pour créer une ligne de menu.' });
        // }

        const { menuId } = req.params;
        const { productId, quantity } = req.body;
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ message: 'Menu non trouvé' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        const menuLine = { productId, quantity };
        menu.lines.push(menuLine);
        const updatedMenu = await menu.save();
        res.status(200).json({ message: 'Ligne de menu ajoutée au menu avec succès', menu: updatedMenu });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la ligne au menu', error: error.message });
    }
};

exports.deleteMenuLine = async (req, res) => {
    try {
        // TODO: Vérifier que l'utilisateur a le rôle "ADMIN" avant de permettre la suppression du menu
        // Ajouter le middleware d'authentification dans les routes pour récupérer l'utilisateur connecté et vérifier son rôle
        // const connectedUser = req.user; // Récupérer l'utilisateur connecté à partir du middleware d'authentification
        // if (!connectedUser || connectedUser.role.toUpperCase() !== 'ADMIN') {
        //     return res.status(403).json({ message: 'Accès refusé. Le rôle "ADMIN" est requis pour supprimer une ligne de menu.' });
        // }

        const { menuId } = req.params;
        const { productId } = req.body;
        console.log(`menuId: ${menuId}, productId: ${productId}`);
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ message: 'Menu non trouvé' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        const menuLineIndex = menu.lines.findIndex(line => line.productId.toString() === productId);
        console.log(`menuLineIndex: ${menuLineIndex}`);
        if (menuLineIndex === -1) {
            return res.status(404).json({ message: 'Ligne de menu non trouvée dans le menu' });
        }
        menu.lines.splice(menuLineIndex, 1);
        const updatedMenu = await menu.save();
        res.status(200).json({ message: 'Ligne de menu supprimée du menu avec succès', menu: updatedMenu });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la ligne du menu', error: error.message });
    }
};

exports.changeMenuPrice = async (req, res) => {
    try {
        // TODO: Vérifier que l'utilisateur a le rôle "ADMIN" avant de permettre la modification du prix du menu
        // Ajouter le middleware d'authentification dans les routes pour récupérer l'utilisateur connecté et vérifier son rôle
        // const connectedUser = req.user; // Récupérer l'utilisateur connecté à partir du middleware d'authentification
        // if (!connectedUser || connectedUser.role.toUpperCase() !== 'ADMIN') {
        //     return res.status(403).json({ message: 'Accès refusé. Le rôle "ADMIN" est requis pour modifier le prix d\'un menu.' });
        // }

        const { menuId } = req.params;
        const { newPrice } = req.body;
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ message: 'Menu non trouvé' });
        }
        menu.price = newPrice;
        const updatedMenu = await menu.save();
        res.status(200).json({ message: 'Prix du menu mis à jour avec succès', menu: updatedMenu });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du prix du menu', error: error.message });
    }
};

exports.listMenus = async (req, res) => {
    try {
        const menus = await Menu.find().populate('lines.productId');
        res.status(200).json({ message: 'Menus récupérés avec succès', menus: menus });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des menus', error: error.message });
    }
};

