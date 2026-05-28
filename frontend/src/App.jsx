import { useState, useEffect, useMemo } from 'react'
import { SUBJECT_LIST } from './constants'
import PersonalitySection from './components/PersonalitySection'
import SubjectSection from './components/SubjectSection'
import ResultPanel from './components/ResultPanel'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api'

export default function App() {
  // ── Subject & Score state ────────────────────────────────────────────────
  const [optionalSubjects, setOptionalSubjects] = useState([])
  const [subjectScores, setSubjectScores] = useState({ 1: '', 2: '' })
  const [validGroups, setValidGroups] = useState(null)
  const [groupError, setGroupError] = useState('')
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [subjectNotice, setSubjectNotice] = useState('')

  // ── Personality & AI state ───────────────────────────────────────────────
  const [userText, setUserText] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)

  // ── University search state ──────────────────────────────────────────────
  const [universitiesResult, setUniversitiesResult] = useState(null)
  const [region, setRegion] = useState('ALL')
  const [uniError, setUniError] = useState('')
  const [isLoadingUni, setIsLoadingUni] = useState(false)
  const [showUniPrompt, setShowUniPrompt] = useState(false)

  // Re-sync subject scores whenever optional subjects change
  useEffect(() => {
    const ids = [1, 2, ...optionalSubjects]
    const newScores = { ...subjectScores }
    ids.forEach(id => { if (newScores[id] === undefined) newScores[id] = '' })
    Object.keys(newScores).forEach(id => { if (!ids.includes(parseInt(id))) delete newScores[id] })
    setSubjectScores(newScores)

    if (optionalSubjects.length >= 1) fetchValidGroups(ids)
    else { setValidGroups(null); setGroupError('') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionalSubjects])

  // ── API 1: Get valid subject groups ─────────────────────────────────────
  const fetchValidGroups = async (ids) => {
    setIsLoadingGroups(true)
    setGroupError('')
    try {
      const res = await fetch(`${API_BASE}/get-valid-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_ids: ids }),
      })
      const data = await res.json()
      if (data.status === 'success') setValidGroups(data.valid_groups)
      else setGroupError(data.message || 'Lỗi không xác định từ server.')
    } catch {
      setGroupError('Không thể kết nối với server. Hãy kiểm tra lại backend đang chạy chưa.')
    } finally {
      setIsLoadingGroups(false)
    }
  }

  // ── API 2: AI personality analysis ──────────────────────────────────────
  const handleAnalyzeAI = async () => {
    setAiError('')
    setAiResult(null)
    setUniversitiesResult(null)
    setShowUniPrompt(false)
    setShowDetailedAnalysis(false)

    if (!userText.trim()) {
      setAiError('Vui lòng chia sẻ một chút về bản thân để AI có thể phân tích!')
      return
    }
    setIsLoadingAi(true)
    try {
      const res = await fetch(`${API_BASE}/analyze-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        const advice = data.advice || {}
        setAiResult({
          ui_tags: data.ui_tags || [],
          summary: typeof advice === 'object' ? (advice.summary || '') : (advice || ''),
          detailed_analysis: typeof advice === 'object' ? (advice.detailed_analysis || '') : '',
          suggested_majors: data.ai_majors_list || [],
        })
        setShowUniPrompt(true)
      } else {
        setAiError(data.message)
      }
    } catch {
      setAiError('Lỗi kết nối đến Server AI!')
    } finally {
      setIsLoadingAi(false)
    }
  }

  // ── API 3: Find universities ─────────────────────────────────────────────
  const handleFindUniversities = async (selectedRegion) => {
    setUniError('')

    if (!validGroups || validGroups.length === 0) {
      setUniError('Vui lòng chọn môn thi ở cột trái để hệ thống xác định khối xét tuyển.')
      return
    }

    const validUserGroups = validGroups
      .map(g => ({ group_id: g.id, code: g.code, ...calculateGroupScore(g.description) }))
      .filter(g => g.isComplete)

    if (validUserGroups.length === 0) {
      setUniError('Vui lòng nhập điểm hợp lệ cho ít nhất 1 khối thi (đủ 3 môn).')
      return
    }

    if (!aiResult?.suggested_majors?.length) {
      setUniError('Chưa có ngành học đề xuất. Vui lòng phân tích tính cách trước.')
      return
    }

    setRegion(selectedRegion)
    setIsLoadingUni(true)
    try {
      const res = await fetch(`${API_BASE}/find-universities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_majors: aiResult.suggested_majors,
          region: selectedRegion,
          user_groups: validUserGroups.map(g => ({ group_id: g.group_id, score: g.total })),
        }),
      })
      const data = await res.json()
      if (data.status === 'success') setUniversitiesResult(data.data)
      else setUniError(data.message)
    } catch {
      setUniError('Lỗi khi kết nối với cơ sở dữ liệu tuyển sinh!')
    } finally {
      setIsLoadingUni(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleSubject = (id) => {
    if (optionalSubjects.includes(id)) {
      setSubjectNotice('')
      setOptionalSubjects(optionalSubjects.filter(s => s !== id))
    } else if (optionalSubjects.length < 2) {
      setSubjectNotice('')
      setOptionalSubjects([...optionalSubjects, id])
    } else {
      setSubjectNotice('Bạn chỉ có thể chọn tối đa 2 môn tự chọn. Hãy bỏ chọn một môn trước.')
    }
  }

  const handleScoreChange = (id, value) => {
    if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) {
      setSubjectScores({ ...subjectScores, [id]: value })
    }
  }

  const calculateGroupScore = (description) => {
    if (!description) return { total: 0, isComplete: false }
    let total = 0, required = 0, entered = 0
    const desc = description.toLowerCase()
    SUBJECT_LIST.forEach(sub => {
      if (desc.includes(sub.name.toLowerCase())) {
        required++
        const s = subjectScores[sub.id]
        if (s && s !== '') { total += parseFloat(s); entered++ }
      }
    })
    return { total: parseFloat(total.toFixed(2)), isComplete: required > 0 && required === entered }
  }

  const hasValidGroups = Boolean(validGroups?.length)
  const hasCompleteAdmissionProfile = hasValidGroups
    && validGroups.some(g => calculateGroupScore(g.description).isComplete)

  const groupedUniversities = useMemo(() => {
    if (!universitiesResult) return null
    const grouped = {}
    universitiesResult.forEach(item => {
      if (!grouped[item.major_name]) grouped[item.major_name] = {}
      const key = `${item.university_code}-${item.university_name}`
      if (!grouped[item.major_name][key]) {
        grouped[item.major_name][key] = {
          uni_name: item.university_name,
          uni_code: item.university_code,
          admission_code: item.admission_code,
          details: [],
        }
      }
      grouped[item.major_name][key].details.push({
        group: item.subject_group,
        score: item.required_score,
        year: item.year,
      })
    })
    return grouped
  }, [universitiesResult])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-16">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-white tracking-tight text-lg">AI Career Navigator</span>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Hệ thống đang hoạt động
          </span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="text-center pt-14 pb-10 px-4">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          Powered by Gemini 2.5 Flash + pgvector RAG
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
          <span className="gradient-text">Khám phá tiềm năng</span>
          <br />
          <span className="text-white">Định hướng tương lai</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Chia sẻ câu chuyện của bạn — AI sẽ phân tích tính cách, đề xuất ngành học
          và tìm trường đại học phù hợp theo điểm thi.
        </p>
      </section>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column — inputs */}
          <div className="lg:col-span-5 space-y-5">
            <PersonalitySection
              userText={userText}
              setUserText={setUserText}
              handleAnalyzeAI={handleAnalyzeAI}
              isLoadingAi={isLoadingAi}
            />
            <SubjectSection
              optionalSubjects={optionalSubjects}
              toggleSubject={toggleSubject}
              subjectScores={subjectScores}
              handleScoreChange={handleScoreChange}
              subjectNotice={subjectNotice}
            />
          </div>

          {/* Right column — results */}
          <div className="lg:col-span-7">
            <ResultPanel
              validGroups={validGroups}
              groupError={groupError}
              isLoadingGroups={isLoadingGroups}
              calculateGroupScore={calculateGroupScore}
              aiResult={aiResult}
              aiError={aiError}
              isLoadingAi={isLoadingAi}
              showDetailedAnalysis={showDetailedAnalysis}
              setShowDetailedAnalysis={setShowDetailedAnalysis}
              showUniPrompt={showUniPrompt}
              universitiesResult={universitiesResult}
              groupedUniversities={groupedUniversities}
              region={region}
              isLoadingUni={isLoadingUni}
              uniError={uniError}
              handleFindUniversities={handleFindUniversities}
              hasValidGroups={hasValidGroups}
              hasCompleteAdmissionProfile={hasCompleteAdmissionProfile}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-20 border-t border-white/5 py-8 text-center">
        <p className="text-slate-500 text-sm">
          © 2026 <span className="text-slate-400 font-semibold">AI Career Navigator</span>. Hệ thống định hướng nghề nghiệp thông minh.
        </p>
        <p className="text-slate-600 text-xs mt-1.5">
          Tô Minh Hiến · Nguyễn Thành Duy · Bùi Tuệ Mẫn &nbsp;|&nbsp; Dữ liệu tham khảo từ Bộ GD&ĐT
        </p>
      </footer>
    </div>
  )
}
