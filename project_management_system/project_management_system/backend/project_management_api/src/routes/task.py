from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import User, db
from src.models.project import Project
from src.models.task import Task, Comment, Dependency

task_bp = Blueprint('task', __name__)

@task_bp.route('/projects/<project_id>/tasks', methods=['GET'])
@jwt_required()
def get_project_tasks(project_id):
    try:
        current_user_id = get_jwt_identity()
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية للوصول لهذا المشروع'}), 403
        
        tasks = Task.query.filter_by(project_id=project_id).all()
        return jsonify([task.to_dict() for task in tasks]), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء جلب المهام'}), 500

@task_bp.route('/tasks/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        current_user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(task.project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية للوصول لهذه المهمة'}), 403
        
        return jsonify(task.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء جلب المهمة'}), 500

@task_bp.route('/projects/<project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    try:
        current_user_id = get_jwt_identity()
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية لإنشاء مهام في هذا المشروع'}), 403
        
        data = request.json
        
        if not data or not data.get('name') or not data.get('start_date') or not data.get('end_date'):
            return jsonify({'error': 'اسم المهمة وتاريخ البداية والنهاية مطلوبة'}), 400
        
        # تحويل التواريخ
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        if start_date >= end_date:
            return jsonify({'error': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'}), 400
        
        # التحقق من المهمة الأم إذا كانت موجودة
        parent_task_id = data.get('parent_task_id')
        if parent_task_id:
            parent_task = Task.query.get(parent_task_id)
            if not parent_task or parent_task.project_id != project_id:
                return jsonify({'error': 'المهمة الأم غير صحيحة'}), 400
        
        # التحقق من المستخدم المُسند إليه
        assigned_to = data.get('assigned_to')
        if assigned_to:
            assignee = User.query.get(assigned_to)
            if not assignee:
                return jsonify({'error': 'المستخدم المُسند إليه غير موجود'}), 400
        
        task = Task(
            project_id=project_id,
            parent_task_id=parent_task_id,
            name=data['name'],
            description=data.get('description', ''),
            start_date=start_date,
            end_date=end_date,
            assigned_to=assigned_to,
            status=data.get('status', 'not_started')
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify(task.to_dict()), 201
        
    except ValueError:
        return jsonify({'error': 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إنشاء المهمة'}), 500

@task_bp.route('/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        current_user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(task.project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية لتعديل هذه المهمة'}), 403
        
        data = request.json
        
        if data.get('name'):
            task.name = data['name']
        if data.get('description') is not None:
            task.description = data['description']
        if data.get('start_date'):
            task.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if data.get('end_date'):
            task.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if data.get('status'):
            task.status = data['status']
        if 'assigned_to' in data:
            if data['assigned_to']:
                assignee = User.query.get(data['assigned_to'])
                if not assignee:
                    return jsonify({'error': 'المستخدم المُسند إليه غير موجود'}), 400
            task.assigned_to = data['assigned_to']
        
        # التحقق من صحة التواريخ
        if task.start_date >= task.end_date:
            return jsonify({'error': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'}), 400
        
        db.session.commit()
        
        return jsonify(task.to_dict()), 200
        
    except ValueError:
        return jsonify({'error': 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء تحديث المهمة'}), 500

@task_bp.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        current_user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(task.project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية لحذف هذه المهمة'}), 403
        
        db.session.delete(task)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء حذف المهمة'}), 500

@task_bp.route('/tasks/<task_id>/dependencies', methods=['POST'])
@jwt_required()
def add_dependency(task_id):
    try:
        current_user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(task.project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية لإضافة تبعيات لهذه المهمة'}), 403
        
        data = request.json
        if not data or not data.get('predecessor_task_id'):
            return jsonify({'error': 'معرف المهمة السابقة مطلوب'}), 400
        
        predecessor_task = Task.query.get(data['predecessor_task_id'])
        if not predecessor_task:
            return jsonify({'error': 'المهمة السابقة غير موجودة'}), 404
        
        # التحقق من أن المهمتين في نفس المشروع
        if predecessor_task.project_id != task.project_id:
            return jsonify({'error': 'المهمتان يجب أن تكونا في نفس المشروع'}), 400
        
        # التحقق من عدم وجود التبعية مسبقاً
        existing_dependency = Dependency.query.filter_by(
            predecessor_task_id=data['predecessor_task_id'],
            successor_task_id=task_id
        ).first()
        
        if existing_dependency:
            return jsonify({'error': 'التبعية موجودة بالفعل'}), 400
        
        dependency = Dependency(
            predecessor_task_id=data['predecessor_task_id'],
            successor_task_id=task_id,
            type=data.get('type', 'finish_to_start')
        )
        
        db.session.add(dependency)
        db.session.commit()
        
        return jsonify(dependency.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إضافة التبعية'}), 500

@task_bp.route('/dependencies/<dependency_id>', methods=['DELETE'])
@jwt_required()
def delete_dependency(dependency_id):
    try:
        current_user_id = get_jwt_identity()
        dependency = Dependency.query.get_or_404(dependency_id)
        
        # التحقق من صلاحية الوصول للمشروع
        successor_task = Task.query.get(dependency.successor_task_id)
        if not _has_project_access(successor_task.project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية لحذف هذه التبعية'}), 403
        
        db.session.delete(dependency)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء حذف التبعية'}), 500

@task_bp.route('/tasks/<task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    try:
        current_user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(task.project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية للوصول لتعليقات هذه المهمة'}), 403
        
        comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.desc()).all()
        return jsonify([comment.to_dict() for comment in comments]), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء جلب التعليقات'}), 500

@task_bp.route('/tasks/<task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    try:
        current_user_id = get_jwt_identity()
        task = Task.query.get_or_404(task_id)
        
        # التحقق من صلاحية الوصول للمشروع
        if not _has_project_access(task.project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية لإضافة تعليقات لهذه المهمة'}), 403
        
        data = request.json
        if not data or not data.get('content'):
            return jsonify({'error': 'محتوى التعليق مطلوب'}), 400
        
        comment = Comment(
            task_id=task_id,
            user_id=current_user_id,
            content=data['content']
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify(comment.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إضافة التعليق'}), 500

@task_bp.route('/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        current_user_id = get_jwt_identity()
        comment = Comment.query.get_or_404(comment_id)
        
        # التحقق من أن المستخدم هو كاتب التعليق
        if comment.user_id != current_user_id:
            return jsonify({'error': 'ليس لديك صلاحية لحذف هذا التعليق'}), 403
        
        db.session.delete(comment)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء حذف التعليق'}), 500

def _has_project_access(project_id, user_id):
    """التحقق من صلاحية المستخدم للوصول للمشروع"""
    from src.models.project import ProjectMember
    
    project = Project.query.get(project_id)
    if not project:
        return False
    
    # إذا كان المستخدم مالك المشروع
    if project.owner_id == user_id:
        return True
    
    # إذا كان المستخدم عضو في المشروع
    member = ProjectMember.query.filter_by(
        project_id=project_id, user_id=user_id
    ).first()
    
    return member is not None

