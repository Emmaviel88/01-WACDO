const {default: mongoose} = require('mongoose');

const connectDB = async () => {
    try {
        if(process.env.NODE_ENV === 'test') {
            console.log('✅ Running in test environment, skipping MongoDB connection');
            return;
        }
        
        if(mongoose.connection.readyState === 1) {
            console.log('✅ Already connected to MongoDB');
            return;
        }
        // console.log('DB_USER présent =', !!process.env.DB_USER);
        // console.log('DB_PASSWORD présent =', !!process.env.DB_PASSWORD);
        // La chaîne de connexion est construite à partir des variables d'environnement DB_USER et DB_PASSWORD, 
        // qui contiennent respectivement le nom d'utilisateur et le mot de passe pour se connecter à la base de données MongoDB.
        // On utilise dotenv pour ne pas divulguer ces informations sensibles dans le code source.

        const password = encodeURIComponent(process.env.DB_PASSWORD); // Encodage du mot de passe pour gérer les caractères spéciaux

        console.log('Mongo Ready State before connexion:', mongoose.connection.readyState);
        
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${password}@cluster0.bnaqqzw.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`);
        
        console.log('Mongo Ready State after connexion:', mongoose.connection.readyState);

        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ Erreur de connexion à MongoDB:', err.message);
        console.log('DB readyState erreur = ', mongoose.connection.readyState);
        throw err; // Propager l'erreur pour que les tests puissent la détecter
    }
}

module.exports = connectDB;
