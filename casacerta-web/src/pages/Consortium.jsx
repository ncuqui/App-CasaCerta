import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useSimulation } from '../context/SimulationContext';
import { runSimulation } from '../services/api';

// ---- Currency mask helpers ----
function toRawNumber(masked) {
    if (!masked) return '';
    const digits = masked.replace(/\D/g, '');
    return digits ? String(parseInt(digits, 10)) : '';
}

function toMasked(raw) {
    if (!raw) return '';
    return parseInt(raw, 10).toLocaleString('pt-BR');
}

function MoneyInput({ name, value, onChange, placeholder, disabled, className }) {
    const handleChange = (e) => {
        const raw = toRawNumber(e.target.value);
        onChange({ target: { name, value: raw } });
    };
    return (
        <input
            name={name}
            type="text"
            inputMode="numeric"
            value={toMasked(value)}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
        />
    );
}

export default function Consortium() {
    const navigate = useNavigate();
    const { user, financing, consortium, setConsortium, setResults } = useSimulation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localPropertyValue, setLocalPropertyValue] = useState('');
    const [termUnit, setTermUnit] = useState('months');

    const hasFinancingData = !!financing.propertyValue;
    const effectivePropertyValue = hasFinancingData ? financing.propertyValue : localPropertyValue;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConsortium((prev) => ({ ...prev, [name]: value }));
    };

    const handleTermChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        const months = termUnit === 'years' ? String(parseInt(raw || 0) * 12) : raw;
        setConsortium((prev) => ({ ...prev, termMonths: months }));
    };

    const termDisplayValue = () => {
        if (!consortium.termMonths) return '';
        if (termUnit === 'years') {
            const y = Math.round(parseInt(consortium.termMonths) / 12);
            return y > 0 ? String(y) : '';
        }
        return consortium.termMonths;
    };

    // Calcula bidPercentage efetivo baseado no tipo de lance
    const effectiveBidPercentage = () => {
        if (consortium.bidType === 'fixed') {
            const pv = parseFloat(effectivePropertyValue);
            const bv = parseFloat(consortium.bidFixedValue);
            if (!pv || !bv) return 0;
            return Math.min((bv / pv) * 100, 100);
        }
        return parseFloat(consortium.bidPercentage) || 0;
    };

    const handleSubmit = async (includeFinancing) => {
        setError('');
        if (!effectivePropertyValue) {
            setError('Informe o valor do imóvel.');
            return;
        }
        if (!consortium.termMonths) {
            setError('Informe o prazo do consórcio.');
            return;
        }
        if (includeFinancing && (!financing.propertyValue || !financing.annualInterestRate)) {
            setError('Preencha os dados de Financiamento primeiro.');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                userId: user.id,
                propertyValue: parseFloat(effectivePropertyValue),
                downPayment: parseFloat(financing.downPayment || 0),
                consortium: {
                    termMonths: parseInt(consortium.termMonths),
                    annualAdminFee: parseFloat(consortium.annualAdminFee),
                    reserveFund: parseFloat(consortium.reserveFund || 0),
                    bidPercentage: effectiveBidPercentage(),
                },
            };
            if (includeFinancing) {
                payload.financing = {
                    termMonths: parseInt(financing.termMonths),
                    annualInterestRate: parseFloat(financing.annualInterestRate),
                    amortizationType: financing.amortizationType,
                };
            }
            const results = await runSimulation(payload);
            setResults(results);
            navigate('/menu/comparacao');
        } catch (e) {
            setError(e.message || 'Erro ao processar simulação.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";

    const bidPct = effectiveBidPercentage();
    const bidValueDisplay = consortium.bidType === 'fixed'
        ? (consortium.bidFixedValue ? `R$ ${toMasked(consortium.bidFixedValue)}` : '—')
        : (effectivePropertyValue ? `R$ ${toMasked(String(Math.round(parseFloat(effectivePropertyValue) * bidPct / 100)))}` : '—');

    return (
        <DashboardLayout title="Consórcio">
            <div className="max-w-5xl space-y-5">

                {/* Banner */}
                <div className="bg-violet-600 rounded-2xl p-5 text-white">
                    <h2 className="text-lg font-bold mb-1">Configure o cenário de consórcio.</h2>
                    <p className="text-violet-200 text-sm">
                        Informe os dados do consórcio para estimar contribuição mensal e custo total.
                        {hasFinancingData
                            ? ' O resultado será comparado com o financiamento.'
                            : ' Você pode ver o resultado isolado ou voltar para preencher o financiamento.'
                        }
                    </p>
                </div>

                {/* Content: Form + Summary side by side */}
                <div className="flex gap-5">

                    {/* Form */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-4">Dados do consórcio</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Valor do imóvel / carta de crédito */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {hasFinancingData ? 'Carta de crédito' : 'Valor do imóvel'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                                    {hasFinancingData ? (
                                        <>
                                            <input value={toMasked(financing.propertyValue)} disabled
                                                   className="w-full border border-gray-100 bg-gray-50 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-400" />
                                            <p className="text-xs text-gray-400 mt-1">Herdado do Financiamento.</p>
                                        </>
                                    ) : (
                                        <MoneyInput name="__localPV" value={localPropertyValue}
                                               onChange={(e) => setLocalPropertyValue(e.target.value)}
                                               placeholder="420.000" className={inputClass} />
                                    )}
                                </div>
                            </div>

                            {/* Prazo com toggle meses/anos */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm font-semibold text-gray-700">Prazo</label>
                                    <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setTermUnit('months')}
                                            className={`px-2 py-0.5 transition-colors ${termUnit === 'months' ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            meses
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTermUnit('years')}
                                            className={`px-2 py-0.5 transition-colors ${termUnit === 'years' ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            anos
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={termDisplayValue()}
                                    onChange={handleTermChange}
                                    placeholder={termUnit === 'years' ? '15' : '180'}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                />
                                {consortium.termMonths && termUnit === 'years' && (
                                    <p className="text-xs text-gray-400 mt-1">{consortium.termMonths} meses</p>
                                )}
                                {consortium.termMonths && termUnit === 'months' && parseInt(consortium.termMonths) >= 12 && (
                                    <p className="text-xs text-gray-400 mt-1">{(parseInt(consortium.termMonths) / 12).toFixed(1).replace('.0', '')} anos</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Taxa administrativa anual</label>
                                <div className="relative">
                                    <input name="annualAdminFee" type="number" step="0.01" value={consortium.annualAdminFee}
                                           onChange={handleChange} placeholder="1,80"
                                           className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%/ano</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Cobrada pela administradora do grupo.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fundo de reserva anual</label>
                                <div className="relative">
                                    <input name="reserveFund" type="number" step="0.01" value={consortium.reserveFund}
                                           onChange={handleChange} placeholder="2,00"
                                           className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%/ano</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Garante o grupo contra inadimplência.</p>
                            </div>
                        </div>

                        {/* Lance: fixo ou variável */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-gray-700">Lance</label>
                                <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setConsortium((prev) => ({ ...prev, bidType: 'variable' }))}
                                        className={`px-3 py-1 transition-colors ${consortium.bidType === 'variable' ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        Variável (%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConsortium((prev) => ({ ...prev, bidType: 'fixed' }))}
                                        className={`px-3 py-1 transition-colors ${consortium.bidType === 'fixed' ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        Fixo (R$)
                                    </button>
                                </div>
                            </div>

                            {consortium.bidType === 'variable' ? (
                                <>
                                    <div className="flex items-center gap-3 mb-1">
                                        <input
                                            name="bidPercentage"
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={consortium.bidPercentage}
                                            onChange={handleChange}
                                            className="flex-1 accent-violet-600"
                                        />
                                        <span className="text-sm font-bold text-violet-600 w-12 text-right">{consortium.bidPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>0%</span><span>25%</span><span>50%</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Lance de {consortium.bidPercentage}% da carta = {bidValueDisplay}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                                        <MoneyInput
                                            name="bidFixedValue"
                                            value={consortium.bidFixedValue}
                                            onChange={handleChange}
                                            placeholder="63.000"
                                            className={inputClass}
                                        />
                                    </div>
                                    {bidPct > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Equivale a {bidPct.toFixed(1)}% da carta de crédito.
                                        </p>
                                    )}
                                </>
                            )}
                            <p className="text-xs text-gray-500 mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                💡 O lance antecipa sua contemplação. Valores maiores aumentam as chances, mas reduzem o saldo da carta disponível.
                            </p>
                        </div>

                        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

                        <div className="flex items-center justify-between">
                            <button onClick={() => navigate('/menu/financiamento')}
                                    className="px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                ← Financiamento
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => handleSubmit(false)} disabled={loading}
                                        className="px-5 py-2.5 border border-violet-200 text-violet-600 font-semibold rounded-lg text-sm hover:bg-violet-50 transition-colors disabled:opacity-60">
                                    {loading ? 'Calculando...' : 'Ver resultado →'}
                                </button>
                                {hasFinancingData && (
                                    <button onClick={() => handleSubmit(true)} disabled={loading}
                                            className="px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-lg text-sm hover:bg-violet-700 transition-colors disabled:opacity-60">
                                        {loading ? 'Calculando...' : 'Ver comparação →'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary sidebar */}
                    <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl shadow-sm p-5">
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">Resumo</h3>
                            <div className="flex flex-col gap-2.5">
                                <SummaryItem label="Carta de crédito" value={effectivePropertyValue ? `R$ ${toMasked(effectivePropertyValue)}` : '—'} />
                                <SummaryItem label="Prazo" value={consortium.termMonths ? `${consortium.termMonths} meses` : '—'} />
                                <SummaryItem label="Taxa adm." value={consortium.annualAdminFee ? `${consortium.annualAdminFee}% a.a.` : '—'} />
                                <SummaryItem
                                    label="Lance"
                                    value={consortium.bidType === 'fixed'
                                        ? bidValueDisplay
                                        : `${consortium.bidPercentage}% da carta`}
                                />
                                {bidPct > 0 && (
                                    <SummaryItem label="Lance em %" value={`${bidPct.toFixed(1)}%`} />
                                )}
                            </div>
                        </div>
                        <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                            <p className="text-xs font-semibold text-violet-700 mb-2">💡 Dicas</p>
                            <p className="text-xs text-gray-500">Lance maior aumenta a chance de contemplação antecipada.</p>
                            <p className="text-xs text-gray-500 mt-2">Consórcio não tem juros, mas exige paciência no prazo.</p>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="border border-gray-100 rounded-lg p-2.5">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-bold text-gray-800">{value}</p>
        </div>
    );
}
