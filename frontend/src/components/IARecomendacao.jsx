import VideoLink from './VideoLink'
import { API_URL } from '../utils/api'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Play, Clock, ChevronRight } from 'lucide-react'
import { auth } from '../firebase'

const IARecomendacao = ({ perfilInicial = {} }) => {
  const [etapa, setEtapa] = useState('formulario') // formulario | carregando | resultado
  const [formulario, setFormulario] = useState({
    interesse: perfilInicial.interesse || '',
    nivel: perfilInicial.nivel || '',
    objetivo: perfilInicial.objetivo || '',
  })
  const [recomendacao, setRecomendacao] = useState(null)
  const [videos, setVideos] = useState([])
  const [moduloSelecionado, setModuloSelecionado] = useState(null)
  const [carregandoVideos, setCarregandoVideos] = useState(false)
  const [erro, setErro] = useState('')

  const gerarRecomendacao = async (e) => {
    e.preventDefault()
    setEtapa('carregando')
    setErro('')

    try {
      const api = API_URL
      const token = await auth.currentUser?.getIdToken()
      const resposta = await fetch(`${api}/ia/recomendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formulario),
      })
      const dados = await resposta.json()

      if (dados.success) {
        setRecomendacao(dados.recomendacao)
        setEtapa('resultado')
        if (dados.aviso) console.warn(dados.aviso)
      } else {
        throw new Error('Falha ao gerar grade curricular')
      }
    } catch (err) {
      setErro('Não foi possível gerar a grade no momento. Verifique a conexão do servidor.')
      setEtapa('formulario')
    }
  }

  const buscarVideosModulo = async (modulo) => {
    setModuloSelecionado(modulo)
    setCarregandoVideos(true)
    setVideos([])

    try {
      const api = API_URL
      const token = await auth.currentUser?.getIdToken()
      const tema = encodeURIComponent(`${modulo.nome} ${formulario.interesse}`)
      const resposta = await fetch(`${api}/ia/videos?tema=${tema}&nivel=${formulario.nivel}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const dados = await resposta.json()
      if (dados.success) setVideos(dados.videos)
    } catch (err) {
      console.error('Erro ao buscar referências:', err)
    } finally {
      setCarregandoVideos(false)
    }
  }

  return (
    <div style={{ width: '100%', color: 'var(--text-primary)' }}>
      <AnimatePresence mode="wait">
        {etapa === 'formulario' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--apple-blue-dim)',
                  border: '1px solid rgba(10, 132, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--apple-blue)',
                  flexShrink: 0,
                }}
              >
                <Compass size={22} />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  Diagnóstico de Especialização
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                  Defina os parâmetros para estruturar sua grade de aprendizado personalizada.
                </p>
              </div>
            </div>

            <form
              onSubmit={gerarRecomendacao}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Área Principal de Interesse
                </label>
                <select
                  value={formulario.interesse}
                  onChange={(e) => setFormulario({ ...formulario, interesse: e.target.value })}
                  required
                  className="apple-input"
                >
                  <option value="">Selecione uma especialidade...</option>
                  <option value="Programação Web">Engenharia de Software Web</option>
                  <option value="Ciência de Dados">Ciência de Dados & Machine Learning</option>
                  <option value="Design UX/UI">Design de Produto (UI/UX)</option>
                  <option value="Arquitetura de Software">Arquitetura de Sistemas</option>
                  <option value="Marketing Digital">Estratégia de Produto & Growth</option>
                  <option value="DevOps">DevOps & Cloud Computing</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Nível de Experiência Atual
                </label>
                <select
                  value={formulario.nivel}
                  onChange={(e) => setFormulario({ ...formulario, nivel: e.target.value })}
                  required
                  className="apple-input"
                >
                  <option value="">Selecione seu nível...</option>
                  <option value="Iniciante">Iniciante (Fundamentos e Introdução)</option>
                  <option value="Intermediário">Intermediário (Prática e Construção)</option>
                  <option value="Avançado">Avançado (Arquitetura e Boas Práticas)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Objetivo de Curto a Médio Prazo
                </label>
                <select
                  value={formulario.objetivo}
                  onChange={(e) => setFormulario({ ...formulario, objetivo: e.target.value })}
                  required
                  className="apple-input"
                >
                  <option value="">Selecione seu objetivo...</option>
                  <option value="Primeiro emprego na área">Ingresso no mercado de trabalho</option>
                  <option value="Transição de carreira">Transição para nova disciplina</option>
                  <option value="Especialização técnica">Especialização técnica e liderança</option>
                  <option value="Crescimento salarial">Consolidação e evolução sênior</option>
                </select>
              </div>

              {erro && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid rgba(255, 69, 58, 0.25)',
                    color: '#ff6961',
                    fontSize: '13px',
                  }}
                >
                  {erro}
                </div>
              )}

              <button
                type="submit"
                className="btn-apple-primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '6px' }}
              >
                Gerar Grade Curricular
              </button>
            </form>
          </motion.div>
        )}

        {etapa === 'carregando' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                className="dash-spinner"
                style={{ width: 22, height: 22, borderTopColor: 'var(--apple-blue)' }}
              />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Analisando perfil e organizando módulos...
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Selecionando conteúdos pedagógicos alinhados aos seus objetivos.
              </p>
            </div>
          </motion.div>
        )}

        {etapa === 'resultado' && recomendacao && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Summary Header */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--apple-blue)',
                    }}
                  >
                    Grade Curricular Estruturada
                  </span>
                  <h2
                    style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      margin: '4px 0 8px',
                    }}
                  >
                    {recomendacao.titulo}
                  </h2>
                  <p
                    style={{
                      fontSize: '13.5px',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                      maxWidth: '600px',
                    }}
                  >
                    {recomendacao.descricao}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                  }}
                >
                  <Clock size={13} />
                  <span>{recomendacao.duracao_estimada}</span>
                </div>
              </div>
            </div>

            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '14px',
                letterSpacing: '-0.01em',
              }}
            >
              Módulos do Programa
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '28px',
              }}
            >
              {recomendacao.modulos?.map((modulo) => (
                <button
                  key={modulo.ordem}
                  onClick={() => buscarVideosModulo(modulo)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background:
                      moduloSelecionado?.ordem === modulo.ordem
                        ? 'rgba(10, 132, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.025)',
                    border:
                      moduloSelecionado?.ordem === modulo.ordem
                        ? '1px solid rgba(10, 132, 255, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'background-color 120ms ease, border-color 120ms ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      flexShrink: 0,
                    }}
                  >
                    {modulo.ordem}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}
                    >
                      {modulo.nome}
                    </div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--text-secondary)',
                        marginTop: '2px',
                      }}
                    >
                      {modulo.descricao} • {modulo.duracao}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </button>
              ))}
            </div>

            {/* Video lessons section */}
            {(carregandoVideos || videos.length > 0) && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    Materiais de Estudo: {moduloSelecionado?.nome}
                  </h3>
                  {carregandoVideos && (
                    <div className="dash-spinner" style={{ width: 14, height: 14 }} />
                  )}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {videos.map((video) => (
                    <VideoLink
                      video={video}
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
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
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '16/9',
                          background: '#000',
                        }}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.titulo}
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
                          <Play size={16} color="#fff" />
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            lineHeight: 1.35,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {video.titulo}
                        </p>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>
                          {video.canal}
                        </p>
                      </div>
                    </VideoLink>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setEtapa('formulario')
                setRecomendacao(null)
                setVideos([])
              }}
              className="btn-apple-secondary"
              style={{ width: '100%', marginTop: '24px', padding: '12px' }}
            >
              Novo Diagnóstico
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default IARecomendacao
