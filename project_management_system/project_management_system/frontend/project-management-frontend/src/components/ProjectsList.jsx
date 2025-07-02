import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '@/lib/api';
import Layout from './Layout';
import '../App.css';

const ProjectsList = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // تصفية المشاريع بناءً على البحث
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projects, searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      const projectsData = response.data;
      
      // تحميل إحصائيات كل مشروع
      const projectsWithStats = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const tasksResponse = await tasksAPI.getByProject(project.id);
            const tasks = tasksResponse.data;
            
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return {
              ...project,
              totalTasks,
              completedTasks,
              progress
            };
          } catch (error) {
            console.error(`Error loading tasks for project ${project.id}:`, error);
            return {
              ...project,
              totalTasks: 0,
              completedTasks: 0,
              progress: 0
            };
          }
        })
      );
      
      setProjects(projectsWithStats);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل المشاريع');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    }
  };

  const getProjectStatus = (project) => {
    const today = new Date();
    const endDate = new Date(project.end_date);
    const startDate = new Date(project.start_date);
    
    if (project.progress === 100) {
      return { status: 'completed', text: 'مكتمل', color: 'bg-green-100 text-green-800' };
    } else if (today > endDate) {
      return { status: 'overdue', text: 'متأخر', color: 'bg-red-100 text-red-800' };
    } else if (today >= startDate) {
      return { status: 'active', text: 'نشط', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'upcoming', text: 'قادم', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <Layout currentPage="projects">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المشاريع...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="projects">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المشاريع</h1>
            <p className="text-gray-600">إدارة ومتابعة جميع مشاريعك</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            مشروع جديد
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المشاريع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {error ? (
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={loadProjects} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const projectStatus = getProjectStatus(project);
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Badge className={projectStatus.color}>
                          {projectStatus.text}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">التقدم</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 ml-1" />
                          <span>
                            {new Date(project.end_date).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 ml-1" />
                          <span>{project.totalTasks} مهمة</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 space-x-reverse pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <Eye className="h-3 w-3 ml-1" />
                          عرض
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'لا توجد مشاريع مطابقة' : 'لا توجد مشاريع'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'جرب تغيير كلمات البحث أو إزالة المرشحات'
                : 'ابدأ بإنشاء مشروعك الأول لتنظيم مهامك'
              }
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء مشروع جديد
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectsList;

