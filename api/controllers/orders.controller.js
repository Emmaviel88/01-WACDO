const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const OrderLine = require('../models/orderline.model');
const Product = require('../models/product.model');
const Menu = require('../models/menu.model');
const { ajoutLigneCde } = require('../middlewares/miscFunctions');
const Employee = require('../models/employee.model');
//const Customer = require('../Unrequested/customer.model'); // Non demandé dans la description du projet : gestion du client dans la création de commande

exports.createOrder = async (req, res) => {
    try {
        await connectDB(); // On s'assure que la connexion à la BDD est établie avant d'effectuer des opérations de lecture

        // Récupérer l'id de l'employé qui crée la commande à partir de l'objet utilisateur dans la requête
        const empCreation = req.user.id;
        console.log(`Utilisateur connecté dans CreateOrder : ${empCreation} (${req.user.role})`); // Affiche l'id et le rôle de l'utilisateur connecté dans la console pour le débogage

         // Récupérer les données de la requête pour créer une nouvelle commande (les id Employé préparation et livraison seront assignés plus tard)
        const placeConsume = req.body.placeConsume;
        console.log(`Lieu de consommation reçue dans CreateOrder : ${placeConsume}`);
        
        // Vérifier si l'id de l'employé est présent
        if (!empCreation) {
            return res.status(400).json({ message: 'ID de l\'employé créateur de la commande est requis' });
        }
        
        // Vérifier si l'employé existe (vous pouvez ajouter une vérification pour l'employé si nécessaire)
        const employeeExists = await Employee.findById(empCreation);
        if (!employeeExists) {
            return res.status(404).json({ message: 'Employé non trouvé' });
        }
        
        // Vérifier si l'employé a le rôle de "ACCUEIL" ou "ADMIN" (un employé au status IDLE ne peut pas créer de commande)
        const validRoles = ['RECEPTION', 'ADMIN'];
        if (!validRoles.includes(employeeExists.role.toUpperCase())) {
            return res.status(403).json({ message: 'Accès refusé : vous devez être un utilisateur RECEPTION  ou ADMIN pour créer une commande' });
        }                     
        
        // Non demandé dans la description du projet : gestion du client dans la création de commande
        // Vérifier si le client existe
        // const customerExists = await Customer.findById(customerId);
        // if (!customerExists) {
        //     return res.status(404).json({ message: 'Client non trouvé, procéder à sa création avant de saisir une commande' });
        // }
        
        // Créer une nouvelle commande
        const newOrder = new Order({
            // customerId, // Gestion client non demandé dans la description du projet
            empCreated: empCreation,
            empPrepared: null, // L'employé de préparation sera assigné plus tard
            empDelivered: null, // L'employé de livraison sera assigné plus tard
            status: 'PENDING', // La commande est créée avec le statut "PENDING" par défaut
            lines: [], // Initialiser les lignes de commande à un tableau vide, les lignes seront ajoutées plus tard
            total : 0, // Initialiser le total à 0
            placeConsume: placeConsume
        });
        
        // Enregistrer la commande dans la base de données
        const savedOrder = await newOrder.save();
        
        // Retourner la commande créée
        res.status(201).json({ message: `Commande ${savedOrder._id} créée avec succès`, order: savedOrder });

    }    catch (error) {
        res.status(500).json({ message: 'L55: Erreur lors de la création de la commande', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        await connectDB(); // On s'assure que la connexion à la BDD est établie avant d'effectuer des opérations de lecture

        const { orderId } = req.params; // Récupérer l'id de la commande à partir des paramètres de la requête
        const newStatus = req.body.status; // Récupérer le nouveau statut de la commande à partir du corps de la requête
        
        console.log(`Mise à jour du statut de la commande ${orderId} reçue dans UpdateOrderStatus : ${newStatus}`);

        // Récupérer l'id de l'employé qui met à jour la commande à partir de l'objet utilisateur dans la requête (celui qui s'est loggé pour faire la requête)
        const empUpdateId = req.user.id;
        console.log(`Utilisateur connecté dans UpdateOrderStatus : ${empUpdateId} (${req.user.role})`); // Affiche l'id et le rôle de l'utilisateur connecté dans la console pour le débogage

        // Vérifier si l'id de l'employé est présent
        if (!empUpdateId) {
            return res.status(400).json({ message: 'L75: ID de l\'employé en charge de la commande est requis' });
        }
        
        // Vérifier si l'employé existe (vous pouvez ajouter une vérification pour l'employé si nécessaire)
        const employeeExists = await Employee.findById(empUpdateId);
        if (!employeeExists) {
            return res.status(404).json({ message: 'L81: Employé non trouvé' });
        }
        
        // Vérifier si l'employé a le rôle de "ACCUEIL" ou "ADMIN" (un employé au status IDLE ne peut pas créer de commande)
        const validRoles = ['RECEPTION', 'PREPARATION', 'DELIVERY', 'ADMIN'];
        if (!validRoles.includes(employeeExists.role.toUpperCase())) {
            return res.status(403).json({ message: 'L87: Accès refusé : vous devez être un utilisateur RECEPTION, PREPARATION, DELIVERY ou ADMIN pour modifier le statut d\'une commande' });
        }

        // Vérifier si la commande existe
        const orderToUpdate = await Order.findById(orderId);
        if (!orderToUpdate) {
            return res.status(404).json({ message: 'L93: Commande non trouvée' });
        }
        
        // Vérifier si le nouveau statut est valide (PENDING, PREPARING, READY, DELIVERED)
        const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: 'L99: New Status invalid' });
        }
       
        // Mettre à jour le statut de la commande
        orderToUpdate.status = newStatus;

        // // Si le nouveau statut est "PREPARING", assigner l'employé de préparation
        // if (newStatus === 'PREPARING') {
        //     orderToUpdate.empPrepared = empUpdateId;
        // }

        // Si le nouveau statut est "READY", assigner l'employé de préparation
        if (newStatus === 'READY') {
            orderToUpdate.empPrepared = empUpdateId;
        }

        // Si le nouveau statut est "DELIVERED", assigner l'employé de livraison
        if (newStatus === 'DELIVERED') {
            orderToUpdate.empDelivered = empUpdateId;
        }

        const retval = await Order.updateOne({ _id: orderId }, { status: newStatus, empPrepared: orderToUpdate.empPrepared, empDelivered: orderToUpdate.empDelivered }, { new: true });
        if (!retval.acknowledged || retval.modifiedCount === 0) {
            return res.status(500).json({ message: 'L107: Erreur lors de la mise à jour du statut de la commande' });
        }

        // Récupérer la commande mise à jour pour la retourner dans la réponse
        const updatedOrder = await Order.findById(orderId);

        // Retourner la commande mise à jour
        res.status(200).json({ message: `L134: Statut de la commande ${orderId} mis à jour avec succès`, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: 'L136: Erreur lors de la mise à jour du statut de la commande', error: error.message });
    }
};

