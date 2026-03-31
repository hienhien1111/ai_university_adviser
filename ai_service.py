import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_personality_and_suggest(user_data, available_majors):
    model = genai.GenerativeModel('gemini-2.5-flash')

    # Lấy đúng 4 biến mới từ Frontend gửi lên
    hoat_dong = user_data.get('hoat_dong', '')
    tinh_cach = user_data.get('tinh_cach', '')
    nang_luc = user_data.get('nang_luc', '')
    moi_truong = user_data.get('moi_truong', '')

    prompt = f"""
    Bạn là "AI Career" - một chuyên gia tư vấn hướng nghiệp cực kỳ tinh tế, chuyên nghiệp và thân thiện.
    Bạn đang áp dụng thuyết tâm lý Holland (RIASEC) để định hướng cho một bạn học sinh 17-18 tuổi.
    
    Dưới đây là lời tâm sự của bạn ấy:
    - Hoạt động yêu thích: {hoat_dong}
    - Tính cách trong mắt người khác: {tinh_cach}
    - Năng lực và thế mạnh: {nang_luc}
    - Môi trường làm việc mơ ước: {moi_truong}

    Danh sách TẤT CẢ các ngành học hiện đang có trong hệ thống tuyển sinh:
    {available_majors}

    NHIỆM VỤ CỦA BẠN:
    1. Xác định 1-2 nhóm tính cách Holland nổi trội nhất.
    2. Chọn ra đúng 3 đến 5 "TÊN NGÀNH" từ danh sách trên phù hợp nhất với hồ sơ.
    
    LUẬT CỨNG (BẮT BUỘC TRÁNH ẢO GIÁC): 
    - Bạn CHỈ ĐƯỢC PHÉP copy chính xác từng chữ cái của các tên ngành từ danh sách tôi cung cấp ở trên. TUYỆT ĐỐI KHÔNG tự bịa ra tên ngành nào không có trong danh sách.
    
    YÊU CẦU VỀ VĂN PHONG VÀ CẤU TRÚC CHO PHẦN "analysis" (QUAN TRỌNG NHẤT):
    - Xưng hô là AI Career và gọi người dùng là "bạn".
    - Giọng điệu: Gần gũi, truyền cảm hứng, thấu hiểu tâm lý tuổi teen nhưng không được quá sến súa và tâng bốc.
    - Giải thích vì sao bạn ấy thuộc nhóm tính cách này, lí do phù hợp với các ngành học, sau đó kết nối mượt mà sang các ngành đề xuất.
    - Độ dài: Khoảng 3-4 câu súc tích.
    
    TRẢ VỀ ĐÚNG FORMAT JSON DƯỚI ĐÂY (Không giải thích thêm, không dùng markdown ```json):
    {{
        "holland_traits": ["Tên nhóm Holland 1", "Tên nhóm Holland 2"],
        "analysis": "Đoạn văn tư vấn tâm lý, thân thiện, truyền cảm hứng...",
        "suggested_majors": ["Tên ngành chính xác 1", "Tên ngành chính xác 2", "Tên ngành chính xác 3"]
    }}
    """

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        if result_text.startswith("```json"):
            result_text = result_text[7:-3]
        elif result_text.startswith("```"):
            result_text = result_text[3:-3]
            
        result_json = json.loads(result_text)
        
        valid_majors = [m for m in result_json.get("suggested_majors", []) if m in available_majors]
        result_json["suggested_majors"] = valid_majors
        
        return result_json
        
    except Exception as e:
        return {"error": f"Lỗi khi gọi AI: {str(e)}"}