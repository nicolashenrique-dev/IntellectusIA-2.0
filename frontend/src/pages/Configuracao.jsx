import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { User, Lock, Bell, Palette, Shield, ChevronRight, Check, AlertCircle } from 'lucide-react'

const Section = ({ title, children }) => (
    <div className="dash-card" style={{ gap: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', padding: '0 0 16px', borderBottom: '0.5px solid var(--border)', marginBottom: 16 }}>
            {title}
        </span>
        {children}
    </div>
)

const Field = ({ label, hint, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
        {children}
        {hint && <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
)

const Input = ({ ...props }) => (
    <input
        {...props}
        style={{
            background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '9px 12px',
            fontSize: 13, color: 'var(--text-primary)', outline: 'none',
            fontFamily: 'inherit', transition: 'border-color .15s', width: '100%', boxSizing: 'border-box',
            ...props.style,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
)

const Toggle = ({ checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        style={{
            width: 36, height: 20, borderRadius: 10, flexShrink: 0,
            background: checked ? 'var(--indigo)' : 'var(--border)',
            cursor: 'pointer', position: 'relative', transition: 'background .2s',
        }}
    >
        <div style={{
            position: 'absolute', top: 3, left: checked ? 19 : 3,
            width: 14, height: 14, borderRadius: '50%', background: '#fff',
            transition: 'left .2s',
        }} />
    </div>
)

const ToggleRow = ({ label, sub, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
        <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
            {sub && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
)

const Alert = ({ type, message }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        borderRadius: 'var(--radius-sm)', fontSize: 12.5, marginBottom: 12,
        background: type === 'success' ? 'rgba(52,211,153,.08)' : 'rgba(239,68,68,.08)',
        border: `0.5px solid ${type === 'success' ? 'rgba(52,211,153,.25)' : 'rgba(239,68,68,.25)'}`,
        color: type === 'success' ? '#34d399' : '#f87171',
    }}>
        {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
        {message}
    </div>
)

const ConfiguracoesPage = () => {
    const user = auth.currentUser
    const navigate = useNavigate()

    const [nome, setNome] = useState(user?.displayName || '')
    const [emailAtual, setEmailAtual] = useState(user?.email || '')
    const [senhaAtual, setSenhaAtual] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [salvandoPerfil, setSalvandoPerfil] = useState(false)
    const [salvandoSenha, setSalvandoSenha] = useState(false)
    const [alertaPerfil, setAlertaPerfil] = useState(null)
    const [alertaSenha, setAlertaSenha] = useState(null)

    const [notifs, setNotifs] = useState({
        email: true, progresso: true, novidades: false, lembretes: true,
    })
    const [tema, setTema] = useState(localStorage.getItem('intelectus_theme') || 'dark')

    React.useEffect(() => {
        localStorage.setItem('intelectus_theme', tema)
        document.body.className = `theme-${tema}`
    }, [tema])

    const salvarPerfil = async () => {
        setSalvandoPerfil(true)
        setAlertaPerfil(null)
        try {
            if (nome !== user.displayName) await updateProfile(user, { displayName: nome })
            if (emailAtual !== user.email) await updateEmail(user, emailAtual)
            setAlertaPerfil({ type: 'success', message: 'Perfil atualizado com sucesso!' })
        } catch (e) {
            setAlertaPerfil({ type: 'error', message: e.code === 'auth/requires-recent-login' ? 'Faça login novamente para alterar o e-mail.' : 'Erro ao atualizar perfil.' })
        } finally {
            setSalvandoPerfil(false)
        }
    }

    const salvarSenha = async () => {
        if (novaSenha !== confirmarSenha) { setAlertaSenha({ type: 'error', message: 'As senhas não coincidem.' }); return }
        if (novaSenha.length < 6) { setAlertaSenha({ type: 'error', message: 'A senha deve ter ao menos 6 caracteres.' }); return }
        setSalvandoSenha(true)
        setAlertaSenha(null)
        try {
            const cred = EmailAuthProvider.credential(user.email, senhaAtual)
            await reauthenticateWithCredential(user, cred)
            await updatePassword(user, novaSenha)
            setAlertaSenha({ type: 'success', message: 'Senha alterada com sucesso!' })
            setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('')
        } catch (e) {
            setAlertaSenha({ type: 'error', message: e.code === 'auth/wrong-password' ? 'Senha atual incorreta.' : 'Erro ao alterar senha.' })
        } finally {
            setSalvandoSenha(false)
        }
    }

    const btnStyle = (loading) => ({
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', background: loading ? 'var(--indigo-dim)' : 'var(--indigo)',
        border: 'none', borderRadius: 'var(--radius-sm)',
        color: '#fff', fontSize: 13, fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        opacity: loading ? 0.7 : 1, transition: 'opacity .15s',
    })

    return (
        <>
            <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-.3px', margin: 0 }}>
                    Configurações
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Gerencie sua conta e preferências.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

                {/* ── Perfil ── */}
                <Section title="👤 Perfil">
                    {alertaPerfil && <Alert {...alertaPerfil} />}
                    <Field label="Nome completo">
                        <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
                    </Field>
                    <Field label="E-mail" hint="Requer reautenticação recente para alterar.">
                        <Input type="email" value={emailAtual} onChange={e => setEmailAtual(e.target.value)} />
                    </Field>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'var(--indigo-dim)', border: '0.5px solid var(--indigo-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 600, color: '#a5b4fc',
                        }}>
                            {nome ? nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'EU'}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avatar gerado pelas iniciais</span>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <button style={btnStyle(salvandoPerfil)} onClick={salvarPerfil} disabled={salvandoPerfil}>
                            {salvandoPerfil ? 'Salvando...' : 'Salvar perfil'}
                        </button>
                    </div>
                </Section>

                {/* ── Segurança ── */}
                <Section title="🔒 Segurança">
                    {alertaSenha && <Alert {...alertaSenha} />}
                    <Field label="Senha atual">
                        <Input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} placeholder="••••••••" />
                    </Field>
                    <Field label="Nova senha">
                        <Input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Mín. 6 caracteres" />
                    </Field>
                    <Field label="Confirmar nova senha">
                        <Input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="Repita a nova senha" />
                    </Field>
                    <button style={btnStyle(salvandoSenha)} onClick={salvarSenha} disabled={salvandoSenha}>
                        {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
                    </button>
                </Section>

                {/* ── Notificações ── */}
                <Section title="🔔 Notificações">
                    <ToggleRow label="Notificações por e-mail" sub="Receba atualizações no seu e-mail" checked={notifs.email} onChange={v => setNotifs(p => ({ ...p, email: v }))} />
                    <ToggleRow label="Lembretes de estudo" sub="Avisos diários para manter sua sequência" checked={notifs.lembretes} onChange={v => setNotifs(p => ({ ...p, lembretes: v }))} />
                    <ToggleRow label="Relatórios de progresso" sub="Resumo semanal de evolução" checked={notifs.progresso} onChange={v => setNotifs(p => ({ ...p, progresso: v }))} />
                    <ToggleRow label="Novidades da plataforma" sub="Lançamentos e novas trilhas" checked={notifs.novidades} onChange={v => setNotifs(p => ({ ...p, novidades: v }))} />
                </Section>

                {/* ── Aparência ── */}
                <Section title="🎨 Aparência">
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>Tema da interface</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {[
                            { key: 'light', label: 'Claro', bg: '#f8fafc', border: '#e2e8f0' },
                            { key: 'dark', label: 'Escuro', bg: '#060b18', border: '#1e293b' },
                            { key: 'midnight', label: 'Midnight', bg: '#0a0014', border: '#2d1b69' },
                            { key: 'slate', label: 'Slate', bg: '#0f172a', border: '#1e293b' },
                        ].map(({ key, label, bg, border }) => (
                            <div
                                key={key}
                                onClick={() => setTema(key)}
                                style={{
                                    flex: 1, padding: '14px 12px', borderRadius: 'var(--radius-sm)',
                                    background: bg, border: `0.5px solid ${tema === key ? 'var(--indigo)' : border}`,
                                    cursor: 'pointer', textAlign: 'center', transition: 'border-color .15s',
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 500, color: tema === key ? '#a5b4fc' : 'var(--text-muted)', marginTop: 4 }}>
                                    {label}
                                </div>
                                {tema === key && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                                        <Check size={12} color="#6366f1" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 12 }}>
                        Mais temas em breve nas próximas versões.
                    </p>
                </Section>
            </div>

            {/* ── Planos Disponíveis ── */}
            <div className="dash-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.12) 0%, rgba(99,102,241,.04) 100%)', borderColor: 'var(--indigo-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                            Conheça nossos planos ✨
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            Veja os planos disponíveis e evolua seus estudos.
                        </div>
                    </div>
                    <button onClick={() => navigate('/planos')} style={{ ...btnStyle(false), background: 'var(--indigo)', border: 'none', color: '#fff', whiteSpace: 'nowrap' }}>
                        Ver Planos Disponíveis <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </>
    )
}

export default ConfiguracoesPage
