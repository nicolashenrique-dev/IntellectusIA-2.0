import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import IARecomendacao from '../components/IARecomendacao'

const PaginaIA = () => {
  const navegar = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        padding: '32px 24px',
      }}
    >
      <header
        style={{
          maxWidth: '900px',
          margin: '0 auto 36px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button
          onClick={() => navegar('/dashboard')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '-0.024em',
              margin: 0,
              color: 'var(--text-primary)',
            }}
          >
            Meu plano de estudos
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Organize o que você quer aprender e encontre por onde começar.
          </p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <IARecomendacao />
      </motion.div>
    </div>
  )
}

export default PaginaIA
