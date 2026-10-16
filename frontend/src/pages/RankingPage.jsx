import { useEffect, useState } from 'react'
import { Trophy, CheckCircle2, Award, User } from 'lucide-react'
import { auth } from '../firebase'
import { API_URL } from '../utils/api'
import { fetchComAuth } from '../utils/authToken'

export default function RankingPage() {
  const [ranking, setRanking] = useState([])
  const [usuarioAtual, setUsuarioAtual] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = auth.currentUser

  async function carregarRanking() {
    setLoading(true)
    setError('')
    try {
      const url = `${API_URL}/trilhas/ranking`
      const res = user ? await fetchComAuth(url) : await fetch(url)
      if (!res.ok) throw new Error('Falha ao carregar ranking.')
      const data = await res.json()

      if (data && data.success) {
        setRanking(data.ranking || [])
        setUsuarioAtual(data.usuarioAtual || null)
      } else {
        throw new Error(data?.message || 'Falha ao carregar ranking.')
      }
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar o ranking. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRanking()
  }, [user?.uid])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--text-muted)',
          fontSize: 13.5,
          padding: '32px 0',
        }}
      >
        <div className="dash-spinner" />
        <span>Carregando classificação dos estudantes...</span>
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
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
            Classificação
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
            Pontuação real acumulada com base nas conquistas de todas as suas trilhas.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-message error" role="alert">
          {error}{' '}
          <button className="text-button" onClick={carregarRanking}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Estatísticas principais no mesmo estilo do restante do site */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-label">
            <Trophy size={14} />
            <span>Sua posição</span>
          </div>
          <div className="dash-stat-value">
            {ranking.length > 0 && usuarioAtual?.posicao ? `#${usuarioAtual.posicao}` : '—'}
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">
            <Award size={14} />
            <span>Seus pontos</span>
          </div>
          <div className="dash-stat-value">{usuarioAtual?.pontos || 0} pts</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">
            <CheckCircle2 size={14} />
            <span>Módulos concluídos</span>
          </div>
          <div className="dash-stat-value">{usuarioAtual?.modulosConcluidos || 0}</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">
            <User size={14} />
            <span>Estudantes</span>
          </div>
          <div className="dash-stat-value">{ranking.length}</div>
        </div>
      </div>

      {/* Tabela / Lista em dash-card perfeitamente integrada */}
      <div className="dash-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em',
            }}
          >
            Classificação Geral
          </span>
          <span className="dash-badge">{ranking.length} participantes</span>
        </div>

        {ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 13.5, margin: '0 0 6px 0' }}>
              Nenhum ponto registrado no banco de dados.
            </p>
            <p style={{ fontSize: 12.5, margin: 0 }}>
              Conclua o primeiro módulo na sua trilha para pontuar e liderar a tabela.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ranking.map((aluno) => {
              const isCurrentUser = aluno.isCurrentUser || (user && aluno.uid === user.uid)
              return (
                <div
                  key={aluno.uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isCurrentUser ? 'var(--apple-blue-dim)' : 'var(--surface)',
                    border: isCurrentUser
                      ? '1px solid var(--apple-blue-border)'
                      : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '11px 14px',
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isCurrentUser ? 'var(--apple-blue)' : 'var(--text-muted)',
                        width: 26,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      #{String(aluno.posicao).padStart(2, '0')}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: isCurrentUser ? 600 : 500,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {aluno.nome}
                        </span>
                        {isCurrentUser && (
                          <span
                            className="dash-badge blue"
                            style={{ padding: '1px 6px', fontSize: 10 }}
                          >
                            Você
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {aluno.modulosConcluidos}{' '}
                        {aluno.modulosConcluidos === 1 ? 'módulo concluído' : 'módulos concluídos'}{' '}
                        · {aluno.titulo}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isCurrentUser ? 'var(--apple-blue)' : 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {aluno.pontos}{' '}
                      <small style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>
                        pts
                      </small>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Regras e explicação da pontuação */}
      <div className="dash-card">
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.015em',
          }}
        >
          Como funciona a pontuação
        </span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
            fontSize: 13,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
            }}
          >
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 3 }}>
              +100 pontos por módulo
            </strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              Na primeira conclusão de cada conteúdo e nível. Os pontos permanecem ao trocar de
              trilha.
            </span>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
            }}
          >
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 3 }}>
              +200 pontos de bônus
            </strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              Na primeira conclusão de cada trilha. Repetir a mesma trilha não duplica o bônus.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
