/**
 * التطبيق الرئيسي - مدير المشاريع
 * يدير التنقل والواجهة الرئيسية للتطبيق
 */

class ProjectManager {
    constructor() {
        this.currentView = 'dashboard';
        this.isInitialized = false;
        this.isMobile = window.innerWidth <= 991;
        
        // انتظار تحميل DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // تأخير قصير للتأكد من تحميل جميع الملفات
            setTimeout(() => this.init(), 100);
        }
    }
    
    /**
     * تهيئة التطبيق
     */
    async init() {
        try {
            console.log('بدء تهيئة مدير المشاريع...');
            
            // إخفاء شاشة التحميل فوراً
            this.hideLoadingScreen();
            
            // التحقق من تحميل جميع المكونات المطلوبة
            if (!this.checkDependencies()) {
                console.error('بعض المكونات المطلوبة غير محملة');
                // محاولة إعادة التهيئة بعد فترة أطول
                setTimeout(() => this.init(), 1000);
                return;
            }
            
            // ربط الأحداث
            this.bindEvents();
            
            // تحديث الواجهة
            this.updateUI();
            
            // تهيئة المكونات
            await this.initializeComponents();
            
            // تحديث الإحصائيات
            this.updateDashboardStats();
            
            this.isInitialized = true;
            console.log('تم تحميل مدير المشاريع بنجاح');
            
        } catch (error) {
            console.error('خطأ في تهيئة التطبيق:', error);
            this.showError('حدث خطأ في تحميل التطبيق');
            // إخفاء شاشة التحميل حتى في حالة الخطأ
            this.hideLoadingScreen();
        }
    }
    
    /**
     * التحقق من تحميل جميع المكونات المطلوبة
     */
    checkDependencies() {
        const required = ['utils', 'storage', 'auth'];
        let allLoaded = true;
        
        for (const dep of required) {
            if (!window[dep]) {
                console.warn(`المكون ${dep} غير محمل بعد`);
                allLoaded = false;
            }
        }
        
        // إذا لم تكن جميع المكونات محملة، انتظر قليلاً
        if (!allLoaded) {
            console.log('انتظار تحميل المكونات...');
            return false;
        }
        
        return true;
    }
    
    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
            console.log('تم إخفاء شاشة التحميل');
        }
    }
    
    /**
     * تهيئة المكونات
     */
    async initializeComponents() {
        // التحقق من وجود المستخدم المسجل
        if (!auth.isAuthenticated) {
            console.log('المستخدم غير مسجل، عرض نافذة تسجيل الدخول');
            setTimeout(() => auth.showLoginModal(), 100);
            return;
        }
        
        // تحديث معلومات المستخدم في الواجهة
        this.updateUserInfo();
        
        // تحميل البيانات
        await this.loadData();
    }
    
    /**
     * تحديث معلومات المستخدم
     */
    updateUserInfo() {
        const user = auth.currentUser;
        if (user) {
            const userNameEl = document.getElementById('user-name');
            const userEmailEl = document.getElementById('user-email');
            
            if (userNameEl) userNameEl.textContent = user.name || 'المستخدم';
            if (userEmailEl) userEmailEl.textContent = user.email || '';
        }
    }
    
    /**
     * تحميل البيانات
     */
    async loadData() {
        try {
            // تحميل المشاريع
            if (window.projects) {
                await projects.loadProjects();
            }
            
            // تحميل المهام
            if (window.tasks) {
                await tasks.loadTasks();
            }
            
            // تحميل الفريق
            if (window.team) {
                await team.loadTeamMembers();
            }
            
            // تحديث مخطط جانت
            if (window.ganttManager) {
                ganttManager.updateGanttData();
            }
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
        }
    }
    
    /**
     * ربط الأحداث
     */
    bindEvents() {
        // أحداث التنقل
        this.bindNavigationEvents();
        
        // أحداث الجوال
        this.bindMobileEvents();
        
        // أحداث النوافذ
        this.bindWindowEvents();
        
        // أحداث المستخدم
        this.bindUserEvents();
        
        // أحداث البحث
        this.bindSearchEvents();
    }
    
    /**
     * ربط أحداث التنقل
     */
    bindNavigationEvents() {
        const navLinks = document.querySelectorAll('.nav-link[data-view]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                this.showView(view);
            });
        });
    }
    
    /**
     * ربط أحداث الجوال
     */
    bindMobileEvents() {
        // إضافة زر القائمة للجوال
        this.addMobileMenuToggle();
        
        // أحداث تغيير حجم الشاشة
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // إغلاق الشريط الجانبي عند النقر على الطبقة
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    }
    
    /**
     * إضافة زر القائمة للجوال
     */
    addMobileMenuToggle() {
        const headerLeft = document.querySelector('.header-left');
        if (headerLeft && !document.querySelector('.mobile-menu-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'mobile-menu-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.setAttribute('aria-label', 'فتح القائمة');
            
            toggleBtn.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
            
            headerLeft.insertBefore(toggleBtn, headerLeft.firstChild);
        }
    }
    
    /**
     * تبديل الشريط الجانبي للجوال
     */
    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            const isActive = sidebar.classList.contains('active');
            
            if (isActive) {
                this.closeMobileSidebar();
            } else {
                this.openMobileSidebar();
            }
        }
    }
    
    /**
     * فتح الشريط الجانبي للجوال
     */
    openMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * إغلاق الشريط الجانبي للجوال
     */
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * معالجة تغيير حجم الشاشة
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 991;
        
        // إذا تغير من جوال إلى سطح مكتب
        if (wasMobile && !this.isMobile) {
            this.closeMobileSidebar();
        }
    }
    
    /**
     * ربط أحداث النوافذ
     */
    bindWindowEvents() {
        // إغلاق النوافذ المنبثقة عند النقر خارجها
        document.addEventListener('click', (e) => {
            // إغلاق قائمة المستخدم
            const userDropdown = document.getElementById('user-dropdown');
            const userMenuBtn = document.getElementById('user-menu-btn');
            
            if (userDropdown && userMenuBtn) {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            }
        });
        
        // إغلاق النوافذ بمفتاح Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // إغلاق النوافذ المنبثقة
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => {
                    modal.classList.remove('active');
                });
                
                // إغلاق الشريط الجانبي للجوال
                if (this.isMobile) {
                    this.closeMobileSidebar();
                }
                
                // إغلاق قائمة المستخدم
                const userDropdown = document.getElementById('user-dropdown');
                if (userDropdown) {
                    userDropdown.classList.remove('active');
                }
            }
        });
    }
    
    /**
     * ربط أحداث المستخدم
     */
    bindUserEvents() {
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });
        }
    }
    
    /**
     * ربط أحداث البحث
     */
    bindSearchEvents() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    }
    
    /**
     * معالجة البحث
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }
        
        // البحث في المشاريع والمهام
        const searchResults = {
            projects: window.projects ? projects.searchProjects(query) : [],
            tasks: window.tasks ? tasks.searchTasks(query) : []
        };
        
        this.displaySearchResults(searchResults);
    }
    
    /**
     * عرض نتائج البحث
     */
    displaySearchResults(results) {
        console.log('نتائج البحث:', results);
    }
    
    /**
     * مسح نتائج البحث
     */
    clearSearchResults() {
        // مسح نتائج البحث المعروضة
    }
    
    /**
     * عرض صفحة معينة
     */
    showView(viewName) {
        // إخفاء جميع الصفحات
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));
        
        // إزالة الحالة النشطة من جميع روابط التنقل
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // عرض الصفحة المطلوبة
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }
        
        // تفعيل رابط التنقل المناسب
        const activeNavLink = document.querySelector(`[data-view="${viewName}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
        // إغلاق الشريط الجانبي للجوال
        if (this.isMobile) {
            this.closeMobileSidebar();
        }
        
        // تحديث محتوى الصفحة
        this.updateViewContent(viewName);
    }
    
    /**
     * تحديث محتوى الصفحة
     */
    updateViewContent(viewName) {
        switch (viewName) {
            case 'dashboard':
                this.updateDashboardStats();
                this.loadRecentProjects();
                this.loadUpcomingTasks();
                break;
            case 'projects':
                if (window.projects) projects.renderProjects();
                break;
            case 'tasks':
                if (window.tasks) tasks.renderTasks();
                break;
            case 'gantt':
                if (window.ganttManager) {
                    ganttManager.initializeGantt();
                }
                break;
            case 'team':
                if (window.team) {
                    team.renderTeamMembers();
                }
                break;
        }
    }
    
    /**
     * تحديث إحصائيات لوحة التحكم
     */
    updateDashboardStats() {
        const allProjects = window.projects ? projects.getAllProjects() : [];
        const allTasks = window.tasks ? tasks.getAllTasks() : [];
        
        // إجمالي المشاريع
        const totalProjectsEl = document.getElementById('total-projects');
        if (totalProjectsEl) {
            totalProjectsEl.textContent = allProjects.length;
        }
        
        // إجمالي المهام
        const totalTasksEl = document.getElementById('total-tasks');
        if (totalTasksEl) {
            totalTasksEl.textContent = allTasks.length;
        }
        
        // المهام المكتملة
        const completedTasks = allTasks.filter(task => task.status === 'completed');
        const completedTasksEl = document.getElementById('completed-tasks');
        if (completedTasksEl) {
            completedTasksEl.textContent = completedTasks.length;
        }
        
        // المهام المتأخرة
        const overdueTasks = allTasks.filter(task => {
            const endDate = new Date(task.endDate);
            const today = new Date();
            return endDate < today && task.status !== 'completed';
        });
        const overdueTasksEl = document.getElementById('overdue-tasks');
        if (overdueTasksEl) {
            overdueTasksEl.textContent = overdueTasks.length;
        }
    }
    
    /**
     * تحميل المشاريع الحديثة
     */
    loadRecentProjects() {
        if (!window.projects) return;
        
        const recentProjects = projects.getRecentProjects(3);
        const container = document.getElementById('recent-projects');
        
        if (container) {
            if (recentProjects.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <p>لا توجد مشاريع حديثة</p>
                        <button class="btn btn-primary" onclick="projects.showAddProjectModal()">
                            <i class="fas fa-plus"></i>
                            إضافة مشروع جديد
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = recentProjects.map(project => `
                    <div class="project-card">
                        <div class="project-header">
                            <div class="project-color" style="background: ${project.color}"></div>
                            <h4 class="project-title">${project.name}</h4>
                            <p class="project-description">${project.description || ''}</p>
                        </div>
                        <div class="project-body">
                            <div class="project-meta">
                                <span class="project-status ${project.status}">${this.getStatusText(project.status)}</span>
                                <span class="project-priority ${project.priority}">${this.getPriorityText(project.priority)}</span>
                            </div>
                            <div class="project-progress">
                                <div class="progress-label">
                                    <span>التقدم</span>
                                    <span>${project.progress || 0}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    /**
     * تحميل المهام القادمة
     */
    loadUpcomingTasks() {
        if (!window.tasks) return;
        
        const upcomingTasks = tasks.getUpcomingTasks(5);
        const container = document.getElementById('upcoming-tasks-list');
        
        if (container) {
            if (upcomingTasks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <p>لا توجد مهام قادمة</p>
                        <button class="btn btn-primary" onclick="tasks.showAddTaskModal()">
                            <i class="fas fa-plus"></i>
                            إضافة مهمة جديدة
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = upcomingTasks.map(task => `
                    <div class="task-item">
                        <div class="task-header">
                            <h4 class="task-title">${task.name}</h4>
                            <span class="task-status ${task.status}">${this.getStatusText(task.status)}</span>
                        </div>
                        <div class="task-meta">
                            <span class="task-project">${window.projects ? projects.getProjectName(task.projectId) : ''}</span>
                            <span class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</span>
                        </div>
                        <div class="task-dates">
                            <span>تاريخ الانتهاء: ${window.utils ? utils.formatDate(task.endDate) : task.endDate}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    /**
     * الحصول على نص الحالة
     */
    getStatusText(status) {
        const statusTexts = {
            'active': 'نشط',
            'completed': 'مكتمل',
            'on-hold': 'متوقف',
            'pending': 'قيد الانتظار',
            'in-progress': 'جاري',
            'overdue': 'متأخر'
        };
        return statusTexts[status] || status;
    }
    
    /**
     * الحصول على نص الأولوية
     */
    getPriorityText(priority) {
        const priorityTexts = {
            'high': 'عالية',
            'medium': 'متوسطة',
            'low': 'منخفضة'
        };
        return priorityTexts[priority] || priority;
    }
    
    /**
     * تحديث الواجهة
     */
    updateUI() {
        // تحديث عداد التنبيهات
        this.updateNotificationBadge();
        
        // تحديث معلومات المستخدم
        this.updateUserInfo();
    }
    
    /**
     * تحديث عداد التنبيهات
     */
    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge && window.notifications) {
            const unreadCount = notifications.getUnreadCount();
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
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
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM محمل، بدء تهيئة التطبيق...');
    window.app = new ProjectManager();
});

// تهيئة احتياطية في حالة عدم تشغيل DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!window.app) {
            console.log('تهيئة احتياطية للتطبيق...');
            window.app = new ProjectManager();
        }
    }, 100);
}