exports.getOrdersList = async (req, res) => {
    try {
        await connectDB(); // On s'assure que la connexion à la BDD est établie avant d'effectuer des opérations de lecture
        // console.log('Ready-State après connectDB = ', mongoose.connection.readyState);
        // Récupèrer la liste de toutes les commandes dans la base de données
        const ordersList = await Order.find()
            .select('_id placeConsume status createdAt')
            .sort({ createdAt: 1 }); // Trier les commandes par date de création (les plus récentes en premier)
        // Retourner la liste des commandes
        // console.log(`La liste des commandes récupérée contient ${ordersList.length} commandes`);
        res.status(200).json({message: `La liste des commandes récupérée contient ${ordersList.length} commandes`, orders: ordersList });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: error.message });
    }
};
// */
// exports.getOrdersList = async (req, res) => {
//     try {
//         await connectDB();

//         console.log('ReadyState après connectDB =', mongoose.connection.readyState);

//         console.log('Avant Order.find()');

//         const ordersList = await Order.find()
//             .select('_id placeConsume status createdAt')
//             .sort({ createdAt: 1 });

//         console.log('Après Order.find()');
//         console.log('Nombre de commandes =', ordersList.length);

//         res.status(200).json({
//             orders: ordersList
//         });

//     } catch (error) {
//         console.error('ERREUR COMPLETE:', error);

//         res.status(500).json({
//             message: error.message
//         });
//     }
// };

exports.addLineToOrder = async (req, res) => {
    try {
        await connectDB(); // On s'assure que la connexion à la BDD est établie avant d'effectuer des opérations de lecture

        const { orderId } = req.params; // Récupérer l'id de la commande à partir des paramètres de la requête
        const { productId, menuId, quantityOrdered } = req.body; // Récupérer les données de la ligne de commande à partir du corps de la requête
        console.log(`L153: Requête reçue dans AddOrderLine pour la commande ${orderId} : productId=${productId}, menuId=${menuId}, quantity=${quantityOrdered}`);
        // Vérifier si la commande existe
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        
        // Vérifier si on a reçu un id de Produit ou de Menu, mais pas les deux en même temps
        if (productId !== null && menuId === null) {
            console.log(`L165: Ajout d'une ligne de commande à la commande ${orderId} reçue dans AddOrderLine : productId=${productId}, quantity=${quantityOrdered}`);
        } 
        if (productId === null && menuId !== null) {
            console.log(`L167: Ajout d'une ligne de commande à la commande ${orderId} reçue dans AddOrderLine : menuId=${menuId}, quantity=${quantityOrdered}`);
        }
        if (productId === null && menuId === null) {
            return res.status(400).json({ message: 'L171: Au moins un id de Produit ou de Menu est requis pour ajouter une ligne de commande' });
        }      
        
        // Vérifier si l'utilisateur est connecté et possède le rôle ADMIN ou RECEPTION
                // Récupérer l'id de l'employé qui met à jour la commande à partir de l'objet utilisateur dans la requête (celui qui s'est loggé pour faire la requête)
        const empUpdateId = req.user.id;
        console.log(`Utilisateur connecté dans addLineToOrder : ${empUpdateId} (${req.user.role})`); // Affiche l'id et le rôle de l'utilisateur connecté dans la console pour le débogage

        // Vérifier si l'id de l'employé est présent
        if (!empUpdateId) {
            return res.status(400).json({ message: 'L183: ID de l\'employé en charge de la commande est requis' });
        }
        
        // Vérifier si l'employé existe (vous pouvez ajouter une vérification pour l'employé si nécessaire)
        const employeeExists = await Employee.findById(empUpdateId);
        if (!employeeExists) {
            return res.status(404).json({ message: 'L189: Employé non trouvé' });
        }
        
        // Vérifier si l'employé a le rôle de "ACCUEIL" ou "ADMIN" (un employé au status IDLE ne peut pas créer de commande)
        const validRoles = ['RECEPTION', 'ADMIN'];
        if (!validRoles.includes(employeeExists.role.toUpperCase())) {
            return res.status(403).json({ message: 'L195: Accès refusé : vous devez être un utilisateur RECEPTION,  ou ADMIN pour ajouter une ligne à une commande' });
        }

        let ligneAjoutee; // Variable pour stocker la ligne de commande ajoutée, qui sera retournée par la fonction ajoutLigneCde et qui contiendra les informations de la ligne de commande créée (id, prix, etc.) pour pouvoir mettre à jour le total de la commande ensuite

        // Si c'est un produit simple, on le récupère et on appelle la création de la ligne de commande avec l'id de la commande, l'id du produit et la quantité commandée
        // On teste aussi qu'on n'a pas reçu un productId en même temps qu'un menuId
        if (productId != null && productId != undefined && (menuId === null || menuId === undefined)) {
            // console.log(`L175: Ajout d'une ligne de commande pour un produit simple à la commande ${orderId} : productId=${productId}, quantity=${quantityOrdered}`);
            ligneAjoutee = await ajoutLigneCde(orderId, productId, quantityOrdered);
            // console.log(`L177: addOrderLine function returned following object ${ligneAjoutee}`);
            if (ligneAjoutee._id === null || ligneAjoutee === undefined) {
                // console.error(`L179: addOrderLine function failed to add a line to the order ${orderId} for product ${productId} with quantity ${quantityOrdered}`);
                return res.status(500).json({ message: 'Erreur lors de l\'ajout de la ligne de commande du produit' });
            }
            
            // console.log(`L180: Ligne de commande ${ligneAjoutee._id} ajoutée à la commande ${orderId}`);
            
            // Ajouter le prix de la ligne de commande au total de la commande
            order.total += ligneAjoutee.price; // Ajouter le prix de la ligne de commande au total de la commande
            console.log(`L186: Total de la commande ${orderId} mis à jour avec le prix du produit : ${order.total}`);
        }
        // console.log(`L190: productId=${productId}, menuId=${menuId}, quantity=${quantityOrdered}`);
        // Si c'est un menu, on le récupère et on parcours ses lignes pour les ajouter à la commande
        if (menuId != null && menuId != undefined) {
            let menu = await Menu.findById(menuId);
            if (!menu) {
                return res.status(404).json({ message: 'Menu non trouvé' });
            }
            // console.log(`L195: Menu ${menuId} trouvé : ${menu.name}, prix : ${menu.price}`);

            for (let menuLine of menu.lines) {
                // console.log(`L198: Traitement de la ligne du menu : productId=${menuLine.productId}, quantity=${menuLine.quantity}`);
                
                // Appeler la fonction addOrderLine pour chaque ligne du menu, en utilisant l'id de la commande, l'id du produit et la quantité de la ligne du menu multipliée par la quantité commandée du menu
                ligneAjoutee = await ajoutLigneCde(orderId, menuLine.productId, menuLine.quantity * quantityOrdered);  
                if (!ligneAjoutee) {
                    return res.status(500).json({ message: 'Erreur lors de l\'ajout de la ligne de commande du menu' });
                }              
                // console.log(`L205: Ligne de commande ajoutée à la commande ${orderId} pour le produit ${menuLine.productId} avec la quantité ${menuLine.quantity * quantityOrdered}`);               
                ligneAjoutee.price = 0; // Le prix de la ligne de commande d'un menu est considéré comme 0 car le prix du menu est ajouté au total de la commande
                await ligneAjoutee.save(); // Enregistrer la ligne de commande mise à jour avec le prix à 0 dans la base de données
            }      
                // Ajouter le prix de la ligne de commande au total de la commande              
                order.total += menu.price*quantityOrdered; // Ajouter le prix du menu au total de la commande
                // console.log(`L210: Total de la commande ${orderId} mis à jour avec le prix du menu : ${order.total}`);      
        }
        
        // Mettre à jour le statut de la commande à "PREPARING" (elle était à "PENDING" à sa création) pour indiquer que la préparation de la commande peut commencer
        order.status = "PREPARING";
        // Enregistrer les modifications de la commande dans la base de données
        const updatedOrder = await order.save();
        if (!updatedOrder) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du total et du statut de la commande' });
        }
         res.status(200).json({ message: `FnL227: Ligne de commande ajoutée à la commande ${updatedOrder._id} avec succès (Total mis à jour : ${updatedOrder.total})` });
    } catch (error) {
        res.status(500).json({ message: 'Fn L229: Erreur lors de l\'ajout de la ligne de commande', error: error.message });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        await connectDB(); // On s'assure que la connexion à la BDD est établie avant d'effectuer des opérations de lecture

        const { orderId } = req.params; // Récupérer l'id de la commande à partir des paramètres de la requête
        console.log('orderId reçu :', req.params.orderId);

        // Récupèrer les détails de la commande, y compris les informations sur les employés, le statut, le total, le lieu de consommation et les lignes de commande avec les détails des produits
        const order = await Order.findById(orderId)
            .populate('empCreated', 'login')
            .populate('empPrepared', 'login')
            .populate('empDelivered', 'login')
            .populate('status')
            .populate('total')
            .populate('placeConsume')
            .populate({ path: 'lines', populate: { path: 'productId', select: 'name' }, select: 'quantity price' }); // Populate les lignes de commande avec les détails du produit (nom et quantité)
            // .sort({ createdAt: 1 }); // Trier les commandes par date de création (par défaut les plus anciennes en premier)
        // Vérifier si la commande existe
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        // Retourner les détails de la commande
        res.status(200).json({ message: `Détails de la commande ${orderId} récupérés avec succès`, order: order });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des détails de la commande', error: error.message });
    }
};

