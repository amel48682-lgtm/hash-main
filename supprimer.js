import fs from 'node:fs/promises';
import dotenv from 'dotenv';

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { decrypt } from './crypto.js';

dotenv.config();

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

const FILE = './etudiant.json';

// Supprimer un étudiant
export async function supprimerEtudiant() {

    const rl = readline.createInterface({ input, output });

    try {
        console.log('\n===== SUPPRIMER UN ETUDIANT =====\n');

        // Lire les étudiants
        const data = await fs.readFile(FILE, 'utf8');
        const etudiants = JSON.parse(data);

        if (etudiants.length === 0) {
            console.log('Aucun étudiant disponible !');
            return;
        }

        // Saisir le nom
        const nom = (
            await rl.question('Nom de l\'étudiant: ')
        ).trim();

        // Rechercher l'étudiant
        const index = etudiants.findIndex(e =>
            decrypt(e.hash_nom, secretKey).toLowerCase()
            === nom.toLowerCase()
        );

        if (index === -1) {
            console.log('Etudiant introuvable !');
            return;
        }

        // Afficher le nom
        console.log('\nEtudiant trouvé:', nom);

        // Demander confirmation
        const confirmation = (
            await rl.question('Confirmer la suppression ? (oui/non): ')
        ).trim().toLowerCase();

        if (confirmation !== 'oui') {
            console.log('Suppression annulée !');
            return;
        }

        // Supprimer l'étudiant
        etudiants.splice(index, 1);

        // Enregistrer les modifications
        await fs.writeFile(
            FILE,
            JSON.stringify(etudiants, null, 2)
        );

        console.log('\nEtudiant supprimé avec succès !');

    } finally {
        rl.close();
    }
}