import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from ai_service import analyze_personality_and_suggest
from sqlalchemy.dialects.postgresql import JSONB # Cần thiết cho cột special_conditions
from flask_cors import CORS
from sqlalchemy import or_, and_

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
    
    # Đã cập nhật cho khớp với Database mới (thay thế ai_mapping_group)
    group_code = db.Column(db.String(20), index=True)
    group_name = db.Column(db.String(255))
    
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
# API 1: LỌC KHỐI THI HỢP LỆ
# ==========================================
@app.route('/api/get-valid-groups', methods=['POST'])
def get_valid_groups():
    data = request.get_json()
    
    if not data or 'subject_ids' not in data:
        return jsonify({"status": "error", "message": "Vui lòng cung cấp mảng subject_ids"}), 400
        
    user_subject_ids = data['subject_ids']
    all_groups = SubjectGroup.query.all()
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

# ==========================================
# API 2: PHÂN TÍCH TÍNH CÁCH & GỢI Ý NGÀNH
# ==========================================
@app.route('/api/analyze-personality', methods=['POST'])
def analyze_personality():
    data = request.get_json()
    
    if not data:
        return jsonify({"status": "error", "message": "Thiếu dữ liệu đầu vào"}), 400

    majors_query = Major.query.with_entities(Major.name).all()
    available_majors = [major[0] for major in majors_query]
    
    if not available_majors:
        return jsonify({"status": "error", "message": "Database chưa có dữ liệu ngành học."}), 400

    ai_response = analyze_personality_and_suggest(data, available_majors)
    
    if "error" in ai_response:
        return jsonify({"status": "error", "message": ai_response["error"]}), 500

    return jsonify({
        "status": "success",
        "data": ai_response
    })

# ==========================================
# API 3: TRÙM CUỐI - TÌM TRƯỜNG ĐẠI HỌC
# ==========================================
@app.route('/api/find-universities', methods=['POST'])
def find_universities():
    data = request.json
    
    # Nhận dữ liệu
    ai_suggested_majors = data.get('ai_majors', []) 
    region = data.get('region', 'ALL')              
    user_groups = data.get('user_groups', [])       # Format: [{"group_id": 1, "score": 25.5}, ...]
    
    if not ai_suggested_majors or not user_groups:
        return jsonify({"status": "error", "message": "Thiếu thông tin ngành học hoặc điểm số khối thi!"})

    try:
        # Xây dựng truy vấn JOIN 5 bảng
        query = db.session.query(
            University.name.label('uni_name'),
            University.code.label('uni_code'),
            Major.name.label('major_name'),
            SubjectGroup.code.label('group_code'),
            AdmissionScore.year,
            AdmissionScore.base_score,
            UniversityMajor.admission_code
        ).join(UniversityMajor, University.id == UniversityMajor.university_id)\
         .join(Major, Major.id == UniversityMajor.major_id)\
         .join(AdmissionScore, AdmissionScore.university_major_id == UniversityMajor.id)\
         .join(SubjectGroup, SubjectGroup.id == AdmissionScore.subject_group_id)

        # Điều kiện 1A: Ngành học phải nằm trong list AI gợi ý
        query = query.filter(Major.name.in_(ai_suggested_majors))
        
        # Điều kiện 1B: Lọc Khu vực
        if region and region != 'ALL':
            # Tạo bộ từ điển dịch từ Frontend sang Database
            region_mapping = {
                'NORTH': 'Bắc',
                'CENTRAL': 'Trung',
                'SOUTH': 'Nam'
            }
            
            # Dịch sang tiếng Việt (nếu không có trong từ điển thì lấy nguyên gốc)
            db_region = region_mapping.get(region, region)
            
            # Tìm kiếm trong DB
            query = query.filter(University.region.ilike(f"%{db_region}%"))
        # Điều kiện 2 & 3: Khớp Khối thi và Điểm số
        score_conditions = []
        for group in user_groups:
            group_id = group.get('group_id')
            user_score = group.get('score')
            
            # Khối phải đúng ID VÀ Điểm chuẩn DB phải <= Điểm User
            condition = and_(
                AdmissionScore.subject_group_id == group_id,
                AdmissionScore.base_score <= user_score
            )
            score_conditions.append(condition)
            
        if score_conditions:
            query = query.filter(or_(*score_conditions))

        # Ưu tiên lấy điểm năm mới nhất, xếp điểm từ cao xuống thấp
        query = query.order_by(AdmissionScore.year.desc(), AdmissionScore.base_score.desc())
        
        results = query.all()
        
        # Format dữ liệu trả về
        matched_universities = []
        for r in results:
            matched_universities.append({
                "university_name": r.uni_name,
                "university_code": r.uni_code,
                "major_name": r.major_name,
                "admission_code": r.admission_code,
                "subject_group": r.group_code,
                "required_score": float(r.base_score),
                "year": r.year
            })
        
        return jsonify({
            "status": "success",
            "count": len(matched_universities),
            "data": matched_universities
        })

    except Exception as e:
        print(f"Lỗi truy vấn Database: {e}")
        return jsonify({"status": "error", "message": "Lỗi hệ thống khi tìm kiếm trường Đại học."})

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