exports.deleteOrderLine = async (req, res) => {
    try {
        await connectDB(); // On s'assure que la connexion à la BDD est établie avant d'effectuer des opérations de lecture
        
        const { orderId } = req.params; // Récupérer l'id de la commande à partir des paramètres de la requête
        const { orderLineId } = req.body; // Récupérer l'id de la ligne de commande à supprimer à partir du corps de la requête
        // Vérifier si la commande existe
        console.log("params =", req.params);
        console.log("body =", req.body);
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        // Vérifier le status de la commande : une ligne de commande ne peut être supprimée que si la commande est au statut "PREPARING" ou "READY" 
        // (la commande est au statut "PENDING" à sa création, elle passe à "PREPARING" dès qu'une ligne de commande est ajoutée, 
        // et elle passe à "READY" lorsque la préparation de la commande est terminée, donc tant que la commande n'est pas encore livrée, on peut supprimer une ligne de commande)
        if (order.status !== 'PREPARING' && order.status !== 'READY') {
            return res.status(400).json({ message: 'Une ligne de commande ne peut être supprimée que si la commande est au statut PREPARING ou READY' });
        } 

        // Vérifier si la ligne de commande existe dans la commande
        const lineIndex = order.lines.findIndex(line => line.toString() === orderLineId);
        if (lineIndex === -1) {
            return res.status(404).json({ message: 'Ligne de commande non trouvée dans la commande' });
        }
        // Récupérer la ligne de commande pour soustraire son prix du total de la commande
        const orderLine = await OrderLine.findById(orderLineId);
        if (!orderLine) {
            return res.status(404).json({ message: 'Ligne de commande non trouvée' });
        }
        // Récupérer le produit pour mise à jour de son stock (suite à annulation de la ligne de commande)
        const orderedProduct = await Product.findById(orderLine.productId);
        if (!orderedProduct) {
            throw new Error('Product not found');
        }        
        // Supprimer la ligne de commande de la base de données
        const deletedLine = await OrderLine.findByIdAndDelete(orderLineId);
        if (!deletedLine) {
            return res.status(500).json({ message: 'Erreur lors de la suppression de la ligne de commande' });
        }
        console.log(`${order.lines.length} Lignes avant suppression : ${order.lines}`);
        console.log(`Stock du produit ${orderedProduct.name} avant mise à jour : ${orderedProduct.stock}`);
        // Supprimer la ligne de commande de la commande
        order.lines.splice(lineIndex, 1);
        console.log(`${order.lines.length} Lignes après suppression : ${order.lines}`);
        // Soustraire le prix de la ligne de commande du total de la commande
        console.log(`Total avant suppression : ${order.total}`);
        console.log(`Prix de la ligne de commande à supprimer : ${orderLine.price}`);
        order.total -= orderLine.price;
        console.log(`Total après suppression : ${order.total}`);
        // Recalculer la quantité en stock du produit suite à l'annulation de la ligne de commande
        orderedProduct.stock += orderLine.quantity;
        console.log(`Stock du produit ${orderedProduct.name} après mise à jour : ${orderedProduct.stock}`);
        // Met à jour la quantité en stock du produit dans la base de données
        await orderedProduct.save();
        // Enregistrer les modifications de la commande dans la base de données
        const updatedOrder = await order.save();
        if (!updatedOrder) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du total et du statut de la commande' });
        }
        res.status(200).json({ message: `Ligne de commande supprimée de la commande ${updatedOrder._id} avec succès (Total mis à jour : ${updatedOrder.total})` });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la ligne de commande', error: error.message });
    }
};

