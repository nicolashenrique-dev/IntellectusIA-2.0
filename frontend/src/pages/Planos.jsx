import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Sparkles, Zap, Shield } from 'lucide-react'

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
    --card-bg: rgba(15,23,42,0.55);
    --radius: 16px;
    --radius-sm: 8px;
  }

  .planos-container {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text-primary);
    font-family: system-ui, -apple-system, sans-serif;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .planos-header {
    width: 100%;
    max-width: 1000px;
    display: flex;
    align-items: center;
    margin-bottom: 40px;
  }

  .btn-voltar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 0.5px solid var(--border);
    color: var(--text-secondary);
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-voltar:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .planos-title-wrapper {
    text-align: center;
    margin-bottom: 48px;
  }

  .planos-title {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 12px;
  }

  .planos-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    max-width: 500px;
    margin: 0 auto;
  }

  .planos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    width: 100%;
    max-width: 1000px;
  }

  .plano-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform 0.2s, border-color 0.2s;
  }

  .plano-card:hover {
    transform: translateY(-4px);
    border-color: var(--border-hover);
  }

  .plano-card.popular {
    border-color: var(--indigo);
    background: linear-gradient(to bottom, rgba(99,102,241,0.05), var(--card-bg));
  }

  .badge-popular {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--indigo);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 0.5px;
  }

  .plano-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .plano-name {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .plano-price {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 24px;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .plano-price span {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-muted);
  }

  .plano-features {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
    flex: 1;
  }

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .feature-icon {
    color: var(--indigo);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .btn-plano {
    width: 100%;
    padding: 12px;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: var(--indigo);
    color: #fff;
  }

  .btn-primary:hover {
    background: #4f46e5;
  }

  .btn-secondary {
    background: var(--surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .btn-secondary:hover {
    background: var(--surface-hover);
  }
`

const PlanosPage = () => {
    const navigate = useNavigate()

    return (
        <>
            <style>{css}</style>
            <div className="planos-container">
                <div className="planos-header">
                    <button className="btn-voltar" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> Voltar
                    </button>
                </div>

                <div className="planos-title-wrapper">
                    <h1 className="planos-title">Escolha o plano ideal para você</h1>
                    <p className="planos-subtitle">
                        Evolua seus estudos com recursos avançados de IA e trilhas ilimitadas.
                    </p>
                </div>

                <div className="planos-grid">
                    {/* Plano Free */}
                    <div className="plano-card">
                        <div className="plano-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            <Shield size={24} />
                        </div>
                        <div className="plano-name">Básico</div>
                        <div className="plano-price">Grátis</div>
                        
                        <div className="plano-features">
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" style={{ color: 'var(--text-secondary)' }} />
                                <span>Acesso a trilhas públicas</span>
                            </div>
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" style={{ color: 'var(--text-secondary)' }} />
                                <span>Geração de 1 trilha por dia com IA</span>
                            </div>
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" style={{ color: 'var(--text-secondary)' }} />
                                <span>Acompanhamento básico de progresso</span>
                            </div>
                        </div>

                        <button className="btn-plano btn-secondary">Plano Atual</button>
                    </div>

                    {/* Plano Pro (Popular) */}
                    <div className="plano-card popular">
                        <div className="badge-popular">Mais popular</div>
                        <div className="plano-icon" style={{ background: 'var(--indigo-dim)', color: '#a5b4fc' }}>
                            <Zap size={24} />
                        </div>
                        <div className="plano-name">Pro</div>
                        <div className="plano-price">R$ 29<span>/mês</span></div>
                        
                        <div className="plano-features">
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" />
                                <span>Geração de trilhas ilimitadas com IA</span>
                            </div>
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" />
                                <span>Acesso offline aos conteúdos</span>
                            </div>
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" />
                                <span>Estatísticas detalhadas e avançadas</span>
                            </div>
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" />
                                <span>Suporte prioritário via chat</span>
                            </div>
                        </div>

                        <button className="btn-plano btn-primary">Assinar Pro</button>
                    </div>

                    {/* Plano Premium */}
                    <div className="plano-card">
                        <div className="plano-icon" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                            <Sparkles size={24} />
                        </div>
                        <div className="plano-name">Premium</div>
                        <div className="plano-price">R$ 59<span>/mês</span></div>
                        
                        <div className="plano-features">
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" style={{ color: '#fbbf24' }} />
                                <span>Tudo do plano Pro</span>
                            </div>
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" style={{ color: '#fbbf24' }} />
                                <span>Mentorias semanais em grupo</span>
                            </div>
                            <div className="feature-item">
                                <Check size={16} className="feature-icon" style={{ color: '#fbbf24' }} />
                                <span>Certificados exclusivos validados</span>
                            </div>
                        </div>

                        <button className="btn-plano btn-secondary" style={{ borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24' }}>Assinar Premium</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PlanosPage
