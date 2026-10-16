import { useState } from 'react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem('lembrarEmail') || '')
  const [senha, setSenha] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [lembrar, setLembrar] = useState(() => !!localStorage.getItem('lembrarEmail'))
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    setAviso('')
    try {
      await setPersistence(auth, lembrar ? browserLocalPersistence : inMemoryPersistence)
      await signInWithEmailAndPassword(auth, email.trim(), senha)
      if (lembrar) localStorage.setItem('lembrarEmail', email.trim())
      else localStorage.removeItem('lembrarEmail')
      navigate('/dashboard')
    } catch (e) {
      setErro(
        e.code === 'auth/network-request-failed'
          ? 'Não foi possível conectar. Verifique sua internet.'
          : e.code === 'auth/too-many-requests'
            ? 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
            : 'Não foi possível entrar. Confira seu e-mail e sua senha.',
      )
    } finally {
      setLoading(false)
    }
  }
  async function reset() {
    setErro('')
    setAviso('')
    if (!email.trim()) {
      setErro('Preencha seu e-mail para recuperar a senha.')
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setAviso(
        'Se houver uma conta com esse e-mail, você receberá as instruções para redefinir a senha.',
      )
    } catch {
      setErro('Não foi possível solicitar a recuperação. Confira o e-mail e tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout>
      <span className="eyebrow">BOM TER VOCÊ POR AQUI</span>
      <h2>Continue de onde parou.</h2>
      <p className="auth-description">Entre para acessar sua trilha e dar o próximo passo.</p>
      <form className="auth-form" onSubmit={submit}>
        {erro && (
          <div className="form-message error" role="alert">
            {erro}
          </div>
        )}
        {aviso && (
          <div className="form-message" role="status">
            {aviso}
          </div>
        )}
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          autoComplete="email"
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="field-heading">
          <label htmlFor="senha">Senha</label>
          <button className="text-button" type="button" disabled={loading} onClick={reset}>
            Esqueceu a senha?
          </button>
        </div>
        <div className="password-field">
          <input
            id="senha"
            autoComplete="current-password"
            type={mostrar ? 'text' : 'password'}
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setMostrar(!mostrar)}
          >
            {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <label className="checkbox-label">
          <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
          Lembrar de mim neste dispositivo
        </label>
        <button className="auth-submit" disabled={loading}>
          {loading ? 'Aguarde…' : 'Entrar na minha conta'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
      <div className="auth-note">
        <span>NO SEU RITMO</span>
        <p>
          Você não precisa ter todas as respostas.
          <br />
          Só precisa de um lugar para começar.
        </p>
      </div>
    </AuthLayout>
  )
}
