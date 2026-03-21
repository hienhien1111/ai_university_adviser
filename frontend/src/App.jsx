import { useState, useEffect } from 'react'

const SUBJECT_LIST = [
  { id: 1, name: 'Toán', isCompulsory: true },
  { id: 2, name: 'Ngữ Văn', isCompulsory: true },
  { id: 3, name: 'Vật lí', isCompulsory: false },
  { id: 4, name: 'Hóa học', isCompulsory: false },
  { id: 5, name: 'Sinh học', isCompulsory: false },
  { id: 6, name: 'Lịch sử', isCompulsory: false },
  { id: 7, name: 'Địa lí', isCompulsory: false },
  { id: 8, name: 'GDCD', isCompulsory: false },
  { id: 11, name: 'Tiếng Anh', isCompulsory: false }
];

function App() {
  const [optionalSubjects, setOptionalSubjects] = useState([])

  const [subjectScores, setSubjectScores] = useState({ 1: '', 2: '' })
  const [region, setRegion] = useState('ALL')

  const [hoatDong, setHoatDong] = useState('')
  const [tinhCach, setTinhCach] = useState('')
  const [nangLuc, setNangLuc] = useState('')
  const [moiTruong, setMoiTruong] = useState('')

  const [validGroups, setValidGroups] = useState(null)
  const [aiResult, setAiResult] = useState(null)

  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [groupError, setGroupError] = useState('')
  const [aiError, setAiError] = useState('')

  const API_BASE = "http://127.0.0.1:5000/api"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionalSubjects]);

  const fetchValidGroups = async (ids) => {
    setIsLoadingGroups(true);
    setGroupError('');
    try {
      const response = await fetch(`${API_BASE}/get-valid-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_ids: ids })
      })
      const data = await response.json()
      if (data.status === 'success') {
        setValidGroups(data.valid_groups)
      } else {
        setGroupError(data.message)
      }
    } catch (error) {
      setGroupError("Lỗi kết nối đến Server Backend!")
    } finally {
      setIsLoadingGroups(false);
    }
  }

  const toggleSubject = (id) => {
    if (optionalSubjects.includes(id)) {
      setOptionalSubjects(optionalSubjects.filter(subId => subId !== id));
    } else {
      if (optionalSubjects.length < 2) {
        setOptionalSubjects([...optionalSubjects, id]);
      } else {
        alert("Bạn chỉ được chọn tối đa 2 môn tự chọn!");
      }
    }
  }

  const handleScoreChange = (id, value) => {
    if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) {
      setSubjectScores({ ...subjectScores, [id]: value });
    }
  }

  const handleAnalyzeAI = async () => {
    setAiError('')
    setAiResult(null)
    setIsLoadingAi(true)

    const payload = { hoat_dong: hoatDong, tinh_cach: tinhCach, nang_luc: nangLuc, moi_truong: moiTruong }

    try {
      const response = await fetch(`${API_BASE}/analyze-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (data.status === 'success') setAiResult(data.data)
      else setAiError(data.message)
    } catch (error) {
      setAiError("Lỗi kết nối đến Server AI!")
    } finally {
      setIsLoadingAi(false)
    }
  }

  const renderScoreInputs = () => {
    const activeSubjects = SUBJECT_LIST.filter(s => s.id === 1 || s.id === 2 || optionalSubjects.includes(s.id));
    return activeSubjects.map(sub => (
      <div key={sub.id} className="col-span-1">
        <label className="block mb-1 text-xs font-semibold text-slate-500">{sub.name}</label>
        <input
          type="number"
          step="0.25"
          min="0" max="10"
          value={subjectScores[sub.id] || ''}
          onChange={(e) => handleScoreChange(sub.id, e.target.value)}
          placeholder="0.0"
          className="w-full bg-white border border-slate-200 text-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none block p-2 transition-all text-center font-bold shadow-inner"
        />
      </div>
    ));
  }

  // ==========================================
  // HÀM MAGIC: Tính điểm thời gian thực cho từng khối
  // ==========================================
  const calculateGroupScore = (description) => {
    if (!description) return { total: 0, isComplete: false };

    let total = 0;
    let requiredSubjects = 0;
    let enteredSubjects = 0;
    const descLower = description.toLowerCase();

    SUBJECT_LIST.forEach(sub => {
      // Nếu tên môn học nằm trong phần mô tả của khối thi (VD: 'vật lí' nằm trong 'toán, vật lí, hóa học')
      if (descLower.includes(sub.name.toLowerCase())) {
        requiredSubjects++;
        const score = subjectScores[sub.id];
        if (score && score !== '') {
          total += parseFloat(score);
          enteredSubjects++;
        }
      }
    });

    return {
      total: total.toFixed(2).replace(/\.00$/, ''), // Xóa đuôi .00 nếu là số chẵn
      isComplete: requiredSubjects > 0 && requiredSubjects === enteredSubjects // Check xem đã nhập đủ 3 môn của khối chưa
    };
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-tight mb-3">
            AI Career Navigator
          </h1>
          <p className="text-slate-500 text-lg">Khám phá tiềm năng - Định hướng tương lai</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: NHẬP LIỆU */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">1. Hồ Sơ Xét Tuyển</h2>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Môn Bắt Buộc</label>
                <div className="flex gap-2">
                  {SUBJECT_LIST.filter(s => s.isCompulsory).map(sub => (
                    <span key={sub.id} className="bg-slate-200 text-slate-500 border border-slate-300 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Môn Tự Chọn (Chọn tối đa 2)</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_LIST.filter(s => !s.isCompulsory).map(sub => {
                    const isSelected = optionalSubjects.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleSubject(sub.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                          }`}
                      >
                        {sub.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-3">
                    <label className="block mb-3 text-sm font-semibold text-slate-700">Điểm thi từng môn</label>
                    <div className="grid grid-cols-4 gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                      {renderScoreInputs()}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-3 text-sm font-semibold text-slate-700">Khu vực ưu tiên</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none block p-3 transition-all h-[68px]"
                    >
                      <option value="ALL">📍 Toàn quốc</option>
                      <option value="NORTH">Miền Bắc</option>
                      <option value="CENTRAL">Miền Trung</option>
                      <option value="SOUTH">Miền Nam</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2: Tâm lý học */}
            <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6">
              <div className="flex items-center mb-5">
                <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">2. Bản Đồ Tâm Lý</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-slate-700">Hoạt động yêu thích</label>
                  <textarea value={hoatDong} onChange={(e) => setHoatDong(e.target.value)} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none block p-3 text-sm transition-all" placeholder="Bạn thích làm gì nhất khi rảnh rỗi?"></textarea>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-slate-700">Tính cách nổi bật</label>
                  <textarea value={tinhCach} onChange={(e) => setTinhCach(e.target.value)} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none block p-3 text-sm transition-all" placeholder="Người khác thường nhận xét bạn thế nào?"></textarea>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-slate-700">Năng lực & Thế mạnh</label>
                  <textarea value={nangLuc} onChange={(e) => setNangLuc(e.target.value)} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none block p-3 text-sm transition-all" placeholder="Bạn tự tin nhất về kỹ năng hay môn học nào?"></textarea>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-slate-700">Môi trường làm việc</label>
                  <textarea value={moiTruong} onChange={(e) => setMoiTruong(e.target.value)} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none block p-3 text-sm transition-all" placeholder="Bạn mơ ước một môi trường làm việc ra sao?"></textarea>
                </div>
              </div>

              <button
                onClick={handleAnalyzeAI}
                disabled={isLoadingAi}
                className="mt-6 w-full text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-70 font-semibold rounded-lg text-sm px-5 py-3 transition-all shadow-md hover:shadow-lg flex justify-center items-center"
              >
                {isLoadingAi ? 'AI đang suy nghĩ...' : 'Khám Phá Trường & Ngành Ngay'}
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: KẾT QUẢ */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-4">Báo Cáo Tuyển Sinh</h2>

              {/* Kết quả Khối thi có tích hợp Điểm số */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm uppercase tracking-wider font-bold text-indigo-500">Tổ hợp xét tuyển & Điểm số</h3>
                  {isLoadingGroups && <span className="text-xs text-indigo-500 animate-pulse font-medium">Đang cập nhật...</span>}
                </div>

                <div className="bg-slate-50/50 rounded-xl border border-slate-200 min-h-[60px] p-4">
                  {groupError && <span className="text-red-500 font-medium">{groupError}</span>}
                  {!groupError && !validGroups && <span className="text-slate-400 text-sm italic">Hãy chọn ít nhất 1 môn tự chọn bên trái để xem các khối thi hợp lệ.</span>}

                  {validGroups && validGroups.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {validGroups.map(g => {
                        const { total, isComplete } = calculateGroupScore(g.description);
                        return (
                          <div key={g.id} className="bg-white border border-indigo-100 px-3 py-2.5 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="border-b border-slate-100 pb-2 mb-2">
                              <span className="font-extrabold text-indigo-700 text-lg block">{g.code}</span>
                              <p className="text-[11px] text-slate-500 uppercase tracking-wide truncate mt-0.5" title={g.description}>{g.description}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-slate-400">Tổng điểm:</span>
                              <span className={`font-black text-lg ${isComplete ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {total > 0 ? total : '--'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {validGroups && validGroups.length === 0 && (
                    <span className="text-slate-600 font-medium">Không tìm thấy tổ hợp khối thi nào phù hợp với các môn này.</span>
                  )}
                </div>
              </div>

              {/* Kết quả AI */}
              <div className="flex-grow">
                <h3 className="text-sm uppercase tracking-wider font-bold text-cyan-500 mb-3">Định hướng Ngành học</h3>

                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm min-h-[200px]">
                  {aiError && <span className="text-red-500 bg-red-50 p-3 rounded-lg block font-medium">{aiError}</span>}
                  {!aiError && !aiResult && !isLoadingAi && <span className="text-slate-400 text-sm italic">Hệ thống đang chờ hồ sơ của bạn...</span>}

                  {isLoadingAi && (
                    <div className="flex flex-col justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mb-3"></div>
                      <span className="text-slate-500 font-medium animate-pulse text-sm">Đang phân tích dữ liệu & quét điểm chuẩn...</span>
                    </div>
                  )}

                  {aiResult && !isLoadingAi && (
                    <div>
                      <div className="mb-4">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-2">Nhóm Holland</span>
                        <div className="flex gap-2">
                          {aiResult.holland_traits.map((t, idx) => (
                            <span key={idx} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-5 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-2">Nhận định chuyên gia</span>
                        <p className="text-slate-700 leading-relaxed text-sm text-justify">{aiResult.analysis}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-2">Đề xuất ngành học cụ thể</span>
                        <ul className="space-y-2">
                          {aiResult.suggested_majors.map((m, idx) => (
                            <li key={idx} className="flex items-center text-slate-800 font-medium bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                              <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App