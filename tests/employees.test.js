const request = require('supertest');
const { MongoMemoryServer } = require("mongodb-memory-server");
const { default: mongoose } = require('mongoose');
const { testsAdd } = require('../middlewares/miscFunctions');

// Création d'un mock pour le middleware d'authentification afin de simuler un utilisateur connecté
jest.mock('../middlewares/auth', () => {
    return (req, res, next) => {
        req.user = {
            _id: "69c7fran5da2f6ebf06579d9",
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

afterAll(async () => {
    await mongoose.disconnect();
    console.log("connexion mongoose fermée")
    await mongoServer.stop();
    console.log("mongoMemoryServer arrêté")
});

// Test d'une fonction simple d'addition de 2 nombres
// describe('Test d\'une fonction simple d\'addition avec JEST', () => {
//     it('Additionne deux nombres fournis en paramètres', async () => {
//         const result = testsAdd(2, 2);
//         console.log(`Le résultat de l'addition est : ${result}`);
//     expect(result).toBe(4);    

//     })
// });

describe('POST /api/employees/', () => {
    it('Login de création d\'un employé', async () => {
        const result = await request(app)
            .post("/api/employees")
            .send({
                login: "Employee_07",
                password: "Pwd07",
                role: "USER"
            })
            .set('Authorization', 'Bearer mockToken'); // Ajout d'un token d'authentification fictif pour simuler un utilisateur connecté

        expect(result.status).toBe(201);
        expect(result.body).toHaveProperty('token'); // On ne peut pas tester la valeur de token car elle est éllaborée de façon dynamique et n'a qu'une durée de validitée limitée.        
    })
});