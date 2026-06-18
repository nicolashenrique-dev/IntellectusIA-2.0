import React, { useState } from 'react'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Brain, Sparkles, Target } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const navigate = useNavigate()

    React.useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const isMobile = windowWidth < 768

    const inputStyle = {
        width: '100%', padding: '14px 14px 14px 48px',
        background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14,
        fontSize: 15, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
        transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    name, email, createdAt: new Date().toISOString()
                })
            } catch (dbErr) {
                console.error('Erro ao salvar dados do usuário:', dbErr)
            }
            navigate('/quiz')
        } catch (err) {
            console.error('Erro de autenticação:', err)
            setError(err.message || 'Erro ao criar conta. Verifique os dados.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Painel Esquerdo - Hero */}
            <div style={{
                flex: isMobile ? 'none' : 1,
                background: 'linear-gradient(145deg, #7c3aed 0%, #4f46e5 60%, #3730a3 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: isMobile ? '40px 24px' : '80px',
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
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: isMobile ? 40 : 52, fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
                    IntelectusIA
                </motion.h1>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    style={{ fontSize: isMobile ? 16 : 17, color: 'rgba(255,255,255,0.8)', maxWidth: 380, marginBottom: isMobile ? 32 : 48, lineHeight: 1.6 }}>
                    Junte-se à revolução do aprendizado personalizado e impulsione sua carreira com IA.
                </motion.p>

                {[
                    { icon: Brain, titulo: 'Perfil Inteligente', desc: 'Mapeamos suas habilidades e objetivos', delay: 0.15 },
                    { icon: Sparkles, titulo: 'Trilhas com IA', desc: 'Conteúdo gerado especialmente para você', delay: 0.25 },
                    { icon: Target, titulo: 'Progresso Real', desc: 'Acompanhe sua evolução passo a passo', delay: 0.35 },
                ].map(({ icon: Icon, titulo, desc, delay }) => (
                    <motion.div key={titulo} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={20} color="white" />
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
                alignItems: isMobile ? 'stretch' : 'center',
                padding: isMobile ? '40px 24px' : '40px',
                background: 'white',
                color: '#1e293b',
                minWidth: 0
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>
                            Criar conta
                        </h2>
                        <p style={{ color: '#94a3b8', marginBottom: 36, fontSize: 15 }}>
                            Comece sua jornada de aprendizado agora
                        </p>

                        <form onSubmit={handleRegister}>
                            {/* Nome */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Nome Completo</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = '#5849ff'; e.target.style.boxShadow = '0 0 0 4px rgba(88,73,255,0.08)' }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                                    />
                                </div>
                            </div>

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
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = '#5849ff'; e.target.style.boxShadow = '0 0 0 4px rgba(88,73,255,0.08)' }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Senha</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mínimo 6 caracteres"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        style={{ ...inputStyle, paddingRight: 48 }}
                                        onFocus={e => { e.target.style.borderColor = '#5849ff'; e.target.style.boxShadow = '0 0 0 4px rgba(88,73,255,0.08)' }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 14 }}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '15px',
                                background: loading ? '#a5b4fc' : '#5849ff',
                                color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                                fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 20px rgba(88,73,255,0.25)'
                            }}
                                onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 24px rgba(88,73,255,0.35)' } }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px rgba(88,73,255,0.25)' }}
                            >
                                {loading ? 'Criando conta...' : 'Cadastrar'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#64748b' }}>
                            Já tem uma conta?{' '}
                            <Link to="/login" style={{ color: '#5849ff', fontWeight: 700, textDecoration: 'none' }}>Entrar agora</Link>
                        </p>
                    </motion.div>
                </div>

                <footer style={{ marginTop: 'auto', textAlign: 'center', fontSize: 11, color: '#cbd5e1', paddingTop: 32 }}>
                    <p>Grupo: Fellipe, Miguel e Nicolas</p>
                    <p>Professores: Douglas e Ricardo | 3º ano B</p>
                </footer>
            </div>
        </div>
    )
}

export default Register

