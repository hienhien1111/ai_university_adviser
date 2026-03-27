import { useState, useEffect, useMemo } from 'react'

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

  // STATE MỚI: Tách biệt AI và University
  const [aiResult, setAiResult] = useState(null)
  const [universitiesResult, setUniversitiesResult] = useState(null)
  const [showUniPrompt, setShowUniPrompt] = useState(false) // Trạng thái hỏi có muốn xem trường không

  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [isLoadingUni, setIsLoadingUni] = useState(false) // Loading riêng cho tìm trường

  const [groupError, setGroupError] = useState('')
  const [aiError, setAiError] = useState('')
  const [uniError, setUniError] = useState('')

  const API_BASE = "https://xettuyen.site/api"

  // 1. Quản lý thay đổi môn học & Gọi API lấy khối thi
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

  const calculateGroupScore = (description) => {
    if (!description) return { total: 0, isComplete: false };
    let total = 0;
    let requiredSubjects = 0;
    let enteredSubjects = 0;
    const descLower = description.toLowerCase();

    SUBJECT_LIST.forEach(sub => {
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
      total: parseFloat(total.toFixed(2)),
      isComplete: requiredSubjects > 0 && requiredSubjects === enteredSubjects
    };
  }

  // ==========================================
  // BƯỚC 1: GỌI API AI GỢI Ý NGÀNH
  // ==========================================
  const handleAnalyzeAI = async () => {
    setAiError('')
    setAiResult(null)
    setUniversitiesResult(null)
    setShowUniPrompt(false)
    setIsLoadingAi(true)

    const payload = { hoat_dong: hoatDong, tinh_cach: tinhCach, nang_luc: nangLuc, moi_truong: moiTruong }

    try {
      const response = await fetch(`${API_BASE}/analyze-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (data.status === 'success') {
        setAiResult(data.data)
        // Hiển thị lời nhắc tìm trường sau khi AI phân tích xong
        setShowUniPrompt(true)
      } else {
        setAiError(data.message)
      }
    } catch (error) {
      setAiError("Lỗi kết nối đến Server AI!")
    } finally {
      setIsLoadingAi(false)
    }
  }

  // ==========================================
  // BƯỚC 2: GỌI API TÌM TRƯỜNG ĐẠI HỌC
  // ==========================================
  const handleFindUniversities = async () => {
    setUniError('')
    setUniversitiesResult(null)

    // Kiểm tra điểm số
    if (!validGroups || validGroups.length === 0) {
      setUniError("Vui lòng chọn môn thi ở Cột 1 để hệ thống xác định khối xét tuyển trước.");
      return;
    }

    const validUserGroups = validGroups
      .map(g => ({ group_id: g.id, ...calculateGroupScore(g.description) }))
      .filter(g => g.isComplete);

    if (validUserGroups.length === 0) {
      setUniError("Vui lòng nhập điểm số hợp lệ cho ít nhất 1 khối thi (đủ 3 môn) ở Cột 1.");
      return;
    }

    setIsLoadingUni(true)

    const userGroupsPayload = validUserGroups.map(g => ({
      group_id: g.group_id,
      score: g.total
    }));

    const uniPayload = {
      ai_majors: aiResult.suggested_majors,
      region: region,
      user_groups: userGroupsPayload
    }

    try {
      const response = await fetch(`${API_BASE}/find-universities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uniPayload)
      })
      const data = await response.json()

      if (data.status === 'success') {
        setUniversitiesResult(data.data)
      } else {
        setUniError(data.message)
      }
    } catch (error) {
      setUniError("Lỗi khi kết nối với Database tuyển sinh!")
    } finally {
      setIsLoadingUni(false)
    }
  }

  // ==========================================
  // HÀM GOM NHÓM DỮ LIỆU (GROUP BY MAJOR -> UNIVERSITY)
  // ==========================================
  const groupedUniversities = useMemo(() => {
    if (!universitiesResult) return null;

    const grouped = {};
    universitiesResult.forEach(item => {
      // 1. Nhóm theo Ngành học
      if (!grouped[item.major_name]) {
        grouped[item.major_name] = {};
      }

      // 2. Nhóm theo Trường đại học (bên trong ngành học)
      const uniKey = `${item.university_code}-${item.university_name}`;
      if (!grouped[item.major_name][uniKey]) {
        grouped[item.major_name][uniKey] = {
          uni_name: item.university_name,
          uni_code: item.university_code,
          admission_code: item.admission_code,
          details: []
        };
      }

      // 3. Đẩy các khối và điểm vào trường
      grouped[item.major_name][uniKey].details.push({
        group: item.subject_group,
        score: item.required_score,
        year: item.year
      });
    });

    return grouped;
  }, [universitiesResult]);

  const renderScoreInputs = () => {
    const activeSubjects = SUBJECT_LIST.filter(s => s.id === 1 || s.id === 2 || optionalSubjects.includes(s.id));
    return activeSubjects.map(sub => (
      <div key={sub.id} className="col-span-1">
        <label className="block mb-1 text-xs font-semibold text-slate-500">{sub.name}</label>
        <input
          type="number" step="0.25" min="0" max="10"
          value={subjectScores[sub.id] || ''}
          onChange={(e) => handleScoreChange(sub.id, e.target.value)}
          placeholder="0.0"
          className="w-full bg-white border border-slate-200 text-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none block p-2 transition-all text-center font-bold shadow-inner"
        />
      </div>
    ));
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
                {isLoadingAi ? 'AI đang phân tích...' : 'Phân Tích Tính Cách Của Tôi'}
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: KẾT QUẢ */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-4">Kết Quả Phân Tích</h2>

              {/* KHU VỰC 1: KHỐI THI & ĐIỂM SỐ (Luôn hiện) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm uppercase tracking-wider font-bold text-indigo-500">Khối thi & Tổng điểm dự kiến</h3>
                  {isLoadingGroups && <span className="text-xs text-indigo-500 animate-pulse font-medium">Đang cập nhật...</span>}
                </div>

                <div className="bg-slate-50/50 rounded-xl border border-slate-200 min-h-[60px] p-4">
                  {groupError && <span className="text-red-500 font-medium">{groupError}</span>}
                  {!groupError && !validGroups && <span className="text-slate-400 text-sm italic">Chọn ít nhất 1 môn tự chọn để xem khối thi.</span>}

                  {validGroups && validGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {validGroups.map(g => {
                        const { total, isComplete } = calculateGroupScore(g.description);
                        return (
                          <div key={g.id} className="bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                            <span className="font-extrabold text-indigo-700">{g.code}</span>
                            <span className="text-slate-300">|</span>
                            <span className={`font-black ${isComplete ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {total > 0 ? total : '--'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {aiError && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-medium">{aiError}</div>}

              {isLoadingAi && (
                <div className="flex-grow flex flex-col justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-500 mb-4"></div>
                  <span className="text-slate-500 font-bold animate-pulse">Trí tuệ nhân tạo đang phân tích hồ sơ...</span>
                </div>
              )}

              {/* KHU VỰC 2: KẾT QUẢ AI & LỜI KÊU GỌI TÌM TRƯỜNG */}
              {aiResult && !isLoadingAi && (
                <div className="flex-grow space-y-6">

                  {/* Nhận định AI */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100">
                    <h3 className="text-sm uppercase tracking-wider font-bold text-cyan-600 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Định vị Bản thân
                    </h3>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {aiResult.holland_traits.map((t, idx) => (
                          <span key={idx} className="bg-white border border-cyan-200 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{t}</span>
                        ))}
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm text-justify mb-4">{aiResult.analysis}</p>

                      <h4 className="font-bold text-sm text-slate-800 mb-2">Đề xuất ngành học phù hợp:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiResult.suggested_majors.map((m, idx) => (
                          <li key={idx} className="flex items-center text-slate-800 font-medium bg-white p-2 rounded-lg border border-slate-200 text-sm shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Nút bấm hỏi ý kiến tìm trường */}
                  {showUniPrompt && !universitiesResult && !isLoadingUni && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center shadow-inner">
                      <h3 className="font-bold text-indigo-900 text-lg mb-2">Bạn đã tìm được ngành học phù hợp!</h3>
                      <p className="text-indigo-700 text-sm mb-5">Bạn có muốn xem danh sách các trường Đại học đang xét tuyển những ngành này và phù hợp với số điểm của bạn không?</p>

                      {uniError && <p className="text-red-500 text-sm mb-4 font-medium bg-red-50 py-2 rounded-lg">{uniError}</p>}

                      <button
                        onClick={handleFindUniversities}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                      >
                        Khám Phá Trường Đại Học Ngay
                      </button>
                    </div>
                  )}

                  {/* Loading tìm trường */}
                  {isLoadingUni && (
                    <div className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                      <span className="text-indigo-600 font-medium animate-pulse">Đang quét điểm chuẩn cơ sở dữ liệu quốc gia...</span>
                    </div>
                  )}

                  {/* KHU VỰC 3: DANH SÁCH TRƯỜNG ĐÃ ĐƯỢC GOM NHÓM */}
                  {universitiesResult && (
                    <div className="animate-fade-in-up">
                      <h3 className="text-sm uppercase tracking-wider font-bold text-indigo-600 mb-4 flex items-center border-b border-indigo-100 pb-2">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        Trường Đại Học Đề Xuất
                      </h3>

                      {Object.keys(groupedUniversities).length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                          <p className="font-bold text-amber-800">Rất tiếc, chưa tìm thấy trường phù hợp!</p>
                          <p className="text-amber-700 text-sm mt-1">Nguyên nhân có thể do điểm của bạn chưa đạt mức chuẩn, hoặc các ngành này không được xét tuyển bằng khối thi bạn chọn.</p>
                        </div>
                      ) : (
                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {/* Lặp qua từng NGÀNH HỌC */}
                          {Object.keys(groupedUniversities).map((majorName, mIdx) => (
                            <div key={mIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200">
                                <h4 className="font-bold text-slate-800 text-lg flex items-center">
                                  <span className="text-2xl mr-2">🎯</span> {majorName}
                                </h4>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {/* Lặp qua từng TRƯỜNG ĐẠI HỌC trong Ngành */}
                                {Object.values(groupedUniversities[majorName]).map((uni, uIdx) => (
                                  <div key={uIdx} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h5 className="font-extrabold text-indigo-700 text-base">{uni.uni_name}</h5>
                                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Mã trường: {uni.uni_code} {uni.admission_code && `| Mã ngành: ${uni.admission_code}`}</span>
                                      </div>
                                    </div>

                                    {/* Lặp qua các KHỐI THI & ĐIỂM của Trường */}
                                    <div className="flex flex-wrap gap-2">
                                      {uni.details.map((detail, dIdx) => (
                                        <div key={dIdx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                                          <span className="font-bold text-slate-700">{detail.group}</span>
                                          <span className="text-slate-300">|</span>
                                          <span className="text-emerald-600 font-black">{detail.score} <span className="text-xs text-slate-400 font-normal">({detail.year})</span></span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Màn hình chờ rỗng ban đầu */}
              {!isLoadingAi && !aiResult && !aiError && (
                <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
                  <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  <p className="text-slate-400 text-sm">Hoàn thiện Hồ sơ xét tuyển và Bản đồ tâm lý bên trái<br />để bắt đầu hành trình chọn trường của bạn.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App