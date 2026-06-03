const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Employee = require('../models/employee.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Creation nouvel employé
exports.createEmployee = async (req, res) => {
    try {

        const connectedUser = req.user; // Récupère les informations de l'utilisateur connecté à partir du middleware d'authentification
        console.log(`Utilisateur connecté dans CreateEmployee : ${connectedUser.id} - ${connectedUser.login} (${connectedUser.role})`);

        // Vérifie que l'utilisateur connecté a le rôle d'administrateur
        if (connectedUser.role.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({ message: 'L15 : Accès refusé, vous n\'êtes pas autorisé à créer un employé' });
        }
        // Récupère les données du corps de la requête
        const { login, password, role } = req.body;
        await connectDB(); // Assure que la connexion à la base de données est établie avant de continuer
        // Vérifie si l'employé à créer existe déjà
        const existingEmployee = await Employee.findOne({ login });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Employé existe déjà, création impossible !' });
        }
        
        // Évolutions possibles : ajouter une validation plus poussée des données (complexité du mot de passe)   
        // Utiliser la lib password-validator

        // Hash le mot de passe saisi
        const hashedPassword = await bcrypt.hash(password, 10);

        // Instancie un nouvel employé avec les données fournies (le role par défaut est 'user')
        const newEmployee = new Employee({
            login,
            password: hashedPassword,
            role: role
        });

        // Sauvegarde nouvel employé en BDD
        const savedEmployee = await newEmployee.save();
        console.log(`Nouvel employé créé : ${savedEmployee.login} - avec le role : ${savedEmployee.role} et l'ID : ${savedEmployee._id} - Créé par : ${connectedUser.id} (${connectedUser.role})`);

        res.status(201).json({ savedEmployee });
    } catch (error) {
        res.status(500).json({ message: 'L45 Erreur lors de la création de l\'employé', error });
    }
};

