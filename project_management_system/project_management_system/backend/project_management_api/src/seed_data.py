#!/usr/bin/env python3
"""
ملف لإضافة بيانات تجريبية لاختبار النظام
"""

import sys
import os
from datetime import datetime, timedelta
import bcrypt

# إضافة مسار المشروع للـ Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# إنشاء تطبيق Flask منفصل للبيانات التجريبية
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# تعريف النماذج مباشرة هنا لتجنب مشاكل الاستيراد
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='not_started')
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    parent_task_id = db.Column(db.Integer, db.ForeignKey('task.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def create_sample_data():
    """إنشاء بيانات تجريبية للنظام"""
    
    with app.app_context():
        # إنشاء الجداول
        db.create_all()
        
        # التحقق من وجود بيانات مسبقة
        if User.query.first():
            print("البيانات التجريبية موجودة مسبقاً")
            return
        
        # إنشاء مستخدمين تجريبيين
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'password': '123456'
            },
            {
                'username': 'manager',
                'email': 'manager@example.com',
                'password': '123456'
            },
            {
                'username': 'developer',
                'email': 'developer@example.com',
                'password': '123456'
            }
        ]
        
        users = []
        for user_data in users_data:
            # تشفير كلمة المرور
            password_hash = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt())
            
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=password_hash.decode('utf-8')
            )
            db.session.add(user)
            users.append(user)
        
        db.session.commit()
        print(f"تم إنشاء {len(users)} مستخدم")
        
        # إنشاء مشاريع تجريبية
        projects_data = [
            {
                'name': 'نظام إدارة المشاريع',
                'description': 'تطوير نظام شامل لإدارة المشاريع مع مخطط غانت تفاعلي',
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=90)).date(),
                'created_by': users[0].id
            },
            {
                'name': 'تطبيق التجارة الإلكترونية',
                'description': 'بناء متجر إلكتروني متكامل مع نظام دفع آمن',
                'start_date': (datetime.now() + timedelta(days=7)).date(),
                'end_date': (datetime.now() + timedelta(days=120)).date(),
                'created_by': users[1].id
            },
            {
                'name': 'موقع الشركة الجديد',
                'description': 'تصميم وتطوير موقع الشركة الجديد مع لوحة إدارة',
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=45)).date(),
                'created_by': users[0].id
            }
        ]
        
        projects = []
        for project_data in projects_data:
            project = Project(**project_data)
            db.session.add(project)
            projects.append(project)
        
        db.session.commit()
        print(f"تم إنشاء {len(projects)} مشروع")
        
        # إنشاء مهام تجريبية
        tasks_data = [
            # مهام المشروع الأول
            {
                'name': 'تحليل المتطلبات',
                'description': 'جمع وتحليل متطلبات النظام من العملاء',
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=7)).date(),
                'status': 'completed',
                'project_id': projects[0].id,
                'assigned_to': users[1].id,
                'created_by': users[0].id
            },
            {
                'name': 'تصميم قاعدة البيانات',
                'description': 'تصميم هيكل قاعدة البيانات والعلاقات',
                'start_date': (datetime.now() + timedelta(days=5)).date(),
                'end_date': (datetime.now() + timedelta(days=12)).date(),
                'status': 'completed',
                'project_id': projects[0].id,
                'assigned_to': users[2].id,
                'created_by': users[0].id
            },
            {
                'name': 'تطوير الواجهة الخلفية',
                'description': 'برمجة APIs والمنطق الخلفي للنظام',
                'start_date': (datetime.now() + timedelta(days=10)).date(),
                'end_date': (datetime.now() + timedelta(days=30)).date(),
                'status': 'in_progress',
                'project_id': projects[0].id,
                'assigned_to': users[2].id,
                'created_by': users[0].id
            },
            {
                'name': 'تطوير الواجهة الأمامية',
                'description': 'تصميم وبرمجة واجهة المستخدم',
                'start_date': (datetime.now() + timedelta(days=20)).date(),
                'end_date': (datetime.now() + timedelta(days=45)).date(),
                'status': 'not_started',
                'project_id': projects[0].id,
                'assigned_to': users[1].id,
                'created_by': users[0].id
            },
            {
                'name': 'تطوير مخطط غانت',
                'description': 'إضافة مخطط غانت التفاعلي للنظام',
                'start_date': (datetime.now() + timedelta(days=35)).date(),
                'end_date': (datetime.now() + timedelta(days=50)).date(),
                'status': 'not_started',
                'project_id': projects[0].id,
                'assigned_to': users[2].id,
                'created_by': users[0].id
            },
            {
                'name': 'الاختبار والمراجعة',
                'description': 'اختبار النظام وإصلاح الأخطاء',
                'start_date': (datetime.now() + timedelta(days=60)).date(),
                'end_date': (datetime.now() + timedelta(days=75)).date(),
                'status': 'not_started',
                'project_id': projects[0].id,
                'assigned_to': users[1].id,
                'created_by': users[0].id
            },
            
            # مهام المشروع الثاني
            {
                'name': 'دراسة السوق',
                'description': 'تحليل المنافسين ودراسة احتياجات السوق',
                'start_date': (datetime.now() + timedelta(days=7)).date(),
                'end_date': (datetime.now() + timedelta(days=14)).date(),
                'status': 'not_started',
                'project_id': projects[1].id,
                'assigned_to': users[1].id,
                'created_by': users[1].id
            },
            {
                'name': 'تصميم المتجر',
                'description': 'تصميم واجهة المتجر الإلكتروني',
                'start_date': (datetime.now() + timedelta(days=14)).date(),
                'end_date': (datetime.now() + timedelta(days=28)).date(),
                'status': 'not_started',
                'project_id': projects[1].id,
                'assigned_to': users[0].id,
                'created_by': users[1].id
            },
            
            # مهام المشروع الثالث
            {
                'name': 'تصميم الهوية البصرية',
                'description': 'تصميم شعار وهوية بصرية للموقع',
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=10)).date(),
                'status': 'in_progress',
                'project_id': projects[2].id,
                'assigned_to': users[0].id,
                'created_by': users[0].id
            },
            {
                'name': 'برمجة الموقع',
                'description': 'تطوير صفحات الموقع ولوحة الإدارة',
                'start_date': (datetime.now() + timedelta(days=8)).date(),
                'end_date': (datetime.now() + timedelta(days=30)).date(),
                'status': 'not_started',
                'project_id': projects[2].id,
                'assigned_to': users[2].id,
                'created_by': users[0].id
            }
        ]
        
        tasks = []
        for task_data in tasks_data:
            task = Task(**task_data)
            db.session.add(task)
            tasks.append(task)
        
        db.session.commit()
        print(f"تم إنشاء {len(tasks)} مهمة")
        
        # إنشاء إشعارات تجريبية
        notifications_data = [
            {
                'user_id': users[1].id,
                'title': 'مهمة جديدة مُسندة إليك',
                'message': 'تم إسناد مهمة "تحليل المتطلبات" إليك في مشروع نظام إدارة المشاريع',
                'type': 'task_assigned'
            },
            {
                'user_id': users[2].id,
                'title': 'اقتراب موعد التسليم',
                'message': 'مهمة "تصميم قاعدة البيانات" ستنتهي خلال 3 أيام',
                'type': 'deadline_reminder'
            },
            {
                'user_id': users[0].id,
                'title': 'تم إكمال مهمة',
                'message': 'تم إكمال مهمة "تحليل المتطلبات" بنجاح',
                'type': 'task_completed'
            }
        ]
        
        notifications = []
        for notification_data in notifications_data:
            notification = Notification(**notification_data)
            db.session.add(notification)
            notifications.append(notification)
        
        db.session.commit()
        print(f"تم إنشاء {len(notifications)} إشعار")
        
        print("تم إنشاء جميع البيانات التجريبية بنجاح!")
        print("\nبيانات تسجيل الدخول:")
        print("المستخدم: admin | كلمة المرور: 123456")
        print("المستخدم: manager | كلمة المرور: 123456")
        print("المستخدم: developer | كلمة المرور: 123456")

if __name__ == '__main__':
    create_sample_data()

