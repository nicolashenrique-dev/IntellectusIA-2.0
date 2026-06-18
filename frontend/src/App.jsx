import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import Roadmap from './pages/Roadmap'
import PaginaIA from './pages/PaginaIA'
import PlanosPage from './pages/Planos'

function App() {
    React.useEffect(() => {
        const t = localStorage.getItem('intelectus_theme') || 'dark';
        document.body.className = `theme-${t}`;
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/ia" element={<PaginaIA />} />
                <Route path="/planos" element={<PlanosPage />} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    )
}

export default App

