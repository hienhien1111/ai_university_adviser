import React, { useState, useEffect, useMemo } from 'react';
import { User, Sparkles, School, Clock, Hexagon, Fingerprint, X, CheckCircle2, AlertCircle, Moon, Sun, UserCircle, ChevronLeft, ChevronRight, BookOpen, GraduationCap, Microscope, Calculator, Atom, Globe, Pencil, Lightbulb, Compass, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // IMPORT THƯ VIỆN MÃ QR

import './App.css';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import TabProfile from './components/TabProfile';
import TabInput from './components/TabInput';
import TabAiResult from './components/TabAiResult';
import TabUniversities from './components/TabUniversities';
import TabHistory from './components/TabHistory';

const SUBJECT_LIST = [
  { id: 1, name: 'Toán', isCompulsory: true }, { id: 2, name: 'Ngữ Văn', isCompulsory: true },
  { id: 3, name: 'Vật lí', isCompulsory: false }, { id: 4, name: 'Hóa học', isCompulsory: false },
  { id: 5, name: 'Sinh học', isCompulsory: false }, { id: 6, name: 'Lịch sử', isCompulsory: false },
  { id: 7, name: 'Địa lí', isCompulsory: false }, { id: 8, name: 'GDCD', isCompulsory: false },
  { id: 11, name: 'Tiếng Anh', isCompulsory: false }
];

const AuroraBackground = React.memo(() => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-aurora-1"></div>
    <div className="absolute top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-aurora-2"></div>
    <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] bg-purple-500/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[130px] animate-aurora-3"></div>
  </div>
));

const FLOATING_ICONS = [BookOpen, GraduationCap, Microscope, Calculator, Atom, Globe, Pencil, Lightbulb, Compass, School];

