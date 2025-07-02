import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import ProjectsList from '@/components/ProjectsList';
import ProjectView from '@/components/ProjectView';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    // التحقق من وجود مستخدم مسجل دخول
    const currentUser = auth.getUser();
    if (currentUser && auth.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    auth.logout();
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView('project');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view !== 'project') {
      setSelectedProjectId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !auth.isAuthenticated()) {
    return <Login onLogin={handleLogin} />;
  }

  // تحديد المكون المراد عرضه بناءً على العرض الحالي
  const renderCurrentView = () => {
    switch (currentView) {
      case 'projects':
        return <ProjectsList onProjectSelect={handleProjectSelect} />;
      case 'project':
        return <ProjectView projectId={selectedProjectId} />;
      case 'dashboard':
      default:
        return <Dashboard user={user} onLogout={handleLogout} onViewChange={handleViewChange} />;
    }
  };

  return renderCurrentView();
}

export default App;
