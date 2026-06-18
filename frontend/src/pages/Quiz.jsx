import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import {
  Brain, Target, Briefcase, ArrowRight, Loader2,
  Monitor, Palette, BarChart, PieChart, Sprout,
  Rocket, Star, ArrowRightLeft, Cpu, BookOpen
} from 'lucide-react'
import { auth, db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

/* ─────────────────────────────────────────────
   Tokens — mesma base do Dashboard
───────────────────────────────────────────── */
const css = `
  :root {
    --indigo: #6366f1;
    --indigo-dim: rgba(99,102,241,0.10);
    --indigo-border: rgba(99,102,241,0.22);
    --surface: rgba(255,255,255,0.025);
    --surface-hover: rgba(255,255,255,0.045);
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.13);
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #475569;
    --bg: #060b18;
    --card-bg: rgba(15,23,42,0.55);
    --radius: 12px;
    --radius-sm: 8px;
  }

  .quiz-page {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text-primary);
    position: relative;
    overflow: hidden;
  }

  /* subtle ambient blobs — mesmos do dashboard */
  .quiz-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(110px);
    opacity: 1;
  }
  .quiz-blob-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: rgba(99,102,241,0.07); }
  .quiz-blob-2 { bottom: -10%; left: -5%; width: 500px; height: 500px; background: rgba(167,139,250,0.06); }

  .quiz-wrap {
    width: 100%;
    max-width: 520px;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ── Top nav bar ── */
  .quiz-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .quiz-logo {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none;
  }
  .quiz-logo-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--indigo);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .quiz-logo-text {
    font-size: 15px; font-weight: 600;
    color: var(--text-primary); letter-spacing: -0.3px;
  }
  .quiz-step-pill {
    font-size: 11.5px; font-weight: 600;
    color: #a5b4fc;
    background: var(--indigo-dim);
    border: 0.5px solid var(--indigo-border);
    border-radius: 20px;
    padding: 3px 10px;
    letter-spacing: .04em;
  }

  /* ── Progress track ── */
  .quiz-progress { display: flex; gap: 6px; }
  .quiz-prog-seg {
    flex: 1; height: 3px; border-radius: 10px;
    background: var(--border);
    overflow: hidden;
    transition: background .3s;
  }
  .quiz-prog-seg-fill {
    height: 100%; border-radius: 10px;
    background: var(--indigo);
    transition: width .5s ease;
  }

  /* ── Question header ── */
  .quiz-header { display: flex; flex-direction: column; gap: 6px; }
  .quiz-q-eyebrow {
    display: flex; align-items: center; gap: 8px;
    font-size: 11.5px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .08em;
    color: var(--text-muted);
  }
  .quiz-q-icon {
    width: 28px; height: 28px; border-radius: 7px;
    background: var(--indigo-dim);
    border: 0.5px solid var(--indigo-border);
    display: flex; align-items: center; justify-content: center;
    color: #a5b4fc;
  }
  .quiz-q-title {
    font-size: 22px; font-weight: 600;
    color: var(--text-primary); letter-spacing: -.4px;
    line-height: 1.3; margin: 0;
  }
  .quiz-q-sub {
    font-size: 13.5px; color: var(--text-secondary);
    line-height: 1.55; margin: 0;
  }

  /* ── Options ── */
  .quiz-options { display: flex; flex-direction: column; gap: 8px; }
  .quiz-option {
    width: 100%;
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    background: var(--card-bg);
    border: 0.5px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    text-align: left;
    color: var(--text-primary);
    font-family: inherit;
    transition: border-color .15s, background .15s, transform .15s;
  }
  .quiz-option:hover:not(:disabled) {
    border-color: var(--indigo-border);
    background: rgba(99,102,241,0.06);
    transform: translateY(-1px);
  }
  .quiz-option:disabled { cursor: not-allowed; opacity: .5; }
  .quiz-option:active:not(:disabled) { transform: translateY(0); }

  .quiz-opt-icon {
    width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
    background: var(--surface);
    border: 0.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary);
    transition: background .15s, color .15s, border-color .15s;
  }
  .quiz-option:hover:not(:disabled) .quiz-opt-icon {
    background: var(--indigo-dim);
    border-color: var(--indigo-border);
    color: #a5b4fc;
  }

  .quiz-opt-label {
    flex: 1;
    font-size: 14px; font-weight: 500;
    color: var(--text-secondary);
    transition: color .15s;
  }
  .quiz-option:hover:not(:disabled) .quiz-opt-label { color: var(--text-primary); }

  .quiz-opt-arrow {
    color: var(--text-muted);
    flex-shrink: 0;
    transition: color .15s, transform .15s;
  }
  .quiz-option:hover:not(:disabled) .quiz-opt-arrow {
    color: #a5b4fc;
    transform: translateX(3px);
  }

  /* ── Error ── */
  .quiz-error {
    font-size: 12.5px; color: #f87171;
    text-align: center;
    background: rgba(239,68,68,0.07);
    border: 0.5px solid rgba(239,68,68,0.2);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
  }

  /* ── Loading screen ── */
  .quiz-loading {
    min-height: 100vh;
    background: var(--bg);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 24px;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text-primary);
  }
  .quiz-spin-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
  .quiz-spin-ring {
    width: 72px; height: 72px; border-radius: 50%;
    border: 1.5px solid var(--indigo-border);
    display: flex; align-items: center; justify-content: center;
  }
  .quiz-spin-ping {
    position: absolute; inset: 0; border-radius: 50%;
    background: var(--indigo-dim);
    animation: qping 1.4s ease-out infinite;
  }
  @keyframes qping {
    0%   { transform: scale(1); opacity: .6; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  .quiz-loading-title {
    font-size: 18px; font-weight: 600;
    color: var(--text-primary); margin: 0; letter-spacing: -.3px;
    text-align: center;
  }
  .quiz-loading-sub {
    font-size: 13px; color: var(--text-secondary);
    text-align: center; max-width: 320px; line-height: 1.6;
    margin: 0;
  }
  .quiz-loading-steps {
    display: flex; flex-direction: column; gap: 10px;
    width: 100%; max-width: 300px;
  }
  .quiz-loading-step {
    display: flex; align-items: center; gap: 10px;
    font-size: 12.5px;
  }
  .quiz-loading-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--indigo); flex-shrink: 0;
    animation: qpulse 1.4s ease-in-out infinite;
  }
  .quiz-loading-dot:nth-child(1) { animation-delay: 0s; }
  .quiz-loading-step:nth-child(2) .quiz-loading-dot { animation-delay: .2s; }
  .quiz-loading-step:nth-child(3) .quiz-loading-dot { animation-delay: .4s; }
  @keyframes qpulse {
    0%, 100% { opacity: .3; transform: scale(1); }
    50%       { opacity: 1;  transform: scale(1.3); }
  }
  .quiz-loading-step-text { color: var(--text-muted); }
`

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const questions = [
  {
    id: 1,
    title: 'Qual sua área de interesse?',
    subtitle: 'Escolha o campo em que você deseja se aprofundar.',
    icon: Brain,
    options: [
      { label: 'Tecnologia e Programação', value: 'TI',        icon: Monitor },
      { label: 'Design e Criatividade',    value: 'DESIGN',    icon: Palette },
      { label: 'Negócios e Marketing',     value: 'MARKETING', icon: BarChart },
      { label: 'Ciência de Dados',         value: 'DATA',      icon: PieChart },
    ],
  },
  {
    id: 2,
    title: 'Qual seu nível atual?',
    subtitle: 'Seja honesto — isso define o ponto de partida da sua trilha.',
    icon: Target,
    options: [
      { label: 'Iniciante total',      value: 'BEGINNER',     icon: Sprout },
      { label: 'Tenho alguma base',    value: 'INTERMEDIATE', icon: Rocket },
      { label: 'Já atuo na área',      value: 'ADVANCED',     icon: Star },
    ],
  },
  {
    id: 3,
    title: 'Qual seu objetivo?',
    subtitle: 'Seu objetivo molda os conteúdos e projetos recomendados.',
    icon: Briefcase,
    options: [
      { label: 'Conseguir o primeiro emprego', value: 'JOB',            icon: Target },
      { label: 'Transição de carreira',        value: 'TRANSITION',    icon: ArrowRightLeft },
      { label: 'Especialização técnica',       value: 'SPECIALIZATION',icon: Cpu },
    ],
  },
]

/* ─────────────────────────────────────────────
   Loading screen
───────────────────────────────────────────── */
const LoadingScreen = () => (
  <div className="quiz-loading">
    <div className="quiz-spin-wrap">
      <div className="quiz-spin-ping" />
      <div className="quiz-spin-ring">
        <Loader2 size={30} color="var(--indigo)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <p className="quiz-loading-title">Criando sua trilha personalizada</p>
      <p className="quiz-loading-sub">A IA está analisando seu perfil e montando seu roteiro de estudos.</p>
    </div>
    <div className="quiz-loading-steps">
      {['Mapeando seu perfil', 'Selecionando conteúdos', 'Montando o roteiro'].map((s) => (
        <div key={s} className="quiz-loading-step">
          <div className="quiz-loading-dot" />
          <span className="quiz-loading-step-text">{s}</span>
        </div>
      ))}
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

/* ─────────────────────────────────────────────
   Quiz
───────────────────────────────────────────── */
const Quiz = () => {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { setUser(null); setError('Você precisa estar logado para realizar o quiz.'); return }
      setUser(u); setError('')
    })
    return () => unsub()
  }, [])

  const handleOption = (value) => {
    if (loading) return
    const newAnswers = { ...answers, [questions[step].id]: value }
    setAnswers(newAnswers)
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 120)
    } else {
      completeQuiz(newAnswers)
    }
  }

  const completeQuiz = async (finalAnswers) => {
    if (!user?.uid) { navigate('/login'); return }
    setLoading(true)
    try {
      const profile = {
        interest:   questions[0].options.find(o => o.value === finalAnswers[1])?.label,
        experience: questions[1].options.find(o => o.value === finalAnswers[2])?.label,
        goal:       questions[2].options.find(o => o.value === finalAnswers[3])?.label,
      }
      const api = import.meta.env.VITE_API_URL || 'https://projeto-sem.vercel.app'
      const res  = await fetch(`${api}/roadmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, uid: user.uid }),
      })
      const data = await res.json()
      if (data.success && data.roadmap) {
        await setDoc(doc(db, 'users', user.uid), {
          trilha: { ...data.roadmap, userId: user.uid, profileAtTime: profile },
        }, { merge: true })
        navigate('/roadmap')
      } else {
        throw new Error(data.message || 'Erro ao gerar sua trilha.')
      }
    } catch (err) {
      console.error('Error completing quiz:', err)
      setError('Falha ao gerar sua trilha. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <><style>{css}</style><LoadingScreen /></>

  const q = questions[step]
  const QIcon = q.icon

  return (
    <>
      <style>{css}</style>
      <div className="quiz-page">
        <div className="quiz-blob quiz-blob-1" />
        <div className="quiz-blob quiz-blob-2" />

        <div className="quiz-wrap">
          {/* Top bar */}
          <div className="quiz-topbar">
            <div className="quiz-logo">
              <div className="quiz-logo-icon">
                <BookOpen size={15} color="#fff" />
              </div>
              <span className="quiz-logo-text">Intelectus</span>
            </div>
            <span className="quiz-step-pill">Passo {step + 1} de {questions.length}</span>
          </div>

          {/* Progress */}
          <div className="quiz-progress">
            {questions.map((_, i) => (
              <div key={i} className="quiz-prog-seg">
                <div className="quiz-prog-seg-fill" style={{ width: i <= step ? '100%' : '0%' }} />
              </div>
            ))}
          </div>

          {/* Question header */}
          <div className="quiz-header">
            <div className="quiz-q-eyebrow">
              <div className="quiz-q-icon"><QIcon size={14} /></div>
              Pergunta {step + 1}
            </div>
            <h1 className="quiz-q-title">{q.title}</h1>
            <p className="quiz-q-sub">{q.subtitle}</p>
          </div>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.18 }}
              className="quiz-options"
            >
              {q.options.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  className="quiz-option"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.055 }}
                  onClick={() => handleOption(opt.value)}
                  disabled={loading}
                >
                  <div className="quiz-opt-icon"><opt.icon size={18} /></div>
                  <span className="quiz-opt-label">{opt.label}</span>
                  <ArrowRight size={15} className="quiz-opt-arrow" />
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {error && <div className="quiz-error">{error}</div>}
        </div>
      </div>
    </>
  )
}

export default Quiz
