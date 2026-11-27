import crypto from 'node:crypto';
import { encrypt, decrypt, hashPassword } from './crypto.js';

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import fs from 'node:fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

if (secretKey.length !== 32) {
    throw new Error('SECRET_KEY must be exactly 32 bytes!');
}

const FILE = './etudiant.json';

// إضافة طالب جديد بواسطة Admin
export async function collectAndSave() {

    const rl = readline.createInterface({ input, output });

    try {

        console.log('\n===== AJOUTER UN ETUDIANT =====\n');

        // إدخال اسم الطالب
        const nom = (await rl.question('Nom: ')).trim();

        if (!nom) {
            console.log('Nom obligatoire !');
            return;
        }

        // إدخال كلمة المرور
        const password = await rl.question('Mot de passe: ');

        const confirmation = await rl.question(
            'Confirmer mot de passe: '
        );

        if (!password) {
            console.log('Mot de passe obligatoire !');
            return;
        }

        if (password !== confirmation) {
            console.log('Les mots de passe ne correspondent pas !');
            return;
        }

        // قراءة الطلاب السابقين
        let etudiants = [];

        try {
            const data = await fs.readFile(FILE, 'utf8');
            etudiants = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        // التحقق من وجود الطالب
        const existe = etudiants.some(etudiant =>
            decrypt(etudiant.hash_nom, secretKey) === nom
        );

        if (existe) {
            console.log('Cet étudiant existe déjà !');
            return;
        }

        // إدخال العلامات
        let releve = [];

        console.log('\n===== AJOUTER LES NOTES =====');

        while (true) {

            const module = (
                await rl.question('Module (Enter pour terminer): ')
            ).trim();

            if (!module) break;

            const note = Number(
                await rl.question('Note (0-20): ')
            );

            if (!Number.isFinite(note) || note < 0 || note > 20) {
                console.log('Note invalide !');
                continue;
            }

            releve.push({ module, note });
        }

        // تشفير اسم الطالب
        const hash_nom = encrypt(nom, secretKey);

        // تشفير العلامات
        const hash_note = encrypt(
            JSON.stringify(releve),
            secretKey
        );

        // حماية كلمة المرور
        const passwordData = hashPassword(password);

        // إنشاء حساب الطالب
        const userData = {
            id: crypto.randomUUID(),
            hash_nom,
            password: passwordData,
            hash_note
        };

        // إضافة الطالب إلى القائمة
        etudiants.push(userData);

        // حفظ جميع الطلاب
        await fs.writeFile(
            FILE,
            JSON.stringify(etudiants, null, 2)
        );

        console.log('\nÉtudiant ajouté avec succès !');

    } finally {
        rl.close();
    }
}