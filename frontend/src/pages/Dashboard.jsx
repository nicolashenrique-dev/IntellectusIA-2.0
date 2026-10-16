import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Settings,
  Plus,
  LogOut,
  ArrowRight,
  Compass,
  CheckCircle2,
  ArrowUpRight,
  Menu,
  X,
  Trophy,
} from 'lucide-react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import MinhasTrilhasPage from './MinhasTrilhasPage'
import ProgressoPage from './ProgressoPage'
import RankingPage from './RankingPage'
import Configuracao from './Configuracao'
import { fetchComAuth, limparSessaoAuth } from '../utils/authToken'
import { API_URL } from '../utils/api'

const sections = [
  { id: 'inicio', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'trilhas', label: 'Minha trilha', icon: BookOpen },
  { id: 'progresso', label: 'Meu progresso', icon: TrendingUp },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
]
export default function Dashboard() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const section = sections.some((s) => s.id === params.get('aba')) ? params.get('aba') : 'inicio'
  const [menu, setMenu] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [userPoints, setUserPoints] = useState(0)
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [highlightError, setHighlightError] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const user = auth.currentUser
  const go = (id) => {
    setParams(id === 'inicio' ? {} : { aba: id })
    setMenu(false)
  }
  async function load() {
    if (!user) return
    setLoading(true)
    setError('')
    setHighlightError(false)
    const results = await Promise.allSettled([
      fetchComAuth(`${API_URL}/trilhas/usuario/${user.uid}`).then(async (r) => {
        const d = await r.json()
        if (r.status === 404) return { roadmap: null, pontos: d.pontuacao?.pontos || 0 }
        if (!r.ok || !d.success) throw Error()
        return { roadmap: d.roadmap, pontos: d.pontuacao.pontos }
      }),
      fetchComAuth(`${API_URL}/itens/destaques`).then(async (r) => {
        const d = await r.json()
        if (!r.ok || !d.success) throw Error()
        return d.destaques || []
      }),
    ])
    if (results[0].status === 'fulfilled') {
      setRoadmap(results[0].value.roadmap)
      setUserPoints(results[0].value.pontos)
    } else setError('Não foi possível carregar sua trilha. Tente novamente.')
    if (results[1].status === 'fulfilled') setHighlights(results[1].value)
    else setHighlightError(true)
    setLoading(false)
  }
  useEffect(() => {
    if (section === 'inicio') load()
  }, [section, user?.uid])
  async function enroll(name) {
    if (enrolling || !user) return
    if (roadmap && !window.confirm(`Começar “${name}”? Essa ação substitui sua trilha atual.`))
      return
    setEnrolling(true)
    setError('')
    try {
      const r = await fetchComAuth(`${API_URL}/trilhas/inscrever`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, trilhaName: name }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) throw Error(d.message || 'Não foi possível começar esta trilha.')
      go('trilhas')
    } catch (e) {
      setError(e.message || 'Verifique sua conexão e tente novamente.')
    } finally {
      setEnrolling(false)
    }
  }
  async function logout() {
    try {
      await signOut(auth)
      limparSessaoAuth()
      navigate('/login')
    } catch {
      setError('Não foi possível sair. Tente novamente.')
    }
  }
  const nodes = roadmap?.nodes || []
  const completed = nodes.filter((n) => n.status === 'completed').length
  const pct = nodes.length ? Math.round((completed / nodes.length) * 100) : 0
  const next = nodes.find((n) => n.status !== 'completed' && n.status !== 'locked')
  const initials = (user?.displayName || user?.email || 'Você').slice(0, 1).toUpperCase()
  return (
    <div className="dash-shell">
      <header className="mobile-header">
        <span className="wordmark">
          <BookOpen size={21} /> intellectus.
        </span>
        <button
          className="dash-icon-btn"
          aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      <aside className={`dash-sidebar${menu ? ' is-open' : ''}`}>
        <Link to="/dashboard" className="wordmark">
          <BookOpen size={25} strokeWidth={1.6} /> intellectus<span className="brand-dot">.</span>
        </Link>
        <span className="sidebar-caption">SEU ESPAÇO DE APRENDIZADO</span>
        <nav className="dash-nav" aria-label="Menu principal">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`dash-nav-item${section === id ? ' active' : ''}`}
              aria-current={section === id ? 'page' : undefined}
              onClick={() => go(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-guide">
          <Compass size={22} />
          <strong>Ainda explorando?</strong>
          <p>Seus interesses são um bom lugar para começar.</p>
          <button className="text-button" onClick={() => navigate('/quiz')}>
            Descobrir meu caminho <ArrowRight size={15} />
          </button>
        </div>
        <div className="dash-sidebar-footer">
          <div className="dash-user-row">
            <div className="dash-avatar">{initials}</div>
            <div className="dash-user-info">
              <div className="dash-user-name">{user?.displayName || 'Minha conta'}</div>
              <div className="dash-user-plan">Um passo de cada vez</div>
            </div>
            <button className="dash-logout-btn" onClick={logout} aria-label="Sair da conta">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <main className="dash-main">
        <div className="workspace-heading">
          <span>
            Meu espaço <span>/</span> {sections.find((s) => s.id === section).label}
          </span>
          <span className="workspace-date">
            {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date())}
          </span>
        </div>
        {error && (
          <div className="form-message error" role="alert">
            {error}{' '}
            <button className="text-button" onClick={load}>
              Tentar novamente
            </button>
          </div>
        )}
        {section === 'inicio' && (
          <>
            <div className="dash-topbar">
              <div>
                <span className="eyebrow">CADA DESCOBERTA CONTA</span>
                <h1>Olá, {user?.displayName?.split(' ')[0] || 'estudante'}.</h1>
                <p>Vamos dar mais um passo no seu caminho?</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => go('ranking')}
                  style={{
                    cursor: 'pointer',
                    border: '1px solid var(--apple-blue-border)',
                    background: 'var(--apple-blue-dim)',
                    color: 'var(--apple-blue)',
                    padding: '8px 14px',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 600,
                    transition: 'transform 120ms ease, background-color 120ms ease',
                  }}
                  title="Ver classificação no Ranking"
                >
                  <Trophy size={15} />
                  <span>{userPoints} pts</span>
                </button>
                <button className="btn-apple-secondary" onClick={() => navigate('/quiz')}>
                  <Plus size={17} /> Nova trilha
                </button>
              </div>
            </div>
            {loading ? (
              <div className="dash-loading-row" role="status">
                <div className="dash-spinner" />
                Carregando seu espaço…
              </div>
            ) : (
              !error && (
                <>
                  <section className="learning-hero">
                    <div className="learning-hero-content">
                      <span className="eyebrow">
                        {roadmap ? 'SEU PRÓXIMO PASSO' : 'UM COMEÇO COM DIREÇÃO'}
                      </span>
                      <h2 style={{ color: '#152d1d' }}>
                        {roadmap ? roadmap.title : 'Você não precisa decidir tudo hoje.'}
                      </h2>
                      <p style={{ color: '#284330' }}>
                        {roadmap
                          ? next
                            ? `Continue com ${next.label}. Seu futuro se constrói um assunto de cada vez.`
                            : 'Você concluiu os módulos disponíveis. Que tal revisitar o que aprendeu?'
                          : 'Conheça seus interesses e encontre uma trilha de estudos para começar. A gente ajuda a organizar o caminho.'}
                      </p>
                      <button
                        className="auth-submit"
                        onClick={() => navigate(roadmap ? '/roadmap' : '/quiz')}
                      >
                        {roadmap ? 'Continuar meus estudos' : 'Encontrar meu caminho'}
                        <ArrowRight size={18} />
                      </button>
                      <span className="hero-caption" style={{ color: '#3d5843' }}>
                        {roadmap
                          ? `${completed} de ${nodes.length} módulos concluídos`
                          : 'Seu perfil · Sua trilha · Seu ritmo'}
                      </span>
                    </div>
                    <div className="path-art" aria-hidden="true">
                      <div className="path-line" />
                      <span className="path-point p1">
                        <CheckCircle2 size={26} />
                      </span>
                      <span className="path-point p2">
                        <BookOpen size={30} />
                      </span>
                      <span className="path-point p3">
                        <Compass size={25} />
                      </span>
                      <span className="path-label l1">Descobrir</span>
                      <span className="path-label l2">Aprender</span>
                      <span className="path-label l3">Avançar</span>
                    </div>
                  </section>
                  <section className="study-metrics" aria-label="Resumo da sua trilha">
                    <div>
                      <span>Seu progresso</span>
                      <strong>
                        {pct}
                        <small>%</small>
                      </strong>
                      <div className="dash-bar-track">
                        <div className="dash-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div>
                      <span>Módulos concluídos</span>
                      <strong>
                        {String(completed).padStart(2, '0')}
                        <small> / {String(nodes.length).padStart(2, '0')}</small>
                      </strong>
                      <p>Conhecimento que fica com você</p>
                    </div>
                    <div>
                      <span>Pontos acumulados</span>
                      <strong style={{ color: 'var(--apple-blue)' }}>
                        {userPoints}
                        <small> pts</small>
                      </strong>
                      <button className="text-button" onClick={() => go('ranking')}>
                        Ver ranking <ArrowUpRight size={15} />
                      </button>
                    </div>
                    <div>
                      <span>Trilha atual</span>
                      <strong className="metric-title">
                        {roadmap?.level || (roadmap ? 'Personalizada' : 'Seu próximo começo')}
                      </strong>
                      <button
                        className="text-button"
                        onClick={() => (roadmap ? go('trilhas') : navigate('/quiz'))}
                      >
                        {roadmap ? 'Ver minha trilha' : 'Descobrir interesses'}
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </section>
                </>
              )
            )}
            <section>
              <div className="dash-section-header">
                <div>
                  <span className="eyebrow">EXPLORE POSSIBILIDADES</span>
                  <h2>Um novo interesse pode começar aqui.</h2>
                </div>
                <Compass size={24} strokeWidth={1.4} />
              </div>
              <div className="dash-highlights-grid">
                {highlights.map((d, i) => (
                  <button
                    key={d.id || d.name}
                    disabled={enrolling}
                    className="explore-card"
                    onClick={() => enroll(d.name)}
                  >
                    <div className={`explore-cover cover-${i % 3}`}>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      <BookOpen size={42} strokeWidth={1} />
                      <ArrowUpRight size={21} />
                    </div>
                    <div className="explore-body">
                      <div className="dash-tag-wrap">
                        {(d.tags || []).slice(0, 3).map((t) => (
                          <span key={t} className="dash-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3>{d.name}</h3>
                      <span>
                        Conhecer esta trilha <ArrowRight size={15} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {!loading && !highlights.length && (
                <div className="catalog-empty">
                  {highlightError
                    ? 'As sugestões estão indisponíveis no momento.'
                    : 'Sua próxima trilha pode ser feita a partir dos seus interesses.'}
                  <button className="text-button" onClick={() => navigate('/quiz')}>
                    Explorar meu perfil <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>
            <footer className="dashboard-footer">
              <span>Intellectus · Aprender abre caminhos.</span>
              <span>No seu tempo. Na sua direção.</span>
            </footer>
          </>
        )}
        {section === 'trilhas' && <MinhasTrilhasPage />}
        {section === 'progresso' && <ProgressoPage />}
        {section === 'ranking' && <RankingPage />}
        {section === 'configuracoes' && <Configuracao />}
      </main>
    </div>
  )
}
