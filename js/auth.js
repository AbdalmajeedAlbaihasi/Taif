/**
 * نظام المصادقة وإدارة المستخدمين
 * يتعامل مع تسجيل الدخول، إنشاء الحسابات، وإدارة الجلسات
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // التحقق من وجود جلسة نشطة
        this.checkExistingSession();
        
        // ربط أحداث النماذج
        this.bindEvents();
    }
    
    /**
     * التحقق من وجود جلسة نشطة
     */
    checkExistingSession() {
        console.log('التحقق من الجلسة النشطة...');
        
        // التأكد من تحميل storage قبل الاستخدام
        if (typeof window.storage === 'undefined') {
            console.log('storage غير محمل بعد، انتظار...');
            setTimeout(() => this.checkExistingSession(), 100);
            return;
        }
        
        console.log('storage محمل، التحقق من المستخدم...');
        const savedUser = storage.getCurrentUser();
        
        if (savedUser) {
            console.log('تم العثور على مستخدم محفوظ:', savedUser);
            this.currentUser = savedUser;
            this.isAuthenticated = true;
            this.showApp();
        } else {
            console.log('لا يوجد مستخدم محفوظ، عرض شاشة تسجيل الدخول');
            this.showAuth();
        }
    }
    
    /**
     * ربط أحداث النماذج والأزرار
     */
    bindEvents() {
        // نموذج تسجيل الدخول
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // نموذج إنشاء الحساب
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // إغلاق النوافذ عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
        
        // إغلاق النوافذ بمفتاح Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    /**
     * معالجة تسجيل الدخول
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        
        if (!email || !password) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }
        
        try {
            // محاكاة عملية تسجيل الدخول
            const user = await this.authenticateUser(email, password);
            
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // حفظ بيانات المستخدم
                storage.setCurrentUser(user);
                
                // إخفاء نافذة تسجيل الدخول
                this.hideLoginModal();
                
                // عرض التطبيق
                this.showApp();
                
                // عرض رسالة ترحيب
                this.showSuccess(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`);
                
            } else {
                this.showError('بيانات الدخول غير صحيحة');
            }
            
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            this.showError('حدث خطأ في تسجيل الدخول');
        }
    }
    
    /**
     * معالجة إنشاء الحساب
     */
    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name')?.value;
        const email = document.getElementById('register-email')?.value;
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-confirm-password')?.value;
        
        if (!name || !email || !password || !confirmPassword) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }
        
        if (password.length < 6) {
            this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('كلمات المرور غير متطابقة');
            return;
        }
        
        try {
            // محاكاة عملية إنشاء الحساب
            const user = await this.createUser(name, email, password);
            
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // حفظ بيانات المستخدم
                storage.setCurrentUser(user);
                
                // إخفاء نافذة إنشاء الحساب
                this.hideRegisterModal();
                
                // عرض التطبيق
                this.showApp();
                
                // عرض رسالة ترحيب
                this.showSuccess(`مرحباً ${user.name}! تم إنشاء الحساب بنجاح`);
                
            } else {
                this.showError('فشل في إنشاء الحساب');
            }
            
        } catch (error) {
            console.error('خطأ في إنشاء الحساب:', error);
            this.showError('حدث خطأ في إنشاء الحساب');
        }
    }
    
    /**
     * مصادقة المستخدم (محاكاة)
     */
    async authenticateUser(email, password) {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // في التطبيق الحقيقي، هذا سيكون استدعاء API
        // هنا نقبل أي بريد إلكتروني وكلمة مرور للتجربة
        
        const user = {
            id: utils.generateId(),
            name: this.extractNameFromEmail(email),
            email: email,
            role: 'admin',
            avatar: null,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        return user;
    }
    
    /**
     * إنشاء مستخدم جديد (محاكاة)
     */
    async createUser(name, email, password) {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // في التطبيق الحقيقي، هذا سيكون استدعاء API
        
        const user = {
            id: utils.generateId(),
            name: name,
            email: email,
            role: 'admin',
            avatar: null,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        return user;
    }
    
    /**
     * استخراج الاسم من البريد الإلكتروني
     */
    extractNameFromEmail(email) {
        const username = email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1);
    }
    
    /**
     * التحقق من صحة البريد الإلكتروني
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * تسجيل الخروج
     */
    handleLogout() {
        // مسح بيانات المستخدم
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // مسح البيانات المحفوظة
        storage.clearCurrentUser();
        
        // إخفاء التطبيق وعرض شاشة تسجيل الدخول
        this.showAuth();
        
        // عرض رسالة تأكيد
        this.showSuccess('تم تسجيل الخروج بنجاح');
    }
    
    /**
     * عرض شاشة المصادقة
     */
    showAuth() {
        console.log('عرض شاشة المصادقة');
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'none';
        }
        
        // عرض نافذة تسجيل الدخول
        this.showLoginModal();
    }
    
    /**
     * عرض التطبيق
     */
    showApp() {
        console.log('عرض التطبيق الرئيسي');
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'grid';
        }
        
        // إخفاء جميع نوافذ المصادقة
        this.hideAllModals();
    }
    
    /**
     * عرض نافذة تسجيل الدخول
     */
    showLoginModal() {
        this.hideAllModals();
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('active');
            
            // التركيز على حقل البريد الإلكتروني
            setTimeout(() => {
                const emailInput = document.getElementById('login-email');
                if (emailInput) {
                    emailInput.focus();
                }
            }, 100);
        }
    }
    
    /**
     * إخفاء نافذة تسجيل الدخول
     */
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * عرض نافذة إنشاء الحساب
     */
    showRegisterModal() {
        this.hideAllModals();
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('active');
            
            // التركيز على حقل الاسم
            setTimeout(() => {
                const nameInput = document.getElementById('register-name');
                if (nameInput) {
                    nameInput.focus();
                }
            }, 100);
        }
    }
    
    /**
     * إخفاء نافذة إنشاء الحساب
     */
    hideRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * إخفاء جميع النوافذ المنبثقة
     */
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    /**
     * تحديث معلومات المستخدم
     */
    updateUserProfile(userData) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...userData };
            storage.setCurrentUser(this.currentUser);
            
            // تحديث الواجهة
            if (window.app) {
                app.updateUserInfo();
            }
            
            this.showSuccess('تم تحديث الملف الشخصي بنجاح');
        }
    }
    
    /**
     * تغيير كلمة المرور
     */
    async changePassword(currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            this.showError('يرجى ملء جميع الحقول');
            return false;
        }
        
        if (newPassword.length < 6) {
            this.showError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
            return false;
        }
        
        try {
            // في التطبيق الحقيقي، هذا سيكون استدعاء API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess('تم تغيير كلمة المرور بنجاح');
            return true;
            
        } catch (error) {
            console.error('خطأ في تغيير كلمة المرور:', error);
            this.showError('فشل في تغيير كلمة المرور');
            return false;
        }
    }
    
    /**
     * التحقق من صلاحيات المستخدم
     */
    hasPermission(permission) {
        if (!this.currentUser) {
            return false;
        }
        
        // المدير له جميع الصلاحيات
        if (this.currentUser.role === 'admin') {
            return true;
        }
        
        // تحديد الصلاحيات حسب الدور
        const permissions = {
            'editor': ['read', 'write', 'edit'],
            'viewer': ['read']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes(permission);
    }
    
    /**
     * الحصول على معلومات المستخدم الحالي
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * التحقق من حالة المصادقة
     */
    isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }
    
    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        if (window.notifications) {
            notifications.show(message, 'error');
        } else {
            alert(message);
        }
    }
    
    /**
     * عرض رسالة نجاح
     */
    showSuccess(message) {
        if (window.notifications) {
            notifications.show(message, 'success');
        }
    }
    
    /**
     * تنظيف البيانات عند إغلاق التطبيق
     */
    cleanup() {
        // تنظيف أي موارد مستخدمة
        this.hideAllModals();
    }
}

// تهيئة مدير المصادقة
const auth = new AuthManager();

// تصدير للاستخدام العام
window.auth = auth;

