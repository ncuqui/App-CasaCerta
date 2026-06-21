import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useSimulation } from '../context/SimulationContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Cell,
    LineChart, Line,
} from 'recharts';

const fmt = (value) =>
    value != null
        ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '—';

const fmtShort = (value) =>
    value != null
        ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : '—';

// Calcula taxa mensal equivalente a partir da anual
function monthlyRate(annualRate) {
    return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

// Composição da parcela de financiamento
function calcFinancingBreakdown(financing) {
    if (!financing) return null;
    const financed = financing.totalCost - financing.totalInterest;
    if (financing.amortizationType === 'SAC') {
        const mRate = monthlyRate(financing.annualInterestRate);
        const amortization = financed / financing.termMonths;
        const firstInterest = financed * mRate;
        const lastInterest = amortization * mRate;
        const firstInstallment = amortization + firstInterest;
        const lastInstallment = amortization + lastInterest;
        return {
            type: 'SAC',
            firstInstallment,
            lastInstallment,
            amortization,
            firstInterest,
            lastInterest,
            firstPrincipalPct: Math.round((amortization / firstInstallment) * 100),
            firstInterestPct: Math.round((firstInterest / firstInstallment) * 100),
        };
    } else {
        // PRICE — parcela fixa, composição média
        const avgPrincipal = financed / financing.termMonths;
        const avgInterest = financing.totalInterest / financing.termMonths;
        const installment = financing.installmentValue;
        return {
            type: 'PRICE',
            installment,
            avgPrincipal,
            avgInterest,
            principalPct: Math.round((avgPrincipal / installment) * 100),
            interestPct: Math.round((avgInterest / installment) * 100),
        };
    }
}

// Composição da contribuição mensal do consórcio
function calcConsortiumBreakdown(consortium, propertyValue) {
    if (!consortium || !propertyValue) return null;
    const pv = Number(propertyValue);
    const principal = pv / consortium.termMonths;
    const adminFee = pv * (consortium.annualAdminFee / 100) / 12;
    const reserveFund = pv * ((consortium.reserveFund || 0) / 100) / 12;
    const total = principal + adminFee + reserveFund;
    return {
        principal,
        adminFee,
        reserveFund,
        total,
        principalPct: Math.round((principal / total) * 100),
        adminFeePct: Math.round((adminFee / total) * 100),
        reserveFundPct: Math.round((reserveFund / total) * 100),
    };
}

export default function Results() {
    const navigate = useNavigate();
    const { results, resetSimulation } = useSimulation();
    const goNewSimulation = () => { resetSimulation(); navigate('/menu/financiamento'); };

    if (!results) {
        return (
            <DashboardLayout title="Resultado">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-gray-400 mb-3">Nenhuma simulação encontrada.</p>
                        <button onClick={goNewSimulation}
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

    const financingBreakdown = calcFinancingBreakdown(financing);
    const consortiumBreakdown = calcConsortiumBreakdown(consortium, results.propertyValue);

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

                {/* ── 2.1 Hero: métricas principais em destaque ── */}
                {hasBoth && (
                    <ComparisonHero
                        financing={financing}
                        consortium={consortium}
                        recommendation={recommendation}
                    />
                )}
                {hasOnlyFinancing && <SingleHero financing={financing} />}
                {hasOnlyConsortium && <SingleHero consortium={consortium} />}

                <div className="flex gap-5">
                    <div className="flex-1 space-y-4">

                        {/* Detalhes + breakdown */}
                        {hasBoth && (
                            <>
                                <ComparisonDetail
                                    financing={financing}
                                    consortium={consortium}
                                    recommendation={recommendation}
                                    financingBreakdown={financingBreakdown}
                                    consortiumBreakdown={consortiumBreakdown}
                                    propertyValue={results.propertyValue}
                                />
                                <CostComparisonChart financing={financing} consortium={consortium} />
                                <AccumulatedCostChart financing={financing} consortium={consortium} />
                                <InstallmentEvolutionChart financing={financing} consortium={consortium} />
                            </>
                        )}
                        {hasOnlyFinancing && (
                            <FinancingDetail
                                financing={financing}
                                propertyValue={results.propertyValue}
                                breakdown={financingBreakdown}
                            />
                        )}
                        {hasOnlyConsortium && (
                            <ConsortiumDetail
                                consortium={consortium}
                                propertyValue={results.propertyValue}
                                breakdown={consortiumBreakdown}
                            />
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={goNewSimulation}
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
                                <button onClick={goNewSimulation}
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

                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                        {hasBoth && (
                            <>
                                <div className="bg-white rounded-2xl shadow-sm p-5">
                                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Resumo final</h3>
                                    <div className="flex flex-col gap-2.5">
                                        <SummaryItem label="Melhor alternativa"
                                                     value={recommendation === 'CONSORTIUM' ? 'Consórcio' : 'Financiamento'}
                                                     highlight />
                                        <SummaryItem label="Economia estimada"
                                                     value={fmt(Math.abs(financing.totalCost - consortium.totalCost))} />
                                        <SummaryItem label="Dif. de parcela"
                                                     value={fmt(Math.abs(financing.installmentValue - consortium.monthlyContribution))} />
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm p-5">
                                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Considerações</h3>
                                    <div className="flex flex-col gap-2 text-xs text-gray-500">
                                        <p>💰 {recommendation === 'CONSORTIUM' ? 'Consórcio' : 'Financiamento'} tem menor custo global.</p>
                                        <p>🏠 Financiamento garante posse imediata do imóvel.</p>
                                        <p>⏱ Consórcio exige aguardar a contemplação pelo sorteio ou lance.</p>
                                        <p>📈 Lance maior no consórcio reduz o tempo de espera.</p>
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
/* 2.1 — Hero: métricas principais em destaque                         */
/* ------------------------------------------------------------------ */
function ComparisonHero({ financing, consortium, recommendation }) {
    const isConsortiumBetter = recommendation === 'CONSORTIUM';
    const winner = isConsortiumBetter ? consortium : financing;
    const loser = isConsortiumBetter ? financing : consortium;
    const winnerLabel = isConsortiumBetter ? 'Consórcio' : 'Financiamento';
    const loserLabel = isConsortiumBetter ? 'Financiamento' : 'Consórcio';
    const winnerPayment = isConsortiumBetter ? consortium.monthlyContribution : financing.installmentValue;
    const loserPayment = isConsortiumBetter ? financing.installmentValue : consortium.monthlyContribution;
    const winnerTerm = winner.termMonths;
    const loserTerm = loser.termMonths;
    const saving = Math.abs(financing.totalCost - consortium.totalCost);

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Vencedor */}
            <div className="col-span-1 bg-green-50 border-2 border-green-300 rounded-2xl p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">✅ Recomendado</span>
                </div>
                <p className="font-bold text-gray-800">{winnerLabel}</p>
                <p className="text-2xl font-extrabold text-green-700">{fmtShort(winner.totalCost)}</p>
                <p className="text-xs text-gray-500">custo total</p>
                <div className="mt-2 pt-2 border-t border-green-200 flex flex-col gap-1 text-xs text-gray-600">
                    <span>{fmt(winnerPayment)}<span className="text-gray-400">/mês</span></span>
                    <span>{winnerTerm} meses</span>
                </div>
            </div>

            {/* Economia */}
            <div className="col-span-1 bg-violet-600 rounded-2xl p-4 flex flex-col items-center justify-center text-white text-center">
                <p className="text-xs font-semibold text-violet-200 mb-1">Você economiza</p>
                <p className="text-3xl font-extrabold">{fmtShort(saving)}</p>
                <p className="text-xs text-violet-200 mt-1">escolhendo {winnerLabel}</p>
            </div>

            {/* Perdedor */}
            <div className="col-span-1 bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Maior custo</span>
                </div>
                <p className="font-bold text-gray-800">{loserLabel}</p>
                <p className="text-2xl font-extrabold text-orange-600">{fmtShort(loser.totalCost)}</p>
                <p className="text-xs text-gray-500">custo total</p>
                <div className="mt-2 pt-2 border-t border-orange-200 flex flex-col gap-1 text-xs text-gray-600">
                    <span>{fmt(loserPayment)}<span className="text-gray-400">/mês</span></span>
                    <span>{loserTerm} meses</span>
                </div>
            </div>
        </div>
    );
}

function SingleHero({ financing, consortium }) {
    const data = financing || consortium;
    const isFinancing = !!financing;
    const payment = isFinancing ? financing?.installmentValue : consortium?.monthlyContribution;
    const paymentLabel = isFinancing ? 'Parcela estimada' : 'Contribuição mensal';

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
                <p className="text-xs text-gray-400">Custo total</p>
                <p className="text-2xl font-extrabold text-gray-800">{fmtShort(data.totalCost)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
                <p className="text-xs text-gray-400">{paymentLabel}</p>
                <p className="text-2xl font-extrabold text-violet-600">{fmt(payment)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
                <p className="text-xs text-gray-400">Prazo</p>
                <p className="text-2xl font-extrabold text-gray-800">{data.termMonths}<span className="text-base font-semibold text-gray-400"> meses</span></p>
                <p className="text-xs text-gray-400">{(data.termMonths / 12).toFixed(1).replace('.0', '')} anos</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* 2.2 — Barra de composição da parcela                                */
/* ------------------------------------------------------------------ */
function BreakdownBar({ segments }) {
    // segments: [{ label, value, pct, color }]
    return (
        <div className="mt-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Composição da parcela</p>
            {/* Barra visual */}
            <div className="flex h-3 rounded-full overflow-hidden w-full mb-3 gap-px bg-gray-100">
                {segments.map((seg, i) => (
                    <div
                        key={i}
                        className={`${seg.color} transition-all`}
                        style={{ width: `${seg.pct}%` }}
                    />
                ))}
            </div>
            {/* Legenda */}
            <div className="flex flex-col gap-1.5">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-sm ${seg.color} flex-shrink-0`} />
                            <span className="text-gray-500">{seg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">{fmt(seg.value)}</span>
                            <span className="text-gray-400 w-8 text-right">{seg.pct}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FinancingBreakdownSection({ breakdown }) {
    if (!breakdown) return null;

    if (breakdown.type === 'SAC') {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-3">Composição da parcela (SAC)</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">1ª parcela</p>
                        <p className="font-bold text-gray-800">{fmt(breakdown.firstInstallment)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Última parcela</p>
                        <p className="font-bold text-gray-800">{fmt(breakdown.lastInstallment)}</p>
                    </div>
                </div>
                <BreakdownBar segments={[
                    { label: 'Amortização (principal)', value: breakdown.amortization, pct: breakdown.firstPrincipalPct, color: 'bg-blue-500' },
                    { label: 'Juros (1ª parcela)', value: breakdown.firstInterest, pct: breakdown.firstInterestPct, color: 'bg-orange-400' },
                ]} />
                <p className="text-xs text-gray-400 mt-2">* Composição referente à 1ª parcela. A amortização é constante; os juros diminuem a cada mês.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <BreakdownBar segments={[
                { label: 'Amortização (média)', value: breakdown.avgPrincipal, pct: breakdown.principalPct, color: 'bg-blue-500' },
                { label: 'Juros (média)', value: breakdown.avgInterest, pct: breakdown.interestPct, color: 'bg-orange-400' },
            ]} />
            <p className="text-xs text-gray-400 mt-2">* Composição média ao longo do prazo. No PRICE, a parcela é fixa e os juros decrescem mês a mês.</p>
        </div>
    );
}

function ConsortiumBreakdownSection({ breakdown }) {
    if (!breakdown) return null;
    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <BreakdownBar segments={[
                { label: 'Carta de crédito (principal)', value: breakdown.principal, pct: breakdown.principalPct, color: 'bg-green-500' },
                { label: 'Taxa administrativa', value: breakdown.adminFee, pct: breakdown.adminFeePct, color: 'bg-amber-400' },
                ...(breakdown.reserveFund > 0 ? [{ label: 'Fundo de reserva', value: breakdown.reserveFund, pct: breakdown.reserveFundPct, color: 'bg-red-300' }] : []),
            ]} />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Detail cards (comparison + individual)                              */
/* ------------------------------------------------------------------ */
function ComparisonDetail({ financing, consortium, recommendation, financingBreakdown, consortiumBreakdown, propertyValue }) {
    const isConsortiumBetter = recommendation === 'CONSORTIUM';
    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Detalhes comparativos</h3>
            <div className="grid grid-cols-2 gap-4">
                {/* Financiamento */}
                <div className={`rounded-xl border-2 p-4 ${isConsortiumBetter ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                    <p className="font-bold text-gray-800 mb-1">🏦 Financiamento</p>
                    <p className="text-xs text-gray-500 mb-3">Posse imediata do imóvel</p>
                    <div className="flex flex-col gap-2 text-sm">
                        <Row label="Custo total" value={fmt(financing.totalCost)} bold />
                        <Row label="Parcela" value={fmt(financing.installmentValue)} />
                        <Row label="Total de juros" value={fmt(financing.totalInterest)} />
                        <Row label="Prazo" value={`${financing.termMonths} meses`} />
                        <Row label="Amortização" value={financing.amortizationType} />
                    </div>
                    <FinancingBreakdownSection breakdown={financingBreakdown} />
                </div>

                {/* Consórcio */}
                <div className={`rounded-xl border-2 p-4 ${isConsortiumBetter ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <p className="font-bold text-gray-800 mb-1">🤝 Consórcio</p>
                    <p className="text-xs text-gray-500 mb-3">Contemplação por sorteio ou lance</p>
                    <div className="flex flex-col gap-2 text-sm">
                        <Row label="Custo total" value={fmt(consortium.totalCost)} bold />
                        <Row label="Contribuição mensal" value={fmt(consortium.monthlyContribution)} />
                        <Row label="Total de taxas adm." value={fmt(consortium.totalAdminFee)} />
                        <Row label="Prazo" value={`${consortium.termMonths} meses`} />
                        <Row label="Lance" value={`${consortium.bidPercentage?.toFixed(1)}%`} />
                    </div>
                    <ConsortiumBreakdownSection breakdown={consortiumBreakdown} />
                </div>
            </div>
        </div>
    );
}

function FinancingDetail({ financing, propertyValue, breakdown }) {
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

            <div className="flex flex-col gap-2 text-sm mb-4">
                <Row label="Valor do imóvel" value={fmt(propertyValue)} />
                <Row label="Prazo" value={`${financing.termMonths} meses (${(financing.termMonths / 12).toFixed(1).replace('.0', '')} anos)`} />
                <Row label="Taxa de juros anual" value={`${financing.annualInterestRate}% a.a.`} />
                <Row label="Amortização" value={financing.amortizationType === 'SAC' ? 'SAC — parcelas decrescentes' : 'PRICE — parcelas fixas'} />
                <Row label="Total de juros" value={fmt(financing.totalInterest)} bold />
            </div>

            <FinancingBreakdownSection breakdown={breakdown} />
        </div>
    );
}

function ConsortiumDetail({ consortium, propertyValue, breakdown }) {
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

            <div className="flex flex-col gap-2 text-sm mb-4">
                <Row label="Carta de crédito" value={fmt(propertyValue)} />
                <Row label="Prazo" value={`${consortium.termMonths} meses (${(consortium.termMonths / 12).toFixed(1).replace('.0', '')} anos)`} />
                <Row label="Taxa adm. anual" value={`${consortium.annualAdminFee}% a.a.`} />
                {consortium.reserveFund > 0 && <Row label="Fundo de reserva" value={`${consortium.reserveFund}% a.a.`} />}
                <Row label="Lance" value={`${consortium.bidPercentage?.toFixed(1)}%`} />
                <Row label="Total de taxas adm." value={fmt(consortium.totalAdminFee)} bold />
            </div>

            <ConsortiumBreakdownSection breakdown={breakdown} />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* 3.2 — Gráficos de comparação                                        */
/* ------------------------------------------------------------------ */

// Gráfico 1: BarChart empilhado — composição do custo total
function CostComparisonChart({ financing, consortium }) {
    const financingFinanced = financing.totalCost - financing.totalInterest;
    const consortiumPrincipal = consortium.totalCost - consortium.totalAdminFee;

    const data = [
        {
            name: 'Financiamento',
            Principal: Math.round(financingFinanced),
            'Juros / Taxas': Math.round(financing.totalInterest),
        },
        {
            name: 'Consórcio',
            Principal: Math.round(consortiumPrincipal),
            'Juros / Taxas': Math.round(consortium.totalAdminFee),
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-1">Composição do custo total</h3>
            <p className="text-xs text-gray-400 mb-4">Quanto é principal e quanto são encargos em cada modalidade.</p>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                    />
                    <Tooltip
                        formatter={(v, name) => [fmt(v), name]}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="Principal" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]}>
                        <Cell key="f-p" fill="#7c3aed" />
                        <Cell key="c-p" fill="#059669" />
                    </Bar>
                    <Bar dataKey="Juros / Taxas" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]}>
                        <Cell key="f-j" fill="#f97316" />
                        <Cell key="c-j" fill="#f59e0b" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-violet-700 inline-block" /> Principal (Financ.)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> Principal (Cons.)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" /> Juros (Financ.)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Taxas (Cons.)</span>
            </div>
        </div>
    );
}

// Gráfico 2: LineChart — custo acumulado ao longo do tempo
function AccumulatedCostChart({ financing, consortium }) {
    const data = useMemo(() => {
        const financed = financing.totalCost - financing.totalInterest;
        const n = financing.termMonths;
        const r = Math.pow(1 + financing.annualInterestRate / 100, 1 / 12) - 1;
        const sacAmortization = financed / n;
        const priceInstallment = r > 0
            ? financed * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
            : financed / n;
        const consortiumMonthly = consortium.monthlyContribution;
        const maxTerm = Math.max(n, consortium.termMonths);
        const step = Math.max(1, Math.ceil(maxTerm / 60));

        const points = [];
        let sacBalance = financed;
        let cumF = 0;
        let cumC = 0;

        for (let m = 1; m <= maxTerm; m++) {
            if (m <= n) {
                if (financing.amortizationType === 'SAC') {
                    cumF += sacAmortization + sacBalance * r;
                    sacBalance = Math.max(0, sacBalance - sacAmortization);
                } else {
                    cumF += priceInstallment;
                }
            }
            if (m <= consortium.termMonths) cumC += consortiumMonthly;
            if (m % step === 0 || m === maxTerm) {
                points.push({ mes: m, Financiamento: Math.round(cumF), Consórcio: Math.round(cumC) });
            }
        }
        return points;
    }, [financing, consortium]);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-1">Custo acumulado ao longo do tempo</h3>
            <p className="text-xs text-gray-400 mb-4">Total desembolsado mês a mês em cada modalidade.</p>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tickFormatter={(v) => `${v}m`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={56} />
                    <Tooltip
                        formatter={(v, name) => [fmtShort(v), name]}
                        labelFormatter={(l) => `Mês ${l}`}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="Financiamento" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls={false} />
                    <Line type="monotone" dataKey="Consórcio" stroke="#059669" strokeWidth={2} dot={false} strokeDasharray="5 3" activeDot={{ r: 4 }} connectNulls={false} />
                </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-2 text-center">
                A linha que chega mais baixo ao fim do prazo representa o menor custo total.
            </p>
        </div>
    );
}

// Gráfico 3: LineChart — evolução mensal das parcelas
function InstallmentEvolutionChart({ financing, consortium }) {
    const { data, financingKey } = useMemo(() => {
        const financed = financing.totalCost - financing.totalInterest;
        const n = financing.termMonths;
        const r = Math.pow(1 + financing.annualInterestRate / 100, 1 / 12) - 1;
        const sacAmortization = financed / n;
        const priceInstallment = r > 0
            ? financed * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
            : financed / n;
        const consortiumMonthly = consortium.monthlyContribution;
        const maxTerm = Math.max(n, consortium.termMonths);
        const step = Math.max(1, Math.ceil(maxTerm / 60));
        const fKey = financing.amortizationType === 'SAC' ? 'Financiamento (SAC)' : 'Financiamento (PRICE)';

        const points = [];
        let sacBalance = financed;

        for (let m = 1; m <= maxTerm; m += step) {
            const point = { mes: m };

            if (m <= n) {
                const sacInterest = sacBalance * r;
                if (financing.amortizationType === 'SAC') {
                    point['Financiamento (SAC)'] = Math.round(sacAmortization + sacInterest);
                } else {
                    point['Financiamento (PRICE)'] = Math.round(priceInstallment);
                }
            for (let s = 0; s < step && sacBalance > 0; s++) {
                sacBalance = Math.max(0, sacBalance - sacAmortization);
            }
        }

        if (m <= consortium.termMonths) {
            point['Consórcio'] = Math.round(consortiumMonthly);
        }

        points.push(point);
    }

        return { data: points, financingKey: fKey };
    }, [financing, consortium]);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-1">Evolução das parcelas mensais</h3>
            <p className="text-xs text-gray-400 mb-4">Comparativo mês a mês entre as contribuições de cada modalidade.</p>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="mes"
                        tickFormatter={(v) => `${v}m`}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                    />
                    <Tooltip
                        formatter={(v, name) => [fmt(v), name]}
                        labelFormatter={(l) => `Mês ${l}`}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line
                        type="monotone"
                        dataKey={financingKey}
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        connectNulls={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="Consórcio"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 3"
                        activeDot={{ r: 4 }}
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
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
