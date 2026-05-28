import React from 'react';
import { BookOpen, BrainCircuit, CheckCircle2, Brain, Zap, Layers, Activity, AlertCircle } from 'lucide-react';

export default function TabInput({
  SUBJECT_LIST = [], optionalSubjects = [], toggleSubject,
  subjectScores = {}, handleScoreChange,
  hoatDong, setHoatDong, tinhCach, setTinhCach,
  nangLuc, setNangLuc, moiTruong, setMoiTruong,
  handleAnalyzeAI, isLoadingAi, isDarkMode,
  validGroups = null, calculateGroupScore, isLoadingGroups, groupError
}) {
  const renderScoreInputs = () => {
    const activeSubjects = SUBJECT_LIST.filter(s => s.id === 1 || s.id === 2 || optionalSubjects.includes(s.id));
    return activeSubjects.map(sub => (
      <div key={sub.id} className="col-span-1 flex flex-col justify-end h-full group">
        {/* LƯỢC BỎ MÀU CYAN/INDIGO RỰC RỠ, ĐỔI THÀNH XÁM/TRẮNG TINH TẾ */}
        <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 text-center truncate group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" title={sub.name}>
          {sub.name}
        </label>
        <input
          type="number" step="0.25" min="0" max="10"
          value={subjectScores[sub.id] || ''}
          onChange={(e) => handleScoreChange(sub.id, e.target.value)}
          placeholder="0.0"
          // CHỮ NHẬP VÀO SẼ LÀ MÀU TRẮNG BÓC TRÊN NỀN TỐI ĐỂ DỄ ĐỌC NHẤT
          className="w-full bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-cyan-400/50 focus:border-transparent focus:outline-none block p-3 transition-all text-center text-lg font-black shadow-sm mt-auto"
        />
      </div>
    ));
  }

  return (
    <div className="space-y-8 text-left animate-fade-in-up">
      {/* Block 1: Hồ Sơ Xét Tuyển */}
      <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-10 transition-colors duration-500">
        <div className="flex items-center mb-8 overflow-hidden border-b border-slate-200/50 dark:border-slate-700/50 pb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-3 rounded-2xl mr-5 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/50">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">1. Hồ Sơ Xét Tuyển</h2>
        </div>

        <div className="mb-8">
          <label className="block mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">Môn Bắt Buộc</label>
          <div className="flex flex-wrap gap-2.5">
            {SUBJECT_LIST.filter(s => s.isCompulsory).map(sub => (
              <span key={sub.id} className="bg-slate-100/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 px-4 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed flex items-center shadow-sm">
                <CheckCircle2 className="w-4 h-4 mr-2 opacity-40" />
                {sub.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">Môn Tự Chọn <span className="text-slate-400 font-normal">(Tối đa 2)</span></label>
          <div className="flex flex-wrap gap-3">
            {SUBJECT_LIST.filter(s => !s.isCompulsory).map(sub => {
              const isSelected = optionalSubjects.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                    isSelected 
                      // NÚT ĐƯỢC CHỌN: ĐỒNG BỘ MÀU INDIGO NHẸ NHÀNG, CHỮ TRẮNG
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-transparent shadow-[0_4px_15px_rgba(79,70,229,0.3)] transform scale-[1.02]' 
                      // NÚT CHƯA CHỌN: NỀN KÍNH MỜ XÁM, CHỮ XÁM/TRẮNG
                      : 'bg-white/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
                  }`}
                >
                  {sub.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/50 dark:border-slate-700/50 mt-6">
          <div className="col-span-full">
            <label className="block mb-4 text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-indigo-500 dark:text-cyan-400"/>Điểm thi/dự kiến từng môn
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
              {renderScoreInputs()}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-5">
            {/* TIÊU ĐỀ KHỐI THI VỀ MÀU NEUTRAL (XÁM/TRẮNG) THAY VÌ MÀU TÍM */}
            <h3 className="text-sm uppercase tracking-widest font-black text-slate-800 dark:text-slate-200 flex items-center">
               <Layers className="w-5 h-5 mr-2 text-indigo-500 dark:text-cyan-400" />Khối thi hợp lệ & Tổng điểm
            </h3>
            {isLoadingGroups && <span className="text-xs text-indigo-600 dark:text-cyan-400 animate-pulse font-bold bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-slate-700 flex items-center"><Activity className="w-4 h-4 mr-1.5"/> Đang đồng bộ...</span>}
          </div>
          
          <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-h-[80px] p-5 shadow-inner">
            {groupError && <div className="flex items-center text-red-500 font-medium text-sm"><AlertCircle className="w-5 h-5 mr-2"/> {groupError}</div>}
            {!groupError && (!validGroups || validGroups.length === 0) && <span className="text-slate-500 dark:text-slate-500 text-sm italic">Vui lòng chọn môn tự chọn để hệ thống gợi ý khối thi.</span>}
            
            {validGroups && validGroups.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {validGroups.map(g => {
                  const { total, isComplete } = calculateGroupScore ? calculateGroupScore(g.description) : { total: 0, isComplete: false };
                  return (
                    // THẺ KẾT QUẢ ĐƯỢC LÀM ĐƠN SẮC, TRÔNG GỌN VÀ CHUYÊN NGHIỆP HƠN
                    <div key={g.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-cyan-500/50 transition-all px-5 py-4 rounded-2xl flex flex-col min-w-[150px] relative overflow-hidden group">
                      <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                        <span className="font-black text-slate-800 dark:text-white text-xl">{g.code}</span>
                        <span className={`font-black text-xl ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{total > 0 ? `${total}Đ` : '--'}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-tight leading-tight flex items-center mt-1">
                        <Zap className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-400 dark:group-hover:text-cyan-400 transition-colors"/> {g.description}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Block 2: Tâm lý học */}
      <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-10 transition-colors duration-500">
        <div className="flex items-center mb-8 overflow-hidden border-b border-slate-200/50 dark:border-slate-700/50 pb-6">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-3 rounded-2xl mr-5 shadow-lg shadow-cyan-200/50 dark:shadow-cyan-900/50">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">2. Hồ Sơ Tính Cách <span className="text-xl font-medium text-slate-400 ml-2 hidden sm:inline-block"></span></h2>
        </div>

        <div className="space-y-6">
          {[
            { label: 'Hoạt động yêu thích', value: hoatDong, setter: setHoatDong, placeholder: 'Bạn thích làm gì nhất khi rảnh rỗi?' },
            { label: 'Tính cách nổi bật', value: tinhCach, setter: setTinhCach, placeholder: 'Người khác thường nhận xét bạn thế nào?' },
            { label: 'Năng lực & Thế mạnh', value: nangLuc, setter: setNangLuc, placeholder: 'Bạn tự tin nhất về kỹ năng hay môn học nào?' },
            { label: 'Môi trường làm việc', value: moiTruong, setter: setMoiTruong, placeholder: 'Bạn mơ ước một môi trường làm việc ra sao?' },
          ].map((item, idx) => (
            <div key={idx}>
              <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</label>
              <textarea 
                value={item.value} 
                onChange={(e) => item.setter(e.target.value)} 
                rows="2" 
                // TEXTAREA SỬ DỤNG MÀU CHỮ TRẮNG, NỀN TỐI SÂU HƠN ĐỂ ĐẨY CHỮ LÊN RÕ RÀNG
                className="w-full bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:border-transparent focus:outline-none block p-4 text-base transition-all shadow-sm" 
                placeholder={item.placeholder}
              ></textarea>
            </div>
          ))}
        </div>

        <button
          onClick={handleAnalyzeAI}
          disabled={isLoadingAi}
          className="group mt-10 w-full relative inline-flex items-center justify-center p-4 overflow-hidden font-bold text-white transition-all duration-300 ease-out bg-indigo-600 rounded-2xl shadow-xl hover:shadow-[0_8px_25px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:hover:-translate-y-0 hover:-translate-y-1 transform active:scale-95"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 animate-text-gradient group-hover:scale-105 transition-transform duration-700 opacity-100 disabled:opacity-50"></span>
          <span className="relative flex items-center text-xl tracking-tight font-black">
            {isLoadingAi ? (
               <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white mr-3"></div>
            ) : (
               <Brain className="w-7 h-7 mr-3 animate-pulse text-cyan-200"/>
            )}
            {isLoadingAi ? 'AI đang giải mã hồ sơ...' : 'Giải Mã Tính Cách & Gợi Ý Ngành Học'}
          </span>
        </button>
      </div>
    </div>
  );
}