import React, { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Brain } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [erro, setErro] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [larguraJanela, setLarguraJanela] = useState(window.innerWidth)
    const navegar = useNavigate()

    React.useEffect(() => {
        const lidarComRedimensionamento = () => setLarguraJanela(window.innerWidth)
        window.addEventListener('resize', lidarComRedimensionamento)
        return () => window.removeEventListener('resize', lidarComRedimensionamento)
    }, [])

    const ehMobile = larguraJanela < 768

    const lidarComLogin = async (e) => {
        e.preventDefault()
        setCarregando(true)
        setErro('')
        try {
            await signInWithEmailAndPassword(auth, email, senha)
            navegar('/dashboard')
        } catch (err) {
            setErro('E-mail ou senha inválidos.')
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: ehMobile ? 'column' : 'row',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Painel Esquerdo */}
            <div style={{
                flex: ehMobile ? 'none' : 1,
                background: 'linear-gradient(145deg, #7c3aed 0%, #4f46e5 60%, #3730a3 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: ehMobile ? '40px 24px' : '80px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Círculos decorativos */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, backdropFilter: 'blur(10px)' }}>
                    <Brain size={40} color="white" />
                </motion.div>

                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: ehMobile ? 40 : 52, fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
                    IntelectusIA
                </motion.h1>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    style={{ fontSize: ehMobile ? 16 : 17, color: 'rgba(255,255,255,0.8)', maxWidth: 380, marginBottom: ehMobile ? 32 : 48, lineHeight: 1.6 }}>
                    Descubra seu caminho profissional com trilhas de estudo criadas por inteligência artificial.
                </motion.p>

                {[
                    { titulo: 'Personalização com IA', desc: 'Trilhas únicas baseadas no seu perfil', delay: 0.15 },
                    { titulo: 'Visualização Clara', desc: 'Árvore de conhecimento interativa', delay: 0.25 }
                ].map(({ titulo, desc, delay }) => (
                    <motion.div key={titulo} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Brain size={20} color="white" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: 15 }}>{titulo}</p>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Painel Direito - Formulário */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: ehMobile ? 'stretch' : 'center',
                padding: ehMobile ? '40px 24px' : '40px',
                background: 'white',
                color: '#1e293b',
                minWidth: 0
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Bem-vindo de volta</h2>
                    <p style={{ color: '#94a3b8', marginBottom: 40, fontSize: 15 }}>Faça login para continuar sua trilha</p>

                    <form onSubmit={lidarComLogin}>
                        {/* E-mail */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>E-mail</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 48px',
                                        background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14,
                                        fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
                                        transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#5849ff'; e.target.style.boxShadow = '0 0 0 4px rgba(88,73,255,0.08)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Senha</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                <input
                                    type={mostrarSenha ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '14px 48px 14px 48px',
                                        background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14,
                                        fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#5849ff'; e.target.style.boxShadow = '0 0 0 4px rgba(88,73,255,0.08)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                                />
                                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: 28 }}>
                            <a href="#" style={{ fontSize: 13, color: '#5849ff', textDecoration: 'none', fontWeight: 500 }}>Esqueceu a senha?</a>
                        </div>

                        {erro && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 14 }}>
                                {erro}
                            </div>
                        )}

                        <button type="submit" disabled={carregando} style={{
                            width: '100%', padding: '15px', background: carregando ? '#a5b4fc' : '#5849ff',
                            color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700,
                            cursor: carregando ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif',
                            boxShadow: '0 8px 20px rgba(88,73,255,0.25)'
                        }}
                            onMouseEnter={e => { if (!carregando) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 24px rgba(88,73,255,0.35)' } }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px rgba(88,73,255,0.25)' }}
                        >
                            {carregando ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#64748b' }}>
                        Não tem uma conta?{' '}
                        <Link to="/register" style={{ color: '#5849ff', fontWeight: 700, textDecoration: 'none' }}>Criar agora</Link>
                    </p>
                </div>

                <footer style={{ marginTop: 'auto', textAlign: 'center', fontSize: 11, color: '#cbd5e1', paddingTop: 32 }}>
                    <p>Grupo: Fellipe, Miguel e Nicolas</p>
                    <p>Professores: Douglas e Ricardo | 3º ano B</p>
                </footer>
            </div>
        </div>
    )
}

export default Login

