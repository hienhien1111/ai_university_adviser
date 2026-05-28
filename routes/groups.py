from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from models import SubjectGroup

groups_bp = Blueprint('groups', __name__)


@groups_bp.route('/api/get-valid-groups', methods=['POST'])
def get_valid_groups():
    data = request.get_json()
    if not data or 'subject_ids' not in data:
        return jsonify({"status": "error", "message": "Vui lòng cung cấp mảng subject_ids"}), 400

    user_subject_ids = data['subject_ids']

    # joinedload: tải toàn bộ subjects trong 1 JOIN query thay vì N lazy queries riêng
    all_groups = SubjectGroup.query.options(joinedload(SubjectGroup.subjects)).all()
    valid_groups = []

    for group in all_groups:
        group_subject_ids = [subject.id for subject in group.subjects]
        if group_subject_ids and all(sub_id in user_subject_ids for sub_id in group_subject_ids):
            valid_groups.append({
                "id": group.id,
                "code": group.code,
                "description": group.description
            })

    return jsonify({
        "status": "success",
        "provided_subject_ids": user_subject_ids,
        "valid_groups": valid_groups
    })

