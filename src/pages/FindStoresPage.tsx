import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, MapPin, Store, Map, FileText, Target, ArrowRight,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const NICHO_SUGGESTIONS = [
  'Barbearia', 'Salão de Beleza', 'Restaurante', 'Pizzaria',
  'Academia', 'Clínica', 'Consultório', 'Oficina Mecânica',
  'Pet Shop', 'Mercado', 'Padaria', 'Sorveteria',
  'Hotel', 'Pousada', 'Loja de Roupas', 'Farmácia',
  'Escola', 'Hospital', 'Cinema', 'Bar',
  'Churrascaria', 'Sushi', 'Igreja', 'Banco',
]

export default function FindStoresPage() {
  const [nicho, setNicho] = useState('')
  const [cidade, setCidade] = useState('')
  const [showNichoSuggestions, setShowNichoSuggestions] = useState(false)

  const filteredNichos = NICHO_SUGGESTIONS.filter((n) =>
    n.toLowerCase().includes(nicho.toLowerCase())
  )

  const openGoogleMaps = () => {
    if (!nicho.trim() || !cidade.trim()) return
    const query = encodeURIComponent(`${nicho} em ${cidade}`)
    window.open(`https://www.google.com/maps/search/${query}/`, '_blank')
  }

  const podeBuscar = nicho.trim() && cidade.trim()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Encontrar Lojas</h1>
        <p className="text-zinc-400 mt-1">Encontre estabelecimentos reais no Google Maps para oferecer seus serviços</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 border-white/5">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="relative">
            <label className="block text-sm font-bold text-zinc-400 mb-2">Nicho / Segmento</label>
            <div className="relative">
              <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Ex: Barbearia, Restaurante..."
                value={nicho}
                onChange={(e) => { setNicho(e.target.value); setShowNichoSuggestions(true) }}
                onFocus={() => setShowNichoSuggestions(true)}
                onBlur={() => setTimeout(() => setShowNichoSuggestions(false), 200)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
              {showNichoSuggestions && nicho && filteredNichos.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                  {filteredNichos.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => { setNicho(s); setShowNichoSuggestions(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Cidade</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Ex: São Paulo, Rio de Janeiro..."
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <button
            onClick={openGoogleMaps}
            disabled={!podeBuscar}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
          >
            <Map size={20} />
            <span>Abrir no Google Maps</span>
            <ArrowRight size={18} className="opacity-70" />
          </button>

          <p className="text-center text-xs text-zinc-600">
            O Google Maps será aberto em uma nova aba com os resultados da sua busca
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Map, title: '1. Busque no Maps',
            desc: 'Encontre todos os estabelecimentos do nicho escolhido na cidade',
            color: 'from-purple-500/10 to-purple-500/5', iconColor: 'text-purple-400',
          },
          {
            icon: Search, title: '2. Identifique os leads',
            desc: 'Veja quais não têm site — são seus potenciais clientes',
            color: 'from-blue-500/10 to-blue-500/5', iconColor: 'text-blue-400',
          },
          {
            icon: FileText, title: '3. Use o Script',
            desc: 'Aborde cada lead com o passo a passo profissional de vendas',
            color: 'from-emerald-500/10 to-emerald-500/5', iconColor: 'text-emerald-400',
          },
        ].map((card) => (
          <div key={card.title} className={`rounded-xl p-5 bg-gradient-to-br ${card.color} border border-white/5`}>
            <card.icon size={24} className={`${card.iconColor} mb-3`} />
            <h3 className="text-sm font-bold text-white mb-1">{card.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="p-5 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-white/5 flex items-center gap-3">
        <Target size={16} className="text-purple-400 shrink-0" />
        <p className="text-sm text-zinc-400">
          Depois de encontrar os leads, use o{' '}
          <a href="/dashboard/script" className="text-purple-400 font-semibold hover:underline">Script de Vendas</a>
          {' '}para abordar cada cliente de forma profissional.
        </p>
      </motion.div>
    </motion.div>
  )
}
