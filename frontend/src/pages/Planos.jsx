import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'

const PlanosPage = () => {
  const navigate = useNavigate()

  const planos = [
    {
      id: 'starter',
      nome: 'Fundamental',
      descricao: 'Para profissionais iniciando seu mapeamento de competências.',
      preco: 'Gratuito',
      periodo: '',
      popular: false,
      recursos: [
        'Acesso a 1 trilha ativa',
        'Mapeamento básico de competências',
        'Módulos com curadoria essencial',
        'Métricas de progresso',
      ],
      cta: 'Plano Atual',
      disabled: true,
    },
    {
      id: 'pro',
      nome: 'Profissional Pro',
      descricao: 'Para quem busca aceleração contínua e especialização técnica.',
      preco: 'R$ 29,90',
      periodo: '/mês',
      popular: true,
      recursos: [
        'Trilhas ilimitadas e simultâneas',
        'Diagnóstico curricular aprofundado',
        'Aulas e referências expandidas',
        'Relatórios detalhados de evolução',
        'Certificação modular de conclusão',
        'Suporte prioritário à comunidade',
      ],
      cta: 'Assinar Plano Pro',
      disabled: false,
    },
    {
      id: 'enterprise',
      nome: 'Corporativo',
      descricao: 'Para equipes e empresas que treinam seus times técnicos.',
      preco: 'Sob consulta',
      periodo: '',
      popular: false,
      recursos: [
        'Gestão centralizada de equipes',
        'Trilhas customizadas por cargo',
        'Dashboard analítico de liderança',
        'Integração SSO corporativa',
        'Gestor de conta dedicado',
      ],
      cta: 'Falar com Consultor',
      disabled: false,
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: 500,
            transition: 'background-color 120ms ease, color 120ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Dashboard</span>
        </button>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '560px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '10px',
          }}
        >
          Planos de Formação
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
          }}
        >
          Escolha o nível ideal para estruturar seus estudos e avançar em suas metas de carreira.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '1000px',
        }}
      >
        {planos.map((p) => {
          const isPop = p.popular
          return (
            <div
              key={p.id}
              style={{
                background: isPop ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: isPop ? '1px solid rgba(10, 132, 255, 0.35)' : '1px solid var(--border)',
                borderRadius: '18px',
                padding: '32px 26px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: isPop
                  ? '0 12px 36px rgba(10, 132, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                  : '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
              }}
            >
              {isPop && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--apple-blue)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    padding: '3px 12px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(10, 132, 255, 0.4)',
                  }}
                >
                  Recomendado
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    marginBottom: '6px',
                  }}
                >
                  {p.nome}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    minHeight: '38px',
                    lineHeight: 1.45,
                  }}
                >
                  {p.descricao}
                </p>
              </div>

              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                }}
              >
                {p.preco}
                {p.periodo && (
                  <span style={{ fontSize: '13.5px', fontWeight: 400, color: 'var(--text-muted)' }}>
                    {p.periodo}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '32px',
                  flex: 1,
                }}
              >
                {p.recursos.map((rec) => (
                  <div
                    key={rec}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'rgba(48, 209, 88, 0.12)',
                        border: '1px solid rgba(48, 209, 88, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#30d158',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={11} />
                    </div>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={p.disabled}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: isPop ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: isPop ? 'var(--apple-blue)' : 'rgba(255, 255, 255, 0.05)',
                  color: isPop ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: p.disabled ? 'default' : 'pointer',
                  opacity: p.disabled ? 0.6 : 1,
                  boxShadow: isPop ? '0 4px 14px rgba(10, 132, 255, 0.25)' : 'none',
                  transition: 'background-color 140ms ease, transform 90ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!p.disabled) {
                    e.currentTarget.style.backgroundColor = isPop ? '#0071e3' : 'var(--border)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!p.disabled) {
                    e.currentTarget.style.backgroundColor = isPop
                      ? 'var(--apple-blue)'
                      : 'rgba(255, 255, 255, 0.05)'
                  }
                }}
                onMouseDown={(e) => {
                  if (!p.disabled) e.currentTarget.style.transform = 'scale(0.98)'
                }}
                onMouseUp={(e) => {
                  if (!p.disabled) e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {p.cta}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlanosPage
