import fs from 'node:fs/promises';
import dotenv from 'dotenv';

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { encrypt, decrypt } from './crypto.js';

dotenv.config();

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

const FILE = './etudiant.json';

// Modifier les notes d'un étudiant
export async function modifierNotes() {

    const rl = readline.createInterface({ input, output });

    try {
        console.log('\n===== MODIFIER LES NOTES =====\n');

        // Lire les étudiants
        const data = await fs.readFile(FILE, 'utf8');
        const etudiants = JSON.parse(data);

        // Saisir le nom
        const nom = (
            await rl.question('Nom de l\'étudiant: ')
        ).trim();

        // Rechercher l'étudiant
        const etudiant = etudiants.find(e =>
            decrypt(e.hash_nom, secretKey).toLowerCase()
            === nom.toLowerCase()
        );

        if (!etudiant) {
            console.log('Etudiant introuvable !');
            return;
        }

        // Déchiffrer les notes
        const releve = JSON.parse(
            decrypt(etudiant.hash_note, secretKey)
        );

        if (releve.length === 0) {
            console.log('Aucune note disponible !');
            return;
        }

        // Afficher les notes actuelles
        console.log('\n===== NOTES ACTUELLES =====');

        releve.forEach(element => {
            console.log(`${element.module}: ${element.note}/20`);
        });

        // Choisir le module
        const module = (
            await rl.question('\nModule à modifier: ')
        ).trim();

        const noteExistante = releve.find(element =>
            element.module.toLowerCase() === module.toLowerCase()
        );

        if (!noteExistante) {
            console.log('Module introuvable !');
            return;
        }

        // Saisir la nouvelle note
        const nouvelleNote = Number(
            await rl.question('Nouvelle note (0-20): ')
        );

        if (!Number.isFinite(nouvelleNote)
            || nouvelleNote < 0
            || nouvelleNote > 20) {

            console.log('Note invalide !');
            return;
        }

        // Modifier la note
        noteExistante.note = nouvelleNote;

        // Chiffrer les nouvelles notes
        etudiant.hash_note = encrypt(
            JSON.stringify(releve),
            secretKey
        );

        // Enregistrer les modifications
        await fs.writeFile(
            FILE,
            JSON.stringify(etudiants, null, 2)
        );

        console.log('\nNote modifiée avec succès !');

    } finally {
        rl.close();
    }
}
