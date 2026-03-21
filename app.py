import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask import request
from ai_service import analyze_personality_and_suggest
from sqlalchemy.dialects.postgresql import JSONB # Cần thiết cho cột special_conditions
from flask_cors import CORS

# Tải các biến môi trường từ file .env
load_dotenv()

app = Flask(__name__)
CORS(app)
# Bật hiển thị tiếng Việt (Unicode) cho JSON trả về
app.json.ensure_ascii = False

# Lắp ráp chuỗi kết nối PostgreSQL
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

# Cấu hình SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Khởi tạo đối tượng database
db = SQLAlchemy(app)

# ==========================================
# KHỞI TẠO CÁC MODEL (ÁNH XẠ DATABASE)
# ==========================================

class University(db.Model):
    __tablename__ = 'universities'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    region = db.Column(db.String(50), index=True)
    
    university_majors = db.relationship('UniversityMajor', backref='university', lazy=True)

class Major(db.Model):
    __tablename__ = 'majors'
    id = db.Column(db.Integer, primary_key=True)
    ministry_code = db.Column(db.String(20), unique=True)
    name = db.Column(db.String(255), nullable=False)
    ai_mapping_group = db.Column(db.String(100), index=True)
    
    university_majors = db.relationship('UniversityMajor', backref='major', lazy=True)

class UniversityMajor(db.Model):
    __tablename__ = 'university_majors'
    id = db.Column(db.Integer, primary_key=True)
    university_id = db.Column(db.Integer, db.ForeignKey('universities.id'), nullable=False)
    major_id = db.Column(db.Integer, db.ForeignKey('majors.id'), nullable=False)
    admission_code = db.Column(db.String(20))
    
    __table_args__ = (db.UniqueConstraint('university_id', 'major_id', name='_university_major_uc'),)
    
    admission_scores = db.relationship('AdmissionScore', backref='university_major', lazy=True)

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class SubjectGroup(db.Model):
    __tablename__ = 'subject_groups'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    description = db.Column(db.String(255))
    
    subjects = db.relationship('Subject', secondary='group_subject_mapping', backref=db.backref('subject_groups', lazy=True))
    admission_scores = db.relationship('AdmissionScore', backref='subject_group', lazy=True)

group_subject_mapping = db.Table('group_subject_mapping',
    db.Column('group_id', db.Integer, db.ForeignKey('subject_groups.id', ondelete='CASCADE'), primary_key=True),
    db.Column('subject_id', db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), primary_key=True)
)

class AdmissionScore(db.Model):
    __tablename__ = 'admission_scores'
    id = db.Column(db.Integer, primary_key=True)
    university_major_id = db.Column(db.Integer, db.ForeignKey('university_majors.id'), nullable=False)
    subject_group_id = db.Column(db.Integer, db.ForeignKey('subject_groups.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    base_score = db.Column(db.Numeric(5, 2), nullable=False)
    special_conditions = db.Column(JSONB)
    
    __table_args__ = (db.UniqueConstraint('university_major_id', 'subject_group_id', 'year', name='_score_uc'),)


# ==========================================
# API LỌC KHỐI THI HỢP LỆ
# ==========================================
@app.route('/api/get-valid-groups', methods=['POST'])
def get_valid_groups():
    # 1. Lấy dữ liệu người dùng gửi lên (VD: mảng ID của 4 môn học)
    data = request.get_json()
    
    if not data or 'subject_ids' not in data:
        return jsonify({"status": "error", "message": "Vui lòng cung cấp mảng subject_ids"}), 400
        
    user_subject_ids = data['subject_ids']

    # 2. Truy vấn toàn bộ khối thi hiện có trong Database
    all_groups = SubjectGroup.query.all()
    valid_groups = []

    # 3. Thuật toán lọc: Khối nào có tất cả các môn nằm trong rổ môn của user thì được chọn
    for group in all_groups:
        group_subject_ids = [subject.id for subject in group.subjects]
        if group_subject_ids and all(sub_id in user_subject_ids for sub_id in group_subject_ids):
            valid_groups.append({
                "id": group.id,
                "code": group.code,
                "description": group.description
            })

    # 4. Trả kết quả về cho Frontend
    return jsonify({
        "status": "success",
        "provided_subject_ids": user_subject_ids,
        "valid_groups": valid_groups
    })

# ==========================================
# API PHÂN TÍCH TÍNH CÁCH & GỢI Ý NGÀNH
# ==========================================
@app.route('/api/analyze-personality', methods=['POST'])
def analyze_personality():
    data = request.get_json()
    
    if not data:
        return jsonify({"status": "error", "message": "Thiếu dữ liệu đầu vào"}), 400

    # 1. Truy vấn Database lấy toàn bộ tên ngành hiện có
    majors_query = Major.query.with_entities(Major.name).all()
    available_majors = [major[0] for major in majors_query]
    
    # Xử lý trường hợp DB rỗng (chưa nhập dữ liệu)
    if not available_majors:
        return jsonify({"status": "error", "message": "Database chưa có dữ liệu ngành học. Vui lòng thêm dữ liệu vào bảng Majors."}), 400

    # 2. Gọi AI Agent và truyền cả 2 luồng dữ liệu vào
    ai_response = analyze_personality_and_suggest(data, available_majors)
    
    if "error" in ai_response:
        return jsonify({"status": "error", "message": ai_response["error"]}), 500

    # 3. Trả kết quả về cho Frontend
    return jsonify({
        "status": "success",
        "data": ai_response
    })
    
# ==========================================
# API TEST 
# ==========================================
@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({
        "status": "success",
        "message": "Backend Flask và toàn bộ Models đã chạy thành công!"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)