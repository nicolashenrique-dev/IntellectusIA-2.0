import VideoLink from '../components/VideoLink'
import { API_URL } from '../utils/api'
import { fetchComAuth } from '../utils/authToken'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  CheckCircle2,
  Play,
  ExternalLink,
  Lock,
  AlertCircle,
  X,
  BookOpen,
  Trophy,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const normalizeStatus = (s) => (s === 'in-progress' ? 'in_progress' : s || 'in_progress')
const statusLabel = { completed: 'Concluído', in_progress: 'Em andamento', locked: 'Bloqueado' }

const Roadmap = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [notificacaoPontos, setNotificacaoPontos] = useState(null)
  const [savingProgress, setSavingProgress] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      setUser(u)
      fetchRoadmap(u.uid)
    })
    return () => unsub()
  }, [navigate])

  const fetchRoadmap = async (uid) => {
    setLoading(true)
    setLoadError(false)
    try {
      const api = API_URL
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch(`${api}/trilhas/usuario/${uid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok && res.status !== 404) throw new Error('Falha ao carregar')
      const data = await res.json()
      setRoadmap(data.success && data.roadmap ? data.roadmap : null)
      setCurrentPoints(data.pontuacao?.pontos || 0)
    } catch (err) {
      console.error('Erro ao carregar trilha:', err)
      setRoadmap(null)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchVideos = async (nodeLabel, level) => {
    setLoadingVideos(true)
    setVideoError(false)
    setVideos([])
    try {
      const api = API_URL
      const res = await fetchComAuth(
        `${api}/ia/videos?tema=${encodeURIComponent(nodeLabel)}&nivel=${encodeURIComponent(level || '')}`,
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.success) {
        setVideos(data.videos)
      } else {
        setVideoError(true)
      }
    } catch {
      setVideoError(true)
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleNodeClick = (node) => {
    if (node.status === 'locked') return
    setSelectedNode(node)
    fetchVideos(node.label, node.level || roadmap?.level || '')
  }

  const closeModal = () => {
    setSelectedNode(null)
    setVideos([])
  }

  const toggleStatus = async (nodeId, currentStatus) => {
    if (savingProgress) return
    setSavingProgress(true)
    const newStatus = currentStatus === 'completed' ? 'in-progress' : 'completed'
    try {
      const api = API_URL
      const r = await fetchComAuth(`${api}/trilhas/no/${nodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          uid: user?.uid,
          nome: user?.displayName || null,
        }),
      })
      const d = await r.json()
      if (!r.ok || !d.success)
        throw new Error(d.message || 'Não foi possível salvar seu progresso.')
      if (d.success) {
        setCurrentPoints(d.totalPontos)
        setRoadmap(d.roadmap)
        if (selectedNode?.id === nodeId) {
          setSelectedNode(d.node)
        }

        if (d.pontosGanhos > 0) {
          setNotificacaoPontos({
            pontos: d.pontosGanhos,
            total: d.totalPontos,
            bonus: d.trilhaCompleta,
          })
          setTimeout(() => setNotificacaoPontos(null), 4500)
        }
      }
    } catch (e) {
      console.error(e)
      window.alert(e.message || 'Não foi possível salvar seu progresso. Tente novamente.')
    } finally {
      setSavingProgress(false)
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--text-secondary)',
          fontSize: '13.5px',
        }}
      >
        <div
          className="dash-spinner"
          style={{ width: 22, height: 22, borderTopColor: 'var(--apple-blue)' }}
        />
        <span>Carregando sua grade curricular...</span>
      </div>
    )
  }

  const completedCount = roadmap?.nodes?.filter((n) => n.status === 'completed').length || 0

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        padding: '32px 36px',
        position: 'relative',
      }}
    >
      <AnimatePresence>
        {notificacaoPontos && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 9999,
              background:
                'linear-gradient(135deg, rgba(10, 132, 255, 0.96), rgba(48, 209, 88, 0.96))',
              color: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 22px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              🎉
            </div>
            <div>
              <strong style={{ fontSize: '15px', fontWeight: 600, display: 'block' }}>
                +{notificacaoPontos.pontos} Pontos Conquistados!
              </strong>
              <span style={{ fontSize: '12.5px', opacity: 0.92 }}>
                {notificacaoPontos.bonus
                  ? '🏆 Bônus: Trilha 100% concluída!'
                  : `Total acumulado: ${notificacaoPontos.total} pts`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
          maxWidth: '1100px',
          margin: '0 auto 28px',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 120ms ease',
          }}
          title="Voltar ao Dashboard"
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={14} color="#f5f5f7" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Intellectus
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {roadmap?.title || 'Grade Curricular'}
          </h1>
        </div>

        {roadmap && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="dash-badge blue">{roadmap.nodes?.length || 0} módulos</span>
            {roadmap.level && <span className="dash-badge">{roadmap.level}</span>}
            <span
              className="dash-badge"
              style={{
                background: 'var(--apple-blue-dim)',
                border: '1px solid var(--apple-blue-border)',
                color: 'var(--apple-blue)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Trophy size={12} /> {currentPoints} pts acumulados
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!roadmap ? (
        <div className="dash-empty" style={{ maxWidth: '440px', margin: '80px auto' }}>
          <div className="dash-empty-icon">
            <AlertCircle size={22} />
          </div>
          <h2>Nenhuma trilha ativa encontrada</h2>
          <p>Realize a avaliação inicial para estruturar sua grade de aprendizado personalizada.</p>
          <button
            className="btn-apple-primary"
            onClick={() => navigate('/quiz')}
            style={{ marginTop: 8 }}
          >
            Realizar Diagnóstico
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {roadmap.nodes?.map((node, idx) => {
            const st = normalizeStatus(node.status)
            const isCompleted = st === 'completed'
            const isInProgress = st === 'in_progress'

            return (
              <motion.div
                key={node.id}
                role="button"
                tabIndex={node.status === 'locked' ? -1 : 0}
                aria-disabled={node.status === 'locked'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleNodeClick(node)
                  }
                }}
                onClick={() => handleNodeClick(node)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.035, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  background: 'var(--card-bg)',
                  border: isCompleted
                    ? '1px solid rgba(48, 209, 88, 0.25)'
                    : isInProgress
                      ? '1px solid rgba(10, 132, 255, 0.28)'
                      : '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: st === 'locked' ? 'not-allowed' : 'pointer',
                  opacity: st === 'locked' ? 0.45 : 1,
                  boxShadow:
                    '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 140ms ease, background-color 140ms ease',
                }}
                whileHover={st !== 'locked' ? { y: -2 } : {}}
                whileTap={st !== 'locked' ? { scale: 0.98 } : {}}
              >
                {/* Accent top highlight */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: isCompleted
                      ? '#30d158'
                      : isInProgress
                        ? 'var(--apple-blue)'
                        : 'transparent',
                  }}
                />

                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Módulo {String(idx + 1).padStart(2, '0')}
                  </span>
                  {isCompleted && <CheckCircle2 size={16} color="#30d158" />}
                  {isInProgress && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'var(--apple-blue)',
                        boxShadow: '0 0 8px rgba(10, 132, 255, 0.6)',
                      }}
                    />
                  )}
                  {st === 'locked' && <Lock size={14} color="#6e6e73" />}
                </div>

                <h3
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {node.label}
                </h3>

                {node.description && (
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {node.description}
                  </p>
                )}

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '11.5px',
                    color: isCompleted
                      ? '#30d158'
                      : isInProgress
                        ? 'var(--apple-blue)'
                        : 'var(--text-muted)',
                  }}
                >
                  <span>{statusLabel[st] || 'Disponível'}</span>
                  <Play size={12} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal Sheet for Node Details & Lessons */}
      <AnimatePresence>
        {selectedNode && (
          <div
            onClick={closeModal}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '85vh',
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '18px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '22px 24px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Conteúdo do Módulo
                  </span>
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                      marginTop: '4px',
                    }}
                  >
                    {selectedNode.label}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Body / Videos list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Aulas e Referências Recomendadas
                  </span>
                  <button
                    onClick={() => toggleStatus(selectedNode.id, selectedNode.status)}
                    disabled={savingProgress}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: selectedNode.status === 'completed' ? '#ff453a' : '#30d158',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {selectedNode.status === 'completed'
                      ? 'Marcar como não concluído'
                      : 'Marcar como concluído ✓'}
                  </button>
                </div>

                {loadingVideos ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '40px 0',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    <div className="dash-spinner" style={{ width: 18, height: 18 }} />
                    <span>Buscando materiais pedagógicos...</span>
                  </div>
                ) : videoError ? (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(255, 69, 58, 0.08)',
                      border: '1px solid rgba(255, 69, 58, 0.2)',
                      color: '#ff6961',
                      fontSize: '13px',
                    }}
                  >
                    Não foi possível carregar os vídeos deste módulo.
                    <div className="video-recovery">
                      <button
                        className="text-button"
                        onClick={() =>
                          fetchVideos(selectedNode.label, selectedNode.level || roadmap?.level)
                        }
                      >
                        Tentar novamente
                      </button>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedNode.label} ${selectedNode.level || roadmap?.level || ''} aula português`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Pesquisar no YouTube ↗
                      </a>
                    </div>
                  </div>
                ) : videos.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px 0',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    A busca automática não encontrou vídeos disponíveis agora.
                    <div className="video-recovery">
                      <button
                        className="text-button"
                        onClick={() =>
                          fetchVideos(selectedNode.label, selectedNode.level || roadmap?.level)
                        }
                      >
                        Tentar novamente
                      </button>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedNode.label} ${selectedNode.level || roadmap?.level || ''} aula português`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Pesquisar este módulo no YouTube ↗
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {videos.map((vid) => (
                      <VideoLink
                        video={vid}
                        key={vid.id}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          gap: '14px',
                          padding: '10px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.025)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          textDecoration: 'none',
                          color: 'var(--text-primary)',
                          transition: 'background-color 120ms ease, border-color 120ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.025)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        <div
                          style={{
                            width: '108px',
                            height: '62px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#000',
                            flexShrink: 0,
                            position: 'relative',
                          }}
                        >
                          <img
                            src={vid.thumbnail || vid.thumb}
                            alt={vid.titulo || vid.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Play size={14} color="#fff" />
                          </div>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '3px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {vid.titulo || vid.title}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {vid.canal || vid.channel}
                          </span>
                        </div>
                        <ExternalLink
                          size={14}
                          style={{ color: 'var(--text-muted)', alignSelf: 'center', flexShrink: 0 }}
                        />
                      </VideoLink>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Roadmap
