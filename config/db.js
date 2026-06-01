const {default: mongoose} = require('mongoose');

const connectDB = async () => {
    try {
        // La chaîne de connexion est construite à partir des variables d'environnement DB_USER et DB_PASSWORD, 
        // qui contiennent respectivement le nom d'utilisateur et le mot de passe pour se connecter à la base de données MongoDB.
        // On utilise dotenv pour ne pas divulguer ces informations sensibles dans le code source.
        await mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+ process.env.DB_PASSWORD+'@cluster0.bnaqqzw.mongodb.net/?appName=Cluster0');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
