import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import Roadmap from './pages/Roadmap'
import PaginaIA from './pages/PaginaIA'
import PlanosPage from './pages/Planos'

function App() {
    const [carregando, setCarregando] = React.useState(true)
    const [usuario, setUsuario] = React.useState(null)

    React.useEffect(() => {
        const t = localStorage.getItem('intelectus_theme') || 'dark';
        document.body.className = `theme-${t}`;

        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    await fetch(`${apiUrl}/autenticacao/cadastro`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            uid: u.uid,
                            nome: u.displayName || u.email.split('@')[0],
                            email: u.email,
                            password: 'dummy-password'
                        })
                    });
                } catch (err) {
                    console.error('Erro ao sincronizar usuário com o backend:', err);
                }
            }
            setUsuario(u)
            setCarregando(false)
        })
        return () => unsub()
    }, []);

    if (carregando) {
        return (
            <div style={{
                display: 'flex',
                height: '100vh',
                width: '100vw',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#060b18',
                color: '#f1f5f9',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '4px solid rgba(99, 102, 241, 0.1)',
                    borderTopColor: '#6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={usuario ? <Navigate to="/dashboard" /> : <Register />} />
                <Route path="/dashboard" element={usuario ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/quiz" element={usuario ? <Quiz /> : <Navigate to="/login" />} />
                <Route path="/roadmap" element={usuario ? <Roadmap /> : <Navigate to="/login" />} />
                <Route path="/ia" element={usuario ? <PaginaIA /> : <Navigate to="/login" />} />
                <Route path="/planos" element={usuario ? <PlanosPage /> : <Navigate to="/login" />} />
                <Route path="/" element={usuario ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    )
}

export default App

