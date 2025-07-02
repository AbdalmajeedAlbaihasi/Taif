from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from src.models.user import db

class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = db.Column(db.String(36), db.ForeignKey('project.id'), nullable=False)
    parent_task_id = db.Column(db.String(36), db.ForeignKey('task.id'), nullable=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    assigned_to = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=True)
    status = db.Column(db.Enum('not_started', 'in_progress', 'completed', 'on_hold', name='task_status'), default='not_started')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # العلاقات
    subtasks = db.relationship('Task', backref=db.backref('parent_task', remote_side=[id]), lazy=True)
    comments = db.relationship('Comment', backref='task', lazy=True, cascade='all, delete-orphan')
    attachments = db.relationship('TaskAttachment', backref='task', lazy=True, cascade='all, delete-orphan')
    
    # التبعيات
    predecessor_dependencies = db.relationship('Dependency', 
                                             foreign_keys='Dependency.successor_task_id',
                                             backref='successor_task', lazy=True)
    successor_dependencies = db.relationship('Dependency', 
                                           foreign_keys='Dependency.predecessor_task_id',
                                           backref='predecessor_task', lazy=True)

    def __repr__(self):
        return f'<Task {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'parent_task_id': self.parent_task_id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'assigned_to': self.assigned_to,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Comment(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = db.Column(db.String(36), db.ForeignKey('task.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TaskAttachment(db.Model):
    __tablename__ = 'task_attachment'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = db.Column(db.String(36), db.ForeignKey('task.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    uploaded_by = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'uploaded_by': self.uploaded_by,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class Dependency(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    predecessor_task_id = db.Column(db.String(36), db.ForeignKey('task.id'), nullable=False)
    successor_task_id = db.Column(db.String(36), db.ForeignKey('task.id'), nullable=False)
    type = db.Column(db.Enum('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish', name='dependency_type'), default='finish_to_start')

    __table_args__ = (db.UniqueConstraint('predecessor_task_id', 'successor_task_id', name='unique_dependency'),)

    def to_dict(self):
        return {
            'id': self.id,
            'predecessor_task_id': self.predecessor_task_id,
            'successor_task_id': self.successor_task_id,
            'type': self.type
        }

