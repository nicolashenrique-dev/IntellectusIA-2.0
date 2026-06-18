import React, { useEffect, useState } from 'react'
import {
    LayoutDashboard, BookOpen, TrendingUp, Settings, Plus,
    LogOut, Bell, ArrowRight, Sparkles, BarChart2, Compass,
    CheckCircle, Clock, Zap, Flame, ArrowUpRight, Minus, Play
} from 'lucide-react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import MinhasTrilhasPage from './MinhasTrilhasPage'
import ProgressoPage from './ProgressoPage'
import Configuracao from './Configuracao'
import { fetchComAuth, limparSessaoAuth } from '../utils/authToken'

/* ─────────────────────────────────────────────
   Tokens
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
    --sidebar-bg: #080e1d;
    --card-bg: rgba(15,23,42,0.55);
    --radius: 12px;
    --radius-sm: 8px;
  }

  .dash-shell { display: flex; height: 100vh; overflow: hidden; background: var(--bg); color: var(--text-primary); font-family: system-ui, -apple-system, sans-serif; }

  /* ── Sidebar ── */
  .dash-sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--sidebar-bg);
    border-right: 0.5px solid var(--border);
    display: flex; flex-direction: column;
    padding: 24px 16px;
    height: 100vh; overflow: hidden;
  }
  .dash-logo { display: flex; align-items: center; gap: 10px; padding: 0 4px; margin-bottom: 32px; }
  .dash-logo-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: var(--indigo);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .dash-logo-text { font-size: 17px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.3px; }

  .dash-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .dash-nav-section {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted);
    padding: 16px 12px 6px;
  }
  .dash-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--radius-sm);
    cursor: pointer; font-size: 13.5px; font-weight: 500;
    color: var(--text-secondary);
    transition: background .15s, color .15s;
    border: 0.5px solid transparent;
    user-select: none;
  }
  .dash-nav-item:hover { background: var(--surface); color: var(--text-primary); }
  .dash-nav-item.active {
    background: var(--indigo-dim); color: #a5b4fc;
    border-color: var(--indigo-border);
  }

  .dash-sidebar-footer { padding-top: 16px; border-top: 0.5px solid var(--border); }
  .dash-user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--radius-sm); cursor: pointer;
  }
  .dash-user-row:hover { background: var(--surface); }
  .dash-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: var(--indigo-dim); border: 0.5px solid var(--indigo-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; color: #a5b4fc; flex-shrink: 0;
  }
  .dash-user-info { flex: 1; min-width: 0; }
  .dash-user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .dash-user-plan { font-size: 11px; color: var(--text-secondary); }
  .dash-logout-btn {
    width: 28px; height: 28px; border-radius: 6px;
    border: none; background: transparent; color: var(--text-muted);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: color .15s, background .15s;
  }
  .dash-logout-btn:hover { color: #f87171; background: rgba(239,68,68,0.1); }

  /* ── Main ── */
  .dash-main {
    flex: 1; overflow-y: auto; padding: 28px 32px;
    display: flex; flex-direction: column; gap: 24px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }

  /* ── Topbar ── */
  .dash-topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .dash-topbar h1 { font-size: 21px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.4px; margin-bottom: 2px; }
  .dash-topbar p { font-size: 13px; color: var(--text-secondary); }
  .dash-topbar-actions { display: flex; align-items: center; gap: 8px; }
  .dash-icon-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 0.5px solid var(--border); background: var(--surface);
    color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    position: relative; transition: background .15s, color .15s;
  }
  .dash-icon-btn:hover { background: var(--surface-hover); color: var(--text-primary); }
  .dash-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px; border-radius: 50%;
    background: #ef4444; border: 1.5px solid var(--bg);
  }
  .dash-cta-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 0 14px; height: 36px;
    background: var(--indigo); border: none;
    border-radius: var(--radius-sm);
    color: #fff; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: opacity .15s;
  }
  .dash-cta-btn:hover { opacity: .88; }

  /* ── Stats ── */
  .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .dash-stat-card {
    background: var(--card-bg); border: 0.5px solid var(--border);
    border-radius: var(--radius); padding: 16px 18px;
    display: flex; flex-direction: column; gap: 6px;
    transition: border-color .15s;
  }
  .dash-stat-card:hover { border-color: var(--border-hover); }
  .dash-stat-label {
    font-size: 11.5px; font-weight: 500; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: .06em;
    display: flex; align-items: center; gap: 6px;
  }
  .dash-stat-value { font-size: 26px; font-weight: 600; color: var(--text-primary); letter-spacing: -.5px; }
  .dash-stat-delta { font-size: 12px; color: #34d399; display: flex; align-items: center; gap: 3px; }
  .dash-stat-delta.neutral { color: var(--text-secondary); }

  /* ── Two-col layout ── */
  .dash-two-col { display: grid; grid-template-columns: 1fr 1.7fr; gap: 16px; }

  /* ── Cards ── */
  .dash-card {
    background: var(--card-bg); border: 0.5px solid var(--border);
    border-radius: var(--radius); padding: 20px;
    display: flex; flex-direction: column; gap: 14px;
    transition: border-color .15s;
  }
  .dash-card:hover { border-color: var(--border-hover); }
  .dash-card.underway {
    background: linear-gradient(135deg, rgba(99,102,241,.12) 0%, rgba(99,102,241,.04) 100%);
    border-color: var(--indigo-border);
  }
  .dash-card.underway:hover { border-color: rgba(99,102,241,.4); }

  .dash-card-eyebrow {
    font-size: 10.5px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--text-muted);
    display: flex; align-items: center; justify-content: space-between;
  }
  .dash-card-header { display: flex; align-items: center; justify-content: space-between; }
  .dash-card-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

  .dash-badge {
    padding: 2px 8px; border-radius: 20px;
    font-size: 10.5px; font-weight: 600;
    background: var(--indigo-dim); border: 0.5px solid var(--indigo-border); color: #a5b4fc;
  }
  .dash-badge.green { background: rgba(52,211,153,.1); border-color: rgba(52,211,153,.25); color: #34d399; }
  .dash-badge.amber { background: rgba(251,191,36,.08); border-color: rgba(251,191,36,.25); color: #fbbf24; }
  .dash-badge.slate { background: var(--surface); border-color: var(--border); color: var(--text-muted); }

  .dash-trail-title { font-size: 17px; font-weight: 600; color: var(--text-primary); letter-spacing: -.3px; line-height: 1.35; }

  .dash-node-list { display: flex; flex-direction: column; gap: 6px; }
  .dash-node-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface); border: 0.5px solid var(--border);
    border-radius: var(--radius-sm); padding: 9px 12px;
    transition: background .13s;
  }
  .dash-node-row:hover { background: var(--surface-hover); }
  .dash-node-name {
    font-size: 13px; font-weight: 500; color: var(--text-primary);
    display: flex; align-items: center; gap: 8px;
  }
  .dash-node-num { font-size: 12px; color: var(--text-muted); width: 16px; }

  .dash-continue-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 10px;
    background: rgba(99,102,241,.18); border: 0.5px solid rgba(99,102,241,.3);
    border-radius: var(--radius-sm); color: #a5b4fc;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background .15s;
  }
  .dash-continue-btn:hover { background: rgba(99,102,241,.28); }

  /* ── Progress ring ── */
  .dash-ring-wrap { display: flex; align-items: center; gap: 20px; }
  .dash-ring-svg { transform: rotate(-90deg); }
  .dash-skill-bars { flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .dash-skill-row { display: flex; flex-direction: column; gap: 4px; }
  .dash-skill-meta { display: flex; justify-content: space-between; font-size: 12px; }
  .dash-skill-name { color: var(--text-secondary); }
  .dash-skill-pct { color: var(--text-muted); }
  .dash-bar-track { height: 4px; background: var(--border); border-radius: 10px; overflow: hidden; }
  .dash-bar-fill { height: 100%; border-radius: 10px; background: var(--indigo); transition: width .8s ease; }

  /* ── Quick actions ── */
  .dash-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .dash-section-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .dash-see-all { font-size: 12.5px; color: var(--indigo); background: none; border: none; cursor: pointer; font-family: inherit; }
  .dash-see-all:hover { text-decoration: underline; }

  .dash-quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .dash-qa-card {
    background: var(--card-bg); border: 0.5px solid var(--border);
    border-radius: var(--radius); padding: 14px 16px; cursor: pointer;
    display: flex; align-items: center; gap: 12px;
    transition: border-color .15s, background .15s;
  }
  .dash-qa-card:hover { border-color: var(--border-hover); background: var(--surface-hover); }
  .dash-qa-icon {
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .dash-qa-icon.indigo { background: var(--indigo-dim); color: #a5b4fc; }
  .dash-qa-icon.teal { background: rgba(45,212,191,.1); color: #2dd4bf; }
  .dash-qa-icon.purple { background: rgba(167,139,250,.1); color: #a78bfa; }
  .dash-qa-text { flex: 1; min-width: 0; }
  .dash-qa-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .dash-qa-sub { font-size: 11.5px; color: var(--text-muted); margin-top: 1px; }

  /* ── Highlights ── */
  .dash-highlights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .dash-highlight-card {
    background: var(--card-bg); border: 0.5px solid var(--border);
    border-radius: var(--radius); padding: 18px; cursor: pointer;
    display: flex; flex-direction: column; gap: 12px;
    transition: border-color .15s, transform .15s;
  }
  .dash-highlight-card:hover { border-color: var(--border-hover); transform: translateY(-1px); }
  .dash-hc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .dash-hc-title { font-size: 14px; font-weight: 500; color: var(--text-primary); line-height: 1.4; }
  .dash-tag-wrap { display: flex; gap: 4px; flex-wrap: wrap; }
  .dash-tag {
    font-size: 10.5px; font-weight: 500; padding: 2px 7px; border-radius: 4px;
    background: var(--surface); border: 0.5px solid var(--border); color: var(--text-muted);
  }
  .dash-hc-bar-wrap { display: flex; flex-direction: column; gap: 4px; }
  .dash-hc-meta { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-muted); }
  .dash-hc-track { height: 3px; background: var(--border); border-radius: 10px; overflow: hidden; }
  .dash-hc-fill { height: 100%; border-radius: 10px; }

  /* ── Empty state ── */
  .dash-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 48px 24px; gap: 12px;
  }
  .dash-empty-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--indigo-dim); display: flex; align-items: center; justify-content: center;
    color: #a5b4fc; margin-bottom: 4px;
  }
  .dash-empty h2 { font-size: 18px; font-weight: 600; color: var(--text-primary); }
  .dash-empty p { font-size: 13px; color: var(--text-secondary); max-width: 320px; line-height: 1.6; }

  /* ── Loading spinner ── */
  .dash-spinner {
    width: 20px; height: 20px; border: 2px solid var(--indigo-border);
    border-top-color: var(--indigo); border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .dash-loading-row { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 13px; padding: 24px 0; }
`

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
const NavItem = ({ icon, label, active, onClick }) => (
    <div className={`dash-nav-item${active ? ' active' : ''}`} onClick={onClick} role="button" tabIndex={0}>
        {icon}
        <span>{label}</span>
    </div>
)

const Badge = ({ children, variant = '' }) => (
    <span className={`dash-badge${variant ? ' ' + variant : ''}`}>{children}</span>
)

const StatCard = ({ icon, label, value, delta, neutral }) => (
    <div className="dash-stat-card">
        <div className="dash-stat-label">{icon}<span>{label}</span></div>
        <div className="dash-stat-value">{value}</div>
        <div className={`dash-stat-delta${neutral ? ' neutral' : ''}`}>
            {neutral ? <Minus size={12} /> : <ArrowUpRight size={12} />}
            <span>{delta}</span>
        </div>
    </div>
)

const NodeStatus = ({ status }) => {
    const map = {
        completed: { label: 'Concluído', variant: 'green' },
        in_progress: { label: 'Em andamento', variant: 'amber' },
        locked: { label: 'Bloqueado', variant: 'slate' },
    }
    const s = map[status] || map.locked
    return <Badge variant={s.variant}>{s.label}</Badge>
}

const SkillBar = ({ label, pct, color }) => (
    <div className="dash-skill-row">
        <div className="dash-skill-meta">
            <span className="dash-skill-name">{label}</span>
            <span className="dash-skill-pct">{pct}%</span>
        </div>
        <div className="dash-bar-track">
            <div className="dash-bar-fill" style={{ width: `${pct}%`, background: color || 'var(--indigo)' }} />
        </div>
    </div>
)

const ProgressRing = ({ pct }) => {
    const r = 32
    const circ = 2 * Math.PI * r
    const offset = circ * (1 - pct / 100)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
                <circle
                    cx="36" cy="36" r={r} fill="none"
                    stroke="var(--indigo)" strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset .8s ease' }}
                />
            </svg>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>geral</span>
        </div>
    )
}

const EmptyState = ({ title, description, action }) => (
    <div className="dash-empty">
        <div className="dash-empty-icon"><BookOpen size={24} /></div>
        <h2>{title}</h2>
        <p>{description}</p>
        {action}
    </div>
)

/* ── NOVA ABA: Minhas Trilhas Content ── */


/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
const Dashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [roadmap, setRoadmap] = useState(null)
    const [loadingRoadmap, setLoadingRoadmap] = useState(true)
    const [destaques, setDestaques] = useState([])
    const [loadingDestaques, setLoadingDestaques] = useState(true)
    const [abaAtual, setAbaAtual] = useState('Dashboard')

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) { navigate('/login'); return }
            setUser(u)
            fetchRoadmap(u.uid)
            fetchHighlights()
        })
        return () => unsub()
    }, [navigate])

    const fetchRoadmap = async (uid) => {
        setLoadingRoadmap(true)
        try {
            const api = import.meta.env.VITE_API_URL || 'https://projeto-sem.vercel.app'
            const res = await fetchComAuth(`${api}/api/trilhas/usuario/${uid}`)
            const data = await res.json()
            setRoadmap(data.success && data.roadmap ? data.roadmap : null)
        } catch (err) {
            console.error('Erro ao carregar trilha:', err)
            setRoadmap(null)
        } finally {
            setLoadingRoadmap(false)
        }
    }

    const fetchHighlights = async () => {
        setLoadingDestaques(true)
        try {
            const api = import.meta.env.VITE_API_URL || 'https://projeto-sem.vercel.app'
            const res = await fetchComAuth(`${api}/api/itens/destaques`)
            const data = await res.json()
            setDestaques(data.success && data.destaques ? data.destaques : [])
        } catch (err) {
            console.error('Erro ao carregar destaques:', err)
        } finally {
            setLoadingDestaques(false)
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        limparSessaoAuth()
        navigate('/login')
    }

    const initials = user?.displayName
        ? user.displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : 'EU'

    const firstName = user?.displayName?.split(' ')[0] || 'de volta'

    const barColors = ['var(--indigo)', '#2dd4bf', '#a78bfa', '#f59e0b']

    return (
        <>
            <style>{css}</style>
            <div className="dash-shell">
                {/* ── SIDEBAR ── */}
                <aside className="dash-sidebar">
                    <div className="dash-logo">
                        <div className="dash-logo-icon">
                            <BookOpen size={17} color="#fff" />
                        </div>
                        <span className="dash-logo-text">Intellectus</span>
                    </div>

                    <nav className="dash-nav">
                        <span className="dash-nav-section">Menu</span>
                        {[
                            { icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
                            { icon: <BookOpen size={17} />, label: 'Minhas Trilhas' },
                            { icon: <TrendingUp size={17} />, label: 'Progresso' },
                        ].map(({ icon, label }) => (
                            <NavItem key={label} icon={icon} label={label} active={abaAtual === label} onClick={() => setAbaAtual(label)} />
                        ))}
                        <span className="dash-nav-section" style={{ marginTop: 8 }}>Sistema</span>
                        <NavItem icon={<Settings size={17} />} label="Configurações" active={abaAtual === 'Configurações'} onClick={() => setAbaAtual('Configurações')} />
                    </nav>

                    <div className="dash-sidebar-footer">
                        <div className="dash-user-row">
                            <div className="dash-avatar">{initials}</div>
                            <div className="dash-user-info">
                                <div className="dash-user-name">{user?.displayName || 'Usuário'}</div>
                                <div className="dash-user-plan">Plano Pro</div>
                            </div>
                            <button className="dash-logout-btn" onClick={handleLogout} title="Sair" aria-label="Sair">
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="dash-main">
                    {/* Topbar */}
                    <div className="dash-topbar">
                        <div>
                            <h1>Bem-vindo de volta, {firstName}</h1>
                            <p>Continue sua jornada de aprendizado personalizada.</p>
                        </div>
                        <div className="dash-topbar-actions">
                            <button className="dash-icon-btn" aria-label="Notificações">
                                <Bell size={17} />
                                <span className="dash-notif-dot" />
                            </button>
                            <button className="dash-cta-btn" onClick={() => navigate('/quiz')}>
                                <Plus size={16} />
                                Nova trilha
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Main View */}
                    {abaAtual === 'Dashboard' && (
                        <>
                            <div className="dash-stats">
                                <StatCard icon={<CheckCircle size={14} />} label="Concluído" value="45%" delta="+8% esta semana" />
                                <StatCard icon={<Clock size={14} />} label="Tempo de estudo" value="12h" delta="+2h vs semana passada" />
                                <StatCard icon={<Zap size={14} />} label="Habilidades" value="8" delta="Sem alteração" neutral />
                                <StatCard icon={<Flame size={14} />} label="Sequência" value="7d" delta="Recorde pessoal!" />
                            </div>

                            <div className="dash-two-col">
                                <div className={`dash-card${roadmap ? ' underway' : ''}`}>
                                    <div className="dash-card-eyebrow">
                                        Trilha ativa
                                        {roadmap && <Badge>{roadmap.level || 'Intermediário'}</Badge>}
                                    </div>

                                    {loadingRoadmap ? (
                                        <div className="dash-loading-row">
                                            <div className="dash-spinner" />
                                            Carregando seu progresso...
                                        </div>
                                    ) : roadmap ? (
                                        <>
                                            <div className="dash-trail-title">{roadmap.title}</div>
                                            <div className="dash-node-list">
                                                {roadmap.nodes?.slice(0, 3).map((node, i) => (
                                                    <div key={node.id} className="dash-node-row">
                                                        <span className="dash-node-name">
                                                            <span className="dash-node-num">{i + 1}.</span>
                                                            {node.label}
                                                        </span>
                                                        <NodeStatus status={node.status} />
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="dash-continue-btn" onClick={() => navigate('/roadmap')}>
                                                Continuar estudando <ArrowRight size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <EmptyState
                                            title="Nenhuma trilha ativa"
                                            description="Crie sua primeira trilha com o assistente de IA e comece a aprender de forma personalizada."
                                            action={
                                                <button className="dash-cta-btn" onClick={() => navigate('/quiz')} style={{ marginTop: 4 }}>
                                                    <Sparkles size={15} /> Iniciar assistente
                                                </button>
                                            }
                                        />
                                    )}
                                </div>

                                <div className="dash-card">
                                    <div className="dash-card-header">
                                        <span className="dash-card-title">Progresso por área</span>
                                        <Badge>Última semana</Badge>
                                    </div>
                                    <div className="dash-ring-wrap">
                                        <ProgressRing pct={45} />
                                        <div style={{ textAlign: 'center', marginRight: 4 }}>
                                            <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', display: 'block', letterSpacing: '-.5px' }}>45%</span>
                                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>concluído</span>
                                        </div>
                                        <div className="dash-skill-bars">
                                            <SkillBar label="Frontend" pct={68} />
                                            <SkillBar label="Backend" pct={40} color="#2dd4bf" />
                                            <SkillBar label="Banco de dados" pct={22} color="#a78bfa" />
                                            <SkillBar label="DevOps" pct={10} color="#475569" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="dash-section-header">
                                    <span className="dash-section-title">Ações rápidas</span>
                                </div>
                                <div className="dash-quick-grid">
                                    {[
                                        { icon: <Sparkles size={17} />, color: 'indigo', label: 'Criar trilha com IA', sub: 'Diagnóstico personalizado', action: () => navigate('/quiz') },
                                        { icon: <BarChart2 size={17} />, color: 'teal', label: 'Ver relatório', sub: 'Histórico detalhado', action: () => setAbaAtual('Progresso') },
                                        { icon: <Compass size={17} />, color: 'purple', label: 'Explorar trilhas', sub: 'Curadoria da semana', action: () => { } },
                                    ].map(({ icon, color, label, sub, action }) => (
                                        <div key={label} className="dash-qa-card" onClick={action} role="button" tabIndex={0}>
                                            <div className={`dash-qa-icon ${color}`}>{icon}</div>
                                            <div className="dash-qa-text">
                                                <div className="dash-qa-label">{label}</div>
                                                <div className="dash-qa-sub">{sub}</div>
                                            </div>
                                            <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="dash-section-header">
                                    <span className="dash-section-title">Trilhas em destaque</span>
                                    <button className="dash-see-all">Ver todas →</button>
                                </div>
                                {loadingDestaques ? (
                                    <div className="dash-loading-row">
                                        <div className="dash-spinner" />
                                        Carregando destaques...
                                    </div>
                                ) : destaques.length > 0 ? (
                                    <div className="dash-highlights-grid">
                                        {destaques.map((d, i) => (
                                            <div key={d.id} className="dash-highlight-card" onClick={() => navigate('/quiz')} role="button" tabIndex={0}>
                                                <div className="dash-hc-top">
                                                    <div className="dash-hc-title">{d.name}</div>
                                                    <div className="dash-tag-wrap">
                                                        {(d.tags || []).map(t => <span key={t} className="dash-tag">{t}</span>)}
                                                    </div>
                                                </div>
                                                <div className="dash-hc-bar-wrap">
                                                    <div className="dash-hc-meta">
                                                        <span>Progresso da comunidade</span>
                                                        <span>{d.progress || 0}%</span>
                                                    </div>
                                                    <div className="dash-hc-track">
                                                        <div className="dash-hc-fill" style={{ width: `${d.progress || 0}%`, background: barColors[i % barColors.length] }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="dash-highlights-grid">
                                        {[
                                            { name: 'Python para Data Science', tags: ['Python', 'ML'], progress: 71, color: 'var(--indigo)' },
                                            { name: 'UI/UX Design Moderno', tags: ['Design', 'Figma'], progress: 54, color: '#2dd4bf' },
                                            { name: 'DevOps & Cloud na prática', tags: ['AWS', 'Docker'], progress: 38, color: '#a78bfa' },
                                            { name: 'Fundamentos de IA', tags: ['IA', 'Teoria'], progress: 62, color: 'var(--indigo)' },
                                        ].map(({ name, tags, progress, color }) => (
                                            <div key={name} className="dash-highlight-card" onClick={() => navigate('/quiz')} role="button" tabIndex={0}>
                                                <div className="dash-hc-top">
                                                    <div className="dash-hc-title">{name}</div>
                                                    <div className="dash-tag-wrap">
                                                        {tags.map(t => <span key={t} className="dash-tag">{t}</span>)}
                                                    </div>
                                                </div>
                                                <div className="dash-hc-bar-wrap">
                                                    <div className="dash-hc-meta">
                                                        <span>Progresso da comunidade</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="dash-hc-track">
                                                        <div className="dash-hc-fill" style={{ width: `${progress}%`, background: color }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Renderiza o componente real de Minhas Trilhas quando ativo */}
                    {abaAtual === 'Minhas Trilhas' && (
                        <MinhasTrilhasPage userId={user?.uid} />
                    )}

                    {abaAtual === 'Configurações' && (
                        <Configuracao userId={user?.uid} />
                    )}

                    {abaAtual === 'Progresso' && (
                        <ProgressoPage userId={user?.uid} />
                    )}

                    {abaAtual !== 'Dashboard' && abaAtual !== 'Minhas Trilhas' && abaAtual !== 'Configurações' && (
                        <EmptyState
                            title={`${abaAtual} em construção`}
                            description={`A aba ${abaAtual} será liberada nas próximas atualizações do Intellectus.`}
                            action={
                                <button className="dash-cta-btn" onClick={() => setAbaAtual('Dashboard')} style={{ marginTop: 4 }}>
                                    Voltar ao Dashboard
                                </button>
                            }
                        />
                    )}
          
                    
          
                </main>
            </div>
        </>
    )
}

export default Dashboard
