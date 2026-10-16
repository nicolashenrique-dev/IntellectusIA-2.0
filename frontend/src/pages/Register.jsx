import { useState } from 'react'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  setPersistence,
  inMemoryPersistence,
  updateProfile,
} from 'firebase/auth'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await setPersistence(auth, inMemoryPersistence)
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(user, { displayName: name.trim() })
      navigate('/quiz')
    } catch (e) {
      setError(
        e.code === 'auth/email-already-in-use'
          ? 'Este e-mail já tem uma conta. Entre para continuar.'
          : e.code === 'auth/weak-password'
            ? 'Escolha uma senha com pelo menos 6 caracteres.'
            : 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout register>
      <span className="eyebrow">SEU PRIMEIRO PASSO</span>
      <h2>
        Abra espaço para
        <br />
        novas possibilidades.
      </h2>
      <p className="auth-description">Crie sua conta e comece a descobrir seu caminho.</p>
      <form className="auth-form" onSubmit={submit}>
        {error && (
          <div className="form-message error" role="alert">
            {error}
          </div>
        )}
        <label htmlFor="name">Como podemos chamar você?</label>
        <input
          id="name"
          autoComplete="name"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          pattern=".*\S.*"
        />
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
        <label htmlFor="password">Senha</label>
        <div className="password-field">
          <input
            id="password"
            autoComplete="new-password"
            type={show ? 'text' : 'password'}
            placeholder="Pelo menos 6 caracteres"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button className="auth-submit" disabled={loading}>
          {loading ? 'Criando sua conta…' : 'Começar minha jornada'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </AuthLayout>
  )
}
