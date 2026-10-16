import { API_URL } from '../utils/api'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Zap, Award, Trophy } from 'lucide-react'
import { auth } from '../firebase'

const ProgressoPage = () => {
  const [roadmap, setRoadmap] = useState(null)
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const u = auth.currentUser
    if (u) fetchRoadmap(u.uid)
  }, [])

  const fetchRoadmap = async (uid) => {
    setLoading(true)
    setLoadError(false)
    try {
      const api = API_URL
      const token = await auth.currentUser?.getIdToken()
      const r = await fetch(`${api}/trilhas/usuario/${uid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!r.ok && r.status !== 404) throw new Error('Falha ao carregar')
      const d = await r.json()
      setRoadmap(d.success && d.roadmap ? d.roadmap : null)
      setUserPoints(d.pontuacao?.pontos || 0)
    } catch {
      setRoadmap(null)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loadError && !loading)
    return (
      <div className="form-message error" role="alert">
        Não foi possível carregar sua trilha.{' '}
        <button className="text-button" onClick={() => fetchRoadmap(auth.currentUser?.uid)}>
          Tentar novamente
        </button>
      </div>
    )

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--text-muted)',
          fontSize: 13.5,
          padding: '32px 0',
        }}
      >
        <div className="dash-spinner" />
        <span>Carregando métricas de progresso...</span>
      </div>
    )

  const nodes = roadmap?.nodes || []
  const total = nodes.length
  const completed = nodes.filter((n) => n.status === 'completed').length
  const inProgress = nodes.filter((n) => ['in_progress', 'in-progress'].includes(n.status)).length
  const locked = total - completed - inProgress
  const pct = total ? Math.round((completed / total) * 100) : 0

  const areas = [
    {
      label: 'Módulos Concluídos',
      value: completed,
      total,
      color: '#30d158',
      icon: <CheckCircle2 size={15} />,
    },
    {
      label: 'Em Desenvolvimento',
      value: inProgress,
      total,
      color: 'var(--apple-blue)',
      icon: <Zap size={15} />,
    },
    {
      label: 'Módulos Subsequentes',
      value: locked,
      total,
      color: 'var(--text-muted)',
      icon: <Clock size={15} />,
    },
  ]

  const r = 50
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Seu progresso
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
          Cada módulo concluído é um passo a mais na sua trilha.
        </p>
      </div>

      {/* Cards de métricas principais */}
      <div className="dash-stats">
        {[
          { icon: <CheckCircle2 size={14} />, label: 'Concluídos', value: `${completed}/${total}` },
          { icon: <Clock size={14} />, label: 'Em andamento', value: inProgress },
          { icon: <Trophy size={14} />, label: 'Pontos Acumulados', value: `${userPoints} pts` },
          { icon: <Award size={14} />, label: 'Aproveitamento', value: `${pct}%` },
        ].map(({ icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
            className="dash-stat-card"
          >
            <div className="dash-stat-label">
              {icon}
              <span>{label}</span>
            </div>
            <div className="dash-stat-value">{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Painéis: Anel de Atividade + Distribuição */}
      <div className="dash-two-col">
        {/* Anel de aproveitamento geral */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          style={{ alignItems: 'center', justifyContent: 'center', gap: 18, padding: '28px 20px' }}
        >
          <div
            style={{
              position: 'relative',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="120"
              height="120"
              style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
            >
              <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="var(--apple-blue)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.9s var(--ease-out)' }}
              />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                {pct}%
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>total</span>
            </div>
          </div>
          {roadmap?.title && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                textAlign: 'center',
                lineHeight: 1.45,
                margin: 0,
                maxWidth: 260,
              }}
            >
              {roadmap.title}
            </p>
          )}
        </motion.div>

        {/* Distribuição por status */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, ease: [0.23, 1, 0.32, 1] }}
          style={{ gap: 20 }}
        >
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em',
            }}
          >
            Composição da Grade
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {areas.map(({ label, value, color, icon }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span
                    style={{
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ color }}>{icon}</span>
                    {label}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {value} de {total}
                  </span>
                </div>
                <div className="dash-bar-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: total ? `${(value / total) * 100}%` : '0%' }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    style={{ height: '100%', borderRadius: '9999px', background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lista estruturada de módulos */}
      <motion.div
        className="dash-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em',
            }}
          >
            Detalhamento por Módulo
          </span>
          <span className="dash-badge">{total} módulos</span>
        </div>

        {nodes.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '32px 0',
            }}
          >
            Nenhuma trilha ativa registrada. Inicie seu diagnóstico para gerar o cronograma.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nodes.map((node, i) => {
              const st = ['in-progress', 'in_progress'].includes(node.status)
                ? 'in_progress'
                : node.status
              const color =
                st === 'completed'
                  ? '#30d158'
                  : st === 'in_progress'
                    ? 'var(--apple-blue)'
                    : 'var(--text-muted)'
              const label =
                st === 'completed'
                  ? 'Concluído'
                  : st === 'in_progress'
                    ? 'Em andamento'
                    : 'Pendente'
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.025, ease: [0.23, 1, 0.32, 1] }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        color: 'var(--text-muted)',
                        width: 22,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {node.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color,
                    }}
                  >
                    {label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </>
  )
}

export default ProgressoPage
