import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Play, ExternalLink, Lock, AlertCircle, X, Bot, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

const normalizeStatus = (s) => s === 'in-progress' ? 'in_progress' : (s || 'in_progress')
const statusLabel = { completed: 'Concluído', in_progress: 'Em andamento', locked: 'Bloqueado' }

const MinhasTrilhasPage = () => {
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noSelecionado, setNoSelecionado] = useState(null)
  const [videos, setVideos] = useState([])
  const [carregandoVideos, setCarregandoVideos] = useState(false)
  const [erroVideos, setErroVideos] = useState(false)

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
    } catch (e) {
      setRoadmap(null)
    } finally {
      setLoading(false)
    }
  }

  const buscarVideos = async (tema, nivel) => {
    setCarregandoVideos(true)
    setErroVideos(false)
    setVideos([])
    try {
      const api = import.meta.env.VITE_API_URL || 'https://projeto-sem.vercel.app'
      const r = await fetch(`${api}/ia/videos?tema=${encodeURIComponent(tema)}&nivel=${encodeURIComponent(nivel || '')}`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      d.success ? setVideos(d.videos) : setErroVideos(true)
    } catch {
      setErroVideos(true)
    } finally {
      setCarregandoVideos(false)
    }
  }

  const toggleStatus = async (nodeId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'in-progress' : 'completed'
    try {
      const api = import.meta.env.VITE_API_URL || 'https://projeto-sem.vercel.app'
      const r = await fetch(`${api}/roadmap/node/${nodeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, uid: auth.currentUser?.uid }),
      })
      const d = await r.json()
      if (d.success) {
        fetchRoadmap(auth.currentUser.uid)
        if (noSelecionado?.id === nodeId) setNoSelecionado({ ...noSelecionado, status: newStatus })
      }
    } catch (e) { console.error(e) }
  }

  const abrirNo = (no) => {
    if (no.status === 'locked') return
    setNoSelecionado(no)
    buscarVideos(no.label, roadmap?.level || '')
  }

  const fecharModal = () => { setNoSelecionado(null); setVideos([]) }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>
      <div className="dash-spinner" /> Carregando trilha...
    </div>
  )

  if (!roadmap) return (
    <div className="dash-empty">
      <div className="dash-empty-icon"><AlertCircle size={24} /></div>
      <h2>Nenhuma trilha encontrada</h2>
      <p>Complete o quiz para que a IA monte sua trilha personalizada.</p>
      <button className="dash-cta-btn" onClick={() => navigate('/quiz')} style={{ marginTop: 4 }}>
        <Sparkles size={15} /> Ir para o quiz
      </button>
    </div>
  )

  return (
    <>
      {/* Título da seção */}
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-.3px', margin: 0 }}>
          {roadmap.title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {roadmap.description || 'Clique em um módulo para ver os conteúdos.'}
        </p>
      </div>

      {/* Meta badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="dash-badge">{roadmap.nodes?.length || 0} módulos</span>
        {roadmap.level && <span className="dash-badge">{roadmap.level}</span>}
      </div>

      {/* Grid de nós — reutiliza classes do Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {roadmap.nodes?.map((no, idx) => {
          const st = normalizeStatus(no.status)
          const borderColor = st === 'completed' ? 'rgba(52,211,153,0.3)' : st === 'in_progress' ? 'var(--indigo-border)' : 'var(--border)'
          const topBar = st === 'completed' ? '#34d399' : st === 'in_progress' ? 'var(--indigo)' : 'transparent'

          return (
            <motion.div
              key={no.id}
              onClick={() => abrirNo(no)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              style={{
                background: 'var(--card-bg)',
                border: `0.5px solid ${borderColor}`,
                borderRadius: 'var(--radius)',
                padding: 18,
                display: 'flex', flexDirection: 'column', gap: 10,
                cursor: st === 'locked' ? 'not-allowed' : 'pointer',
                opacity: st === 'locked' ? 0.45 : 1,
                position: 'relative', overflow: 'hidden',
                transition: 'border-color .15s',
              }}
            >
              {/* Barra de topo colorida */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: topBar, borderRadius: '12px 12px 0 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Módulo {String(idx + 1).padStart(2, '0')}
                </span>
                {st === 'completed'   && <CheckCircle2 size={15} color="#34d399" />}
                {st === 'locked'      && <Lock size={14} color="var(--text-muted)" />}
                {st === 'in_progress' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--indigo)', display: 'inline-block' }} />}
              </div>

              <p style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, margin: 0 }}>{no.label}</p>
              {no.description && (
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {no.description}
                </p>
              )}

              {st !== 'locked' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#a5b4fc', marginTop: 2 }}>
                  <Play size={11} fill="currentColor" /> Ver conteúdo
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {noSelecionado && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) fecharModal() }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(6px)',
              zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{
                width: '100%', maxWidth: 560,
                maxHeight: '88vh',
                background: '#0d1526',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Barra topo */}
              <div style={{ height: 2, background: noSelecionado.status === 'completed' ? '#34d399' : 'var(--indigo)' }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 20px 0', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px' }}>
                    {statusLabel[normalizeStatus(noSelecionado.status)]}
                  </p>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-.3px', margin: 0 }}>
                    {noSelecionado.label}
                  </h2>
                </div>
                <button onClick={fecharModal} style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <X size={15} />
                </button>
              </div>

              {noSelecionado.description && (
                <p style={{ padding: '12px 20px 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {noSelecionado.description}
                </p>
              )}

              {/* Vídeos */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <Play size={12} fill="currentColor" style={{ color: '#a5b4fc' }} /> Conteúdo recomendado
                </div>

                {carregandoVideos ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                    <div className="dash-spinner" /> Buscando tutoriais...
                  </div>
                ) : erroVideos ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12.5 }}>
                    <AlertCircle size={16} /> Erro ao carregar vídeos.
                  </div>
                ) : videos.length > 0 ? (
                  videos.map((v) => (
                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', gap: 12, padding: 10, borderRadius: 'var(--radius-sm)', border: '0.5px solid transparent', textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 112, height: 63, borderRadius: 7, overflow: 'hidden', flexShrink: 0, background: '#0a0f1e' }}>
                        <img src={v.thumbnail} alt={v.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{v.titulo}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {v.canal} <ExternalLink size={10} />
                        </span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text-muted)' }}>
                    Nenhum vídeo encontrado.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ borderTop: '0.5px solid var(--border)', padding: '14px 20px', display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={fecharModal} style={{ flex: 1, padding: 9, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Voltar
                </button>
                <button
                  onClick={() => toggleStatus(noSelecionado.id, noSelecionado.status)}
                  style={{ flex: 1, padding: 9, background: noSelecionado.status === 'completed' ? 'var(--surface)' : 'var(--indigo)', border: noSelecionado.status === 'completed' ? '0.5px solid var(--border)' : 'none', borderRadius: 'var(--radius-sm)', color: noSelecionado.status === 'completed' ? 'var(--text-secondary)' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {noSelecionado.status === 'completed' ? 'Desmarcar' : 'Concluir módulo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MinhasTrilhasPage
