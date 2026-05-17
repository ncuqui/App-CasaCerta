import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useSimulation } from '../context/SimulationContext';

const fmt = (value) =>
    value != null
        ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '—';

export default function Results() {
    const navigate = useNavigate();
    const { results } = useSimulation();

    if (!results) {
        return (
            <DashboardLayout title="Resultado">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-gray-400 mb-3">Nenhuma simulação encontrada.</p>
                        <button onClick={() => navigate('/menu/financiamento')}
                                className="bg-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
                            Iniciar simulação
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { financing, consortium, recommendation } = results;
    const hasBoth = financing && consortium;
    const hasOnlyFinancing = financing && !consortium;
    const hasOnlyConsortium = consortium && !financing;

    const pageTitle = hasBoth
        ? 'Comparação — Resultado Final'
        : hasOnlyFinancing
            ? 'Resultado — Financiamento'
            : 'Resultado — Consórcio';

    return (
        <DashboardLayout title={pageTitle}>
            <div className="max-w-5xl space-y-5">

                {/* Banner */}
                <div className="bg-violet-600 rounded-2xl p-5 text-white">
                    <h2 className="text-lg font-bold mb-1">
                        {hasBoth ? 'Resultado da sua simulação.' : 'Resultado da simulação.'}
                    </h2>
                    <p className="text-violet-200 text-sm">
                        {hasBoth
                            ? 'Comparativo entre financiamento e consórcio com base nos dados informados.'
                            : hasOnlyFinancing
                                ? 'Detalhes do cenário de financiamento simulado.'
                                : 'Detalhes do cenário de consórcio simulado.'
                        }
                    </p>
                </div>

                <div className="flex gap-5">

                    {/* Main content */}
                    <div className="flex-1 space-y-4">

                        {/* Comparison view (both modalities) */}
                        {hasBoth && <ComparisonView financing={financing} consortium={consortium} recommendation={recommendation} />}

                        {/* Single modality views */}
                        {hasOnlyFinancing && <FinancingOnlyView financing={financing} propertyValue={results.propertyValue} />}
                        {hasOnlyConsortium && <ConsortiumOnlyView consortium={consortium} propertyValue={results.propertyValue} />}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={() => navigate('/menu/financiamento')}
                                    className="px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                Nova simulação
                            </button>
                            {hasOnlyFinancing && (
                                <button onClick={() => navigate('/menu/consorcio')}
                                        className="px-4 py-2.5 bg-violet-600 text-white font-semibold rounded-lg text-sm hover:bg-violet-700 transition-colors">
                                    Comparar com Consórcio →
                                </button>
                            )}
                            {hasOnlyConsortium && (
                                <button onClick={() => navigate('/menu/financiamento')}
                                        className="px-4 py-2.5 bg-violet-600 text-white font-semibold rounded-lg text-sm hover:bg-violet-700 transition-colors">
                                    Comparar com Financiamento →
                                </button>
                            )}
                            <button onClick={() => navigate('/menu/simulacoes')}
                                    className="px-4 py-2.5 border border-violet-200 text-violet-600 font-semibold rounded-lg text-sm hover:bg-violet-50 transition-colors">
                                Ver histórico
                            </button>
                        </div>
                    </div>

                    {/* Side summary */}
                    <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                        {hasBoth && (
                            <>
                                <div className="bg-white rounded-2xl shadow-sm p-5">
                                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Resumo final</h3>
                                    <div className="flex flex-col gap-2.5">
                                        <SummaryItem label="Melhor alternativa"
                                                     value={recommendation === 'CONSORTIUM' ? 'Consórcio' : 'Financiamento'}
                                                     highlight />
                                        <SummaryItem label="Diferença de custo"
                                                     value={fmt(Math.abs(financing.totalCost - consortium.totalCost))} />
                                        <SummaryItem label="Diferença de parcela"
                                                     value={fmt(Math.abs(financing.installmentValue - consortium.monthlyContribution))} />
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm p-5">
                                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Justificativas</h3>
                                    <div className="flex flex-col gap-2 text-xs text-gray-500">
                                        <p>💰 {recommendation === 'CONSORTIUM' ? 'Consórcio' : 'Financiamento'} tem menor custo global.</p>
                                        <p>📉 Parcela mais compatível com orçamento conservador.</p>
                                        <p>⏱ Financiamento é mais indicado quando urgência é o fator principal.</p>
                                    </div>
                                </div>
                            </>
                        )}
                        {!hasBoth && (
                            <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
                                <p className="text-xs font-semibold text-violet-700 mb-2">💡 Simulação individual</p>
                                <p className="text-xs text-gray-500">
                                    Você simulou apenas {hasOnlyFinancing ? 'o financiamento' : 'o consórcio'}.
                                    Para uma análise completa, simule também {hasOnlyFinancing ? 'o consórcio' : 'o financiamento'} e
                                    compare as modalidades.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

/* ------------------------------------------------------------------ */
/* Comparison view (both modalities)                                   */
/* ------------------------------------------------------------------ */
function ComparisonView({ financing, consortium, recommendation }) {
    const isConsortiumBetter = recommendation === 'CONSORTIUM';

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Comparativo final</h3>

            <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Financing */}
                <div className={`rounded-xl border-2 p-4 ${isConsortiumBetter ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="font-bold text-gray-800">🏦 Financiamento</p>
                            <p className="text-xs text-gray-500">Posse imediata</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isConsortiumBetter ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {isConsortiumBetter ? 'Maior custo' : 'Melhor resultado'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        <Row label="Custo total" value={fmt(financing.totalCost)} bold />
                        <Row label="Parcela estimada" value={fmt(financing.installmentValue)} />
                        <Row label="Prazo" value={`${financing.termMonths} meses`} />
                        <Row label="Vantagem" value="Imediatismo" bold />
                    </div>
                </div>

                {/* Consortium */}
                <div className={`rounded-xl border-2 p-4 ${isConsortiumBetter ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="font-bold text-gray-800">🤝 Consórcio</p>
                            <p className="text-xs text-gray-500">Contemplação variável</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isConsortiumBetter ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {isConsortiumBetter ? 'Melhor resultado' : 'Maior custo'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        <Row label="Custo total" value={fmt(consortium.totalCost)} bold />
                        <Row label="Contribuição mensal" value={fmt(consortium.monthlyContribution)} />
                        <Row label="Prazo" value={`${consortium.termMonths} meses`} />
                        <Row label="Vantagem" value="Economia" bold />
                    </div>
                </div>
            </div>

            {/* Recommendation */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="font-bold text-green-700 mb-1">
                    ✅ Recomendação: {isConsortiumBetter ? 'Consórcio' : 'Financiamento'}
                </p>
                <p className="text-sm text-gray-600">
                    Com base nos valores informados, o {isConsortiumBetter ? 'consórcio' : 'financiamento'} apresentou
                    menor custo total. O {isConsortiumBetter ? 'financiamento' : 'consórcio'} é mais indicado quando{' '}
                    {isConsortiumBetter ? 'a posse imediata é indispensável' : 'o prazo longo é aceitável'}.
                </p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Financing-only view                                                 */
/* ------------------------------------------------------------------ */
function FinancingOnlyView({ financing, propertyValue }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-lg">🏦</span>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Financiamento</h3>
                    <p className="text-xs text-gray-400">Resultado individual</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Custo total</p>
                    <p className="text-xl font-bold text-gray-800">{fmt(financing.totalCost)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Parcela estimada</p>
                    <p className="text-xl font-bold text-gray-800">{fmt(financing.installmentValue)}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm">
                <Row label="Valor do imóvel" value={fmt(propertyValue)} />
                <Row label="Prazo" value={`${financing.termMonths} meses`} />
                <Row label="Taxa de juros anual" value={`${financing.annualInterestRate}%`} />
                <Row label="Amortização" value={financing.amortizationType} />
                <Row label="Total de juros" value={fmt(financing.totalInterest)} bold />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Consortium-only view                                                */
/* ------------------------------------------------------------------ */
function ConsortiumOnlyView({ consortium, propertyValue }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <span className="text-lg">🤝</span>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Consórcio</h3>
                    <p className="text-xs text-gray-400">Resultado individual</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Custo total</p>
                    <p className="text-xl font-bold text-gray-800">{fmt(consortium.totalCost)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Contribuição mensal</p>
                    <p className="text-xl font-bold text-gray-800">{fmt(consortium.monthlyContribution)}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm">
                <Row label="Carta de crédito" value={fmt(propertyValue)} />
                <Row label="Prazo" value={`${consortium.termMonths} meses`} />
                <Row label="Taxa adm. anual" value={`${consortium.annualAdminFee}%`} />
                <Row label="Fundo de reserva" value={`${consortium.reserveFund}%`} />
                <Row label="Lance" value={`${consortium.bidPercentage}%`} />
                <Row label="Total taxa adm." value={fmt(consortium.totalAdminFee)} bold />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Shared components                                                   */
/* ------------------------------------------------------------------ */
function Row({ label, value, bold }) {
    return (
        <div className="flex justify-between border-b border-gray-100 pb-1 last:border-0 last:pb-0">
            <span className="text-gray-500">{label}</span>
            <span className={bold ? 'font-bold text-gray-800' : 'text-gray-700'}>{value}</span>
        </div>
    );
}

function SummaryItem({ label, value, highlight }) {
    return (
        <div className="border border-gray-100 rounded-lg p-2.5">
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-sm font-bold ${highlight ? 'text-violet-600' : 'text-gray-800'}`}>{value}</p>
        </div>
    );
}