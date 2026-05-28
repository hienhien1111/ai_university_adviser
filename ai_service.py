import os
import json
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load biến môi trường
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Khởi tạo Gemini
genai.configure(api_key=GEMINI_API_KEY)
llm_model = genai.GenerativeModel('gemini-2.5-flash')

# Khởi tạo Local Embedding Model (Chỉ chạy 1 lần khi import file này)
print("Đang nạp AI Model (vietnamese-bi-encoder)... Vui lòng đợi...")
embedding_model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder")

def extract_intent(user_text):
    """BƯỚC 1: Tiền xử lý Input (Hợp thể sức mạnh HyDE & Semantic Binding)"""
    prompt = f"""
    Bạn là một kỹ sư xử lý dữ liệu AI. Nhiệm vụ của bạn là dịch đoạn chia sẻ của học sinh thành một "Hồ sơ năng lực học thuật" (2-3 câu) để tìm kiếm các ngành đại học bằng thuật toán Vector.
    
    Đoạn chia sẻ của học sinh: "{user_text}"
    
    NGUYÊN TẮC TỐI THƯỢNG (BẮT BUỘC TUÂN THỦ 100%):
    1. CẤM TÍN HIỆU ÂM: Bỏ qua hoàn toàn những môn học/công việc mà học sinh ghét, sợ.
    
    2. CHUYỂN ĐỔI NGỮ NGHĨA ẨN (Semantic Mapping):
       - Nếu thấy "đi đây đi đó", "khám phá nền văn hóa", "hướng ngoại", "chăm sóc người khác vui vẻ" -> Bắt buộc hiểu đây là khối ngành Dịch vụ / Du lịch. 
       - TUYỆT ĐỐI KHÔNG dịch thành nghiên cứu văn hóa hàn lâm, y tế, hay giáo dục đặc biệt.
       
    3. ÉP KỸ NĂNG MỀM VÀO NGỮ CẢNH CHUYÊN MÔN (Rất quan trọng):
       - Không liệt kê kỹ năng mềm trơ trọi. Phải gắn chặt nó vào chuyên môn của ngành mục tiêu.
       - VD 1 (Dịch vụ): Thay vì viết "Thích chăm sóc người khác và kết nối con người", HÃY VIẾT "Có năng lực cung cấp dịch vụ xuất sắc, chăm sóc khách hàng, quản trị trải nghiệm du khách và lữ hành".
       - VD 2 (Nghệ thuật): Thay vì "Thích cái đẹp", HÃY VIẾT "Tư duy thẩm mỹ cao trong thiết kế đồ họa, truyền thông".
       
    4. KHUẾCH ĐẠI TÊN NGÀNH: Trực tiếp gọi tên các khối ngành đại học liên quan (VD: Quản trị khách sạn, Quản trị dịch vụ du lịch và lữ hành, Ngôn ngữ học...) trong đoạn văn.

    Chỉ trả về đoạn văn Hồ sơ đã được tối ưu, KHÔNG giải thích gì thêm.
    """
    response = llm_model.generate_content(prompt)
    return response.text.strip()

def vectorize_text(text):
    """BƯỚC 2: Biến chuỗi Keyword thành Vector 768 chiều"""
    vector_array = embedding_model.encode(text).tolist()
    # Format thành chuỗi chuẩn của pgvector: "[0.1, 0.2, ...]"
    return f"[{','.join(map(str, vector_array))}]"

def generate_explainable_advice(user_text, top_majors):
    """BƯỚC 4: Giải thích lý do chọn ngành & Gợi ý mở rộng - ÉP KIỂU JSON"""
    context_lines = []
    for m in top_majors:
        # Xử lý mảng các ngành liên quan
        related_str = ", ".join(m['related_majors']) if m['related_majors'] else "Không có dữ liệu mở rộng"
        
        context_lines.append(f"- NGÀNH ĐỀ XUẤT CHÍNH: {m['major_name']}")
        context_lines.append(f"  + Mô tả ngành: {m['description']}")
        context_lines.append(f"  + Thuộc nhóm ngành lớn: {m['group_name']}")
        context_lines.append(f"  + Các ngành liên quan cùng nhóm: {related_str}\n")
        
    majors_context = "\n".join(context_lines)
    
    prompt = f"""
    Bạn là chuyên gia tư vấn hướng nghiệp tận tâm. Học sinh có chia sẻ ban đầu: "{user_text}".
    Hệ thống AI đã quét dữ liệu và tìm ra 5 NGÀNH HỌC (Mã 7 số) phù hợp nhất, kèm theo thông tin Nhóm ngành của chúng:
    
    {majors_context}
    
    Nhiệm vụ: 
    Bạn BẮT BUỘC phải trả kết quả về dưới dạng đối tượng JSON với đúng 3 trường sau:
    1. "tags": Một mảng (array) chứa 3 đến 5 từ khóa cực ngắn (tối đa 2-3 chữ/từ khóa) tóm tắt chính xác nhất tố chất nổi bật của học sinh này (Ví dụ: ["#Nhạy_bén", "#Số_liệu", "#Thích_lãnh_đạo"]).
    
    2. "summary": Một đoạn văn ngắn gọn (tối đa 3-4 câu). Chỉ tóm tắt tính cách học sinh và gọi tên 5 NGÀNH ĐỀ XUẤT CHÍNH. Tuyệt đối không nhắc đến các ngành liên quan ở đây.
    
    3. "detailed_analysis": Đoạn tư vấn chi tiết, chia bố cục rõ ràng cho từng ngành trong 5 NGÀNH CHÍNH. 
       - Trọng tâm: Phân tích TẠI SAO ngành đó lại phù hợp với tính cách/kỹ năng học sinh đã chia sẻ.
       - Mở rộng: Ở cuối phần phân tích của MỖI ngành, hãy thêm một dòng "Mở rộng góc nhìn:" để giới thiệu nhanh về nhóm ngành lớn của nó, đồng thời gợi ý nhẹ nhàng các "ngành liên quan cùng nhóm" để học sinh có thêm lựa chọn tham khảo dự phòng (giải thích ngắn gọn sự khác biệt nếu cần).
       - Có thể dùng ký tự xuống dòng (\\n) và in đậm để làm đẹp định dạng.

    Trả lời bằng giọng văn gần gũi, chuyên nghiệp, xưng "chuyên gia" hoặc "anh/chị" và gọi học sinh là "bạn".
    """
    
    response = None
    try:
        response = llm_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        # Tiền xử lý: Gọt bỏ Markdown (```json ... ```) nếu Gemini tự ý thêm vào
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        advice_data = json.loads(raw_text)
        
        # Đảm bảo mảng tags luôn tồn tại
        if "tags" not in advice_data or not isinstance(advice_data["tags"], list):
            advice_data["tags"] = ["#Phân_tích_AI"]
            
        return advice_data
        
    except Exception as e:
        print(f"Lỗi generate_explainable_advice: {e}")
        return {
            "tags": ["#Lỗi_định_dạng", "#Đang_xử_lý"],
            "summary": "Hệ thống đã phân tích thành công. Vui lòng xem chi tiết 5 ngành được đề xuất bên dưới.",
            "detailed_analysis": response.text if response else "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI."
        }