import { encrypt } from './crypto.js';  
import readline from 'node:readline/promises';

import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import dotenv from "dotenv"
dotenv.config();

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');
if (secretKey.length !== 32) {
    throw new Error('SECRET_KEY must be exactly 32 bytes!');
}



export function decrypt(encryptedObj, key) {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        key,
        Buffer.from(encryptedObj.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));

    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

async function collectAndSave() {
    const rl = readline.createInterface({ input, output });

    try {
        const nom = await rl.question('Nom: ');
        let releve = [];
        let note, module;
        do {
            module = await rl.question('Module: ');
            note = await rl.question('Note: ');
            releve.push({ module, note });
        } while (module);


        const hash_nom = encrypt(nom, secretKey);
        const hash_note = encrypt(JSON.stringify(releve), secretKey);

        const userData = { hash_nom, hash_note };

        await fs.writeFile(`etudiant.json`, JSON.stringify(userData, null, 2));
        console.log('etudiant data saved to etudiant.json!');
    } finally {
        rl.close();
    }
}

collectAndSave();
