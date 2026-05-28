# AI University Adviser

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-AWS_RDS-336791?style=flat-square&logo=postgresql&logoColor=white)](https://aws.amazon.com/rds/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**Hệ thống tư vấn hướng nghiệp đại học thông minh** — phân tích tính cách học sinh qua văn bản tự do, gợi ý ngành học phù hợp bằng **RAG + pgvector**, và tìm trường đại học theo điểm thi THPT.

[Demo](#demo) · [Tính năng](#-tính-năng) · [Cài đặt](#-cài-đặt) · [API](#-api-reference) · [Kiến trúc](#-kiến-trúc)

</div>

---

## ính năng

| | Tính năng | Mô tả |
|---|---|---|
| | **AI Personality Analysis** | Phân tích văn bản tự do qua Gemini 2.5 Flash (kỹ thuật HyDE) |
| | **Vector Search (RAG)** | Tìm ngành phù hợp bằng embedding tiếng Việt + cosine similarity trên pgvector |
| | **Explainable AI** | Sinh lời khuyên chi tiết giải thích *tại sao* từng ngành phù hợp |
| | **University Matching** | Lọc trường theo ngành AI đề xuất, điểm thi và khu vực địa lý |
| | **Subject Group Detection** | Tự động xác định khối thi hợp lệ từ môn học người dùng chọn |
| | **Dark Mode UI** | Giao diện glassmorphism hiện đại, responsive |

---

## Kiến trúc

```
┌──────────────────────── FRONTEND ──────────────────────────┐
│  React 19 + Vite + Tailwind v4                             │
│  PersonalitySection │ SubjectSection │ ResultPanel         │
└───────────────────────────┬────────────────────────────────┘
                            │  REST API (JSON)
┌───────────────────────────▼────────────────────────────────┐
│                   BACKEND (Flask 3.1)                       │
│                                                             │
│  POST /api/analyze-personality                              │
│   ├─ [1] extract_intent()   → Gemini 2.5 Flash (HyDE)     │
│   ├─ [2] vectorize_text()   → bkai/viet-bi-encoder (768d) │
│   ├─ [3] pgvector search    → TOP 5 cosine similarity      │
│   └─ [4] generate_advice()  → Gemini 2.5 Flash (JSON)     │
│                                                             │
│  POST /api/get-valid-groups  → routes/groups.py            │
│  POST /api/find-universities → routes/universities.py      │
└───────────────────────────┬────────────────────────────────┘
                            │  SQLAlchemy + psycopg2
┌───────────────────────────▼────────────────────────────────┐
│               PostgreSQL (AWS RDS) + pgvector              │
│  universities · majors · university_majors                  │
│  admission_scores · subjects · subject_groups              │
│  major_embeddings (vector 768d)                            │
└────────────────────────────────────────────────────────────┘
```

---

## Cài đặt

### Yêu cầu

- Python **3.11+**
- Node.js **18+** & npm
- Kết nối Internet (tải model AI lần đầu ~500 MB)

### 1. Clone

```bash
git clone https://github.com/your-username/ai_university_adviser.git
cd ai_university_adviser
```

### 2. Cấu hình `.env`

```bash
cp .env.example .env   # hoặc tạo thủ công
```

```env
DB_USER=postgres
DB_PASS=your_db_password
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres

GEMINI_API_KEY=your_gemini_api_key
```

> Lấy Gemini API Key tại [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Khởi động Backend

```bash
# Tạo virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Cài dependencies
pip install -r requirements.txt

# Chạy server
python app.py
```

> **Lần đầu khởi động** sẽ tải model `bkai-foundation-models/vietnamese-bi-encoder` từ HuggingFace (~500 MB). Vui lòng chờ.

Backend chạy tại: **`http://127.0.0.1:5000`**

Kiểm tra: `curl http://127.0.0.1:5000/api/test`

### 4. Khởi động Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: **`http://localhost:5173`**

---

## 📡 API Reference

### `GET /api/test`
Health check — kiểm tra backend hoạt động.

```json
{ "status": "success", "message": "Backend RAG Pipeline đang hoạt động!" }
```

---

### `POST /api/analyze-personality`
Phân tích tính cách học sinh, đề xuất 5 ngành học phù hợp nhất.

**Request:**
```json
{ "text": "Mình thích công nghệ, hay mày mò lập trình, tư duy logic tốt..." }
```

**Response:**
```json
{
  "status": "success",
  "ui_tags": ["#Tư_duy_logic", "#Công_nghệ", "#Phân_tích"],
  "hyde_profile": "Hồ sơ học thuật AI đã tổng hợp...",
  "top_majors": [
    {
      "major_name": "Khoa học máy tính",
      "description": "...",
      "similarity_score": 0.9123,
      "group_name": "Nhóm ngành Máy tính",
      "related_majors": ["Kỹ thuật phần mềm", "Trí tuệ nhân tạo"]
    }
  ],
  "ai_majors_list": ["Khoa học máy tính", "..."],
  "advice": {
    "tags": ["#Tư_duy_logic"],
    "summary": "...",
    "detailed_analysis": "..."
  }
}
```

---

### `POST /api/get-valid-groups`
Xác định khối thi hợp lệ từ danh sách môn học.

**Request:**
```json
{ "subject_ids": [1, 2, 3, 4] }
```

**Response:**
```json
{
  "status": "success",
  "valid_groups": [
    { "id": 1, "code": "A00", "description": "Toán, Vật lí, Hóa học" }
  ]
}
```

---

### `POST /api/find-universities`
Tìm trường theo ngành AI đề xuất và điểm thi.

**Request:**
```json
{
  "ai_majors": ["Khoa học máy tính"],
  "region": "Bắc",
  "user_groups": [{ "group_id": 1, "score": 25.5 }]
}
```

**Response:**
```json
{
  "status": "success",
  "count": 12,
  "data": [
    {
      "university_name": "Đại học Bách Khoa Hà Nội",
      "university_code": "BKA",
      "major_name": "Khoa học máy tính",
      "admission_code": "BKA-7480101",
      "subject_group": "A00",
      "required_score": 27.5,
      "year": 2024
    }
  ]
}
```

---

## Cấu trúc Project

```
ai_university_adviser/
├── app.py                    # Flask entry point
├── extensions.py             # SQLAlchemy instance (db)
├── models.py                 # ORM models
├── ai_service.py             # RAG pipeline (Gemini + embedding)
├── requirements.txt          # Python dependencies
├── .env                      # Biến môi trường (git-ignored)
├── .gitignore
│
├── routes/
│   ├── __init__.py           # Blueprint registration
│   ├── analyze.py            # POST /api/analyze-personality
│   ├── groups.py             # POST /api/get-valid-groups
│   └── universities.py       # POST /api/find-universities
│
└── frontend/                 # React + Vite frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx           # Root component + state + API calls
        ├── main.jsx          # React entry point
        ├── index.css         # Design system (Tailwind v4 + custom)
        ├── components/
        │   ├── PersonalitySection.jsx  # Input form + suggestion chips
        │   ├── SubjectSection.jsx      # Subject picker + score inputs
        │   └── ResultPanel.jsx         # AI results + university list
        └── constants/
            └── index.js      # SUBJECT_LIST, SUGGESTION_CHIPS
```

---

## Database Schema

```sql
universities        -- Thông tin trường ĐH (mã, tên, vùng)
majors              -- Ngành học (mã bộ 7 số, tên, nhóm ngành)
university_majors   -- Liên kết trường ↔ ngành (mã tuyển sinh)
admission_scores    -- Điểm chuẩn theo năm, khối thi, điều kiện đặc biệt (JSONB)
subjects            -- Môn học (Toán, Văn, Lí, Hóa...)
subject_groups      -- Khối thi (A00, B00, C00, D01...)
major_embeddings    -- Vector 768 chiều (pgvector) cho từng ngành
```

---

## RAG Pipeline

```
Học sinh nhập văn bản tự do
         │
         ▼
[1] extract_intent()    — Gemini 2.5 Flash
    Chuyển đổi text thô → "Hồ sơ năng lực học thuật" (HyDE technique)
         │
         ▼
[2] vectorize_text()    — bkai/vietnamese-bi-encoder
    Mã hóa hồ sơ → vector 768 chiều
         │
         ▼
[3] pgvector search     — PostgreSQL <=> (cosine distance)
    Tìm TOP 5 ngành gần nhất trong major_embeddings
         │
         ▼
[4] generate_advice()   — Gemini 2.5 Flash (JSON output)
    Sinh tags, summary, phân tích chi tiết + mở rộng ngành
         │
         ▼
[5] find_universities() — SQLAlchemy
    Lọc trường theo ngành + khu vực + điểm thi (tùy chọn)
```

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| **Backend** | Flask 3.1, Flask-SQLAlchemy, Flask-CORS |
| **Database** | PostgreSQL (AWS RDS) + pgvector extension |
| **AI / LLM** | Google Gemini 2.5 Flash (`google-generativeai`) |
| **Embedding** | `bkai-foundation-models/vietnamese-bi-encoder` (768d) |
| **ORM / DB Adapter** | SQLAlchemy 2.0, psycopg2-binary |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Config** | python-dotenv |

---

## Tác giả

Được phát triển bởi nhóm sinh viên:

- **Tô Minh Hiến**
- **Nguyễn Thành Duy**
- **Bùi Tuệ Mẫn**

> Dữ liệu tuyển sinh tham khảo từ **Bộ Giáo dục và Đào tạo Việt Nam**.

---

## 📄 License

[MIT](LICENSE) © 2026 AI University Adviser Team
