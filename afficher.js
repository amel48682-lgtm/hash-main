import fs from 'node:fs/promises';
import dotenv from 'dotenv';

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { decrypt } from './crypto.js';

dotenv.config();

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

const FILE = './etudiant.json';

// قراءة قائمة الطلاب
async function lireEtudiants() {
    const data = await fs.readFile(FILE, 'utf8');
    return JSON.parse(data);
}

// عرض علامات طالب
function afficherNotes(etudiant) {

    const nom = decrypt(etudiant.hash_nom, secretKey);

    const releve = JSON.parse(
        decrypt(etudiant.hash_note, secretKey)
    );

    console.log('\n===== RELEVE DE NOTES =====');
    console.log('Nom:', nom);

    if (releve.length === 0) {
        console.log('Aucune note disponible.');
        return;
    }

    releve.forEach(element => {
        console.log(`${element.module}: ${element.note}/20`);
    });
}

// عرض جميع الطلاب
async function afficherListe() {

    const etudiants = await lireEtudiants();

    console.log('\n===== LISTE DES ETUDIANTS =====\n');

    if (etudiants.length === 0) {
        console.log('Aucun étudiant trouvé !');
        return;
    }

    etudiants.forEach((etudiant, index) => {

        const nom = decrypt(etudiant.hash_nom, secretKey);

        console.log(`${index + 1}. ${nom}`);
    });
}

// البحث عن طالب
async function rechercherEtudiant(rl) {

    const etudiants = await lireEtudiants();

    const nomRecherche = (
        await rl.question('\nNom de l\'étudiant: ')
    ).trim();

    const etudiant = etudiants.find(e => {

        const nom = decrypt(e.hash_nom, secretKey);

        return nom.toLowerCase() === nomRecherche.toLowerCase();
    });

    if (!etudiant) {
        console.log('\nEtudiant introuvable !');
        return;
    }

    afficherNotes(etudiant);
}

// القائمة الرئيسية
export async function afficherEtudiants() {

    const rl = readline.createInterface({ input, output });

    try {

        while (true) {

            console.log('\n===== GESTION DES ETUDIANTS =====');
            console.log('1. Afficher la liste des étudiants');
            console.log('2. Rechercher un étudiant et ses notes');
            console.log('3. Retour');

            const choix = await rl.question('\nVotre choix: ');

            switch (choix) {

                case '1':
                    await afficherListe();
                    break;

                case '2':
                    await rechercherEtudiant(rl);
                    break;

                case '3':
                    return;

                default:
                    console.log('Choix invalide !');
            }
        }

    } finally {
        rl.close();
    }
}