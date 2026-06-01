const jwt = require('jsonwebtoken');

// Récupération du token qui est toujours envoyé dans le header de la requête
const auth = (req, res, next) => {
    
    const authHeader = req.header('authorization');
    console.log(`auth-L7 : Hearder reçu : `, authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            erreur: 'auth-L11 : Le header de la requête ne contient pas de token valide'
        });
    }
    // Récupérer le token après "Bearer ". 
    // Le token est toujours dans le header "Authorization" et commence par "Bearer "
    // La fonction split permet de séparer la chaîne de caractères en deux parties : 
    // "Bearer" et le token lui-même. On prend la deuxième partie (index 1) qui est le token. 
    const token = req.header('Authorization').split(' ')[1]; 
    console.log("Token reçu dans auth : " + token);
    
    if (!token) {
        return res.status(401).json({ erreur: 'AUTH-L13 : Veuillez vous connecter en tant qu\'administrateur pour pouvoir créer un employé' });
    }
    try {
        // Vérifier le token et récupérer les informations de l'utilisateur (id et role) qui ont été encodées lors de la connexion
        // la variable JWT_SECRET est une clé utilisée pour signer et vérifier les tokens JWT.
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        // Ajouter les informations de l'utilisateur à la requête pour les utiliser dans les routes protégées
        req.user = decodedUser;
        req.tokenExpirationDate = getTokenExpirationDate(token);

        console.log(`User décodé dans auth: ${decodedUser.id} - ${decodedUser.login} (${decodedUser.role}) - Expire le : ${req.tokenExpirationDate})`);
        
        next();
    } catch (er) {
        return res.status(401).json({ erreur: 'AUTH-L25 : Veuillez vous connecter en tant qu\'administrateur pour pouvoir créer un employé', error: er.message });
    }
};

const getTokenExpirationDate = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return null; // Le token n'a pas de champ d'expiration
        }
        return new Date(decoded.exp * 1000); // Convertir l'expiration en millisecondes
    } catch (error) {
        console.error('Erreur lors du décodage du token :', error);
        return null; // En cas d'erreur, retourner null
    }
};

module.exports = auth, getTokenExpirationDate;