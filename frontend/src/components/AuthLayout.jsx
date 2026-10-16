import { BookOpen, ArrowUpRight, Check, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ children, register = false }) {
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="wordmark" to="/">
          <BookOpen size={25} strokeWidth={1.6} /> intellectus<span className="brand-dot">.</span>
        </Link>
        <div className="auth-story-content">
          <span className="eyebrow">UM CAMINHO PARA O SEU FUTURO</span>
          <h1 style={{ color: '#173220' }}>
            Seu próximo passo
            <br />
            começa com uma
            <br />
            <em style={{ color: '#3b6b45' }}>boa direção.</em>
          </h1>
          <p>
            Explore seus interesses. Encontre o que faz sentido para você. Transforme a vontade de
            aprender em um caminho possível.
          </p>
          <div className="study-preview" aria-label="Exemplo de uma trilha de estudos">
            <div className="preview-heading">
              <span>SEU CAMINHO, PASSO A PASSO</span>
              <ArrowUpRight size={18} />
            </div>
            <div className="preview-step">
              <span className="step-dot done">
                <Check size={15} />
              </span>
              <div>
                <strong>Descubra seus interesses</strong>
                <small>O ponto de partida é você</small>
              </div>
            </div>
            <div className="preview-step">
              <span className="step-dot current">02</span>
              <div>
                <strong>Aprenda com uma trilha</strong>
                <small>Conteúdos organizados, no seu ritmo</small>
              </div>
              <Play size={16} />
            </div>
            <div className="preview-step">
              <span className="step-dot">03</span>
              <div>
                <strong>Construa seu próximo passo</strong>
                <small>Mais clareza a cada descoberta</small>
              </div>
            </div>
          </div>
        </div>
        <footer className="auth-story-footer">
          <span>Aprender abre caminhos.</span>
          <span>Feito para quem está começando.</span>
        </footer>
      </section>
      <section className="auth-panel">
        <div className="auth-switch">
          {register ? 'Já tem uma conta?' : 'Primeira vez aqui?'}{' '}
          <Link to={register ? '/login' : '/register'}>
            {register ? 'Entrar' : 'Criar conta'} <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="auth-form-wrap">{children}</div>
        <p className="auth-footnote">Um espaço para explorar, aprender e seguir em frente.</p>
      </section>
    </main>
  )
}
