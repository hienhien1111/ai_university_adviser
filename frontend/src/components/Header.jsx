import React, { useState, useEffect } from 'react';
import { Hexagon, Sun, Moon, Search, UserCircle, User, Clock } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isDarkMode, setIsDarkMode, onGoHome }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 20);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsDropdownOpen(false); 
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-transform duration-500 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`transition-all duration-300 ease-in-out ${
        !isAtTop 
          ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 shadow-sm py-2.5' 
          : 'bg-transparent py-5'
      }`}>
        
        {/* ĐÃ SỬA LẠI THÀNH w-full VÀ TĂNG PADDING (px-6, px-12, px-20) ĐỂ GIÃN SÁT 2 BÊN */}
        <div className="w-full px-6 sm:px-12 lg:px-20 mx-auto">
          <div className="flex items-center justify-between gap-4">
            
            {/* CỘT TRÁI: Logo */}
            <div 
              className="flex items-center justify-start cursor-pointer transform transition-transform hover:scale-105 shrink-0" 
              onClick={() => {
                 onGoHome();
                 setIsDropdownOpen(false); 
              }}
            >
              <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 p-2.5 rounded-xl mr-3 shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/50">
                <Hexagon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight whitespace-nowrap">
                EduGuide <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">AI</span>
              </h1>
            </div>

            {/* CỘT GIỮA: Không gian đệm đẩy 2 bên ra xa */}
            <div className="flex-1"></div>

            {/* CỘT PHẢI: Search, Dark Mode, Profile Dropdown */}
            <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0 relative">
              
              <div className="hidden md:block relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-cyan-400" />
                </div>
                <input 
                  type="search" 
                  placeholder="Tìm kiếm..." 
                  className="w-36 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm font-semibold rounded-full py-2.5 pl-11 pr-4 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-cyan-500/50 focus:border-indigo-400 transition-all duration-300 focus:w-56 shadow-sm outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2.5 sm:p-3 rounded-full bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 active:scale-95"
                title={isDarkMode ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 active:scale-95 flex items-center justify-center relative z-50 ${
                    isDropdownOpen || activeTab === 'profile' || activeTab === 'history'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-cyan-400 ring-2 ring-indigo-500/30'
                      : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="Tài khoản"
                >
                  <UserCircle className="w-5 h-5" />
                </button>

                {isDropdownOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                )}

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in-up origin-top-right">
                    
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/80 mb-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Tài khoản của tôi</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Hệ thống hướng nghiệp</p>
                    </div>
                    
                    <button 
                      onClick={() => { setActiveTab('profile'); setIsDropdownOpen(false); }} 
                      className={`flex items-center w-full px-4 py-2.5 text-sm font-bold transition-colors ${
                        activeTab === 'profile' 
                          ? 'text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-500/10' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-cyan-400'
                      }`}
                    >
                      <User className="w-4 h-4 mr-3" /> Hồ sơ cá nhân
                    </button>
                    
                    <button 
                      onClick={() => { setActiveTab('history'); setIsDropdownOpen(false); }} 
                      className={`flex items-center w-full px-4 py-2.5 text-sm font-bold transition-colors ${
                        activeTab === 'history' 
                          ? 'text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-500/10' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-cyan-400'
                      }`}
                    >
                      <Clock className="w-4 h-4 mr-3" /> Lịch sử phân tích
                    </button>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}