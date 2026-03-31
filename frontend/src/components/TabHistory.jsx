import React from 'react';
import { Clock, Trash2, ArrowRight, BrainCircuit, XOctagon } from 'lucide-react';

export default function TabHistory({ history, setHistory, onLoadHistory, isDarkMode }) {
  const clearHistory = () => {
    // alert() mặc định khá xấu, nhưng do UI đã sang nên alert() tạm chấp nhận được.
    // Nếu Duy muốn alert() sang thì nhắn mình, mình sẽ viết component Alert xịn.
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử phân tích? Thao tác này khôi phục được.')) {
      setHistory([]);
      localStorage.removeItem('eduGuideHistory');
    }
  };

  const deleteItem = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('eduGuideHistory', JSON.stringify(newHistory));
  };

  if (!history || history.length === 0) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center text-center py-24 bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up transition-colors duration-500">
        <div className="bg-indigo-50 dark:bg-indigo-950/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-100 dark:border-indigo-800 hover:scale-110 transition-transform duration-300">
          <Clock className="w-12 h-12 text-indigo-300 dark:text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 transition-colors tracking-tight">Lịch sử trống</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-sm">Bạn chưa có bài phân tích nào được lưu trữ. Hãy sang tab "Hồ sơ" để bắt đầu nhe!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left animate-fade-in-up pr-2 max-h-[850px] overflow-y-auto custom-scrollbar transition-colors duration-500">
      <div className="flex justify-between items-center mb-8 px-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-6 transition-colors duration-500">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center tracking-tight transition-colors duration-500 overflow-hidden">
          <div className="bg-indigo-100 dark:bg-indigo-950 p-2 rounded-xl mr-3 shadow-inner">
             <Clock className="w-6 h-6 mr-0 text-indigo-600 dark:text-indigo-400" />
          </div> 
          Lịch sử phân tích của bạn
        </h2>
        <button 
          onClick={clearHistory}
          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-extrabold text-sm bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900 px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_10px_rgba(239,68,68,0.1)] hover:-translate-y-1 active:scale-95 group"
        >
          <XOctagon className="w-4 h-4 mr-1.5 inline group-hover:animate-pulse"/> Xóa tất cả lịch sử
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pr-1">
        {history.map((item) => (
          <div key={item.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/80 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-3xl p-7 transition-all duration-300 group hover:-translate-y-1.5 group">
            <div className="flex justify-between items-start mb-5 border-b border-slate-100 dark:border-slate-700 pb-5">
              <div className="bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 text-indigo-900 dark:text-indigo-100 text-xs font-black px-4 py-2 rounded-lg border dark:border-indigo-800 transition-colors">
                Lần phân tích: {item.date}
              </div>
              <button 
                  onClick={() => deleteItem(item.id)} 
                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all active:scale-95"
                  title="Xóa lần này"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-3 flex items-center tracking-tight transition-colors duration-500">
              <BrainCircuit className="w-5 h-5 mr-2.5 text-cyan-600 dark:text-cyan-400"/> 
              Các ngành gợi ý từ AI:
            </h3>
            <div className="flex flex-wrap gap-2.5 mb-8">
              {item.aiResult?.suggested_majors?.slice(0, 3).map((major, idx) => (
                <span key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm truncate max-w-full">
                  {major}
                </span>
              ))}
              {item.aiResult?.suggested_majors?.length > 3 && <span className="text-xs font-bold text-slate-400 dark:text-slate-500 animate-pulse">...và {item.aiResult?.suggested_majors?.length - 3} ngành nữa</span>}
            </div>

            <button 
              onClick={() => onLoadHistory(item)}
              className="group w-full flex items-center justify-center px-6 py-4.5 text-white/90 dark:text-white font-extrabold rounded-2xl transition-all duration-300 bg-indigo-50 dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white shadow-sm hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:-translate-y-1.5 transform active:scale-95 text-lg relative"
            >
              Xem lại kết quả này <ArrowRight className="w-5 h-5 ml-2.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}