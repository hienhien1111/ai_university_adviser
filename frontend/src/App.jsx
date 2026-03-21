import { useState } from 'react'

function App() {
  // Quản lý trạng thái (State) cho các ô nhập liệu
  const [subjectIds, setSubjectIds] = useState('')
  const [hoatDong, setHoatDong] = useState('')
  const [tinhCach, setTinhCach] = useState('')
  const [nangLuc, setNangLuc] = useState('')
  const [moiTruong, setMoiTruong] = useState('')

  // Quản lý trạng thái cho kết quả trả về
  const [validGroups, setValidGroups] = useState(null)
  const [aiResult, setAiResult] = useState(null)

  // Trạng thái loading và thông báo lỗi
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [groupError, setGroupError] = useState('')
  const [aiError, setAiError] = useState('')

  const API_BASE = "http://127.0.0.1:5000/api"

  // Hàm xử lý tìm khối thi
  const handleGetGroups = async () => {
    setGroupError('')
    setValidGroups(null)

    const ids = subjectIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    if (ids.length === 0) {
      setGroupError("Vui lòng nhập ID môn học hợp lệ!")
      return
    }

    setIsLoadingGroups(true)
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
      setIsLoadingGroups(false)
    }
  }

  // Hàm xử lý gọi AI
  const handleAnalyzeAI = async () => {
    setAiError('')
    setAiResult(null)
    setIsLoadingAi(true)

    const payload = {
      hoat_dong: hoatDong,
      tinh_cach: tinhCach,
      nang_luc: nangLuc,
      moi_truong: moiTruong
    }

    try {
      const response = await fetch(`${API_BASE}/analyze-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (data.status === 'success') {
        setAiResult(data.data)
      } else {
        setAiError(data.message)
      }
    } catch (error) {
      setAiError("Lỗi kết nối đến Server AI!")
    } finally {
      setIsLoadingAi(false)
    }
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

            {/* Block 1: Môn học */}
            <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">1. Khối Thi Xét Tuyển</h2>
              </div>
              <input
                value={subjectIds}
                onChange={(e) => setSubjectIds(e.target.value)}
                type="text"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none block p-3 transition-all mb-4"
                placeholder="Nhập ID 4 môn thi (VD: 1, 2, 3, 11)"
              />
              <button
                onClick={handleGetGroups}
                disabled={isLoadingGroups}
                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 font-semibold rounded-lg text-sm px-5 py-3 transition-colors shadow-md hover:shadow-lg"
              >
                {isLoadingGroups ? 'Đang tra cứu...' : 'Xác Định Khối Thi'}
              </button>
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
                {isLoadingAi ? 'AI đang suy nghĩ...' : 'Phân Tích Bằng AI'}
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: KẾT QUẢ */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-4">Báo Cáo Phân Tích</h2>

              {/* Kết quả Khối thi */}
              <div className="mb-6">
                <h3 className="text-sm uppercase tracking-wider font-bold text-indigo-500 mb-3">Tổ hợp môn hợp lệ</h3>
                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 min-h-[60px] flex items-center">
                  {groupError && <span className="text-red-500 font-medium">{groupError}</span>}
                  {!groupError && !validGroups && <span className="text-slate-400 text-sm italic">Chưa có dữ liệu. Vui lòng xác định khối thi ở cột trái.</span>}

                  {validGroups && validGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {validGroups.map(g => (
                        <span key={g.id} className="bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                          <span className="font-bold text-indigo-900">{g.code}</span> - {g.description}
                        </span>
                      ))}
                    </div>
                  )}
                  {validGroups && validGroups.length === 0 && (
                    <span className="text-slate-600">Không tìm thấy tổ hợp khối thi nào phù hợp với các môn này.</span>
                  )}
                </div>
              </div>

              {/* Kết quả AI */}
              <div className="flex-grow">
                <h3 className="text-sm uppercase tracking-wider font-bold text-cyan-500 mb-3">Định hướng Ngành học</h3>

                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm min-h-[200px]">
                  {aiError && <span className="text-red-500 bg-red-50 p-3 rounded-lg block font-medium">{aiError}</span>}
                  {!aiError && !aiResult && !isLoadingAi && <span className="text-slate-400 text-sm italic">Hệ thống AI đang chờ hồ sơ của bạn...</span>}

                  {isLoadingAi && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
                      <span className="ml-3 text-slate-500 font-medium animate-pulse">Đang phân tích dữ liệu...</span>
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
                        <p className="text-slate-700 leading-relaxed text-sm">{aiResult.analysis}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-2">Đề xuất ngành học cụ thể</span>
                        <ul className="space-y-2">
                          {aiResult.suggested_majors.map((m, idx) => (
                            <li key={idx} className="flex items-center text-slate-800 font-medium bg-emerald-50/50 p-2 rounded border border-emerald-100">
                              <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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