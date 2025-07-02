/**
 * نظام إدارة التخزين المحلي
 * يتعامل مع حفظ واسترجاع البيانات من localStorage
 */

class StorageManager {
    constructor() {
        this.prefix = 'project_manager_';
        this.version = '1.0.0';
        
        // مفاتيح التخزين
        this.keys = {
            USER: 'current_user',
            PROJECTS: 'projects',
            TASKS: 'tasks',
            TEAM: 'team_members',
            SETTINGS: 'app_settings',
            NOTIFICATIONS: 'notifications'
        };
        
        // تهيئة التخزين
        this.init();
    }
    
    /**
     * تهيئة نظام التخزين
     */
    init() {
        try {
            // التحقق من دعم localStorage
            if (!this.isStorageSupported()) {
                console.warn('localStorage غير مدعوم في هذا المتصفح');
                return;
            }
            
            // تهيئة البيانات الافتراضية
            this.initializeDefaultData();
            
            console.log('تم تهيئة نظام التخزين بنجاح');
            
        } catch (error) {
            console.error('خطأ في تهيئة نظام التخزين:', error);
        }
    }
    
    /**
     * التحقق من دعم localStorage
     */
    isStorageSupported() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * تهيئة البيانات الافتراضية
     */
    initializeDefaultData() {
        // تهيئة المشاريع إذا لم تكن موجودة
        if (!this.getProjects().length) {
            this.setProjects([]);
        }
        
        // تهيئة المهام إذا لم تكن موجودة
        if (!this.getTasks().length) {
            this.setTasks([]);
        }
        
        // تهيئة الفريق إذا لم يكن موجود
        if (!this.getTeamMembers().length) {
            this.setTeamMembers([]);
        }
        
        // تهيئة الإعدادات
        if (!this.getSettings()) {
            this.setSettings(this.getDefaultSettings());
        }
    }
    
    /**
     * الحصول على الإعدادات الافتراضية
     */
    getDefaultSettings() {
        return {
            theme: 'light',
            language: 'ar',
            notifications: true,
            autoSave: true,
            dateFormat: 'dd/mm/yyyy',
            timeFormat: '24h'
        };
    }
    
