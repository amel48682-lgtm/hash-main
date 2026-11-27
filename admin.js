import fs from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { hashPassword, verifyPassword } from './crypto.js';

export async function createAdmin() {
    const rl = readline.createInterface({ input, output });

    try {
        if (fs.existsSync('admin.json')) {
            console.log('Un compte Admin existe déjà !');
            return;
        }

        console.log('\n===== CREATION ADMIN =====\n');

        const nom = await rl.question('Nom Admin: ');
        const password = await rl.question('Mot de passe: ');
        const confirmation = await rl.question('Confirmer mot de passe: ');

        if (!nom.trim() || !password) {
            console.log('Veuillez remplir tous les champs !');
            return;
        }

        if (password !== confirmation) {
            console.log('Les mots de passe ne correspondent pas !');
            return;
        }

        const passwordData = hashPassword(password);
        const admin = { nom, password: passwordData };

        fs.writeFileSync('admin.json', JSON.stringify(admin, null, 2));

        console.log('\nCompte Admin créé avec succès !');

    } finally {
        rl.close();
    }
}

export async function loginAdmin() {
    if (!fs.existsSync('admin.json')) {
        console.log('Aucun compte Admin trouvé !');
        return false;
    }

    const rl = readline.createInterface({ input, output });

    try {
        const admin = JSON.parse(fs.readFileSync('admin.json', 'utf8'));

        console.log('\n===== CONNEXION ADMIN =====\n');

        const nom = await rl.question('Nom Admin: ');
        const password = await rl.question('Mot de passe: ');

        if (nom === admin.nom && verifyPassword(password, admin.password)) {
            console.log('\nBienvenue Admin !');
            return true;
        }

        console.log('\nNom ou mot de passe incorrect !');
        return false;

    } finally {
        rl.close();
    }
}