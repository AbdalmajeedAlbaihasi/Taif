import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '@/lib/api';
import Layout from './Layout';
import GanttChart from './GanttChart';
import '../App.css';

const ProjectView = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // تحميل بيانات المشروع
      const projectResponse = await projectsAPI.getById(projectId);
      setProject(projectResponse.data);
      
      // تحميل مهام المشروع
      const tasksResponse = await tasksAPI.getByProject(projectId);
      setTasks(tasksResponse.data);
      
    } catch (err) {
      setError('حدث خطأ أثناء تحميل بيانات المشروع');
      console.error('Error loading project data:', err);
    } finally {
      setLoading(false);
    }
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

  const getProjectStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const notStarted = tasks.filter(task => task.status === 'not_started').length;
    const onHold = tasks.filter(task => task.status === 'on_hold').length;
    
    return { total, completed, inProgress, notStarted, onHold };
  };

  const calculateProgress = () => {
    const stats = getProjectStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  if (loading) {
    return (
      <Layout currentPage="projects">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات المشروع...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout currentPage="projects">
        <div className="text-center">
          <p className="text-red-600">{error || 'المشروع غير موجود'}</p>
          <Button onClick={loadProjectData} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </Layout>
    );
  }

  const stats = getProjectStats();
  const progress = calculateProgress();

  return (
    <Layout currentPage="projects">
      <div className="space-y-6">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 ml-1" />
                  <span>
                    {new Date(project.start_date).toLocaleDateString('ar-SA')} - {new Date(project.end_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 ml-1" />
                  <span>5 أعضاء</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 ml-1" />
                  <span>{progress}% مكتمل</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 ml-1" />
                تعديل
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 ml-1" />
                إدارة الأعضاء
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">تقدم المشروع</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المهام</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">لم تبدأ</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="gantt">المخطط الزمني</TabsTrigger>
            <TabsTrigger value="tasks">المهام</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>المهام الحديثة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{task.description}</p>
                          <div className="flex items-center mt-1 space-x-2 space-x-reverse">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(task.end_date).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>النشاط الأخير</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">تم إنشاء مهمة جديدة "تصميم الواجهة"</p>
                        <p className="text-xs text-gray-500">منذ ساعتين</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">تم إكمال مهمة "إعداد قاعدة البيانات"</p>
                        <p className="text-xs text-gray-500">منذ 4 ساعات</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">تم إضافة تعليق على مهمة "البرمجة"</p>
                        <p className="text-xs text-gray-500">منذ يوم</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="gantt">
            <GanttChart projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">جميع المهام</h3>
              <Button>
                <Plus className="h-4 w-4 ml-1" />
                مهمة جديدة
              </Button>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <h4 className="font-medium">{task.name}</h4>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center mt-2 space-x-4 space-x-reverse text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 ml-1" />
                            <span>
                              {new Date(task.start_date).toLocaleDateString('ar-SA')} - {new Date(task.end_date).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          {task.assigned_to && (
                            <div className="flex items-center">
                              <Users className="h-3 w-3 ml-1" />
                              <span>مُسند</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectView;

