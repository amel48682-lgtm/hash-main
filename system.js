import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { loginAdmin } from './admin.js';
import { dashboard } from './dashboard.js';
import { connexionEtudiant } from './connexion.js';

async function afficherMenu() {
    const rl = readline.createInterface({ input, output });

    try {
        console.log('\n========== SYSTEM ==========');
        console.log('1. Connexion Admin');
        console.log('2. Connexion Etudiant');
        console.log('3. Quitter');
        console.log('============================');

        return await rl.question('\nVotre choix: ');

    } finally {
        rl.close();
    }
}

export async function system() {

    while (true) {

        const choix = await afficherMenu();

        switch (choix) {

            case '1': {
                const connected = await loginAdmin();

                if (connected) {
                    console.log('\nBienvenue dans votre espace Admin !');
                    await dashboard();
                }

                break;
            }

            case '2':
                await connexionEtudiant();
                break;

            case '3':
                console.log('\nFermeture du système...');
                return;

            default:
                console.log('\nChoix invalide !');
        }
    }
}