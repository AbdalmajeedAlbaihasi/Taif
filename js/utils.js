/**
 * ملف المساعدات والوظائف المشتركة
 * يحتوي على الوظائف المساعدة المستخدمة في جميع أنحاء التطبيق
 */

// ===== تنسيق التواريخ =====
const DateUtils = {
    /**
     * تنسيق التاريخ للعرض
     * @param {Date|string} date - التاريخ المراد تنسيقه
     * @returns {string} التاريخ المنسق
     */
    formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return d.toLocaleDateString('ar-SA', options);
    },
    
    /**
     * تنسيق التاريخ للإدخال في حقول HTML
     * @param {Date|string} date - التاريخ المراد تنسيقه
     * @returns {string} التاريخ بصيغة YYYY-MM-DD
     */
    formatDateForInput(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        return d.toISOString().split('T')[0];
    },
    
    /**
     * حساب الفرق بين تاريخين بالأيام
     * @param {Date|string} startDate - تاريخ البداية
     * @param {Date|string} endDate - تاريخ النهاية
     * @returns {number} عدد الأيام
     */
    getDaysDifference(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
        
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    /**
     * التحقق من انتهاء التاريخ
     * @param {Date|string} date - التاريخ المراد فحصه
     * @returns {boolean} true إذا كان التاريخ منتهي
     */
    isOverdue(date) {
        if (!date) return false;
        
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return d < today;
    },
    
    /**
     * الحصول على تاريخ اليوم
     * @returns {string} تاريخ اليوم بصيغة YYYY-MM-DD
     */
    getToday() {
        return new Date().toISOString().split('T')[0];
    }
};

