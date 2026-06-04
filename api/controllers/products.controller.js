const mongoose = require('mongoose');
const Product = require('../models/product.model');

// Création d'un nouveau produit
exports.createProduct = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est un administrateur
        if (req.user.role.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({ message: 'Accès refusé : vous devez être un administrateur pour créer un produit' });
        }

        // Récupérer les informations du produit à partir de la requête
        const { name, description, price, imageUrl, category, stock, isOption } = req.body;
        // Vérifier si un produit avec le même nom existe déjà
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ message: 'Un produit avec ce nom existe déjà' });
        }

        // Créer le nouveau produit
        const newProduct = new Product({
            name,
            description,
            price,
            imageUrl,
            category,
            stock,
            isOption
        });

        // Enregistrer le produit dans la base de données
        const savedProduct = await newProduct.save();

        // Retourner le produit créé
        res.status(201).json({message: `Produit ${savedProduct.name} créé avec succès`, product: savedProduct});
    } catch (error) {
        // Gérer les erreurs
        res.status(500).json({ message: 'Erreur lors de la création du produit', error });
    }
};

// Modifie un produit existant
exports.updateProduct = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est un administrateur        
        if (req.user.role.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({ message: 'Accès refusé : vous devez être un administrateur pour modifier un produit' });
        }

        // Récupérer l'ID du produit à partir des paramètres de la requête
        const productId = req.params.id;
        // Récupérer les nouvelles informations du produit à partir de la requête
        const { name, description, price, imageUrl, category, stock, isOption } = req.body;
        // Vérifier si le produit existe
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        // Mettre à jour les informations du produit
        existingProduct.name = name || existingProduct.name; 
        existingProduct.description = description || existingProduct.description;
        existingProduct.price = price || existingProduct.price;
        existingProduct.imageUrl = imageUrl || existingProduct.imageUrl;
        existingProduct.category = category || existingProduct.category;
        existingProduct.stock = stock !== undefined ? stock : existingProduct.stock;
        existingProduct.isOption = isOption !== undefined ? isOption : existingProduct.isOption;

        // Enregistrer les modifications dans la base de données
        const retval = await existingProduct.updateOne(existingProduct);
        if (!retval.acknowledged || retval.modifiedCount === 0) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du produit', error });
        }
        const updatedProduct = await Product.findById(productId); // Récupérer le produit mis à jour pour la réponse
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
    
        res.status(200).json({ message: 'Produit mis à jour avec succès', product: updatedProduct });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour du produit', error });
    }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est un administrateur
        if (req.user.role.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({ message: 'Accès refusé : vous devez être un administrateur pour supprimer un produit' });
        }
        // Récupérer l'ID du produit à partir des paramètres de la requête
        const productId = req.params.id;
        // Vérifier si le produit existe
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        // Supprimer le produit de la base de données
        await existingProduct.deleteOne({ _id: productId });
        res.status(200).json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du produit', error });
    }
};

// Modifier le stock d'un produit (fonction qui devra être appelé lorsqu'une commande est validée pour réduire le stock du produit commandé)
exports.updateProductStock = async (req, res) => {
    try {
        // Vérifier si le produit existe        
        const  productId  = req.params.id;
        const  qtySold  = parseInt(req.body.qtySold); // Quantité vendue à soustraire du stock   

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        // Récupérer la nouvelle quantité de stock à partir de la requête
        const newStock = parseInt(existingProduct.stock) - qtySold;

        if (newStock < 0) {
            return res.status(400).json({ message: 'Stock insuffisant pour ce produit' });
        }
        // Mettre à jour la quantité de stock du produit
        existingProduct.stock = newStock;

        // Enregistrer les modifications dans la base de données
        const retval = await existingProduct.updateOne(existingProduct);
        if (!retval.acknowledged || retval.modifiedCount === 0) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du stock du produit', error });
        }
        // relit le produit mis à jour pour s'assurer que les données sont à jour avant de les retourner dans la réponse
        const updatedProduct = await Product.findById(productId);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        
        res.status(200).json({ message: `Stock du produit ${updatedProduct.name} mis à jour avec succès`, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'updateProductStock - L142 : Erreur lors de la mise à jour du stock du produit', error });
    }
};

// Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().select(' -createdAt -updatedAt -__v');

        res.status(200).json({ message: `${products.length} produit${products.length > 1 ? 's récupérés' : ' récupéré'} avec succès`, products });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des produits', error: error.message, name: error.name });
    }
};