    /**
     * حفظ البيانات
     */
    setItem(key, value) {
        try {
            const fullKey = this.prefix + key;
            const data = {
                value: value,
                timestamp: Date.now(),
                version: this.version
            };
            
            localStorage.setItem(fullKey, JSON.stringify(data));
            console.log('تم حفظ البيانات');
            return true;
            
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    }
    
    /**
     * استرجاع البيانات
     */
    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const item = localStorage.getItem(fullKey);
            
            if (!item) {
                return defaultValue;
            }
            
            const data = JSON.parse(item);
            
            // التحقق من إصدار البيانات
            if (data.version !== this.version) {
                console.warn(`إصدار البيانات قديم للمفتاح: ${key}`);
                // يمكن إضافة منطق ترقية البيانات هنا
            }
            
            return data.value;
            
        } catch (error) {
            console.error('خطأ في استرجاع البيانات:', error);
            return defaultValue;
        }
    }
    
    /**
     * حذف البيانات
     */
    removeItem(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('خطأ في حذف البيانات:', error);
            return false;
        }
    }
    
    /**
     * مسح جميع البيانات
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return false;
        }
    }
    
    // ===== إدارة المستخدم =====
    
    /**
     * حفظ المستخدم الحالي
     */
    setCurrentUser(user) {
        return this.setItem(this.keys.USER, user);
    }
    
    /**
     * الحصول على المستخدم الحالي
     */
    getCurrentUser() {
        return this.getItem(this.keys.USER);
    }
    
    /**
     * مسح المستخدم الحالي
     */
    clearCurrentUser() {
        return this.removeItem(this.keys.USER);
    }
    
    // ===== إدارة المشاريع =====
    
    /**
     * حفظ المشاريع
     */
    setProjects(projects) {
        return this.setItem(this.keys.PROJECTS, projects);
    }
    
    /**
     * الحصول على المشاريع
     */
    getProjects() {
        return this.getItem(this.keys.PROJECTS, []);
    }
    
    /**
     * إضافة مشروع جديد
     */
    addProject(project) {
        const projects = this.getProjects();
        projects.push({
            ...project,
            id: project.id || utils.generateId(),
            createdAt: project.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return this.setProjects(projects);
    }
    
    /**
     * تحديث مشروع
     */
    updateProject(projectId, updates) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === projectId);
        
        if (index !== -1) {
            projects[index] = {
                ...projects[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            return this.setProjects(projects);
        }
        
        return false;
    }
    
    /**
     * حذف مشروع
     */
    deleteProject(projectId) {
        const projects = this.getProjects();
        const filteredProjects = projects.filter(p => p.id !== projectId);
        
        if (filteredProjects.length !== projects.length) {
            // حذف المهام المرتبطة بالمشروع أيضاً
            const tasks = this.getTasks();
            const filteredTasks = tasks.filter(t => t.projectId !== projectId);
            this.setTasks(filteredTasks);
            
            return this.setProjects(filteredProjects);
        }
        
        return false;
    }
    
    // ===== إدارة المهام =====
    
    /**
     * حفظ المهام
     */
    setTasks(tasks) {
        return this.setItem(this.keys.TASKS, tasks);
    }
    
    /**
     * الحصول على المهام
     */
    getTasks() {
        return this.getItem(this.keys.TASKS, []);
    }
    
    /**
     * إضافة مهمة جديدة
     */
    addTask(task) {
        const tasks = this.getTasks();
        tasks.push({
            ...task,
            id: task.id || utils.generateId(),
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return this.setTasks(tasks);
    }
    
    /**
     * تحديث مهمة
     */
    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        
        if (index !== -1) {
            tasks[index] = {
                ...tasks[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            return this.setTasks(tasks);
        }
        
        return false;
    }
    
    /**
     * حذف مهمة
     */
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        
        if (filteredTasks.length !== tasks.length) {
            return this.setTasks(filteredTasks);
        }
        
        return false;
    }
    
    // ===== إدارة الفريق =====
    
    /**
     * حفظ أعضاء الفريق
     */
    setTeamMembers(members) {
        return this.setItem(this.keys.TEAM, members);
    }
    
    /**
     * الحصول على أعضاء الفريق
     */
    getTeamMembers() {
        return this.getItem(this.keys.TEAM, []);
    }
    
    /**
     * إضافة عضو فريق جديد
     */
    addTeamMember(member) {
        const members = this.getTeamMembers();
        members.push({
            ...member,
            id: member.id || utils.generateId(),
            joinedAt: member.joinedAt || new Date().toISOString()
        });
        return this.setTeamMembers(members);
    }
    
    /**
     * تحديث عضو فريق
     */
    updateTeamMember(memberId, updates) {
        const members = this.getTeamMembers();
        const index = members.findIndex(m => m.id === memberId);
        
        if (index !== -1) {
            members[index] = {
                ...members[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            return this.setTeamMembers(members);
        }
        
        return false;
    }
    
    /**
     * حذف عضو فريق
     */
    deleteTeamMember(memberId) {
        const members = this.getTeamMembers();
        const filteredMembers = members.filter(m => m.id !== memberId);
        
        if (filteredMembers.length !== members.length) {
            return this.setTeamMembers(filteredMembers);
        }
        
        return false;
    }
    
    // ===== إدارة الإعدادات =====
    
    /**
     * حفظ الإعدادات
     */
    setSettings(settings) {
        return this.setItem(this.keys.SETTINGS, settings);
    }
    
    /**
     * الحصول على الإعدادات
     */
    getSettings() {
        return this.getItem(this.keys.SETTINGS, this.getDefaultSettings());
    }
    
    /**
     * تحديث إعداد محدد
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.setSettings(settings);
    }
    
    // ===== إدارة التنبيهات =====
    
    /**
     * حفظ التنبيهات
     */
    setNotifications(notifications) {
        return this.setItem(this.keys.NOTIFICATIONS, notifications);
    }
    
    /**
     * الحصول على التنبيهات
     */
    getNotifications() {
        return this.getItem(this.keys.NOTIFICATIONS, []);
    }
    
    /**
     * إضافة تنبيه جديد
     */
    addNotification(notification) {
        const notifications = this.getNotifications();
        notifications.unshift({
            ...notification,
            id: notification.id || utils.generateId(),
            createdAt: notification.createdAt || new Date().toISOString(),
            read: false
        });
        
        // الاحتفاظ بآخر 100 تنبيه فقط
        if (notifications.length > 100) {
            notifications.splice(100);
        }
        
        return this.setNotifications(notifications);
    }
    
    /**
     * تحديث تنبيه
     */
    updateNotification(notificationId, updates) {
        const notifications = this.getNotifications();
        const index = notifications.findIndex(n => n.id === notificationId);
        
        if (index !== -1) {
            notifications[index] = {
                ...notifications[index],
                ...updates
            };
            return this.setNotifications(notifications);
        }
        
        return false;
    }
    
    /**
     * حذف تنبيه
     */
    deleteNotification(notificationId) {
        const notifications = this.getNotifications();
        const filteredNotifications = notifications.filter(n => n.id !== notificationId);
        
        if (filteredNotifications.length !== notifications.length) {
            return this.setNotifications(filteredNotifications);
        }
        
        return false;
    }
    
    /**
     * تحديد التنبيه كمقروء
     */
    markNotificationAsRead(notificationId) {
        return this.updateNotification(notificationId, { read: true });
    }
    
    /**
     * تحديد جميع التنبيهات كمقروءة
     */
    markAllNotificationsAsRead() {
        const notifications = this.getNotifications();
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        return this.setNotifications(updatedNotifications);
    }
    
    // ===== وظائف البحث =====
    
    /**
     * البحث في المشاريع
     */
    searchProjects(query) {
        const projects = this.getProjects();
        const searchTerm = query.toLowerCase();
        
        return projects.filter(project => 
            project.name.toLowerCase().includes(searchTerm) ||
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
    }
    
    /**
     * البحث في المهام
     */
    searchTasks(query) {
        const tasks = this.getTasks();
        const searchTerm = query.toLowerCase();
        
        return tasks.filter(task => 
            task.name.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // ===== وظائف الإحصائيات =====
    
    /**
     * الحصول على إحصائيات التطبيق
     */
    getAppStats() {
        const projects = this.getProjects();
        const tasks = this.getTasks();
        const teamMembers = this.getTeamMembers();
        
        return {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'active').length,
            completedProjects: projects.filter(p => p.status === 'completed').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            overdueTasks: tasks.filter(t => {
                const endDate = new Date(t.endDate);
                const today = new Date();
                return endDate < today && t.status !== 'completed';
            }).length,
            teamMembers: teamMembers.length,
            storageUsed: this.getStorageUsage()
        };
    }
    
    /**
     * الحصول على استخدام التخزين
     */
    getStorageUsage() {
        try {
            let totalSize = 0;
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    totalSize += localStorage.getItem(key).length;
                }
            });
            
            return {
                used: totalSize,
                formatted: utils.formatFileSize(totalSize)
            };
            
        } catch (error) {
            console.error('خطأ في حساب استخدام التخزين:', error);
            return { used: 0, formatted: '0 بايت' };
        }
    }
    
    // ===== النسخ الاحتياطي والاستعادة =====
    
    /**
     * إنشاء نسخة احتياطية
     */
    createBackup() {
        try {
            const backup = {
                version: this.version,
                timestamp: new Date().toISOString(),
                data: {
                    user: this.getCurrentUser(),
                    projects: this.getProjects(),
                    tasks: this.getTasks(),
                    teamMembers: this.getTeamMembers(),
                    settings: this.getSettings(),
                    notifications: this.getNotifications()
                }
            };
            
            return backup;
            
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            return null;
        }
    }
    
    /**
     * استعادة من نسخة احتياطية
     */
    restoreFromBackup(backup) {
        try {
            if (!backup || !backup.data) {
                throw new Error('النسخة الاحتياطية غير صالحة');
            }
            
            const { data } = backup;
            
            // استعادة البيانات
            if (data.user) this.setCurrentUser(data.user);
            if (data.projects) this.setProjects(data.projects);
            if (data.tasks) this.setTasks(data.tasks);
            if (data.teamMembers) this.setTeamMembers(data.teamMembers);
            if (data.settings) this.setSettings(data.settings);
            if (data.notifications) this.setNotifications(data.notifications);
            
            return true;
            
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            return false;
        }
    }
    
    /**
     * الحصول على قائمة المستخدمين المسجلين
     */
    getRegisteredUsers() {
        return this.getItem('registered_users') || [];
    }
    
    /**
     * حفظ قائمة المستخدمين المسجلين
     */
    setRegisteredUsers(users) {
        return this.setItem('registered_users', users);
    }
    
    /**
     * إضافة مستخدم جديد للقائمة
     */
    addRegisteredUser(user) {
        const users = this.getRegisteredUsers();
        users.push(user);
        return this.setRegisteredUsers(users);
    }
    
    /**
     * البحث عن مستخدم بالبريد الإلكتروني
     */
    findUserByEmail(email) {
        const users = this.getRegisteredUsers();
        return users.find(user => user.email === email);
    }
}

// تهيئة مدير التخزين
const storage = new StorageManager();

// تصدير للاستخدام العام
window.storage = storage;