exports.loginEmployee = async (req, res) => {
    try {
        const { login, password } = req.body;
        // Vérifie que le login et mot de passe sont présents
        if (!login || !password) {
            return res.status(400).json({ message: 'Veuillez fournir un login et un mot de passe' });
        }
        await connectDB(); // Assure que la connexion à la base de données est établie avant de continuer
        // Cherche l'employé par son login dans la BDD
        const existingEmployee = await Employee.findOne({ login });
        if (!existingEmployee) {
            return res.status(400).json({ message: 'Login ou mot de passe incorrect' });
        }
        // console.log("Employé trouvé :", existingEmployee);
        // console.log("Password reçu :", password);
        // console.log("Password en base :", existingEmployee.password);
        // Compare le mot de passe saisi avec le mot de passe hashé en BDD
        const isPwdOk = await bcrypt.compare(password, existingEmployee.password);
        if (!isPwdOk) {
            return res.status(400).json({ message: 'Login ou mot de passe incorrect' });
        }
        // console.log('JWT_SECRET =', process.env.JWT_SECRET);
        // Génère un token JWT
        const token = jwt.sign({ id: existingEmployee._id, login: existingEmployee.login, role: existingEmployee.role.toUpperCase() }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // console.log("User : " + existingEmployee.login + " connecté avec succès, role : " + existingEmployee.role);
        console.log(`User : ${existingEmployee.login.toUpperCase()} (${existingEmployee.role}) connecté avec succès !`);
        console.log(`Token reçu dans login : ${token}`);
        res.status(200).json({ message: 'Connexion réussie', token });
    } catch (error) {
        console.error(error);

        res.status(500).json({ message: 'L74 Erreur lors de la connexion', error });
    }
};

exports.editEmployee = async (req, res) => {
    try {
        const connectedUser = req.user;
        console.log(`Utilisateur connecté dans EditEmployee : ${connectedUser.id} - ${connectedUser.login} (${connectedUser.role})`);
        console.log(`ID de l'employé à modifier : ${req.params.id}`);

        // Vérifie que l'utilisateur connecté a le rôle d'administrateur ou que c'est l'utilsateur titulaire du compte lui-même
        if (connectedUser.id !== req.params.id && connectedUser.role.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({ message: 'L13 : Accès refusé, vous n\'êtes pas autorisé à modifier ces données' });
        }
        const { id } = req.params;
        const { login, password, role } = req.body;
        await connectDB(); // Assure que la connexion à la base de données est établie avant de continuer
        // Vérifie si l'employé à modifier existe
        const existingEmployee = await Employee.findById(id);
        if (!existingEmployee) {
            return res.status(404).json({ message: 'Employé non trouvé, modification impossible !' });
        }
        // Hash le nouveau mot de passe saisi
        const hashedPassword = await bcrypt.hash(password, 10);
        // Met à jour les données de l'employé
        existingEmployee.login = login;
        existingEmployee.password = hashedPassword;
        //Le rôle ne peut être modifié que par un administrateur, sinon il reste inchangé
        if (connectedUser.role.toUpperCase() == 'ADMIN') {
            existingEmployee.role = role.toUpperCase();
        }
        if(existingEmployee.role.toUpperCase() !== role.toUpperCase() && connectedUser.role.toUpperCase() !== 'ADMIN') {
            console.log(`L'utilisateur ${connectedUser.login} (${connectedUser.role}) a tenté de modifier le rôle de l'employé ${existingEmployee.login} (${existingEmployee.role}) sans les permissions nécessaires, le rôle reste inchangé`);
            res.status(403).json({ message: 'L106 : Accès refusé, vous n\'êtes pas autorisé à modifier le rôle. Seul un ADMINISTRATEUR peut le faire !' });
        }

        // Met à jour les modifications en BDD
        const retval = await Employee.updateOne({ _id: id }, existingEmployee, { new: true });
        if (!retval.acknowledged || retval.modifiedCount === 0) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'employé', error });
        }
        // Récupère les données de l'employé mis à jour pour les retourner dans la réponse
        const afterUpdateEmployee = await Employee.findById(id); // Récupère les données de l'employé mis à jour pour les retourner dans la réponse
        console.log(`Employé modifié : ${afterUpdateEmployee.login} - avec le role : ${afterUpdateEmployee.role} et l'ID : ${afterUpdateEmployee._id} - Modifié par : ${connectedUser.id} (${connectedUser.role})`);
        res.status(200).json({ afterUpdateEmployee });
    } catch (error) {
        res.status(500).json({ message: 'L105 Erreur lors de la modification de l\'employé', error });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const connectedUser = req.user;
        console.log(`Utilisateur connecté dans DeleteEmployee : ${connectedUser.id} - ${connectedUser.login} (${connectedUser.role})`);
        
        // Vérifie que l'utilisateur connecté a le rôle d'administrateur
        if (connectedUser.role.toUpperCase() !== 'ADMIN') {
            return res.status(403).json({ message: 'L116 : Accès refusé, vous n\'êtes pas autorisé à supprimer un employé' });
        }
        const { id } = req.params;
        await connectDB();
        // Vérifie si l'employé à supprimer existe
        const existingEmployee = await Employee.findById(id);
        if (!existingEmployee) {
            return res.status(404).json({ message: 'Employé non trouvé, suppression impossible !' });
        }
        // Supprime l'employé de la BDD
        await existingEmployee.deleteOne({ _id: id });
        console.log(`Employé supprimé : ${existingEmployee.login} - avec le role : ${existingEmployee.role} et l'ID : ${existingEmployee._id} - Supprimé par : ${connectedUser.id} (${connectedUser.role})`);
        res.status(200).json({ message: 'Employé supprimé avec succès' });

    } catch (error) {
        res.status(500).json({ message: 'L130 Erreur lors de la suppression de l\'employé', error: error.message });
    }
};

exports.listEmployees = async (req, res) => {
    try {
        await connectDB(); // Assure que la connexion à la base de données est établie avant de continuer
        //const employees = await Employee.find().select('-password'); // Exclut le champ password de la liste des employés
        const employees = await Employee.find().select('-password'); // Exclut le champ password de la liste des employés
        console.log(`Liste des employés récupérée, contient ${employees.length} employés`);
        res.status(200).json({ employees });
    } 
    // catch (error) {
    //     res.status(500).json({ message: 'L139 Erreur lors de la récupération de la liste des employés', error });
    // }
    catch (error) {
    console.error('L139', error);

    res.status(500).json({
        message: 'L139 Erreur lors de la récupération de la liste des employés',
        error: error.message,
        stack: error.stack
        });
    }
};