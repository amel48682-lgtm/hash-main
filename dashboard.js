import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { collectAndSave } from './ajouter.js';
import { afficherEtudiants } from './afficher.js';
import { modifierNotes } from './modifier.js';
import { supprimerEtudiant } from './supprimer.js';



// Tableau de bord Admin
export async function dashboard() {

    const rl = readline.createInterface({ input, output });

    try {

        while (true) {

            console.log('\n========== ADMIN DASHBOARD ==========');
            console.log('1. Ajouter un étudiant');
            console.log('2. Afficher / Rechercher un étudiant');
            console.log('3. Modifier les notes');
            console.log('4. Supprimer un étudiant');
            console.log('5. Déconnexion');
            console.log('=====================================');

            const choix = await rl.question('\nVotre choix: ');

            switch (choix) {

                case '1':
                    rl.close();
                    await collectAndSave();
                    return dashboard();

                case '2':
                    rl.close();
                    await afficherEtudiants();
                    return dashboard();

                case '3':
                    rl.close();
                    await modifierNotes();
                    return dashboard();
                case '4':
                    rl.close();
                    await supprimerEtudiant();
                    return dashboard();

                case '5':
                    console.log('\nDéconnexion Admin...');
                    return;

                default:
                    console.log('\nChoix invalide !');
            }
        }

    } finally {
        rl.close();
    }
}
