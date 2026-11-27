
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import fs from 'node:fs/promises';
import dotenv from 'dotenv';

import { decrypt, verifyPassword } from './crypto.js';

dotenv.config();

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

const FILE = './etudiant.json';

// Connexion étudiant
export async function connexionEtudiant() {

    const rl = readline.createInterface({ input, output });

    try {
        console.log('\n===== CONNEXION ETUDIANT =====\n');

        const nom = (await rl.question('Nom: ')).trim();

        const password = await rl.question('Mot de passe: ');

        // Lire les étudiants
        const data = await fs.readFile(FILE, 'utf8');
        const etudiants = JSON.parse(data);

        // Rechercher l'étudiant
        const etudiant = etudiants.find(e =>
            decrypt(e.hash_nom, secretKey) === nom
        );

        if (!etudiant) {
            console.log('Etudiant introuvable !');
            return;
        }

        // Vérifier le mot de passe
        if (!verifyPassword(password, etudiant.password)) {
            console.log('Mot de passe incorrect !');
            return;
        }

        console.log('\nBienvenue ' + nom + ' !');

        // Déchiffrer les notes
        const releve = JSON.parse(
            decrypt(etudiant.hash_note, secretKey)
        );

        console.log('\n===== MES NOTES =====\n');

        if (releve.length === 0) {
            console.log('Aucune note disponible.');
        } else {
            releve.forEach(element => {
                console.log(`${element.module}: ${element.note}/20`);
            });
        }

    } finally {
        rl.close();
    }
}
