// دوال إدارة المصادقة والمستخدم
export const auth = {
  // حفظ بيانات المستخدم والـ token
  setUser: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },

  // الحصول على المستخدم الحالي
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // الحصول على الـ token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // التحقق من تسجيل الدخول
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // تسجيل الخروج
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

