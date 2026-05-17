import { useNavigate } from 'react-router-dom';

const steps = [
  { label: 'Etapa 1', desc: 'Cadastro' },
  { label: 'Etapa 2', desc: 'Financiamento' },
  { label: 'Etapa 3', desc: 'Consórcio' },
  { label: 'Etapa 4', desc: 'Resultado final' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2">
        <span className="text-lg">🏠</span>
        <span className="font-semibold text-base text-violet-700 tracking-tight">CasaCerta</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-5xl flex gap-6">

          {/* Hero Card */}
          <div className="flex-1 bg-violet-600 rounded-2xl p-8 text-white flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold leading-tight mb-3">
                Simule e compare formas de adquirir um imóvel.
              </h1>
              <p className="text-violet-200 text-sm leading-relaxed">
                Este sistema permite analisar financiamento e consórcio com base em dados reais,
                resultando em uma recomendação objetiva ao final da jornada.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-violet-700 font-semibold px-5 py-2 rounded-lg text-sm hover:bg-violet-50 transition-colors"
              >
                Iniciar simulação
              </button>
              <button className="border border-white text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-violet-500 transition-colors">
                Entender funcionamento
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-2">
              {steps.map((s) => (
                <div key={s.label} className="bg-violet-500 rounded-xl p-3">
                  <p className="text-xs font-semibold text-violet-200">{s.label}</p>
                  <p className="text-sm font-bold text-white">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-64 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">O que será analisado</h2>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '$', title: 'Custo total', desc: 'Valor final pago ao longo do tempo.' },
                  { icon: '↓', title: 'Parcela mensal', desc: 'Impacto no orçamento.' },
                  { icon: '⏱', title: 'Prazo', desc: 'Tempo até quitação ou contemplação.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-3">Resultado final</h2>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <span className="font-medium">Comparativo direto</span>
                <span className="font-medium">Recomendação</span>
                <span className="font-medium">Dados informativos</span>
                <span className="font-medium">Relatório exportável</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
