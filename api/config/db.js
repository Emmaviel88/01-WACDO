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
        
        // La chaîne de connexion est construite à partir des variables d'environnement DB_USER et DB_PASSWORD, 
        // qui contiennent respectivement le nom d'utilisateur et le mot de passe pour se connecter à la base de données MongoDB.
        // On utilise dotenv pour ne pas divulguer ces informations sensibles dans le code source.

        const password = encodeURIComponent(process.env.DB_PASSWORD); // Encodage du mot de passe pour gérer les caractères spéciaux
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${password}@cluster0.bnaqqzw.mongodb.net/?appName=Cluster0`);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ Erreur de connexion à MongoDB:', err.message);
        throw err; // Propager l'erreur pour que les tests puissent la détecter
    }
}

module.exports = connectDB;
