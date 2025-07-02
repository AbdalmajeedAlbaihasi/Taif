from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import User, db
from src.models.project import Project, ProjectMember

project_bp = Blueprint('project', __name__)

@project_bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    try:
        current_user_id = get_jwt_identity()
        
        # جلب المشاريع التي يملكها المستخدم أو عضو فيها
        owned_projects = Project.query.filter_by(owner_id=current_user_id).all()
        member_projects = db.session.query(Project).join(ProjectMember).filter(
            ProjectMember.user_id == current_user_id
        ).all()
        
        # دمج المشاريع وإزالة التكرار
        all_projects = list(set(owned_projects + member_projects))
        
        return jsonify([project.to_dict() for project in all_projects]), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء جلب المشاريع'}), 500

@project_bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    try:
        current_user_id = get_jwt_identity()
        project = Project.query.get_or_404(project_id)
        
        # التحقق من صلاحية الوصول
        if not _has_project_access(project_id, current_user_id):
            return jsonify({'error': 'ليس لديك صلاحية للوصول لهذا المشروع'}), 403
        
        return jsonify(project.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء جلب المشروع'}), 500

@project_bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        if not data or not data.get('name') or not data.get('start_date') or not data.get('end_date'):
            return jsonify({'error': 'اسم المشروع وتاريخ البداية والنهاية مطلوبة'}), 400
        
        # تحويل التواريخ
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        if start_date >= end_date:
            return jsonify({'error': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'}), 400
        
        project = Project(
            name=data['name'],
            description=data.get('description', ''),
            start_date=start_date,
            end_date=end_date,
            owner_id=current_user_id
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify(project.to_dict()), 201
        
    except ValueError:
        return jsonify({'error': 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إنشاء المشروع'}), 500

@project_bp.route('/projects/<project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    try:
        current_user_id = get_jwt_identity()
        project = Project.query.get_or_404(project_id)
        
        # التحقق من أن المستخدم هو مالك المشروع
        if project.owner_id != current_user_id:
            return jsonify({'error': 'ليس لديك صلاحية لتعديل هذا المشروع'}), 403
        
        data = request.json
        
        if data.get('name'):
            project.name = data['name']
        if data.get('description') is not None:
            project.description = data['description']
        if data.get('start_date'):
            project.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if data.get('end_date'):
            project.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        # التحقق من صحة التواريخ
        if project.start_date >= project.end_date:
            return jsonify({'error': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'}), 400
        
        db.session.commit()
        
        return jsonify(project.to_dict()), 200
        
    except ValueError:
        return jsonify({'error': 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء تحديث المشروع'}), 500

@project_bp.route('/projects/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    try:
        current_user_id = get_jwt_identity()
        project = Project.query.get_or_404(project_id)
        
        # التحقق من أن المستخدم هو مالك المشروع
        if project.owner_id != current_user_id:
            return jsonify({'error': 'ليس لديك صلاحية لحذف هذا المشروع'}), 403
        
        db.session.delete(project)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء حذف المشروع'}), 500

@project_bp.route('/projects/<project_id>/members', methods=['POST'])
@jwt_required()
def add_project_member():
    try:
        current_user_id = get_jwt_identity()
        project_id = request.view_args['project_id']
        project = Project.query.get_or_404(project_id)
        
        # التحقق من أن المستخدم هو مالك المشروع
        if project.owner_id != current_user_id:
            return jsonify({'error': 'ليس لديك صلاحية لإضافة أعضاء لهذا المشروع'}), 403
        
        data = request.json
        if not data or not data.get('user_id'):
            return jsonify({'error': 'معرف المستخدم مطلوب'}), 400
        
        # التحقق من وجود المستخدم
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        # التحقق من عدم وجود العضوية مسبقاً
        existing_member = ProjectMember.query.filter_by(
            project_id=project_id, user_id=data['user_id']
        ).first()
        
        if existing_member:
            return jsonify({'error': 'المستخدم عضو في المشروع بالفعل'}), 400
        
        member = ProjectMember(
            project_id=project_id,
            user_id=data['user_id'],
            role=data.get('role', 'member')
        )
        
        db.session.add(member)
        db.session.commit()
        
        return jsonify(member.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إضافة العضو'}), 500

@project_bp.route('/projects/<project_id>/members/<user_id>', methods=['DELETE'])
@jwt_required()
def remove_project_member(project_id, user_id):
    try:
        current_user_id = get_jwt_identity()
        project = Project.query.get_or_404(project_id)
        
        # التحقق من أن المستخدم هو مالك المشروع
        if project.owner_id != current_user_id:
            return jsonify({'error': 'ليس لديك صلاحية لإزالة أعضاء من هذا المشروع'}), 403
        
        member = ProjectMember.query.filter_by(
            project_id=project_id, user_id=user_id
        ).first()
        
        if not member:
            return jsonify({'error': 'العضو غير موجود في المشروع'}), 404
        
        db.session.delete(member)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إزالة العضو'}), 500

def _has_project_access(project_id, user_id):
    """التحقق من صلاحية المستخدم للوصول للمشروع"""
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

