const request = require('supertest');
const { MongoMemoryServer } = require("mongodb-memory-server");
const { default: mongoose } = require('mongoose');
const { testsAdd } = require('../middlewares/miscFunctions');
const Employee = require('../models/employee.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const OrderLine = require('../models/orderLine.model');

let adminEmployee;

// Création d'un mock pour le middleware d'authentification afin de simuler un utilisateur connecté
jest.mock('../middlewares/auth', () => {
    return (req, res, next) => {
        req.user = {
            id: global.adminEmployeeId, // Utiliser l'ID de l'employé admin créé dans la base de données en mémoire
            login: 'admin',
            role: 'ADMIN'
        };
        next();
    };
});

const app = require('../app');

// Création DB en mémoire
let mongoServer;

beforeAll(async() => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {dbName: 'JestTests'});
});

beforeEach(async () => {
    await Employee.deleteMany({});
    await Order.deleteMany({});
    
    adminEmployee = await Employee.create({
        login: 'admin',
        password: 'pwd',
        role: 'ADMIN'
    });

    global.adminEmployeeId = adminEmployee._id.toString();
});

afterEach(async () => {
    await Employee.deleteMany({});
    await Order.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    console.log("connexion mongoose fermée")
    await mongoServer.stop();
    console.log("mongoMemoryServer arrêté")
});

// Test d'une fonction simple d'addition de 2 nombres
// describe('Test d\'une fonction simple d\'addition avec JEST', () => {
//     it('Additionne deux nombres fournis en paramètres', async () => {
//         const result = testsAdd(2, 3);
//         console.log(`Le résultat de l'addition est : ${result}`);
//     expect(result).toBe(5);    

//     })
// });

describe('POST /api/orders', () => {
    it('Création d\'une nouvelle commande', async () => {
        const result = await request(app)
            .post("/api/orders")
            .send({
               placeConsume: 'DINE-IN'
            })
            .set('Authorization', 'Bearer mockToken'); // Ajout d'un token d'authentification fictif pour simuler un utilisateur connecté
        console.log(result.body);
        expect(result.status).toBe(201);                                // Vérifier que le code de statut de la réponse est 201 (Created)
        expect(result.body).toHaveProperty('message');                  // Vérifier que la réponse contient une propriété "message"
        expect(result.body.message).toContain('créée avec succès');     // Vérifier que le message de succès contient la phrase "créée avec succès"
        expect(result.body.order).toHaveProperty('_id');                      // Vérifier que la réponse contient une propriété "_id" (l'ID de la commande créée)
        expect(result.body.order).toHaveProperty('placeConsume', 'DINE-IN');  // Vérifier que la commande a été créée avec le bon type de consommation
        expect(result.body.order.status).toBe('PENDING');                     // Vérifier que la commande a été créée avec le statut "PENDING"
        expect(result.body.order).toHaveProperty('lines');                    // Vérifier que la commande a une propriété "lines" (les lignes de commande)
        expect(Array.isArray(result.body.order.lines)).toBe(true);            // Vérifier que "lines" est un tableau
        expect(result.body.order.lines.length).toBe(0);                       // Vérifier que la commande a été créée avec le tableau lines vide
        expect(result.body.order.total).toBe(0);                              // Vérifier que la commande a été créée avec un total de 0
    })
});

describe('GET /api/orders/list', () => {
    it('Récupération de la liste des commandes', async () => {
    
        await Order.create({
            empCreated: adminEmployee._id,
            empPrepared: null,
            empDelivered: null,
            status: 'PENDING',
            lines: [],
            total: 0,
            placeConsume: 'DINE-IN'
        });

        const result = await request(app)
            .get("/api/orders/list")
            .set('Authorization', 'Bearer mockToken'); // Ajout d'un token d'authentification fictif pour simuler un utilisateur connecté
        console.log(result.body);
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty('orders');
        expect(Array.isArray(result.body.orders)).toBe(true);
    })
});

describe('POST /api/orders/addLineToOrder/:orderId', () => {
it('Ajoute une ligne de produit à une commande', async () => {

    const order = await Order.create({
        empCreated: adminEmployee._id,
        status: 'PENDING',
        lines: [],
        total: 0,
        placeConsume: 'DINE-IN'
    });

    const product = await Product.create({
        name: 'Big Mac',
        description: 'Hamburger Big Mac',
        category: 'MEATS',
        price: 5.50,
        stock: 10
    });

    const result = await request(app)
        .post(`/api/orders/addLineToOrder/${order._id}`)
        .send({
                productId: product._id,
                menuId: null,
                quantityOrdered: 2
            })
        .set('Authorization', 'Bearer mockToken');

    expect(result.status).toBe(200);

    // Relecture de la commande depuis Mongo
    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.status).toBe('PREPARING');
    expect(updatedOrder.total).toBe(11);
    expect(updatedOrder.lines).toHaveLength(1);

    // Vérification de la ligne créée
    const line = await OrderLine.findById(updatedOrder.lines[0]);

    expect(line).not.toBeNull();
    expect(line.productId.toString()).toBe(product._id.toString());
    expect(line.quantity).toBe(2);
    expect(line.price).toBe(11);

    // Vérification du stock
    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct.stock).toBe(8);
    });
});