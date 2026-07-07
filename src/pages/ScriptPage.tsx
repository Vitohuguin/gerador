import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneCall, MessageCircle, Mail, CheckCircle2, ArrowRight,
  Star, Target, Users, TrendingUp, Shield, Zap, FileText,
  ClipboardList, Lightbulb, HandshakeIcon, Clock, BarChart3,
  ChevronDown, ChevronUp, Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface StepProps {
  number: number
  title: string
  subtitle: string
  icon: React.ElementType
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  color: string
}

function Step({ number, title, subtitle, icon: Icon, children, isOpen, onToggle, color }: StepProps) {
  return (
    <motion.div variants={itemVariants} className="glass-card overflow-hidden border-white/5">
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Passo {number}</span>
          </div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-zinc-500 shrink-0" /> : <ChevronDown size={18} className="text-zinc-500 shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 border-t border-white/5">
          {children}
        </div>
      )}
    </motion.div>
  )
}

interface ScriptBlockProps {
  label: string
  text: string
  highlight?: boolean
}

function ScriptBlock({ label, text, highlight }: ScriptBlockProps) {
  return (
    <div className={cn("p-4 rounded-xl border", highlight ? "bg-purple-500/5 border-purple-500/20" : "bg-white/5 border-white/5")}>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-2" />
}

export default function ScriptPage() {
  const [openStep, setOpenStep] = useState<number | null>(null)

  const toggle = (n: number) => setOpenStep(openStep === n ? null : n)

  const steps = [
    {
      number: 1, title: 'Prospecção', subtitle: 'Encontre e qualifique leads',
      icon: Target, color: 'bg-blue-500',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Identifique empreendedores locais que ainda não têm presença digital profissional.
            Foque em negócios com Instagram ativo mas sem site ou com site desatualizado.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScriptBlock label="Perfil ideal" text="Pequenos e médios empresários, prestadores de serviço, clínicas, salões, restaurantes, lojas físicas." />
            <ScriptBlock label="Ferramentas" text="Google Maps, Instagram, LinkedIn, indicações de clientes satisfeitos, networking local." />
          </div>
          <ScriptBlock label="Abordagem inicial (rede social)" text="'Olá [Nome], vi o trabalho de vocês e achei incrível! Reparei que vocês não têm um site ainda — eu ajudo empresas como a sua a terem uma presença digital profissional que atrai clientes todos os dias. Posso mandar uma ideia rápida?'" highlight />
        </div>
      ),
    },
    {
      number: 2, title: 'Primeiro Contato', subtitle: 'Apresentação e quebra-gelo',
      icon: PhoneCall, color: 'from-emerald-500 to-teal-500',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            O primeiro contato define todo o relacionamento. Seja direto, profissional e mostre valor desde o início.
          </p>
          <ScriptBlock label="Script telefônico" text="'Olá [Nome], aqui é [Seu Nome] da [Sua Empresa]. Tudo bem? A razão do meu contato é que eu ajudo empresas a atraírem mais clientes através de sites profissionais e estratégias digitais. Eu vi que o [Negócio] tem um trabalho excelente e acredito que podemos potencializar ainda mais seus resultados com um site moderno. Você tem 3 minutinhos para eu te mostrar uma ideia?'" highlight />
          <ScriptBlock label="Script WhatsApp" text="'Oi [Nome], tudo bem? 😊 Sou [Seu Nome], da [Empresa]. Vi que o [Negócio] está crescendo e pensei em algo que pode ajudar: um site profissional que funciona como um vendedor 24h pra você. Clientes buscam online o tempo todo — posso mandar um exemplo de como podemos transformar isso em mais vendas pra você?'" highlight />
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">Dica de Ouro</p>
            <p className="text-sm text-zinc-300">Nunca comece perguntando 'quanto você quer gastar'. Primeiro entenda a dor, depois apresente a solução. Use palavras como 'resultado', 'clientes', 'crescimento'.</p>
          </div>
        </div>
      ),
    },
    {
      number: 3, title: 'Diagnóstico', subtitle: 'Entenda as necessidades do cliente',
      icon: ClipboardList, color: 'from-violet-500 to-purple-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Faça perguntas estratégicas para mapear exatamente o que o cliente precisa. Quanto mais você entender, melhor será sua proposta.
          </p>
          <div className="space-y-3">
            <ScriptBlock label="Pergunta 1" text="'Qual o principal objetivo do seu negócio nos próximos 6 meses? Atender mais clientes, vender mais ou fortalecer a marca?'" />
            <ScriptBlock label="Pergunta 2" text="'Hoje, como os clientes encontram você? Pelo Instagram, indicação ou busca no Google?'" />
            <ScriptBlock label="Pergunta 3" text="'Se você pudesse mudar uma coisa na forma como é encontrado online, o que seria?'" />
            <ScriptBlock label="Pergunta 4" text="'Você já perdeu clientes por não ter um site profissional ou por não aparecer no Google?'" />
          </div>
          <ScriptBlock label="Anote tudo" text="Registre as respostas. Use essas informações para personalizar a proposta. Clientes percebem quando você realmente se importa." highlight />
        </div>
      ),
    },
    {
      number: 4, title: 'Apresentação da Solução', subtitle: 'Mostre o valor do seu serviço',
      icon: Lightbulb, color: 'from-amber-500 to-orange-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Apresente sua solução de forma clara, mostrando como resolve os problemas identificados no diagnóstico.
          </p>
          <ScriptBlock label="Script de apresentação" text="'Baseado no que você me falou, montei uma solução sob medida para o [Negócio]. Vamos criar um site profissional que: 1) Aparece no Google quando clientes buscam pelo seu serviço; 2) Transmite credibilidade e profissionalismo; 3) Funciona como um vendedor automático 24 horas por dia; 4) Capta leads e agendamentos direto pelo site. Fora isso, o site é moderno, responsivo (funciona no celular) e otimizado para aparecer nas buscas.'" highlight />
          <ScriptBlock label="Diferenciais" text="✔ Design moderno e exclusivo ✔ Otimizado para Google (SEO) ✔ Responsivo (funciona em qualquer dispositivo) ✔ Integração com WhatsApp e redes sociais ✔ Painel administrativo simples ✔ Suporte e manutenção inclusos" />
        </div>
      ),
    },
    {
      number: 5, title: 'Proposta Comercial', subtitle: 'Apresente preços e condições',
      icon: FileText, color: 'from-blue-500 to-indigo-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            A proposta deve ser clara, profissional e mostrar o retorno sobre o investimento. Nunca venda preço — venda valor.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Como precificar</p>
              <ul className="text-sm text-zinc-300 space-y-1.5">
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Site institucional: R$ 1.500 - 3.500</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Landing page: R$ 1.000 - 2.500</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Loja virtual: R$ 3.000 - 8.000</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Sistema web: R$ 5.000 - 15.000</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Manutenção mensal: R$ 150 - 500</li>
              </ul>
            </div>
            <ScriptBlock label="Argumento de valor" text="'Investir num site profissional não é um gasto — é um investimento que se paga com poucos clientes. Um site de R$ 2.000 equivale a quanto faturamento para o seu negócio? Se cada cliente trouxer R$ 200 de lucro, apenas 10 clientes pagam o site.'" />
          </div>
          <ScriptBlock label="Script de fechamento" text="'O investimento para criar seu site profissional é de [X] parcelas de [Y]. Considerando que cada novo cliente gera em média [Z] de lucro, o site se paga sozinho com poucas vendas. Fora a credibilidade que um site profissional traz — muitas vezes o cliente escolhe você só por ter um site e o concorrente não. Podemos começar essa semana ainda?'" highlight />
        </div>
      ),
    },
    {
      number: 6, title: 'Objeções', subtitle: 'Responda dúvidas e resistências',
      icon: Shield, color: 'from-red-500 to-rose-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Objeções são normais. Veja-as como um sinal de interesse. Prepare respostas para as objeções mais comuns.
          </p>
          <div className="space-y-3">
            <ScriptBlock label='"Está caro"' highlight text="'Entendo, [Nome]. Mas pense no seguinte: um site profissional é um ativo que trabalha pra você 24h por dia, 7 dias por semana. Diferente de um anúncio que acaba quando você para de pagar, o site continua gerando resultados. E você pode parcelar em até 12x sem juros.'" />
            <ScriptBlock label='"Preciso pensar"' highlight text="'Claro, sem problemas! Posso deixar você com uma proposta detalhada por escrito? Enquanto isso, que tal agendarmos uma call rápida de 15 min na próxima semana para eu tirar qualquer dúvida? Muitos clientes que sentam para ver os números percebem que o retorno é muito maior que o investimento.'" />
            <ScriptBlock label='"Já tenho alguém"' highlight text="'Que ótimo! Fico feliz que está cuidando disso. Posso deixar meu cartão e uma proposta mesmo assim? Se não der certo com ele, ou se quiser uma segunda opinião, estou à disposição. O que me diferencia é que entrego em [X] dias e dou suporte completo por [Y] meses.'" />
            <ScriptBlock label='"Instagram já basta"' highlight text="'Entendo, o Instagram é ótimo. Mas sabia que mais de 70% das pessoas pesquisam no Google antes de contratar um serviço? E mais: o Instagram é da Meta, você não controla. Se a rede sair do ar ou seu alcance cair, você perde clientes. Um site é seu, você controla. E ele aparece no Google 24h por dia.'" />
          </div>
        </div>
      ),
    },
    {
      number: 7, title: 'Fechamento', subtitle: 'Converta o lead em cliente',
      icon: HandshakeIcon, color: 'from-emerald-500 to-green-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            O fechamento é a conclusão natural de todo o processo. Se você fez bem os passos anteriores, o cliente já está convencido.
          </p>
          <ScriptBlock label="Script de fechamento" text="'[Nome], baseado em tudo que conversamos, tenho certeza que um site profissional vai trazer exatamente os resultados que você busca. Posso já dar início ao projeto hoje e em [X] dias seu site está no ar. Vou enviar o contrato e o link de pagamento agora. Que número de WhatsApp é melhor para enviar?'" highlight />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScriptBlock label="Fechamento por urgência" text="'Estou com uma agenda aberta essa semana e posso começar seu projeto imediatamente — em [X] dias ele fica pronto. Se fecharmos hoje, ainda consigo incluir [bônus] sem custo extra.'" />
            <ScriptBlock label="Fechamento por prova social" text="'Atendemos [X] clientes no mesmo segmento que o seu e todos tiveram aumento de pelo menos 40% nos contatos vindos do site. Posso te mostrar alguns cases de sucesso.'" />
          </div>
        </div>
      ),
    },
    {
      number: 8, title: 'Pós-Venda', subtitle: 'Acompanhamento e fidelização',
      icon: Star, color: 'from-yellow-500 to-amber-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            O pós-venda é tão importante quanto a venda. Clientes satisfeitos indicam e contratam novamente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScriptBlock label="7 dias após entrega" text="'Oi [Nome], tudo bem? Passando pra saber como está o site! Você já recebeu algum contato através dele? Precisa de alguma alteração ou ajuste? Estou aqui pra ajudar!'" />
            <ScriptBlock label="30 dias após entrega" text="'Olá [Nome]! Faz um mês que seu site está no ar. Gostaria de saber como estão os resultados. Posso te enviar um relatório simples de quantas pessoas visitaram e de onde vieram? Também tenho novidades sobre [novo serviço/melhorias] que podem interessar você.'" />
          </div>
          <ScriptBlock label="Estratégia de indicação" text="'[Nome], se você conhecer alguém que também precisa de um site, posso oferecer um desconto especial pra essa pessoa e um bônus pra você como forma de agradecimento. Funciona como parceria!'" highlight />
          <ScriptBlock label="Upgrade" text="Clientes satisfeitos compram mais. Ofereça: manutenção mensal, sistema de agendamento, blog, e-commerce, Google Meu Negócio, relatórios de tráfego. Sempre mostre como cada adicional gera mais resultados pro negócio dele." />
        </div>
      ),
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Script de Vendas</h1>
          <p className="text-zinc-400 mt-1">Passo a passo profissional para abordar clientes e oferecer sites</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Passos', value: '8', icon: ClipboardList, color: 'from-purple-500 to-purple-600' },
          { label: 'Tempo médio', value: '15-20 min', icon: Clock, color: 'from-blue-500 to-blue-600' },
          { label: 'Conversão esperada', value: '~40%', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Indicação natural', value: '~60%', icon: BarChart3, color: 'from-amber-500 to-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center border-white/5">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-gradient-to-br", stat.color)}>
              <stat.icon size={16} className="text-white" />
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 border border-white/5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Target size={14} className="text-zinc-500" />
          <span>Clique em cada passo para expandir</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <ArrowRight size={14} className="text-zinc-500" />
          <span>Siga a ordem para melhores resultados</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <Play size={14} className="text-zinc-500" />
          <span>Adapte os scripts ao seu estilo</span>
        </div>
      </motion.div>

      <div className="space-y-3">
        {steps.map((step) => (
          <Step
            key={step.number}
            number={step.number}
            title={step.title}
            subtitle={step.subtitle}
            icon={step.icon}
            color={step.color}
            isOpen={openStep === step.number}
            onToggle={() => toggle(step.number)}
          >
            {step.content}
          </Step>
        ))}
      </div>

      <motion.div variants={itemVariants} className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-center">
        <Lightbulb size={24} className="text-purple-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Lembre-se</h3>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Clientes compram confiança antes de comprar tecnologia. Seja autêntico, ouça mais do que fala,
          e foque sempre em como você pode resolver os problemas do cliente. O resto é consequência.
        </p>
      </motion.div>
    </motion.div>
  )
}
