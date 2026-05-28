import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, AlertCircle, ArrowRight, BookMarked, BarChart3, Compass, School, Fingerprint, Bot, Loader2 } from 'lucide-react';

// === COMPONENT ROBOT ĐANG CHẠY VÀ SUY NGHĨ ===
const RobotLoadingState = () => {
  const messages = [
    "🤔 Đang phân tích hồ sơ... Hmm, thú vị đấy!",
    "💻 Đang đối chiếu với kho dữ liệu điểm chuẩn...",
    "🔍 Phân tích Holland & năng lực đang chạy...",
    "✨ Gần xong rồi! Đang chốt kết quả nha...",
    "🎉 Hoàn tất! Sẵn sàng hiển thị..."
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // Tự động chuyển đổi câu thoại dựa trên thời gian (Tổng chờ ~12-15s)
    const timer1 = setTimeout(() => setMsgIndex(1), 3000);
    const timer2 = setTimeout(() => setMsgIndex(2), 6000);
    const timer3 = setTimeout(() => setMsgIndex(3), 9000);
    const timer4 = setTimeout(() => setMsgIndex(4), 12000);

    return () => {
      clearTimeout(timer1); clearTimeout(timer2);
      clearTimeout(timer3); clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center py-24 bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 rounded-[2.5rem] transition-colors relative overflow-hidden shadow-sm min-h-[400px]">
      
      {/* Hiệu ứng ánh sáng nền hắt lên */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-400/20 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Không gian đường ray cho robot chạy */}
        <div className="relative w-full max-w-md h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full mt-28 mb-12">
          
          {/* Khối bọc cả Robot và Hộp thoại - Chạy qua chạy lại (Trái -> Phải -> Trái) */}
          <motion.div
            animate={{ 
              x: ['-50%', '50%', '-50%'], // Tọa độ di chuyển ngang
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 5, // Mất 5s để chạy hết 1 vòng
              ease: "linear"
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center w-72"
          >
            
            {/* Hộp thoại Speech Bubble (Nằm trong khối di chuyển nên sẽ bám theo Robot) */}
            <div className="relative mb-4 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 text-center min-h-[60px] flex items-center justify-center w-[260px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {messages[msgIndex]}
                </motion.p>
              </AnimatePresence>
              {/* Mũi tên hộp thoại trỏ xuống */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 rotate-45 border-b border-r border-slate-100 dark:border-slate-700"></div>
            </div>

            {/* Bản thân con Robot (Có hiệu ứng nhún nhảy liên tục tạo cảm giác đang chạy) */}
            <motion.div
              animate={{ y: [0, -12, 0] }} // Nhún lên xuống
              transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }}
              className="relative"
            >
              {/* Vệt gió (Speed lines) bay phía sau tạo cảm giác tốc độ */}
              <motion.div 
                animate={{ opacity: [0, 1, 0], x: [-5, -20, -5] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute top-1/2 -translate-y-1/2 right-full mr-2 flex flex-col gap-1.5 opacity-60"
              >
                <div className="w-6 h-1 bg-cyan-400 rounded-full"></div>
                <div className="w-3 h-1 bg-indigo-400 rounded-full ml-auto"></div>
              </motion.div>

              {/* Avatar Robot */}
              <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-4 rounded-2xl shadow-xl border-2 border-white/40 relative z-10">
                <Bot className="w-10 h-10 text-white" />
              </div>
            </motion.div>

          </motion.div>
        </div>
        
        {/* Dòng chữ chờ đợi bên dưới đường ray */}
        <span className="text-slate-500 dark:text-slate-400 font-black animate-pulse text-lg tracking-tight">
          Hệ thống đang mô phỏng dữ liệu và phân tích...
        </span>
      </div>
    </div>
  );
};

export default function TabAiResult({
  isLoadingAi, aiError, aiResult, onGoToUniversity, isDarkMode,
  SUBJECT_LIST = [], optionalSubjects = [], subjectScores = {},
  validGroups = [], calculateGroupScore = () => ({ total: 0, isComplete: false })
}) {

  const safeTraits = Array.isArray(aiResult?.holland_traits) ? aiResult.holland_traits : [];
  const safeMajors = Array.isArray(aiResult?.suggested_majors) ? aiResult.suggested_majors : [];

  const renderText = (data) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join(', ');
    if (typeof data === 'object') return data.name || data.title || data.ten || JSON.stringify(data);
    return String(data);
  };

  const renderAnalysis = () => {
    if (!aiResult?.analysis) return 'Hệ thống AI không trả về phân tích chi tiết...';
    if (typeof aiResult.analysis === 'string') return aiResult.analysis;
    if (Array.isArray(aiResult.analysis)) return aiResult.analysis.join('\n\n');
    return JSON.stringify(aiResult.analysis);
  };

  const completedGroups = validGroups ? validGroups
    .map(group => ({
      name: group.id,
      subjects: group.description, 
      ...calculateGroupScore(group.description) 
    }))
    .filter(g => g.isComplete) : [];

  if (!aiResult && !isLoadingAi) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center text-center py-24 bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up transition-colors duration-500">
        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-200/50 dark:border-slate-700/50 hover:scale-110 transition-transform duration-300 shadow-inner">
           <BarChart3 className="w-16 h-16 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md">Bảng phân tích AI hiện đang trống. <br/> Hãy quay lại tab <span className="font-bold text-indigo-500 animate-pulse">"Học tập"</span> để cung cấp dữ liệu đầu vào!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left animate-fade-in-up">

      <div className="bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 transition-colors duration-500">
        <div className="flex items-center justify-between mb-5 border-b border-slate-200/50 dark:border-slate-700/50 pb-5">
          <h3 className="text-sm uppercase tracking-widest font-black text-indigo-600 dark:text-indigo-400 flex items-center">
             <Fingerprint className="w-5 h-5 mr-2" />Tóm tắt Khối Xét tuyển
          </h3>
        </div>
        
        {completedGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGroups.map((group, index) => {
              const percentage = Math.min((group.total / 30) * 100, 100);
              return (
                <div 
                  key={index} 
                  className="group relative flex flex-col justify-between p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className="pr-4">
                      <div className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-extrabold tracking-widest mb-3 border border-indigo-100 dark:border-indigo-500/20">
                        KHỐI {group.name}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                        {group.subjects.replace(/,\s*/g, ' • ')}
                      </p>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <span className="font-black text-4xl text-slate-900 dark:text-white tracking-tight">
                        {group.total}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                        Tổng điểm
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 w-full pt-4 border-t border-slate-100 dark:border-slate-700/80">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Thang điểm 30</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{group.total}/30</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-5 bg-amber-50/80 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 shadow-inner font-semibold">
            <AlertCircle className="w-6 h-6 inline-block mb-2 text-amber-500 opacity-80" />
            <p>Bạn chưa nhập đủ điểm cho bất kỳ khối xét tuyển nào.</p>
            <p className="text-sm opacity-70 mt-1 font-normal">Vui lòng quay lại phần "Học tập" để cập nhật đầy đủ thông tin điểm số.</p>
          </div>
        )}
      </div>

      {aiError && <div className="bg-red-50/80 dark:bg-red-950/80 backdrop-blur-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-5 rounded-2xl font-bold flex items-center shadow-sm"><AlertCircle className="w-5 h-5 mr-3"/>Lỗi truy xuất AI: {aiError}</div>}
      
      {/* GỌI COMPONENT ROBOT NẾU ĐANG LOADING */}
      {isLoadingAi && <RobotLoadingState />}

      {aiResult && !isLoadingAi && (
        <div className="group bg-gradient-to-br from-cyan-50/80 via-blue-50/80 to-indigo-50/80 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-indigo-950/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-white dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all duration-700">
          
          <div className="flex items-center justify-between mb-8 border-b border-cyan-200/50 dark:border-slate-700 pb-6 relative z-10">
              <h3 className="text-sm uppercase tracking-widest font-black text-cyan-700 dark:text-cyan-400 mb-0 flex items-center">
                <div className="bg-cyan-100 dark:bg-cyan-950 p-2.5 rounded-xl mr-3 shadow-inner">
                  <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                Báo cáo Năng lực & Định hướng AI
              </h3>
          </div>
          
          <div className="mb-10 relative z-10 space-y-6">
            <div className="flex flex-wrap gap-2.5">
              {safeTraits.map((t, idx) => (
                <span key={idx} className="bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-600 text-cyan-900 dark:text-cyan-200 px-4 py-2 rounded-xl text-sm font-black shadow-sm tracking-tight flex items-center">
                  <Compass className="w-4 h-4 mr-1.5 opacity-50"/> {renderText(t)}
                </span>
              ))}
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/60 p-6 md:p-8 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-indigo-500"></div>
               <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base text-justify font-medium transition-colors duration-500 whitespace-pre-wrap">
                 {renderAnalysis()}
               </p>
            </div>
          </div>
          
          <div className="relative z-10 border-t border-cyan-200/50 dark:border-slate-700 pt-8">
            <h4 className="font-extrabold text-xl text-slate-800 dark:text-white mb-6 flex items-center tracking-tight transition-colors">
               <BookMarked className="w-6 h-6 mr-3 text-indigo-500 dark:text-indigo-400" /> Ngành học định hướng cho bạn:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {safeMajors.map((m, idx) => (
                <li key={idx} className="flex items-center text-slate-800 dark:text-slate-200 font-bold bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-white dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-default group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center mr-4 group-hover:bg-indigo-500 transition-colors">
                    <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                  {renderText(m)}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center pt-10 mt-8 relative z-10">
            <h3 className="font-black text-indigo-950 dark:text-white text-2xl mb-6 tracking-tight transition-colors">Sẵn sàng đối chiếu với điểm chuẩn thực tế?</h3>
            <button
              onClick={onGoToUniversity}
              className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all duration-300 ease-out bg-indigo-600 font-pj rounded-full shadow-[0_8px_25px_rgba(79,70,229,0.3)] dark:shadow-[0_8px_30px_rgba(79,70,229,0.6)] hover:bg-indigo-700 hover:-translate-y-1.5 transform active:scale-95 text-lg"
            >
               <School className="w-6 h-6 mr-3 text-cyan-200" />
               Khám Phá Trường Đại Học Ngay
               <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}