import VideoLink from '../components/VideoLink'
import { API_URL } from '../utils/api'
import { fetchComAuth } from '../utils/authToken'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Play,
  ExternalLink,
  Lock,
  AlertCircle,
  X,
  Compass,
  Trophy,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

const normalizeStatus = (s) => (s === 'in-progress' ? 'in_progress' : s || 'in_progress')
const statusLabel = { completed: 'Concluído', in_progress: 'Em andamento', locked: 'Bloqueado' }

const MinhasTrilhasPage = () => {
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [noSelecionado, setNoSelecionado] = useState(null)
  const [videos, setVideos] = useState([])
  const [carregandoVideos, setCarregandoVideos] = useState(false)
  const [erroVideos, setErroVideos] = useState(false)
  const [notificacaoPontos, setNotificacaoPontos] = useState(null)
  const [savingProgress, setSavingProgress] = useState(false)

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
      setCurrentPoints(d.pontuacao?.pontos || 0)
    } catch (e) {
      setRoadmap(null)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  const buscarVideos = async (tema, nivel) => {
    setCarregandoVideos(true)
    setErroVideos(false)
    setVideos([])
    try {
      const api = API_URL
      const r = await fetchComAuth(
        `${api}/ia/videos?tema=${encodeURIComponent(tema)}&nivel=${encodeURIComponent(nivel || '')}`,
      )
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
          uid: auth.currentUser?.uid,
          nome: auth.currentUser?.displayName || null,
        }),
      })
      const d = await r.json()
      if (!r.ok || !d.success)
        throw new Error(d.message || 'Não foi possível salvar seu progresso.')
      if (d.success) {
        setCurrentPoints(d.totalPontos)
        setRoadmap(d.roadmap)
        if (noSelecionado?.id === nodeId) setNoSelecionado(d.node)

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

  const abrirNo = (no) => {
    if (no.status === 'locked') return
    setNoSelecionado(no)
    buscarVideos(no.label, no.level || roadmap?.level || '')
  }

  const fecharModal = () => {
    setNoSelecionado(null)
    setVideos([])
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
        <span>Carregando suas trilhas...</span>
      </div>
    )

  if (!roadmap)
    return (
      <div className="dash-empty" style={{ padding: '60px 20px' }}>
        <div className="dash-empty-icon">
          <AlertCircle size={22} />
        </div>
        <h2>Nenhuma trilha encontrada</h2>
        <p>Realize o diagnóstico de perfil para gerar seu currículo estruturado.</p>
        <button
          className="btn-apple-primary"
          onClick={() => navigate('/quiz')}
          style={{ marginTop: 8 }}
        >
          <Compass size={15} /> Realizar Diagnóstico
        </button>
      </div>
    )

  const completedCount = roadmap.nodes?.filter((n) => n.status === 'completed').length || 0

  return (
    <>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {roadmap.title}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
          {roadmap.description ||
            'Selecione um módulo para visualizar materiais e registrar sua conclusão.'}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: '12px',
          alignItems: 'center',
        }}
      >
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

      {/* Grid de módulos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        {roadmap.nodes?.map((no, idx) => {
          const st = normalizeStatus(no.status)
          const isCompleted = st === 'completed'
          const isInProgress = st === 'in_progress'

          return (
            <motion.div
              key={no.id}
              role="button"
              tabIndex={no.status === 'locked' ? -1 : 0}
              aria-disabled={no.status === 'locked'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  abrirNo(no)
                }
              }}
              onClick={() => abrirNo(no)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.035, ease: [0.23, 1, 0.32, 1] }}
              style={{
                background: 'var(--card-bg)',
                border: isCompleted
                  ? '1px solid rgba(48, 209, 88, 0.25)'
                  : isInProgress
                    ? '1px solid var(--apple-blue-border)'
                    : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: st === 'locked' ? 'not-allowed' : 'pointer',
                opacity: st === 'locked' ? 0.45 : 1,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm), var(--shadow-specular)',
                transition: 'border-color 140ms ease, background-color 140ms ease',
              }}
              whileHover={st !== 'locked' ? { y: -2 } : {}}
              whileTap={st !== 'locked' ? { scale: 0.98 } : {}}
            >
              {/* Highlight bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
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
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '.04em',
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
                    }}
                  />
                )}
                {st === 'locked' && <Lock size={14} color="var(--text-muted)" />}
              </div>

              <h3
                style={{
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {no.label}
              </h3>

              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  fontSize: 11.5,
                  color: isCompleted
                    ? '#30d158'
                    : isInProgress
                      ? 'var(--apple-blue)'
                      : 'var(--text-muted)',
                }}
              >
                <span>{statusLabel[st]}</span>
                <Play size={11} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal de detalhes do módulo */}
      <AnimatePresence>
        {noSelecionado && (
          <div
            onClick={fecharModal}
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
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '22px 24px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Conteúdo Programático
                  </span>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                      marginTop: 4,
                    }}
                  >
                    {noSelecionado.label}
                  </h2>
                </div>
                <button
                  onClick={fecharModal}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
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

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Aulas e Referências Recomendadas
                  </span>
                  <button
                    disabled={savingProgress}
                    onClick={() => toggleStatus(noSelecionado.id, noSelecionado.status)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: noSelecionado.status === 'completed' ? '#ff453a' : '#30d158',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {noSelecionado.status === 'completed'
                      ? 'Marcar como não concluído'
                      : 'Marcar como concluído ✓'}
                  </button>
                </div>

                {carregandoVideos ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '40px 0',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                    }}
                  >
                    <div className="dash-spinner" style={{ width: 18, height: 18 }} />
                    <span>Buscando materiais pedagógicos...</span>
                  </div>
                ) : erroVideos ? (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      background: 'rgba(255, 69, 58, 0.08)',
                      border: '1px solid rgba(255, 69, 58, 0.2)',
                      color: '#ff6961',
                      fontSize: 13,
                    }}
                  >
                    Não foi possível carregar os vídeos deste módulo.
                    <div className="video-recovery">
                      <button
                        className="text-button"
                        onClick={() =>
                          buscarVideos(noSelecionado.label, noSelecionado.level || roadmap?.level)
                        }
                      >
                        Tentar novamente
                      </button>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${noSelecionado.label} ${noSelecionado.level || roadmap?.level || ''} aula português`)}`}
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
                      fontSize: 13,
                    }}
                  >
                    A busca automática não encontrou vídeos disponíveis agora.
                    <div className="video-recovery">
                      <button
                        className="text-button"
                        onClick={() =>
                          buscarVideos(noSelecionado.label, noSelecionado.level || roadmap?.level)
                        }
                      >
                        Tentar novamente
                      </button>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${noSelecionado.label} ${noSelecionado.level || roadmap?.level || ''} aula português`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Pesquisar este módulo no YouTube ↗
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {videos.map((vid) => (
                      <VideoLink
                        video={vid}
                        key={vid.id}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          gap: 14,
                          padding: 10,
                          borderRadius: 12,
                          background: 'rgba(255, 255, 255, 0.025)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          textDecoration: 'none',
                          color: 'var(--text-primary)',
                          transition: 'background-color 120ms ease, border-color 120ms ease',
                        }}
                      >
                        <div
                          style={{
                            width: 108,
                            height: 62,
                            borderRadius: 8,
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
                            gap: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
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
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
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
    </>
  )
}

export default MinhasTrilhasPage
