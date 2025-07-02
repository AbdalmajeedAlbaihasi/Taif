import React, { useState, useEffect } from 'react';
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ZoomIn, ZoomOut, Filter } from 'lucide-react';
import { tasksAPI } from '@/lib/api';
import 'gantt-task-react/dist/index.css';
import '../App.css';

const GanttChart = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getByProject(projectId);
      const tasksData = response.data;
      
      // تحويل المهام إلى تنسيق Gantt Chart
      const ganttTasks = tasksData.map((task, index) => ({
        start: new Date(task.start_date),
        end: new Date(task.end_date),
        name: task.name,
        id: task.id,
        type: task.parent_task_id ? 'task' : 'project',
        progress: getTaskProgress(task.status),
        isDisabled: false,
        styles: getTaskStyles(task.status),
        dependencies: [], // سيتم تحديثها لاحقاً
      }));

      setTasks(ganttTasks);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل المهام');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskProgress = (status) => {
    switch (status) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 50;
      case 'not_started':
        return 0;
      case 'on_hold':
        return 25;
      default:
        return 0;
    }
  };

  const getTaskStyles = (status) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#10b981', progressColor: '#059669', progressSelectedColor: '#047857' };
      case 'in_progress':
        return { backgroundColor: '#3b82f6', progressColor: '#2563eb', progressSelectedColor: '#1d4ed8' };
      case 'not_started':
        return { backgroundColor: '#6b7280', progressColor: '#4b5563', progressSelectedColor: '#374151' };
      case 'on_hold':
        return { backgroundColor: '#f59e0b', progressColor: '#d97706', progressSelectedColor: '#b45309' };
      default:
        return { backgroundColor: '#6b7280', progressColor: '#4b5563', progressSelectedColor: '#374151' };
    }
  };

  const handleTaskChange = async (task) => {
    try {
      // تحديث المهمة في قاعدة البيانات
      await tasksAPI.update(task.id, {
        start_date: task.start.toISOString().split('T')[0],
        end_date: task.end.toISOString().split('T')[0],
      });
      
      // تحديث المهام المحلية
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === task.id ? task : t)
      );
    } catch (err) {
      console.error('Error updating task:', err);
      // إعادة تحميل المهام في حالة الخطأ
      loadTasks();
    }
  };

  const handleTaskDelete = async (task) => {
    try {
      await tasksAPI.delete(task.id);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleExpanderClick = (task) => {
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === task.id ? task : t))
    );
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل المخطط الزمني...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={loadTasks} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 ml-2" />
              المخطط الزمني للمشروع (Gantt Chart)
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Select value={viewMode} onValueChange={handleViewModeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ViewMode.Hour}>ساعة</SelectItem>
                <SelectItem value={ViewMode.QuarterDay}>ربع يوم</SelectItem>
                <SelectItem value={ViewMode.HalfDay}>نصف يوم</SelectItem>
                <SelectItem value={ViewMode.Day}>يوم</SelectItem>
                <SelectItem value={ViewMode.Week}>أسبوع</SelectItem>
                <SelectItem value={ViewMode.Month}>شهر</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="gantt-container" style={{ height: '500px', direction: 'ltr' }}>
            <Gantt
              tasks={tasks}
              viewMode={viewMode}
              onDateChange={handleTaskChange}
              onDelete={handleTaskDelete}
              onExpanderClick={handleExpanderClick}
              listCellWidth="200px"
              columnWidth={viewMode === ViewMode.Month ? 300 : 65}
              locale="ar"
              rtl={false} // نحتاج لتعطيل RTL للمخطط ليعمل بشكل صحيح
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">لا توجد مهام في هذا المشروع</p>
            <p className="text-sm">أضف مهام جديدة لعرضها في المخطط الزمني</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GanttChart;

