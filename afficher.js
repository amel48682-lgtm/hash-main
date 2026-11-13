import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import { decrypt } from './crypto.js';

dotenv.config();

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');

const data = await fs.readFile('etudiant.json', 'utf8');

const etudiants = JSON.parse(data);

const nom = decrypt(etudiants.hash_nom, secretKey);

console.log("Nom:", nom);

const releve = JSON.parse(
    decrypt(etudiants.hash_note, secretKey)
);

console.log("Relevé de notes:", releve);