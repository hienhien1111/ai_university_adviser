import React from 'react';
import { MapPin, Search, School, AlertCircle, BookOpen, ChevronRight, Award, GraduationCap, Lock } from 'lucide-react';

export default function TabUniversities({
  aiResult, region, handleFindUniversities, isLoadingUni,
  uniError, universitiesResult, groupedUniversities, isDarkMode
}) {

  // MÀN HÌNH KHÓA: Nếu chưa có kết quả AI, chặn người dùng chọn trường
  if (!aiResult) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center text-center py-24 bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up transition-colors duration-500">
        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
           <Lock className="w-16 h-16 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">Tính năng đang bị khóa</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-lg leading-relaxed">
          Hệ thống cần dữ liệu định hướng ngành học từ AI trước khi có thể gợi ý trường Đại học cho bạn. <br/><br/>
          Vui lòng bấm <span className="font-bold text-indigo-500 dark:text-cyan-400">&lt; Nút quay lại</span> để hoàn thành nhập điểm ở tab Học tập và Giải mã AI nhé!
        </p>
      </div>
    );
  }

  const regions = [
    { id: 'ALL', label: 'Toàn Quốc' },
    { id: 'NORTH', label: 'Miền Bắc' },
    { id: 'CENTRAL', label: 'Miền Trung' },
    { id: 'SOUTH', label: 'Miền Nam' }
  ];

  return (
    <div className="space-y-8 text-left animate-fade-in-up">
      
      {/* KHUNG CHỌN KHU VỰC VỚI GIAO DIỆN KÍNH MỜ */}
      <div className="bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[3rem] p-6 md:p-12 transition-colors duration-500 flex flex-col items-center">
        
        <div className="flex items-center mb-8 flex-col text-center">
          <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-3.5 rounded-2xl mb-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Bạn muốn học Đại học ở khu vực nào?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">Hệ thống sẽ lọc các trường có điểm chuẩn phù hợp với bạn</p>
        </div>

        {/* NÚT CHỌN KHU VỰC */}
        <div className="flex flex-col w-full max-w-md gap-4 mt-4">
          {regions.map(r => {
            const isSelected = region === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleFindUniversities(r.id)}
                className={`relative flex items-center justify-between px-6 py-4 rounded-2xl font-black text-xl transition-all duration-300 border overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-transparent shadow-[0_8px_20px_rgba(79,70,229,0.3)] scale-[1.02]'
                    : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border-white/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-cyan-500 hover:shadow-md'
                }`}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                
                <span className="relative z-10">{r.label}</span>
                <ChevronRight className={`w-6 h-6 relative z-10 transition-transform ${isSelected ? 'text-white translate-x-1' : 'text-indigo-500 dark:text-cyan-400 group-hover:translate-x-1'}`} />
              </button>
            );
          })}
        </div>
        
        {/* HIỆU ỨNG LOADING */}
        {isLoadingUni && (
          <div className="mt-10 flex items-center justify-center text-indigo-600 dark:text-cyan-400 font-black text-lg animate-pulse bg-indigo-50 dark:bg-slate-800 px-6 py-3 rounded-full border border-indigo-100 dark:border-slate-700">
            <Search className="w-5 h-5 mr-3 animate-spin" /> Đang truy xuất cơ sở dữ liệu điểm chuẩn...
          </div>
        )}
        
        {/* LỖI NẾU CÓ */}
        {uniError && (
          <div className="mt-8 w-full max-w-md bg-red-50/80 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-4 rounded-2xl font-bold flex items-center justify-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-2"/> {uniError}
          </div>
        )}
      </div>

      {/* KHUNG KẾT QUẢ ĐẠI HỌC */}
      {universitiesResult && !isLoadingUni && (
         <div className="bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[3rem] p-6 md:p-10 transition-colors duration-500 animate-fade-in-up">
            <div className="flex items-center mb-8 border-b border-slate-200/50 dark:border-slate-700/50 pb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-2xl mr-5 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/50">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Trường Đại học Phù hợp</h2>
            </div>
            
            {Object.keys(groupedUniversities).length === 0 ? (
              <div className="text-center py-16">
                 <School className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                 <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Không tìm thấy trường nào phù hợp với điểm số của bạn ở khu vực này.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(groupedUniversities).map((majorName, idx) => (
                  <div key={idx} className="bg-white/60 dark:bg-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm border border-white/60 dark:border-slate-700">
                    <h3 className="text-2xl font-black text-indigo-700 dark:text-cyan-400 mb-6 flex items-center">
                      <BookOpen className="w-6 h-6 mr-3 text-indigo-500"/> {majorName}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {Object.keys(groupedUniversities[majorName]).map((uniKey, uIdx) => {
                        const uni = groupedUniversities[majorName][uniKey];
                        return (
                          <div key={uIdx} className="bg-white/80 dark:bg-slate-900/80 border border-white dark:border-slate-700/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-bl-full"></div>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">{uni.uni_name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-5 flex items-center">
                               Mã trường: {uni.uni_code} <span className="mx-2 text-slate-300 dark:text-slate-600">|</span> Mã ngành: {uni.admission_code}
                            </p>
                            <div className="space-y-3">
                              {uni.details.map((detail, dIdx) => (
                                <div key={dIdx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center"><Award className="w-4 h-4 mr-2 text-amber-500"/> Khối {detail.group}</span>
                                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{detail.score} Đ <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold ml-1">({detail.year})</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>
      )}
    </div>
  );
}