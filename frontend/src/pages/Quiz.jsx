import { API_URL } from '../utils/api'
import { validatePersonalizedRoadmap, validateSavedRoadmap } from '../utils/personalizedRoadmap.mjs'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import {
  Compass,
  Target,
  Briefcase,
  ArrowRight,
  Monitor,
  Palette,
  BarChart3,
  Database,
  Sprout,
  Rocket,
  Award,
  ArrowRightLeft,
  Layers,
  BookOpen,
} from 'lucide-react'
import { auth } from '../firebase'

/* ─────────────────────────────────────────────
   Assessment Questions Data (Professional Focus)
───────────────────────────────────────────── */
const questions = [
  {
    id: 1,
    title: 'Qual a sua área de foco profissional?',
    subtitle: 'Escolha o assunto que mais desperta sua curiosidade. Você pode mudar depois.',
    icon: Compass,
    options: [
      { label: 'Engenharia de Software & Web', value: 'TI', icon: Monitor },
      { label: 'Design de Produto & UI/UX', value: 'DESIGN', icon: Palette },
      { label: 'Negócios, Produto & Marketing', value: 'MARKETING', icon: BarChart3 },
      { label: 'Ciência de Dados & Analytics', value: 'DATA', icon: Database },
    ],
  },
  {
    id: 2,
    title: 'Quanto você já conhece sobre essa área?',
    subtitle: 'Vamos encontrar um ponto de partida que faça sentido para você.',
    icon: Target,
    options: [
      { label: 'Iniciante (Construindo Fundamentos)', value: 'BEGINNER', icon: Sprout },
      { label: 'Intermediário (Já desenvolve projetos)', value: 'INTERMEDIATE', icon: Rocket },
      {
        label: 'Avançado (Busca refinamento técnico e arquitetura)',
        value: 'ADVANCED',
        icon: Award,
      },
    ],
  },
  {
    id: 3,
    title: 'Qual é o seu objetivo principal no momento?',
    subtitle: 'Assim, sua trilha fica mais próxima do que você quer conquistar.',
    icon: Briefcase,
    options: [
      { label: 'Ingresso no mercado ou primeiro emprego', value: 'JOB', icon: Target },
      { label: 'Transição estratégica de carreira', value: 'TRANSITION', icon: ArrowRightLeft },
      { label: 'Especialização técnica e liderança', value: 'SPECIALIZATION', icon: Layers },
    ],
  },
]

/* ─────────────────────────────────────────────
   Apple Setup Assistant Loading Screen
───────────────────────────────────────────── */
const LoadingScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '24px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'var(--surface)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="dash-spinner"
        style={{ width: 24, height: 24, borderTopColor: 'var(--apple-blue)' }}
      />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '380px' }}>
      <h2
        style={{
          fontSize: '19px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        Preparando sua trilha
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Organizando os assuntos e os próximos passos para você começar a estudar.
      </p>
    </div>

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '280px',
        marginTop: '8px',
      }}
    >
      {[
        'Mapeando perfil de competências',
        'Selecionando referências pedagógicas',
        'Gerando roteiro modular',
      ].map((step, idx) => (
        <div
          key={step}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--apple-blue)',
              opacity: 0.8,
            }}
          />
          <span>{step}</span>
        </div>
      ))}
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   Quiz Component (Apple Design)
───────────────────────────────────────────── */
const Quiz = () => {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null)
        setError('Você precisa estar logado para realizar o diagnóstico.')
        return
      }
      setUser(u)
      setError('')
    })
    return () => unsub()
  }, [])

  const handleOption = (value) => {
    if (loading) return
    const newAnswers = { ...answers, [questions[step].id]: value }
    setAnswers(newAnswers)
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 110)
    } else {
      completeQuiz(newAnswers)
    }
  }

  const completeQuiz = async (finalAnswers) => {
    if (!user?.uid) {
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      const profile = {
        interestCode: finalAnswers[1],
        experienceCode: finalAnswers[2],
        goalCode: finalAnswers[3],
        interest: questions[0].options.find((o) => o.value === finalAnswers[1])?.label,
        experience: questions[1].options.find((o) => o.value === finalAnswers[2])?.label,
        goal: questions[2].options.find((o) => o.value === finalAnswers[3])?.label,
      }
      const api = API_URL
      const token = await user.getIdToken()

      const res = await fetch(`${api}/trilhas/gerar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile, uid: user.uid }),
      })
      const data = await res.json()
      if (res.ok && data.success && data.roadmap) {
        validatePersonalizedRoadmap(data.roadmap, profile)
        const savedResponse = await fetch(`${api}/trilhas/usuario/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        const saved = await savedResponse.json()
        if (!savedResponse.ok || !saved.success) {
          throw new Error('Não foi possível confirmar sua nova trilha. Tente novamente.')
        }
        validateSavedRoadmap(data.roadmap, saved.roadmap, profile)
        navigate('/roadmap')
      } else {
        throw new Error(data.message || 'Erro ao gerar sua trilha.')
      }
    } catch (err) {
      console.error('Error completing quiz:', err)
      setError(err.message || 'Não foi possível criar sua trilha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen />

  const q = questions[step]
  const QIcon = q.icon

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        color: 'var(--text-primary)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'var(--border)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={14} color="#f5f5f7" />
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.015em',
              }}
            >
              Intellectus
            </span>
          </div>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            Etapa {step + 1} de {questions.length}
          </span>
        </div>

        {/* Progress discrete track (Apple style) */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '9999px',
                background: 'var(--border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: '9999px',
                  background: i <= step ? 'var(--apple-blue)' : 'transparent',
                  transition: 'background-color 200ms ease',
                }}
              />
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px 24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Question Title & Icon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  background: 'var(--apple-blue-dim)',
                  border: '1px solid rgba(10, 132, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--apple-blue)',
                }}
              >
                <QIcon size={14} />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                }}
              >
                Diagnóstico Curricular
              </span>
            </div>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {q.title}
            </h1>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {q.subtitle}
            </p>
          </div>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {q.options.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => handleOption(opt.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '13px 16px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    transition:
                      'border-color 140ms ease, background-color 140ms ease, transform 90ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(10, 132, 255, 0.35)'
                    e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.backgroundColor = 'var(--card-bg)'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.985)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '9px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      flexShrink: 0,
                    }}
                  >
                    <opt.icon size={16} />
                  </div>
                  <span
                    style={{
                      flex: 1,
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {opt.label}
                  </span>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </button>
              ))}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 69, 58, 0.1)',
                border: '1px solid rgba(255, 69, 58, 0.25)',
                color: '#ff6961',
                fontSize: '12.5px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Quiz
