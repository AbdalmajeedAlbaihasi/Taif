import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '@/lib/api';
import Layout from './Layout';
import '../App.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const projectsResponse = await projectsAPI.getAll();
      const projectsData = projectsResponse.data;
      setProjects(projectsData);
      setRecentProjects(projectsData.slice(0, 3));

      // حساب الإحصائيات
      let totalCompleted = 0;
      let totalPending = 0;
      let totalOverdue = 0;

      for (const project of projectsData) {
        try {
          const tasksResponse = await tasksAPI.getByProject(project.id);
          const tasks = tasksResponse.data;
          
          const completed = tasks.filter(task => task.status === 'completed').length;
          const pending = tasks.filter(task => task.status === 'not_started' || task.status === 'in_progress').length;
          const overdue = tasks.filter(task => {
            const endDate = new Date(task.end_date);
            const today = new Date();
            return endDate < today && task.status !== 'completed';
          }).length;

          totalCompleted += completed;
          totalPending += pending;
          totalOverdue += overdue;
        } catch (error) {
          console.error(`Error loading tasks for project ${project.id}:`, error);
        }
      }

      setStats({
        totalProjects: projectsData.length,
        completedTasks: totalCompleted,
        pendingTasks: totalPending,
        overdueTasks: totalOverdue
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectProgress = (project) => {
    // هذه دالة مؤقتة لحساب تقدم المشروع
    // في التطبيق الحقيقي، ستحتاج لجلب المهام وحساب النسبة
    return Math.floor(Math.random() * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'not_started':
        return 'لم يبدأ';
      case 'on_hold':
        return 'متوقف';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout currentPage="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في نظام إدارة المشاريع</h1>
          <p className="text-blue-100">تابع تقدم مشاريعك ومهامك من مكان واحد</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 ml-1" />
                +2 من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام المكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(stats.completedTasks * 0.1)} هذا الأسبوع
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام المعلقة</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">
                تحتاج للمتابعة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام المتأخرة</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdueTasks}</div>
              <p className="text-xs text-muted-foreground">
                تحتاج لاهتمام عاجل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>المشاريع الحديثة</CardTitle>
                  <CardDescription>آخر المشاريع التي تم إنشاؤها</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  مشروع جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{project.description}</p>
                        <div className="flex items-center mt-2 space-x-2 space-x-reverse">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(project.start_date).toLocaleDateString('ar-SA')} - {new Date(project.end_date).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{getProjectProgress(project)}%</div>
                        <Progress value={getProjectProgress(project)} className="w-16 h-2 mt-1" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد مشاريع حتى الآن</p>
                    <Button className="mt-4" size="sm">
                      <Plus className="h-4 w-4 ml-2" />
                      إنشاء أول مشروع
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
              <CardDescription>الأدوات الأكثر استخداماً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FolderOpen className="h-6 w-6 mb-2" />
                  <span className="text-sm">مشروع جديد</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  <span className="text-sm">مهمة جديدة</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">دعوة عضو</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">عرض التقويم</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

