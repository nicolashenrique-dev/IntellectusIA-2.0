import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, CheckCircle2, Clock, Zap, Flame,
  Target, Calendar, Award, BarChart2
} from 'lucide-react'
import { auth } from '../firebase'

const ProgressoPage = () => {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = auth.currentUser
    if (u) fetchRoadmap(u.uid)
  }, [])

  const fetchRoadmap = async (uid) => {
    setLoading(true)
    try {
      const api = import.meta.env.VITE_API_URL || 'https://projeto-sem.vercel.app'
      const r = await fetch(`${api}/roadmap/user/${uid}`)
      const d = await r.json()
      setRoadmap(d.success && d.roadmap ? d.roadmap : null)
    } catch {
      setRoadmap(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>
      <div className="dash-spinner" /> Carregando progresso...
    </div>
  )

  const nodes = roadmap?.nodes || []
  const total = nodes.length
  const completed = nodes.filter(n => n.status === 'completed').length
  const inProgress = nodes.filter(n => ['in_progress', 'in-progress'].includes(n.status)).length
  const locked = total - completed - inProgress
  const pct = total ? Math.round((completed / total) * 100) : 0

  const areas = [
    { label: 'Concluídos', value: completed, total, color: '#34d399', icon: <CheckCircle2 size={15} /> },
    { label: 'Em andamento', value: inProgress, total, color: '#6366f1', icon: <Zap size={15} /> },
    { label: 'Bloqueados', value: locked, total, color: '#475569', icon: <Clock size={15} /> },
  ]

  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  return (
    <>
      {/* Título */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-.3px', margin: 0 }}>
          Seu Progresso
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Acompanhe sua evolução na trilha atual.
        </p>
      </div>

      {/* Cards de stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: <CheckCircle2 size={14} />, label: 'Concluídos', value: `${completed}/${total}` },
          { icon: <Clock size={14} />,        label: 'Tempo de estudo', value: '12h' },
          { icon: <Flame size={14} />,        label: 'Sequência', value: '7d' },
          { icon: <Award size={14} />,        label: 'Progresso geral', value: `${pct}%` },
        ].map(({ icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="dash-stat-card"
          >
            <div className="dash-stat-label">{icon}<span>{label}</span></div>
            <div className="dash-stat-value">{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Dois painéis: anel + barras */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>

        {/* Anel de progresso */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ alignItems: 'center', justifyContent: 'center', gap: 20, padding: 28 }}
        >
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={r} fill="none"
              stroke="var(--indigo)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px', display: 'block' }}>
              {pct}%
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>concluído</span>
          </div>
          {roadmap?.title && (
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              {roadmap.title}
            </p>
          )}
        </motion.div>

        {/* Barras por status */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ gap: 20 }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Distribuição dos módulos</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {areas.map(({ label, value, color, icon }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color }}>{icon}</span>{label}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{value} de {total}</span>
                </div>
                <div className="dash-bar-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: total ? `${(value / total) * 100}%` : '0%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 10, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lista de módulos com status */}
      <motion.div
        className="dash-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Módulos da trilha</span>
          <span className="dash-badge">{total} total</span>
        </div>

        {nodes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
            Nenhuma trilha ativa. Crie uma no quiz!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nodes.map((node, i) => {
              const st = ['in-progress', 'in_progress'].includes(node.status) ? 'in_progress' : node.status
              const color = st === 'completed' ? '#34d399' : st === 'in_progress' ? '#6366f1' : '#475569'
              const label = st === 'completed' ? 'Concluído' : st === 'in_progress' ? 'Em andamento' : 'Bloqueado'
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.03 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--surface)', border: '0.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '9px 12px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                    {node.label}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${color}18`, border: `0.5px solid ${color}44`, color }}>
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
