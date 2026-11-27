import { createAdmin } from './admin.js';
import { system } from './system.js';

// إنشاء حساب Admin إذا لم يكن موجودًا
await createAdmin();

// تشغيل النظام
await system();