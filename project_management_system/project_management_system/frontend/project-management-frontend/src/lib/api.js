import axios from 'axios';

// إنشاء instance من axios مع الإعدادات الأساسية
const api = axios.create({
  baseURL: '/api', // استخدام مسار نسبي للـ API
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة interceptor لإرفاق token في كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// إضافة interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إزالة token المنتهي الصلاحية وإعادة توجيه للتسجيل
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// دوال المصادقة
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// دوال المشاريع
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (projectId, userData) => api.post(`/projects/${projectId}/members`, userData),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

// دوال المهام
export const tasksAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (projectId, taskData) => api.post(`/projects/${projectId}/tasks`, taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  addDependency: (taskId, dependencyData) => api.post(`/tasks/${taskId}/dependencies`, dependencyData),
  deleteDependency: (dependencyId) => api.delete(`/dependencies/${dependencyId}`),
};

// دوال التعليقات
export const commentsAPI = {
  getByTask: (taskId) => api.get(`/tasks/${taskId}/comments`),
  create: (taskId, commentData) => api.post(`/tasks/${taskId}/comments`, commentData),
  delete: (id) => api.delete(`/comments/${id}`),
};

// دوال الإشعارات
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark_all_read'),
};

export default api;

