from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, db
from src.models.notification import Notification

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        current_user_id = get_jwt_identity()
        
        # جلب الإشعارات مرتبة حسب التاريخ (الأحدث أولاً)
        notifications = Notification.query.filter_by(user_id=current_user_id).order_by(
            Notification.created_at.desc()
        ).all()
        
        return jsonify([notification.to_dict() for notification in notifications]), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء جلب الإشعارات'}), 500

@notification_bp.route('/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    try:
        current_user_id = get_jwt_identity()
        notification = Notification.query.get_or_404(notification_id)
        
        # التحقق من أن الإشعار يخص المستخدم الحالي
        if notification.user_id != current_user_id:
            return jsonify({'error': 'ليس لديك صلاحية لتعديل هذا الإشعار'}), 403
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify(notification.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء تحديث الإشعار'}), 500

@notification_bp.route('/notifications/mark_all_read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    try:
        current_user_id = get_jwt_identity()
        
        # تحديث جميع الإشعارات غير المقروءة للمستخدم
        Notification.query.filter_by(
            user_id=current_user_id, is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({'message': 'تم وضع علامة مقروءة على جميع الإشعارات'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء تحديث الإشعارات'}), 500

def create_notification(user_id, message, notification_type, related_entity_id=None):
    """دالة مساعدة لإنشاء إشعار جديد"""
    try:
        notification = Notification(
            user_id=user_id,
            message=message,
            type=notification_type,
            related_entity_id=related_entity_id
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
        
    except Exception as e:
        db.session.rollback()
        return None

