import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Youtube, Brain, Loader2, Play, ChevronRight, BookOpen, Clock, Zap } from 'lucide-react'

const IARecomendacao = ({ perfilInicial = {} }) => {
    const [etapa, setEtapa] = useState('formulario') // formulario | carregando | resultado
    const [formulario, setFormulario] = useState({
        interesse: perfilInicial.interesse || '',
        nivel: perfilInicial.nivel || '',
        objetivo: perfilInicial.objetivo || ''
    })
    const [recomendacao, setRecomendacao] = useState(null)
    const [videos, setVideos] = useState([])
    const [moduloSelecionado, setModuloSelecionado] = useState(null)
    const [carregandoVideos, setCarregandoVideos] = useState(false)
    const [erro, setErro] = useState('')

    const gerarRecomendacao = async (e) => {
        e.preventDefault()
        setEtapa('carregando')
        setErro('')

        try {
            const resposta = await fetch('https://projeto-sem.vercel.app/ia/recomendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            })
            const dados = await resposta.json()

            if (dados.success) {
                setRecomendacao(dados.recomendacao)
                setEtapa('resultado')
                if (dados.aviso) console.warn(dados.aviso)
            } else {
                throw new Error('Falha ao gerar recomendação')
            }
        } catch (err) {
            setErro('Erro ao conectar com a IA. Verifique se o Ollama está rodando.')
            setEtapa('formulario')
        }
    }

    const buscarVideosModulo = async (modulo) => {
        setModuloSelecionado(modulo)
        setCarregandoVideos(true)
        setVideos([])

        try {
            const tema = encodeURIComponent(`${modulo.nome} ${formulario.interesse}`)
            const resposta = await fetch(`https://projeto-sem.vercel.app/ia/videos?tema=${tema}&nivel=${formulario.nivel}`)
            const dados = await resposta.json()
            if (dados.success) setVideos(dados.videos)
        } catch (err) {
            console.error('Erro ao buscar vídeos:', err)
        } finally {
            setCarregandoVideos(false)
        }
    }

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {etapa === 'formulario' && (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-[#5849ff]/20 rounded-xl flex items-center justify-center">
                                <Brain size={24} className="text-[#5849ff]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Recomendação com IA</h2>
                                <p className="text-slate-400 text-sm">Ollama llama3.1 gerará sua trilha personalizada</p>
                            </div>
                        </div>

                        <form onSubmit={gerarRecomendacao} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Interesse Principal</label>
                                <select
                                    value={formulario.interesse}
                                    onChange={e => setFormulario({ ...formulario, interesse: e.target.value })}
                                    required
                                    className="ia-select"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Programação Web">Programação Web</option>
                                    <option value="Ciência de Dados">Ciência de Dados</option>
                                    <option value="Design UX/UI">Design UX/UI</option>
                                    <option value="Arquitetura de Software">Arquitetura de Software</option>
                                    <option value="Marketing Digital">Marketing Digital</option>
                                    <option value="DevOps">DevOps</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nível Atual</label>
                                <select
                                    value={formulario.nivel}
                                    onChange={e => setFormulario({ ...formulario, nivel: e.target.value })}
                                    required
                                    className="ia-select"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Iniciante">Iniciante</option>
                                    <option value="Intermediário">Intermediário</option>
                                    <option value="Avançado">Avançado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Objetivo</label>
                                <select
                                    value={formulario.objetivo}
                                    onChange={e => setFormulario({ ...formulario, objetivo: e.target.value })}
                                    required
                                    className="ia-select"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Primeiro emprego na área">Primeiro emprego na área</option>
                                    <option value="Transição de carreira">Transição de carreira</option>
                                    <option value="Especialização técnica">Especialização técnica</option>
                                    <option value="Crescimento salarial">Crescimento salarial</option>
                                </select>
                            </div>

                            {erro && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl">{erro}</p>}

                            <button type="submit" className="btn-primary w-full justify-center py-4">
                                <Zap size={20} />
                                Gerar Trilha com IA
                            </button>
                        </form>
                    </motion.div>
                )}

                {etapa === 'carregando' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        >
                            <Brain size={56} className="text-[#5849ff] mb-6" />
                        </motion.div>
                        <h3 className="text-xl font-bold mt-6 mb-2">IA Analisando seu perfil...</h3>
                        <p className="text-slate-400">Ollama llama3.1 está gerando sua trilha personalizada</p>
                    </motion.div>
                )}

                {etapa === 'resultado' && recomendacao && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass p-6 rounded-2xl mb-6 border-l-4 border-[#5849ff]">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-[#5849ff] font-bold">Trilha Recomendada por IA</span>
                                    <h2 className="text-2xl font-bold mt-1">{recomendacao.titulo}</h2>
                                    <p className="text-slate-400 mt-2">{recomendacao.descricao}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-4 py-2 rounded-full">
                                    <Clock size={14} />
                                    {recomendacao.duracao_estimada}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-4">Módulos da Trilha</h3>
                        <div className="space-y-3 mb-8">
                            {recomendacao.modulos?.map((modulo) => (
                                <button
                                    key={modulo.ordem}
                                    onClick={() => buscarVideosModulo(modulo)}
                                    className={`w-full text-left glass p-4 rounded-xl transition-all flex items-center gap-4 ${moduloSelecionado?.ordem === modulo.ordem ? 'border-[#5849ff]/50 bg-[#5849ff]/5' : 'hover:bg-white/5'}`}
                                >
                                    <div className="w-8 h-8 bg-[#5849ff]/20 rounded-lg flex items-center justify-center text-sm font-bold text-[#5849ff] shrink-0">
                                        {modulo.ordem}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{modulo.nome}</p>
                                        <p className="text-sm text-slate-400">{modulo.descricao} • {modulo.duracao}</p>
                                    </div>
                                    <Youtube size={20} className="text-red-400 shrink-0" />
                                </button>
                            ))}
                        </div>

                        {(carregandoVideos || videos.length > 0) && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Youtube size={20} className="text-red-400" />
                                    <h3 className="text-lg font-bold">Vídeos: {moduloSelecionado?.nome}</h3>
                                    {carregandoVideos && <Loader2 size={18} className="animate-spin text-slate-400" />}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {videos.map((video) => (
                                        <a
                                            key={video.id}
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="glass rounded-xl overflow-hidden hover:border-red-400/30 transition-all group"
                                        >
                                            <div className="relative">
                                                <img src={video.thumbnail} alt={video.titulo} className="w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                                        <Play size={20} fill="white" color="white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <p className="font-semibold text-sm line-clamp-2 mb-1">{video.titulo}</p>
                                                <p className="text-xs text-slate-400">{video.canal}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {moduloSelecionado && !carregandoVideos && videos.length === 0 && (
                            <p className="text-center text-slate-500 py-8">Nenhum vídeo encontrado. Verifique sua chave da API do YouTube.</p>
                        )}

                        <button onClick={() => { setEtapa('formulario'); setRecomendacao(null); setVideos([]) }}
                            className="mt-6 w-full py-3 glass rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium">
                            Gerar Nova Trilha
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default IARecomendacao
