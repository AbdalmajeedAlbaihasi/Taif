from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # التحقق من وجود البيانات المطلوبة
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'اسم المستخدم والبريد الإلكتروني وكلمة المرور مطلوبة'}), 400
        
        # التحقق من عدم وجود مستخدم بنفس اسم المستخدم أو البريد الإلكتروني
        existing_user = User.query.filter(
            (User.username == data['username']) | (User.email == data['email'])
        ).first()
        
        if existing_user:
            return jsonify({'error': 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل'}), 400
        
        # إنشاء مستخدم جديد
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # إنشاء رمز الوصول
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'تم تسجيل المستخدم بنجاح',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء التسجيل'}), 500

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'اسم المستخدم وكلمة المرور مطلوبان'}), 400
        
        # البحث عن المستخدم
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401
        
        # إنشاء رمز الوصول
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'تم تسجيل الدخول بنجاح',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء تسجيل الدخول'}), 500

@auth_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء جلب بيانات المستخدم'}), 500

