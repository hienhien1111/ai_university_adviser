import React from 'react';
import { User, MapPin, Mail, Phone, Calendar, ArrowRight, UserCircle } from 'lucide-react';

export default function TabProfile({ profile, setProfile, isDarkMode, onNext }) {
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8 text-left animate-fade-in-up">
      {/* Khung Glassmorphism hiện đại đồng bộ với các tab khác */}
      <div className="bg-white/40 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-10 transition-colors duration-500">
        
        <div className="flex items-center mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-3 rounded-2xl mr-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
            <UserCircle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight transition-colors">Hồ Sơ Cá Nhân</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ và tên */}
          <div>
            <label className="block mb-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">Họ và tên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input type="text" name="name" value={profile.name} onChange={handleChange} placeholder="Nhập họ và tên của bạn" 
                className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/30 focus:border-cyan-400 dark:focus:border-cyan-500 focus:outline-none block pl-12 p-4 text-base transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="example@gmail.com" 
                className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/30 focus:border-cyan-400 dark:focus:border-cyan-500 focus:outline-none block pl-12 p-4 text-base transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block mb-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="09xx xxx xxx" 
                className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/30 focus:border-cyan-400 dark:focus:border-cyan-500 focus:outline-none block pl-12 p-4 text-base transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block mb-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">Ngày sinh</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input type="date" name="dob" value={profile.dob} onChange={handleChange} 
                className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/30 focus:border-cyan-400 dark:focus:border-cyan-500 focus:outline-none block pl-12 p-4 text-base transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
            </div>
          </div>

          {/* KHU VỰC SINH SỐNG (ĐÃ FIX LỖI TÀNG HÌNH CHỮ) */}
          <div className="md:col-span-2">
            <label className="block mb-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">Khu vực sinh sống</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              
              <select 
                name="location" 
                value={profile.location} 
                onChange={handleChange} 
                className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/30 focus:border-cyan-400 dark:focus:border-cyan-500 focus:outline-none block pl-12 p-4 text-base transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] appearance-none cursor-pointer"
              >
                {/* Ép cứng màu nền và màu chữ cho các thẻ option để không bị lỗi trên các trình duyệt khác nhau */}
                <option value="" disabled className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium">Chọn khu vực...</option>
                <option value="Miền Bắc" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium">Miền Bắc</option>
                <option value="Miền Trung" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium">Miền Trung</option>
                <option value="Miền Nam" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium">Miền Nam</option>
              </select>
              
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Nút Tiếp tục (Đồng bộ hiệu ứng xịn sò) */}
        <button
          onClick={onNext}
          className="group mt-10 w-full relative inline-flex items-center justify-center p-4 overflow-hidden font-bold text-white transition-all duration-300 ease-out bg-indigo-600 rounded-2xl shadow-xl hover:shadow-[0_8px_25px_rgba(79,70,229,0.5)] active:scale-95"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 animate-text-gradient group-hover:scale-105 transition-transform duration-700 opacity-100"></span>
          <span className="relative flex items-center text-xl tracking-tight font-black">
            Lưu & Tiếp tục: Nhập điểm Học tập
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1.5 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
}