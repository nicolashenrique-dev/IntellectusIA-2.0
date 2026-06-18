import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import IARecomendacao from '../components/IARecomendacao'

const PaginaIA = () => {
    const navegar = useNavigate()

    return (
        <div className="min-h-screen bg-[#070b14] p-8">
            <header className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => navegar('/dashboard')}
                    className="p-3 glass rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assistente de Trilhas</h1>
                    <p className="text-slate-400 mt-1">IA + YouTube para guiar sua jornada de estudos</p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto glass p-8 rounded-3xl"
            >
                <IARecomendacao />
            </motion.div>
        </div>
    )
}

export default PaginaIA

