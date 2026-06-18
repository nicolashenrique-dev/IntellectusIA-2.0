import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, CheckCircle2, Play, ExternalLink,
  Loader2, Lock, AlertCircle, X, Bot, BookOpen
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

/* ─────────────────────────────────────────────
   Tokens — mesmo sistema do Dashboard e Quiz
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

  .rm-page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text-primary);
    font-family: system-ui, -apple-system, sans-serif;
    padding: 28px 32px;
    position: relative;
    overflow-x: hidden;
  }

  .rm-blob {
    position: fixed; border-radius: 50%;
    pointer-events: none; filter: blur(110px);
  }
  .rm-blob-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: rgba(99,102,241,0.07); }
  .rm-blob-2 { bottom: -10%; left: -5%; width: 500px; height: 500px; background: rgba(167,139,250,0.06); }

  /* ── Header ── */
  .rm-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 28px; position: relative; z-index: 10;
  }
  .rm-back-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 0.5px solid var(--border); background: var(--surface);
    color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, color .15s, border-color .15s;
    flex-shrink: 0;
  }
  .rm-back-btn:hover { background: var(--surface-hover); color: var(--text-primary); border-color: var(--border-hover); }

  .rm-logo {
    display: flex; align-items: center; gap: 8px; margin-right: 4px;
  }
  .rm-logo-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--indigo);
    display: flex; align-items: center; justify-content: center;
  }
  .rm-logo-text { font-size: 15px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.3px; }

  .rm-title-wrap { flex: 1; min-width: 0; }
  .rm-title {
    font-size: 20px; font-weight: 600; color: var(--text-primary);
    letter-spacing: -0.4px; margin: 0 0 2px; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .rm-subtitle { font-size: 13px; color: var(--text-secondary); margin: 0; }

  /* ── Meta badges ── */
  .rm-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; position: relative; z-index: 10; }
  .rm-badge {
    font-size: 11.5px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    background: var(--indigo-dim); border: 0.5px solid var(--indigo-border); color: #a5b4fc;
  }
  .rm-badge.purple { background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.25); color: #a78bfa; }

  /* ── Grid ── */
  .rm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    position: relative; z-index: 10;
    max-width: 1100px; margin: 0 auto;
  }

  /* ── Node card ── */
  .rm-node-card {
    background: var(--card-bg);
    border: 0.5px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    display: flex; flex-direction: column; gap: 10px;
    transition: border-color .15s, transform .15s, background .15s;
    cursor: pointer; position: relative; overflow: hidden;
  }
  .rm-node-card:hover:not(.locked) {
    border-color: var(--indigo-border);
    background: rgba(99,102,241,0.05);
    transform: translateY(-2px);
  }
  .rm-node-card.completed { border-color: rgba(52,211,153,0.2); background: rgba(52,211,153,0.03); }
  .rm-node-card.completed:hover { border-color: rgba(52,211,153,0.35); }
  .rm-node-card.in_progress { border-color: rgba(99,102,241,0.2); }
  .rm-node-card.locked { cursor: not-allowed; opacity: .45; }

  .rm-node-top { display: flex; align-items: center; justify-content: space-between; }
  .rm-node-num {
    font-size: 10.5px; font-weight: 600;
    letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted);
  }
  .rm-status-dot {
    width: 7px; height: 7px; border-radius: 50%;
  }
  .rm-status-dot.completed { background: #34d399; }
  .rm-status-dot.in_progress { background: var(--indigo); }
  .rm-status-dot.locked { background: var(--text-muted); }

  .rm-node-title { font-size: 14.5px; font-weight: 500; color: var(--text-primary); line-height: 1.4; margin: 0; }
  .rm-node-desc { font-size: 12.5px; color: var(--text-secondary); line-height: 1.55; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  .rm-node-footer {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: #a5b4fc;
    margin-top: 2px;
  }

  /* ── Top accent bar on card ── */
  .rm-node-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 12px 12px 0 0;
  }
  .rm-node-bar.completed { background: #34d399; }
  .rm-node-bar.in_progress { background: var(--indigo); }
  .rm-node-bar.locked { background: transparent; }

  /* ── Empty state ── */
  .rm-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center;
    padding: 72px 24px; gap: 12px; position: relative; z-index: 10;
  }
  .rm-empty-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--indigo-dim); display: flex;
    align-items: center; justify-content: center; color: #a5b4fc; margin-bottom: 4px;
  }
  .rm-empty h2 { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0; }
  .rm-empty p { font-size: 13px; color: var(--text-secondary); max-width: 300px; line-height: 1.6; margin: 0; }
  .rm-cta-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 0 16px; height: 36px;
    background: var(--indigo); border: none; border-radius: var(--radius-sm);
    color: #fff; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: opacity .15s; margin-top: 4px;
  }
  .rm-cta-btn:hover { opacity: .88; }

  /* ── Loading ── */
  .rm-loading {
    min-height: 100vh; background: var(--bg);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 14px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .rm-spinner {
    width: 36px; height: 36px; border: 2px solid var(--indigo-border);
    border-top-color: var(--indigo); border-radius: 50%;
    animation: rmspin .7s linear infinite;
  }
  @keyframes rmspin { to { transform: rotate(360deg); } }
  .rm-loading p { font-size: 13px; color: var(--text-secondary); margin: 0; }

  /* ── Modal overlay ── */
  .rm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(6px);
    z-index: 50;
    display: flex; align-items: flex-end; justify-content: center;
    padding: 0;
  }
  @media (min-width: 640px) {
    .rm-overlay { align-items: center; padding: 24px; }
  }

  /* ── Modal panel ── */
  .rm-modal {
    width: 100%; max-width: 580px;
    max-height: 90vh;
    background: #0d1526;
    border: 0.5px solid var(--border);
    border-radius: 12px 12px 0 0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  @media (min-width: 640px) {
    .rm-modal { border-radius: var(--radius); }
  }

  .rm-modal-bar { height: 2px; width: 100%; flex-shrink: 0; }
  .rm-modal-bar.completed { background: #34d399; }
  .rm-modal-bar.in-progress { background: var(--indigo); }

  .rm-modal-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 20px 20px 0; flex-shrink: 0; gap: 12px;
  }
  .rm-modal-eyebrow {
    font-size: 10.5px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;
  }
  .rm-modal-title { font-size: 18px; font-weight: 600; color: var(--text-primary); letter-spacing: -.3px; margin: 0; line-height: 1.35; }
  .rm-close-btn {
    width: 30px; height: 30px; border-radius: var(--radius-sm); flex-shrink: 0;
    border: 0.5px solid var(--border); background: var(--surface);
    color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, color .15s;
  }
  .rm-close-btn:hover { background: var(--surface-hover); color: var(--text-primary); }

  .rm-modal-desc {
    padding: 12px 20px 16px; flex-shrink: 0;
    font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;
  }

  /* ── Videos section ── */
  .rm-videos {
    flex: 1; overflow-y: auto; padding: 0 20px 8px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .rm-videos-header {
    display: flex; align-items: center; gap: 7px; margin-bottom: 12px;
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--text-muted);
  }
  .rm-video-row {
    display: flex; gap: 12px; padding: 10px;
    border-radius: var(--radius-sm);
    border: 0.5px solid transparent;
    text-decoration: none;
    transition: background .15s, border-color .15s;
    cursor: pointer;
  }
  .rm-video-row:hover {
    background: var(--surface-hover);
    border-color: var(--border);
  }
  .rm-thumb-wrap {
    width: 112px; height: 63px; border-radius: 7px;
    overflow: hidden; flex-shrink: 0; background: #0a0f1e;
    position: relative;
  }
  .rm-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .rm-thumb-play {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .15s;
  }
  .rm-video-row:hover .rm-thumb-play { opacity: 1; }
  .rm-video-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 3px; }
  .rm-video-title {
    font-size: 13px; font-weight: 500; color: var(--text-primary);
    line-height: 1.4; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    transition: color .15s;
  }
  .rm-video-row:hover .rm-video-title { color: #a5b4fc; }
  .rm-video-channel {
    font-size: 11.5px; color: var(--text-muted);
    display: flex; align-items: center; gap: 4px;
  }

  .rm-videos-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 40px 0; gap: 10px;
    color: var(--text-muted); font-size: 13px;
  }
  .rm-videos-error {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px; border-radius: var(--radius-sm);
    background: rgba(239,68,68,0.06);
    border: 0.5px solid rgba(239,68,68,0.2);
    color: #f87171; font-size: 12.5px;
  }
  .rm-videos-empty { text-align: center; padding: 40px 0; font-size: 13px; color: var(--text-muted); }

  /* ── Modal footer ── */
  .rm-modal-footer {
    flex-shrink: 0;
    border-top: 0.5px solid var(--border);
    padding: 14px 20px;
    display: flex; gap: 8px;
  }
  .rm-btn-secondary {
    flex: 1; padding: 9px;
    background: var(--surface); border: 0.5px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-secondary);
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: inherit; transition: background .15s, color .15s;
  }
  .rm-btn-secondary:hover { background: var(--surface-hover); color: var(--text-primary); }
  .rm-btn-primary {
    flex: 1; padding: 9px;
    background: var(--indigo); border: none;
    border-radius: var(--radius-sm); color: #fff;
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: inherit; transition: opacity .15s;
  }
  .rm-btn-primary:hover { opacity: .88; }
  .rm-btn-primary.desmarcar {
    background: var(--surface); border: 0.5px solid var(--border); color: var(--text-secondary);
  }
  .rm-btn-primary.desmarcar:hover { color: var(--text-primary); background: var(--surface-hover); }
