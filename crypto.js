import crypto from 'node:crypto';//استيراد مكتبة التشفير

export function encrypt(text, key) {//كلمة export تعني أننا نستطيع استعمال هذه الدالة في ملفات أخرى.
    const iv = crypto.randomBytes(12);//ننشئ قيمة عشوائية اسمها IV
//وظيفتها جعل نتيجة التشفير مختلفة حتى لو كان النص نفسه
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);//إنشاء أداة التشفي 

    let encrypted = cipher.update(text, 'utf8', 'hex');  
    encrypted += cipher.final('hex');
//نحوّل النص الأصلي إلى نص مشفر
    const authTag = cipher.getAuthTag().toString('hex');

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag
    };
}

export function decrypt(encryptedObj, key) {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        key,
        Buffer.from(encryptedObj.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));

    let decrypted = decipher.update(
        encryptedObj.encryptedData, 'hex', 'utf8'
    );

    decrypted += decipher.final('utf8');

    return decrypted;
}


// إنشاء Hash لكلمة المرور
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');

    const hash = crypto.scryptSync(password, salt, 64).toString('hex');

    return {
        salt: salt,
        hash: hash
    };
}

// التحقق من كلمة المرور
export function verifyPassword(password, storedPassword) {

    const hash = crypto.scryptSync(
        password,
        storedPassword.salt,
        64
    );

    const originalHash = Buffer.from(storedPassword.hash, 'hex');

    return crypto.timingSafeEqual(hash, originalHash);
}