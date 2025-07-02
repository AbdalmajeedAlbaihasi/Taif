import { useState, useEffect } from 'react';
import { Bell, User, LogOut, Menu, X, Home, FolderOpen, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import '../App.css';

const Layout = ({ children, currentPage = 'dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(auth.getUser());
  }, []);

  const handleLogout = () => {
    auth.logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home, href: '/' },
    { id: 'projects', label: 'المشاريع', icon: FolderOpen, href: '/projects' },
    { id: 'calendar', label: 'التقويم', icon: Calendar, href: '/calendar' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">إدارة المشاريع</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                  currentPage === item.id ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : ''
                }`}
              >
                <Icon className="h-5 w-5 ml-3" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden ml-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(item => item.id === currentPage)?.label || 'لوحة التحكم'}
            </h2>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.username || 'المستخدم'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