const FloatingBackground = React.memo(({ isDarkMode }) => {
  const containerRef = React.useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const icons = containerRef.current.querySelectorAll('.interactive-icon');
      icons.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        const iconX = rect.left + rect.width / 2;
        const iconY = rect.top + rect.height / 2;
        const distX = e.clientX - iconX;
        const distY = e.clientY - iconY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        const maxDist = 200; 
        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          const repelX = (distX / distance) * -70 * force; 
          const repelY = (distY / distance) * -70 * force;
          
          icon.style.transform = `translate(${repelX}px, ${repelY}px) scale(${1 + force * 0.4}) rotate(${force * 25}deg)`;
          icon.style.opacity = '1';
          icon.style.color = isDarkMode ? '#22d3ee' : '#6366f1'; 
          icon.style.filter = `drop-shadow(0 0 15px ${isDarkMode ? 'rgba(34,211,238,0.6)' : 'rgba(99,102,241,0.6)'})`;
        } else {
          icon.style.transform = `translate(0px, 0px) scale(1) rotate(0deg)`;
          icon.style.opacity = '0.25';
          icon.style.color = '';
          icon.style.filter = 'none';
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDarkMode]);

  const iconsData = useMemo(() => {
    return FLOATING_ICONS.map((Icon, i) => {
      const isLeft = i % 2 === 0;
      const left = isLeft ? `${Math.random() * 25 + 2}%` : `${Math.random() * 25 + 70}%`;
      const top = `${Math.random() * 80 + 10}%`;
      return {
        id: i, Icon, top, left,
        animationDuration: `${Math.random() * 15 + 15}s`,
        animationDelay: `${Math.random() * 5}s`,
      };
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(15deg); }
        }
        .animate-float-icon { animation: float-icon ease-in-out infinite; }
      `}</style>
      {iconsData.map(({ id, Icon, top, left, animationDuration, animationDelay }) => (
        <div key={id} className="absolute" style={{ top, left }}>
          <div className="animate-float-icon" style={{ animationDuration, animationDelay }}>
            <div 
              className="interactive-icon transition-all duration-300 ease-out text-indigo-500/30 dark:text-cyan-400/20"
              style={{ opacity: 0.25 }}
            >
              <Icon className="w-16 h-16 md:w-28 md:h-28" strokeWidth={1} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', dob: '', location: ''
  });

  const [optionalSubjects, setOptionalSubjects] = useState([]);
  const [subjectScores, setSubjectScores] = useState({ 1: '', 2: '' });
  const [region, setRegion] = useState('');

  const [hoatDong, setHoatDong] = useState('');
  const [tinhCach, setTinhCach] = useState('');
  const [nangLuc, setNangLuc] = useState('');
  const [moiTruong, setMoiTruong] = useState('');

  const [validGroups, setValidGroups] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [universitiesResult, setUniversitiesResult] = useState(null);

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('eduGuideHistory');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  });

  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingUni, setIsLoadingUni] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [aiError, setAiError] = useState('');
  const [uniError, setUniError] = useState('');

  const API_BASE = "https://api.xettuyen.site/api";

  const TABS = [
    { id: 'profile', label: 'Cá nhân', icon: UserCircle },
    { id: 'input', label: 'Học tập', icon: Fingerprint }, 
    { id: 'ai', label: 'Phân tích AI', icon: Sparkles },
    { id: 'university', label: 'Khám phá', icon: School },
    { id: 'history', label: 'Lịch sử', icon: Clock },
  ];

  useEffect(() => {
    const currentSubjectIds = [1, 2, ...optionalSubjects];
    const newScores = { ...subjectScores };
    currentSubjectIds.forEach(id => {
      if (newScores[id] === undefined) newScores[id] = '';
    });
    Object.keys(newScores).forEach(id => {
      if (!currentSubjectIds.includes(parseInt(id))) delete newScores[id];
    });
    setSubjectScores(newScores);

    if (optionalSubjects.length >= 1) {
      fetchValidGroups(currentSubjectIds);
    } else {
      setValidGroups(null);
      setGroupError('');
    }
  }, [optionalSubjects]);

  const fetchValidGroups = async (ids) => {
    setIsLoadingGroups(true); setGroupError('');
    try {
      const response = await fetch(`${API_BASE}/get-valid-groups`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject_ids: ids })
      });
      const data = await response.json();
      if (data.status === 'success') setValidGroups(data.valid_groups);
      else setGroupError(data.message);
    } catch (error) { setGroupError("Lỗi kết nối đến Server Backend!"); } 
    finally { setIsLoadingGroups(false); }
  }

  const toggleSubject = (id) => {
    if (optionalSubjects.includes(id)) setOptionalSubjects(optionalSubjects.filter(subId => subId !== id));
    else {
      if (optionalSubjects.length < 2) setOptionalSubjects([...optionalSubjects, id]);
      else showToast("Bạn chỉ được chọn tối đa 2 môn tự chọn!", "warning");
    }
  }

  const handleScoreChange = (id, value) => {
    if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) setSubjectScores({ ...subjectScores, [id]: value });
  }

  const calculateGroupScore = (description) => {
    if (!description) return { total: 0, isComplete: false };
    let total = 0; let requiredSubjects = 0; let enteredSubjects = 0;
    const descLower = description.toLowerCase();
    SUBJECT_LIST.forEach(sub => {
      if (descLower.includes(sub.name.toLowerCase())) {
        requiredSubjects++; const score = subjectScores[sub.id];
        if (score && score !== '') { total += parseFloat(score); enteredSubjects++; }
      }
    });
    return { total: parseFloat(total.toFixed(2)), isComplete: requiredSubjects > 0 && requiredSubjects === enteredSubjects };
  }

  const handleAnalyzeAI = async () => {
    // 1. Xóa dữ liệu cũ và bật trạng thái Loading
    setAiError(''); 
    setAiResult(null); 
    setUniversitiesResult(null); 
    setIsLoadingAi(true);
    
    // 2. CHUYỂN TAB NGAY LẬP TỨC: Đưa người dùng sang Tab AI để xem Robot suy nghĩ
    setActiveTab('ai'); 

    // 3. Chuẩn bị dữ liệu và gọi API
    const payload = { hoat_dong: hoatDong, tinh_cach: tinhCach, nang_luc: nangLuc, moi_truong: moiTruong };
    try {
      const response = await fetch(`${API_BASE}/analyze-personality`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setAiResult(data.data); 
        // Đã setActiveTab('ai') ở trên rồi nên chỗ này không cần nữa, nhưng giữ lại cũng không sao
        showToast("AI đã phân tích thành công!", "success");
        
        const newRecord = {
          id: Date.now().toString(), date: new Date().toLocaleString('vi-VN'),
          profile,
          hoatDong, tinhCach, nangLuc, moiTruong, optionalSubjects, subjectScores, aiResult: data.data, validGroups
        };
        const currentHistory = Array.isArray(history) ? history : [];
        const updatedHistory = [newRecord, ...currentHistory];
        setHistory(updatedHistory); localStorage.setItem('eduGuideHistory', JSON.stringify(updatedHistory));
      } else { 
        setAiError(data.message); 
        showToast(data.message, "error"); 
        // Nếu lỗi, tự động đẩy về lại Tab Input để người dùng sửa dữ liệu
        setActiveTab('input'); 
      }
    } catch (error) { 
      setAiError("Lỗi kết nối đến Server AI!"); 
      showToast("Lỗi kết nối đến Server AI!", "error"); 
      setActiveTab('input'); 
    } 
    finally { 
      setIsLoadingAi(false); 
    }
  }

  const loadHistoryItem = (item) => {
    if(item.profile) setProfile(item.profile);
    setHoatDong(item.hoatDong); setTinhCach(item.tinhCach); setNangLuc(item.nangLuc); setMoiTruong(item.moiTruong);
    setOptionalSubjects(item.optionalSubjects); setSubjectScores(item.subjectScores);
    setAiResult(item.aiResult); setValidGroups(item.validGroups); setUniversitiesResult(null);
    setActiveTab('ai'); showToast("Đã tải lại hồ sơ cũ", "success");
  };

  const handleFindUniversities = async (selectedRegion) => {
    setUniError(''); setRegion(selectedRegion);
    if (!validGroups || validGroups.length === 0) { showToast("Vui lòng chọn môn thi ở phần Học tập trước.", "warning"); return; }
    const validUserGroups = validGroups.map(g => ({ group_id: g.id, ...calculateGroupScore(g.description) })).filter(g => g.isComplete);
    if (validUserGroups.length === 0) { showToast("Vui lòng nhập điểm số hợp lệ cho ít nhất 1 khối.", "warning"); return; }
    setIsLoadingUni(true);
    const userGroupsPayload = validUserGroups.map(g => ({ group_id: g.group_id, score: g.total }));
    const uniPayload = { ai_majors: aiResult.suggested_majors, region: selectedRegion, user_groups: userGroupsPayload };
    try {
      const response = await fetch(`${API_BASE}/find-universities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(uniPayload)
      });
      const data = await response.json();
      if (data.status === 'success') { setUniversitiesResult(data.data); showToast("Đã tìm thấy danh sách trường!", "success"); } 
      else { setUniError(data.message); }
    } catch (error) { setUniError("Lỗi kết nối Database tuyển sinh!"); } 
    finally { setIsLoadingUni(false); }
  }

  const groupedUniversities = useMemo(() => {
    if (!universitiesResult) return null;
    const grouped = {};
    universitiesResult.forEach(item => {
      if (!grouped[item.major_name]) grouped[item.major_name] = {};
      const uniKey = `${item.university_code}-${item.university_name}`;
      if (!grouped[item.major_name][uniKey]) grouped[item.major_name][uniKey] = { uni_name: item.university_name, uni_code: item.university_code, admission_code: item.admission_code, details: [] };
      grouped[item.major_name][uniKey].details.push({ group: item.subject_group, score: item.required_score, year: item.year });
    });
    return grouped;
  }, [universitiesResult]);

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-800'} bg-grid-pattern`}>
      
      {toast && (
        <div className="fixed top-24 right-4 md:right-8 z-[100] animate-fade-in-up">
          <div className={`flex items-center p-4 rounded-2xl shadow-xl border backdrop-blur-md text-sm font-bold ${
            toast.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' :
            toast.type === 'error' ? 'bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300' :
            'bg-amber-50/90 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100"><X className="w-4 h-4"/></button>
          </div>
        </div>
      )}

      <AuroraBackground />
      <FloatingBackground isDarkMode={isDarkMode} />

      {!isStarted ? (
        <LandingPage 
          onStart={() => setIsStarted(true)} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
        />
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen pb-6 animate-fade-in-up">
          
          <Header 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onGoHome={() => setIsStarted(false)} 
          />

          <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 transition-all">
            
            {activeTab !== 'history' && (() => {
              const FLOW_STEPS = TABS.filter(t => t.id !== 'history' && t.id !== 'profile');
              const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === activeTab);
              
              if (currentStepIndex === -1) return null;

              const handlePrevStep = () => {
                if (currentStepIndex > 0) setActiveTab(FLOW_STEPS[currentStepIndex - 1].id);
              };

              const handleNextStep = () => {
                if (currentStepIndex < FLOW_STEPS.length - 1) setActiveTab(FLOW_STEPS[currentStepIndex + 1].id);
              };

              return (
                <div className="w-full max-w-5xl mx-auto mb-14 px-2 animate-fade-in-up">
                 
                    <div className="relative flex items-center justify-between gap-4 p-3 sm:p-4"> 
                    <button 
                      onClick={handlePrevStep} 
                      disabled={currentStepIndex === 0}
                      className="p-2.5 sm:p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none z-10 shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="relative flex-grow mx-4 sm:mx-8">
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full z-0"></div>
                      
                      <div 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full z-0 transition-all duration-700 ease-out"
                        style={{ width: `${(Math.max(0, currentStepIndex) / (FLOW_STEPS.length - 1)) * 100}%` }}
                      ></div>

                      <div className="relative flex items-center justify-between w-full">
                        {FLOW_STEPS.map((step, index) => {
                          const isCurrent = index === currentStepIndex;
                          const isPast = index < currentStepIndex;
                          const Icon = step.icon;

                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center group">
                              <button
                                onClick={() => setActiveTab(step.id)}
                                className={`flex items-center justify-center transition-all duration-500 ease-out relative ${
                                  isCurrent 
                                    ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900 border-4 border-white dark:border-slate-800 scale-110 z-20' 
                                    : isPast
                                    ? 'w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-50 dark:bg-slate-700 border-2 border-indigo-400 dark:border-cyan-500/50 hover:scale-110 cursor-pointer shadow-sm z-10'
                                    : 'w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-cyan-500/50 hover:scale-110 cursor-pointer shadow-sm'
                                }`}
                              >
                                {isCurrent && (
                                  <div className="absolute inset-[-6px] rounded-full border border-indigo-400/30 dark:border-cyan-400/30 animate-ping pointer-events-none"></div>
                                )}

                                {isCurrent && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                                {isPast && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-cyan-400" />}
                                {(!isCurrent && !isPast) && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />}
                              </button>
                              
                              <div 
                                className={`absolute top-14 sm:top-16 text-xs font-black whitespace-nowrap transition-colors duration-300 ${
                                  isCurrent 
                                    ? 'text-indigo-700 dark:text-cyan-400' 
                                    : isPast
                                    ? 'text-slate-600 dark:text-slate-300'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      onClick={handleNextStep} 
                      disabled={currentStepIndex === FLOW_STEPS.length - 1}
                      className="p-2.5 sm:p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none z-10 shrink-0"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                  </div>
                </div>
              );
            })()}

            <div className="relative group z-10 transition-all">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2.5rem] blur opacity-20 dark:opacity-40 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/80 dark:border-slate-700/80 shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-4 md:p-10 transition-colors duration-500 min-h-[500px] overflow-hidden">

                <div className="relative z-10">
                  {activeTab === 'profile' && (
                    <TabProfile profile={profile} setProfile={setProfile} isDarkMode={isDarkMode} onNext={() => setActiveTab('input')} />
                  )}

                  {activeTab === 'input' && (
                    <TabInput 
                      SUBJECT_LIST={SUBJECT_LIST} optionalSubjects={optionalSubjects} toggleSubject={toggleSubject} 
                      subjectScores={subjectScores} handleScoreChange={handleScoreChange} 
                      hoatDong={hoatDong} setHoatDong={setHoatDong} tinhCach={tinhCach} setTinhCach={setTinhCach} 
                      nangLuc={nangLuc} setNangLuc={setNangLuc} moiTruong={moiTruong} setMoiTruong={setMoiTruong} 
                      handleAnalyzeAI={handleAnalyzeAI} isLoadingAi={isLoadingAi} isDarkMode={isDarkMode} 
                      validGroups={validGroups} calculateGroupScore={calculateGroupScore} 
                      isLoadingGroups={isLoadingGroups} groupError={groupError}
                    />
                  )}
                  
                  {activeTab === 'ai' && (
                    <TabAiResult 
                      isLoadingAi={isLoadingAi} aiError={aiError} aiResult={aiResult} 
                      onGoToUniversity={() => setActiveTab('university')} isDarkMode={isDarkMode} 
                      SUBJECT_LIST={SUBJECT_LIST} optionalSubjects={optionalSubjects} subjectScores={subjectScores}
                      
                      validGroups={validGroups}
                      calculateGroupScore={calculateGroupScore}
                    />
                  )}

                  {activeTab === 'university' && (
                    <TabUniversities aiResult={aiResult} region={region} handleFindUniversities={handleFindUniversities} isLoadingUni={isLoadingUni} uniError={uniError} universitiesResult={universitiesResult} groupedUniversities={groupedUniversities} isDarkMode={isDarkMode} />
                  )}

                  {activeTab === 'history' && (
                    <TabHistory history={history} setHistory={setHistory} onLoadHistory={loadHistoryItem} isDarkMode={isDarkMode} />
                  )}
                </div>

              </div>
            </div>
          </div>

        {/* FOOTER - BỐ CỤC CHIA CỘT TỐI GIẢN (MINIMALIST COLUMNS) */}
          <footer className="mt-auto pt-20 pb-8 relative z-10 w-full border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/30 backdrop-blur-sm transition-colors duration-500">
            <div className="max-w-6xl mx-auto px-6">
              
              {/* Nút QR Code (Căn giữa phía trên cùng) */}
              <div className="flex justify-center mb-16">
                <div className="group relative">
                  <button className="flex items-center justify-center px-6 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-cyan-400 hover:shadow-md transition-all duration-300">
                    <QrCode className="w-5 h-5 mr-2" />
                    Truy cập trên Điện thoại
                  </button>
                  
                  {/* Popup QR Code */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out pointer-events-none z-50">
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                       <div className="bg-white p-2 rounded-2xl shadow-sm">
                         <QRCodeSVG 
                           value={typeof window !== 'undefined' ? window.location.origin : 'https://eduguide-ai.com'} 
                           size={130} level="H" bgColor="#ffffff" fgColor="#000000"
                         />
                       </div>
                       <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black mt-3 whitespace-nowrap flex items-center">
                         <Sparkles className="w-3 h-3 mr-1 text-cyan-500"/> Quét mã bằng Camera
                       </p>
                     </div>
                     <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-slate-800"></div>
                  </div>
                </div>
              </div>

              {/* Lưới danh sách chia cột */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 w-full mb-16 px-4 md:px-0">
                {/* Cột 1: Thông tin chung */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                    <Hexagon className="w-4 h-4 mr-2 text-indigo-500" /> EduGuide AI
                  </h4>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Về chúng tôi</a></li>
                    <li><a href="#" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Hướng dẫn sử dụng</a></li>
                    <li><a href="#" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Cập nhật mới</a></li>
                  </ul>
                </div>

                {/* Cột 2: Frontend */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Frontend</h4>
                  <ul className="space-y-4">
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">React</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">Node.js</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">Tailwind CSS</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">HTML</li>
                  </ul>
                </div>

                {/* Cột 3: Backend */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Backend</h4>
                  <ul className="space-y-4">
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">Python</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">Flask</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">SQLAlchemy</li>
                  </ul>
                </div>

                {/* Cột 4: Hạ tầng */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Hạ tầng & Triển khai</h4>
                  <ul className="space-y-4">
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">Vercel</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">AWS</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">Gunicorn</li>
                    <li className="text-sm font-medium text-slate-500 dark:text-slate-400">Nginx</li>
                  </ul>
                </div>
              </div>

              {/* Phần thông tin Bản quyền & Nhà phát triển */}
              <div className="w-full pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-0">
                {/* Nguồn dữ liệu */}
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center md:text-left">
                  Dữ liệu tuyển sinh tham khảo từ <span className="font-bold text-slate-600 dark:text-slate-300">Bộ GD&ĐT</span>.
                </p>

                {/* Nhóm phát triển */}
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center md:text-right flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <span>Phát triển bởi</span> 
                  <span className="font-bold text-indigo-600 dark:text-cyan-400">Tô Minh Hiến - Nguyễn Thành Duy - Bùi Tuệ Mẫn</span>
                </p>
              </div>

              {/* DÒNG LƯU Ý AI (DISCLAIMER) - Chuyên nghiệp và đáng tin cậy */}
              <div className="w-full mt-6 pt-6 border-t border-slate-200/30 dark:border-slate-800/30 flex justify-center px-4 md:px-0">
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-400/80 dark:text-slate-500/80 text-center max-w-4xl flex items-start sm:items-center justify-center leading-relaxed">
                  {/* <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 mt-0.5 sm:mt-0 opacity-70" /> */}
                  <span>
                    <strong className="font-semibold text-slate-500 dark:text-slate-400">Lưu ý:</strong> Các kết quả phân tích và định hướng từ EduGuide AI được tạo ra tự động dựa trên dữ liệu bạn nhập vào. Trí tuệ nhân tạo có thể mắc sai lầm hoặc chưa đánh giá hết toàn diện các khía cạnh. Vui lòng sử dụng kết quả này như một nguồn tham khảo và kết hợp thêm tư vấn từ chuyên gia, thầy cô để có quyết định chính xác nhất.
                  </span>
                </p>
              </div>

            </div>
          </footer>

        </div>
      )}
    </div>
  );
}

export default App;