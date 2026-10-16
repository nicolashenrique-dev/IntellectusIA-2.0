import React, { useState } from 'react'
import { auth } from '../firebase'
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { Check, AlertCircle } from 'lucide-react'

const Section = ({ title, children }) => (
  <div className="dash-card" style={{ gap: 0, padding: '20px 22px' }}>
    <div
      style={{
        fontSize: '13.5px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '16px',
      }}
    >
      {title}
    </div>
    {children}
  </div>
)

const Field = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
    <label
      style={{
        fontSize: 12.5,
        fontWeight: 500,
        color: 'var(--text-secondary)',
        letterSpacing: '-0.01em',
      }}
    >
      {label}
    </label>
    {children}
    {hint && <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{hint}</span>}
  </div>
)

const Input = ({ ...props }) => (
  <input
    {...props}
    className="apple-input"
    style={{
      ...props.style,
    }}
  />
)

const Alert = ({ type, message }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      borderRadius: 'var(--radius-sm)',
      fontSize: 12.5,
      marginBottom: 14,
      background: type === 'success' ? 'var(--apple-green-dim)' : 'var(--apple-red-dim)',
      border: `1px solid ${type === 'success' ? 'var(--apple-green-border)' : 'var(--apple-red-border)'}`,
      color: type === 'success' ? 'var(--apple-green)' : 'var(--apple-red)',
    }}
  >
    {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
    <span>{message}</span>
  </div>
)

const Configuracao = () => {
  const user = auth.currentUser

  const [nome, setNome] = useState(user?.displayName || '')
  const [emailAtual, setEmailAtual] = useState(user?.email || '')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [alertaPerfil, setAlertaPerfil] = useState(null)
  const [alertaSenha, setAlertaSenha] = useState(null)

  const [tema, setTema] = useState(localStorage.getItem('intelectus_theme') || 'light')

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
      setAlertaPerfil({
        type: 'error',
        message:
          e.code === 'auth/requires-recent-login'
            ? 'Faça login novamente para alterar o e-mail.'
            : 'Erro ao atualizar dados do perfil.',
      })
    } finally {
      setSalvandoPerfil(false)
    }
  }

  const salvarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      setAlertaSenha({ type: 'error', message: 'As senhas não coincidem.' })
      return
    }
    if (novaSenha.length < 6) {
      setAlertaSenha({ type: 'error', message: 'A senha deve ter ao menos 6 caracteres.' })
      return
    }
    setSalvandoSenha(true)
    setAlertaSenha(null)
    try {
      const cred = EmailAuthProvider.credential(user.email, senhaAtual)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, novaSenha)
      setAlertaSenha({ type: 'success', message: 'Senha atualizada com sucesso!' })
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (e) {
      setAlertaSenha({
        type: 'error',
        message:
          e.code === 'auth/wrong-password' ? 'Senha atual incorreta.' : 'Erro ao atualizar senha.',
      })
    } finally {
      setSalvandoSenha(false)
    }
  }

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
          Configurações do Sistema
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
          Atualize seus dados e escolha como prefere usar seu espaço.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 16,
        }}
      >
        {/* ── Perfil de Usuário ── */}
        <Section title="Perfil de Usuário">
          {alertaPerfil && <Alert {...alertaPerfil} />}
          <Field label="Nome Completo">
            <Input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          </Field>
          <Field
            label="E-mail de Acesso"
            hint="Necessário reautenticar para alterar seu e-mail principal."
          >
            <Input
              type="email"
              value={emailAtual}
              onChange={(e) => setEmailAtual(e.target.value)}
              placeholder="seu@email.com"
            />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-apple-primary" onClick={salvarPerfil} disabled={salvandoPerfil}>
              {salvandoPerfil ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </Section>

        {/* ── Segurança ── */}
        <Section title="Segurança & Credenciais">
          {alertaSenha && <Alert {...alertaSenha} />}
          <Field label="Senha Atual">
            <Input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Nova Senha">
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </Field>
          <Field label="Confirmar Nova Senha">
            <Input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-apple-secondary" onClick={salvarSenha} disabled={salvandoSenha}>
              {salvandoSenha ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </div>
        </Section>

        {/* ── Aparência / Tema ── */}
        <Section title="Aparência & Ambiente">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Tema da Interface
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                background: 'var(--surface)',
                padding: 4,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}
            >
              {[
                { id: 'dark', label: 'Escuro' },
                { id: 'light', label: 'Claro' },
                { id: 'slate', label: 'Grafite' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTema(t.id)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    background: tema === t.id ? 'var(--card-bg)' : 'transparent',
                    color: tema === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 500,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    boxShadow: tema === t.id ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                    transition: 'background-color 140ms ease, color 140ms ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}

export default Configuracao
