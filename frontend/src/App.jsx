import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Login from './pages/Login'
import Register from './pages/Register'
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Quiz = React.lazy(() => import('./pages/Quiz'))
const Roadmap = React.lazy(() => import('./pages/Roadmap'))
const PaginaIA = React.lazy(() => import('./pages/PaginaIA'))
const PlanosPage = React.lazy(() => import('./pages/Planos'))

function App() {
  const [carregando, setCarregando] = React.useState(true)
  const [usuario, setUsuario] = React.useState(null)

  React.useEffect(() => {
    const t = localStorage.getItem('intelectus_theme') || 'light'
    document.body.className = `theme-${t}`

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUsuario(u)
      setCarregando(false)
    })
    return () => unsub()
  }, [])

  if (carregando) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '2.5px solid rgba(255, 255, 255, 0.08)',
            borderTopColor: '#0a84ff',
            borderRadius: '50%',
            animation: 'apple-spin 0.65s linear infinite',
          }}
        />
        <style>{`@keyframes apple-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <Router>
      <React.Suspense
        fallback={
          <div className="page-loading" role="status">
            Carregando seu espaço…
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={usuario ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={usuario ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/quiz" element={usuario ? <Quiz /> : <Navigate to="/login" />} />
          <Route path="/roadmap" element={usuario ? <Roadmap /> : <Navigate to="/login" />} />
          <Route path="/planejamento" element={usuario ? <PaginaIA /> : <Navigate to="/login" />} />
          <Route
            path="/ia"
            element={usuario ? <Navigate to="/planejamento" /> : <Navigate to="/login" />}
          />
          <Route path="/planos" element={usuario ? <PlanosPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={usuario ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
        </Routes>
      </React.Suspense>
    </Router>
  )
}

export default App
