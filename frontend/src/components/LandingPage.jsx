import React from 'react';
import { ArrowRight, BrainCircuit, School, Fingerprint, Hexagon, Sun, Moon } from 'lucide-react';

export default function LandingPage({ onStart, isDarkMode, setIsDarkMode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* Top Bar tối giản cho Trang chủ */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 p-2.5 rounded-xl shadow-[0_4px_15px_rgba(79,70,229,0.4)]">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            EduGuide <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">AI</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="p-3 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 active:scale-95"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center px-5 py-2.5 bg-white/60 dark:bg-slate-900/60 border border-indigo-100/80 dark:border-indigo-500/30 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-black tracking-widest uppercase mb-10 shadow-sm backdrop-blur-md animate-fade-in-up">
          <span className="relative flex h-2 w-2 mr-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-800 dark:text-white tracking-tighter mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Khám phá bản thân <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent animate-text-gradient">Kiến tạo tương lai</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-semibold mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
          Sử dụng Trí tuệ nhân tạo để phân tích tính cách, kết hợp điểm số thực tế nhằm đưa ra lộ trình Đại học hoàn hảo nhất dành riêng cho bạn.
        </p>

        {/* Nút Call to Action */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-12 py-5 font-black text-white transition-all duration-300 ease-out bg-indigo-600 rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.3)] dark:shadow-[0_8px_40px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:-translate-y-1.5 transform active:scale-95 text-xl animate-fade-in-up" 
          style={{ animationDelay: '0.3s' }}
        >
          Bắt đầu hành trình
          <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
        </button>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-28 w-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/80 p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all hover:-translate-y-2 text-left group">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Fingerprint className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xl mb-3">Hồ sơ cá nhân hóa</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed">Dữ liệu học tập và thông tin cá nhân được xử lý an toàn, tạo ra kết quả độc bản cho bạn.</p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/80 p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all hover:-translate-y-2 text-left group">
            <div className="bg-purple-100 dark:bg-purple-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xl mb-3">Phân tích Đa chiều</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed">AI mô phỏng tính cách theo chuẩn trắc nghiệm Holland để tìm ra năng lực cốt lõi.</p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/80 p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all hover:-translate-y-2 text-left group">
            <div className="bg-cyan-100 dark:bg-cyan-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <School className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xl mb-3">Khám phá Đại học</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed">Tra cứu điểm chuẩn tự động và lọc ra các trường Đại học phù hợp nhất với điểm số.</p>
          </div>
        </div>

      </div>
    </div>
  );
}