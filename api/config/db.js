const {default: mongoose} = require('mongoose');

const connectDB = async () => {
    try {
        if(process.env.NODE_ENV === 'test') {
            console.log('✅ Running in test environment, skipping MongoDB connection');
            return; // Si on est en environnement de test, on ne tente pas de se connecter à MongoDB (la connexion se fera dans le module de test avec mongodb-memory-server)
        }
        
        if(mongoose.connection.readyState === 1) {
            console.log('✅ Already connected to MongoDB');
            return; // Si mongoose est déjà connecté, on ne tente pas de se reconnecter, ce qui évite les erreurs de connexion multiple et les problèmes de pool de connexions.
        }

        // console.log('DB_USER présent =', !!process.env.DB_USER);
        // console.log('DB_PASSWORD présent =', !!process.env.DB_PASSWORD);
        // La chaîne de connexion est construite à partir des variables d'environnement DB_USER et DB_PASSWORD, 
        // qui contiennent respectivement le nom d'utilisateur et le mot de passe pour se connecter à la base de données MongoDB.
        // On utilise dotenv pour ne pas divulguer ces informations sensibles dans le code source.

        const password = encodeURIComponent(process.env.DB_PASSWORD); // Encodage du mot de passe pour gérer les caractères spéciaux

        // Quelques console.log pour suivre l'état de la connexion et les variables d'environnement, ce qui peut aider à diagnostiquer les problèmes de connexion.
        console.log('ℹ️ db.js;22 : Mongo Ready State before connexion:', mongoose.connection.readyState);
        console.log('ℹ️ db.js;23 : NODE_ENV =', process.env.NODE_ENV);
        console.log('ℹ️ db.js;24 : DB_USER présent =', !!process.env.DB_USER);
        console.log('ℹ️ db.js;25 : DB_PASSWORD présent =', !!process.env.DB_PASSWORD);
        console.log('ℹ️ db.js;26 : DB_USER =', process.env.DB_USER);

        const dns = require('dns');

        dns.resolveSrv('_mongodb._tcp.cluster0.bnaqqzw.mongodb.net', (err, records) => {
            console.log('ℹ️ SRV records:', records);
            console.log('❌ SRV error:', err);
        });
        
        // await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${password}@cluster0.bnaqqzw.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`);
        await mongoose.connect(`mongodb://${process.env.DB_USER}:${password}@ac-e9pz2tp-shard-00-00.bnaqqzw.mongodb.net:27017,ac-e9pz2tp-shard-00-01.bnaqqzw.mongodb.net:27017,ac-e9pz2tp-shard-00-02.bnaqqzw.mongodb.net:27017/?ssl=true&replicaSet=atlas-glclgu-shard-0&authSource=admin&appName=Cluster0`, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1,
            retryWrites: true
            }
        );
        
        console.log('ℹ️ db.js;27 : Mongo Ready State after connexion:', mongoose.connection.readyState);

        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ Erreur de connexion à MongoDB:', err.message);
        console.log('⚠️ db.js;35 : DB readyState erreur = ', mongoose.connection.readyState);
        console.error('⚠️ db.js;36 : Cause :', err.cause);
        console.error('⚠️ db.js;37 : Reason :', err.reason);
        throw err; // Propager l'erreur pour que les tests puissent la détecter
    }
}

module.exports = connectDB;