`

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const statusLabel = {
  completed:   'Concluído',
  'in-progress': 'Em andamento',
  in_progress:   'Em andamento',
  locked:      'Bloqueado',
}

const normalizeStatus = (s) => {
  if (s === 'in-progress') return 'in_progress'
  return s || 'in_progress'
}

/* ─────────────────────────────────────────────
   Roadmap
───────────────────────────────────────────── */
const Roadmap = () => {
  const navigate = useNavigate()
  const [roadmap, setRoadmap]               = useState(null)
  const [noSelecionado, setNoSelecionado]   = useState(null)
  const [videos, setVideos]                 = useState([])
  const [carregandoVideos, setCarregandoVideos] = useState(false)
  const [erroVideos, setErroVideos]         = useState(false)
  const [carregandoRoadmap, setCarregandoRoadmap] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) fetchRoadmap(u.uid)
      else navigate('/login')
    })
    return () => unsub()
  }, [navigate])

  const fetchRoadmap = async (uid) => {
    setCarregandoRoadmap(true)
    try {
      const api = import.meta.env.VITE_API_URL || 'https://projeto-sem.vercel.app'
      const r = await fetch(`${api}/roadmap/user/${uid}`)
      const d = await r.json()
      setRoadmap(d.success && d.roadmap ? d.roadmap : null)
    } catch (e) {
      console.error('Erro ao carregar roadmap:', e)
    } finally {
      setCarregandoRoadmap(false)
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
      if (d.success) setVideos(d.videos)
      else setErroVideos(true)
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
        if (auth.currentUser) fetchRoadmap(auth.currentUser.uid)
        if (noSelecionado?.id === nodeId) setNoSelecionado({ ...noSelecionado, status: newStatus })
      }
    } catch (e) {
      console.error('Erro ao atualizar status:', e)
    }
  }

  const abrirNo = (no) => {
    if (no.status === 'locked') return
    setNoSelecionado(no)
    buscarVideos(no.label, roadmap?.level || '')
  }

  const fecharModal = () => { setNoSelecionado(null); setVideos([]) }

  /* ── Loading ── */
  if (carregandoRoadmap) return (
    <>
      <style>{css}</style>
      <div className="rm-loading">
        <div className="rm-spinner" />
        <p>Carregando sua trilha...</p>
      </div>
    </>
  )

  return (
    <>
      <style>{css}</style>
      <div className="rm-page">
        <div className="rm-blob rm-blob-1" />
        <div className="rm-blob rm-blob-2" />

        {/* Header */}
        <header className="rm-header">
          <button className="rm-back-btn" onClick={() => navigate('/dashboard')} aria-label="Voltar">
            <ChevronLeft size={18} />
          </button>
          <div className="rm-logo">
            <div className="rm-logo-icon"><BookOpen size={14} color="#fff" /></div>
            <span className="rm-logo-text">Intelectus</span>
          </div>
          <div className="rm-title-wrap">
            <h1 className="rm-title">{roadmap?.title || 'Sua Trilha'}</h1>
            <p className="rm-subtitle">{roadmap?.description || 'Clique em um módulo para ver os conteúdos.'}</p>
          </div>
        </header>

        {/* Meta */}
        {roadmap && (
          <div className="rm-meta">
            <span className="rm-badge">{roadmap.nodes?.length || 0} módulos</span>
            {roadmap.level && <span className="rm-badge">{roadmap.level}</span>}
            {roadmap.fonte === 'ollama' && (
              <span className="rm-badge purple" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Bot size={12} /> Gerado por IA
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {!roadmap ? (
          <div className="rm-empty">
            <div className="rm-empty-icon"><AlertCircle size={24} /></div>
            <h2>Nenhuma trilha encontrada</h2>
            <p>Complete o quiz para que a IA monte sua trilha personalizada.</p>
            <button className="rm-cta-btn" onClick={() => navigate('/quiz')}>Ir para o quiz</button>
          </div>
        ) : (
          <div className="rm-grid">
            {roadmap.nodes?.map((no, idx) => {
              const st = normalizeStatus(no.status)
              return (
                <motion.div
                  key={no.id}
                  className={`rm-node-card ${st}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.045 }}
                  onClick={() => abrirNo(no)}
                >
                  <div className={`rm-node-bar ${st}`} />

                  <div className="rm-node-top">
                    <span className="rm-node-num">Módulo {String(idx + 1).padStart(2, '0')}</span>
                    {st === 'completed'   && <CheckCircle2 size={15} color="#34d399" />}
                    {st === 'locked'      && <Lock size={14} color="var(--text-muted)" />}
                    {st === 'in_progress' && <span className="rm-status-dot in_progress" />}
                  </div>

                  <p className="rm-node-title">{no.label}</p>
                  {no.description && <p className="rm-node-desc">{no.description}</p>}

                  {st !== 'locked' && (
                    <div className="rm-node-footer">
                      <Play size={11} fill="currentColor" />
                      Ver conteúdo
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {noSelecionado && (
            <div
              className="rm-overlay"
              onClick={(e) => { if (e.target === e.currentTarget) fecharModal() }}
            >
              <motion.div
                className="rm-modal"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              >
                {/* Top accent */}
                <div className={`rm-modal-bar ${noSelecionado.status}`} />

                {/* Header */}
                <div className="rm-modal-header">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="rm-modal-eyebrow">{statusLabel[noSelecionado.status] || 'Em andamento'}</p>
                    <h2 className="rm-modal-title">{noSelecionado.label}</h2>
                  </div>
                  <button className="rm-close-btn" onClick={fecharModal} aria-label="Fechar">
                    <X size={15} />
                  </button>
                </div>

                {/* Description */}
                {noSelecionado.description && (
                  <p className="rm-modal-desc">{noSelecionado.description}</p>
                )}

                {/* Videos */}
                <div className="rm-videos">
                  <div className="rm-videos-header">
                    <Play size={12} fill="currentColor" style={{ color: '#a5b4fc' }} />
                    Conteúdo recomendado
                  </div>

                  {carregandoVideos ? (
                    <div className="rm-videos-loading">
                      <div className="rm-spinner" />
                      <span>Buscando tutoriais no YouTube...</span>
                    </div>
                  ) : erroVideos ? (
                    <div className="rm-videos-error">
                      <AlertCircle size={16} />
                      Erro ao carregar vídeos. Verifique sua conexão.
                    </div>
                  ) : videos.length > 0 ? (
                    videos.map((v) => (
                      <a
                        key={v.id}
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rm-video-row"
                      >
                        <div className="rm-thumb-wrap">
                          <img src={v.thumbnail} alt={v.titulo} />
                          <div className="rm-thumb-play">
                            <Play size={16} color="#fff" fill="#fff" />
                          </div>
                        </div>
                        <div className="rm-video-meta">
                          <span className="rm-video-title">{v.titulo}</span>
                          <span className="rm-video-channel">
                            {v.canal}
                            <ExternalLink size={10} />
                          </span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="rm-videos-empty">Nenhum vídeo encontrado para este módulo.</div>
                  )}
                </div>

                {/* Footer */}
                <div className="rm-modal-footer">
                  <button className="rm-btn-secondary" onClick={fecharModal}>Voltar</button>
                  <button
                    className={`rm-btn-primary${noSelecionado.status === 'completed' ? ' desmarcar' : ''}`}
                    onClick={() => toggleStatus(noSelecionado.id, noSelecionado.status)}
                  >
                    {noSelecionado.status === 'completed' ? 'Desmarcar' : 'Concluir módulo'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default Roadmap