// ===== وظائف النصوص =====
const TextUtils = {
    /**
     * اقتطاع النص إلى طول محدد
     * @param {string} text - النص المراد اقتطاعه
     * @param {number} length - الطول المطلوب
     * @returns {string} النص المقتطع
     */
    truncate(text, length = 100) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    /**
     * تنظيف النص من المسافات الزائدة
     * @param {string} text - النص المراد تنظيفه
     * @returns {string} النص المنظف
     */
    clean(text) {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ');
    },
    
    /**
     * تحويل النص إلى عنوان URL
     * @param {string} text - النص المراد تحويله
     * @returns {string} النص المحول
     */
    slugify(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    /**
     * تحويل أول حرف إلى كبير
     * @param {string} text - النص المراد تحويله
     * @returns {string} النص المحول
     */
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
};

// ===== وظائف الألوان =====
const ColorUtils = {
    /**
     * توليد لون عشوائي
     * @returns {string} لون بصيغة hex
     */
    generateRandomColor() {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
            '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
            '#ec4899', '#6366f1', '#14b8a6', '#eab308'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    /**
     * تحويل لون hex إلى rgba
     * @param {string} hex - اللون بصيغة hex
     * @param {number} alpha - الشفافية
     * @returns {string} اللون بصيغة rgba
     */
    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    /**
     * الحصول على لون متباين
     * @param {string} backgroundColor - لون الخلفية
     * @returns {string} اللون المتباين (أبيض أو أسود)
     */
    getContrastColor(backgroundColor) {
        // إزالة # من بداية اللون
        const hex = backgroundColor.replace('#', '');
        
        // تحويل إلى RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // حساب السطوع
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        return brightness > 128 ? '#000000' : '#ffffff';
    }
};

// ===== وظائف التحقق =====
const ValidationUtils = {
    /**
     * التحقق من صحة البريد الإلكتروني
     * @param {string} email - البريد الإلكتروني
     * @returns {boolean} true إذا كان صحيح
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * التحقق من قوة كلمة المرور
     * @param {string} password - كلمة المرور
     * @returns {object} نتيجة التحقق
     */
    validatePassword(password) {
        const result = {
            isValid: false,
            score: 0,
            feedback: []
        };
        
        if (!password) {
            result.feedback.push('كلمة المرور مطلوبة');
            return result;
        }
        
        if (password.length < 6) {
            result.feedback.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        } else {
            result.score += 1;
        }
        
        if (password.length >= 8) {
            result.score += 1;
        }
        
        if (/[A-Z]/.test(password)) {
            result.score += 1;
        } else {
            result.feedback.push('يفضل استخدام حرف كبير واحد على الأقل');
        }
        
        if (/[0-9]/.test(password)) {
            result.score += 1;
        } else {
            result.feedback.push('يفضل استخدام رقم واحد على الأقل');
        }
        
        if (/[^A-Za-z0-9]/.test(password)) {
            result.score += 1;
        } else {
            result.feedback.push('يفضل استخدام رمز خاص واحد على الأقل');
        }
        
        result.isValid = result.score >= 2;
        return result;
    },
    
    /**
     * التحقق من صحة URL
     * @param {string} url - الرابط
     * @returns {boolean} true إذا كان صحيح
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// ===== وظائف التخزين =====
const StorageUtils = {
    /**
     * حفظ البيانات في localStorage
     * @param {string} key - المفتاح
     * @param {any} value - القيمة
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
        }
    },
    
    /**
     * استرجاع البيانات من localStorage
     * @param {string} key - المفتاح
     * @param {any} defaultValue - القيمة الافتراضية
     * @returns {any} البيانات المسترجعة
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('خطأ في استرجاع البيانات:', error);
            return defaultValue;
        }
    },
    
    /**
     * حذف البيانات من localStorage
     * @param {string} key - المفتاح
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('خطأ في حذف البيانات:', error);
        }
    },
    
    /**
     * مسح جميع البيانات
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
        }
    }
};

// ===== وظائف عامة =====
const Utils = {
    /**
     * توليد معرف فريد
     * @returns {string} معرف فريد
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * تأخير التنفيذ
     * @param {number} ms - المدة بالميلي ثانية
     * @returns {Promise} وعد التأخير
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * نسخ النص إلى الحافظة
     * @param {string} text - النص المراد نسخه
     * @returns {Promise<boolean>} نتيجة النسخ
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('خطأ في نسخ النص:', error);
            return false;
        }
    },
    
    /**
     * تحميل ملف JSON
     * @param {object} data - البيانات
     * @param {string} filename - اسم الملف
     */
    downloadJSON(data, filename = 'data.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    /**
     * تحميل ملف CSV
     * @param {array} data - البيانات
     * @param {string} filename - اسم الملف
     */
    downloadCSV(data, filename = 'data.csv') {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    /**
     * تنسيق الأرقام
     * @param {number} number - الرقم
     * @returns {string} الرقم المنسق
     */
    formatNumber(number) {
        if (typeof number !== 'number') return '0';
        return number.toLocaleString('ar-SA');
    },
    
    /**
     * تنسيق حجم الملف
     * @param {number} bytes - الحجم بالبايت
     * @returns {string} الحجم المنسق
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 بايت';
        
        const k = 1024;
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * خلط عناصر المصفوفة
     * @param {array} array - المصفوفة
     * @returns {array} المصفوفة المخلوطة
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    /**
     * إزالة التكرارات من المصفوفة
     * @param {array} array - المصفوفة
     * @param {string} key - المفتاح للمقارنة (اختياري)
     * @returns {array} المصفوفة بدون تكرارات
     */
    removeDuplicates(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },
    
    /**
     * ترتيب المصفوفة
     * @param {array} array - المصفوفة
     * @param {string} key - المفتاح للترتيب
     * @param {string} direction - اتجاه الترتيب (asc/desc)
     * @returns {array} المصفوفة المرتبة
     */
    sortArray(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
};

// ===== تجميع جميع الوظائف =====
const utils = {
    ...DateUtils,
    ...TextUtils,
    ...ColorUtils,
    ...ValidationUtils,
    ...StorageUtils,
    ...Utils
};

// تصدير للاستخدام العام
window.utils = utils;

