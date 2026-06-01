const mongoose = require('mongoose');
const Order = require('../models/order.model');
const OrderLine = require('../models/orderLine.model');
const Product = require('../models/product.model');
const Menu = require('../models/menu.model');

const ajoutLigneCde = async (orderId, productId, quantityOrdered) => {
    try {
        // Vérifier que le produit existe
        const orderedProduct = await Product.findById(productId);
        if (!orderedProduct) {
            throw new Error('Product not found');
        }
        // console.log('SubFn L15: Product found:', orderedProduct.name, 'with stock:', orderedProduct.stock);
        // Vérifier que la quantité est un nombre positif
        if (quantityOrdered <= 0) {
            throw new Error('Quantity must be a positive number');
        }
        console.log('SubFn L20: Quantity is valid:', quantityOrdered);
        // Vérifier que la commande existe        
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        // console.log('SubFn L26: Order found:', order._id);
        // Vérifier que le produit est disponible
        if (orderedProduct.stock < quantityOrdered) {
            throw new Error('Insufficient stock for the product');
        }
        // Recalculer la quantité en stock du produit
        orderedProduct.stock -= quantityOrdered;
        // console.log('SubFn L33: Updated stock for product', orderedProduct.name, ':', orderedProduct.stock);
        // Met à jour la quantité en stock du produit en commande
        await orderedProduct.save();
        // console.log('SubFn L36: Product stock updated in database for', orderedProduct.name);
        // Créer une nouvelle ligne de commande
        const orderLine = new OrderLine({
            orderId: orderId,
            productId: productId,
            menuId: null, // Si c'est un produit, le menuId est null
            quantity: quantityOrdered,
            price: orderedProduct.price * quantityOrdered // Calculer le prix total de la ligne de commande
        });
        // console.log('SubFn L45: New Order-line created with price:', orderLine.price);
        // Enregistrer la ligne de commande dans la base de données
        const newLine = await orderLine.save();
        console.log('SubFn L48: New Order-line saved:', newLine._id);
        const oldLength = order.lines.length;
        const newLength = order.lines.push(newLine._id); // Ajouter l'id de la ligne de commande au tableau des lignes de la commande
        if(newLength > oldLength) {
            console.log(`SubFn L52: Order-line added to order 'Lines' array: ${order._id}, Length before: ${oldLength} / Length after: ${newLength}`);
        } else {
            console.log('SubFn L54: Failed to add order line to order:', order._id);
        }
        await order.save(); // Enregistrer la commande mise à jour avec la nouvelle ligne de commande dans la base de données
        // console.log('SubFn L57: Order updated with new line and saved:', order._id);
        // Retourne la nouvelle ligne de commande créée
        return newLine;
    } catch (error) {
        // console.error('Error adding Order-line:', error);
        throw error; // Propager l'erreur pour qu'elle puisse être gérée par le contrôleur
    }
    
};

// Fonction uniquement créée pour exécuter des tests simples d'addition, à supprimer par la suite
const testsAdd = (x, y) => {
    return x + y;
}

module.exports = { ajoutLigneCde, testsAdd };