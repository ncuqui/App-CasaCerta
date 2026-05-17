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

// Converte taxa anual (%) para mensal equivalente (%)
function monthlyEquivalent(annualRate) {
    const rate = parseFloat(annualRate);
    if (!rate || rate <= 0) return null;
    return ((Math.pow(1 + rate / 100, 1 / 12) - 1) * 100).toFixed(4);
}

export default function Financing() {
    const navigate = useNavigate();
    const { user, financing, setFinancing, setResults } = useSimulation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [termUnit, setTermUnit] = useState('months');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFinancing((prev) => ({ ...prev, [name]: value }));
    };

    // Converte o valor exibido no campo prazo para meses no contexto
    const handleTermChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        const months = termUnit === 'years' ? String(parseInt(raw || 0) * 12) : raw;
        setFinancing((prev) => ({ ...prev, termMonths: months }));
    };

    const termDisplayValue = () => {
        if (!financing.termMonths) return '';
        if (termUnit === 'years') {
            const y = Math.round(parseInt(financing.termMonths) / 12);
            return y > 0 ? String(y) : '';
        }
        return financing.termMonths;
    };

    const financedAmount =
        financing.propertyValue && financing.downPayment
            ? (parseFloat(financing.propertyValue) - parseFloat(financing.downPayment)).toLocaleString('pt-BR')
            : '—';

    const downPercent =
        financing.propertyValue && financing.downPayment
            ? Math.round((parseFloat(financing.downPayment) / parseFloat(financing.propertyValue)) * 100)
            : null;

    const monthlyRate = monthlyEquivalent(financing.annualInterestRate);

    const handleSimulateAlone = async () => {
        setError('');
        if (!financing.propertyValue || !financing.annualInterestRate || !financing.termMonths) {
            setError('Preencha o valor do imóvel, o prazo e a taxa de juros.');
            return;
        }
        try {
            setLoading(true);
            const results = await runSimulation({
                userId: user.id,
                propertyValue: parseFloat(financing.propertyValue),
                downPayment: parseFloat(financing.downPayment || 0),
                financing: {
                    termMonths: parseInt(financing.termMonths),
                    annualInterestRate: parseFloat(financing.annualInterestRate),
                    amortizationType: financing.amortizationType,
                },
            });
            setResults(results);
            navigate('/menu/comparacao');
        } catch (e) {
            setError(e.message || 'Erro ao processar simulação.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";

    return (
        <DashboardLayout title="Financiamento">
            <div className="max-w-5xl space-y-5">

                {/* Banner */}
                <div className="bg-violet-600 rounded-2xl p-5 text-white">
                    <h2 className="text-lg font-bold mb-1">Configure o cenário de financiamento.</h2>
                    <p className="text-violet-200 text-sm">
                        Informe os dados do financiamento para estimar parcela, prazo e custo total.
                        Você pode ver o resultado isolado ou prosseguir para comparar com o consórcio.
                    </p>
                </div>

                {/* Content: Form + Summary side by side */}
                <div className="flex gap-5">

                    {/* Form */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-4">Dados do financiamento</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Valor do imóvel</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                                    <MoneyInput name="propertyValue" value={financing.propertyValue} onChange={handleChange}
                                           placeholder="420.000" className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Valor de entrada</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                                    <MoneyInput name="downPayment" value={financing.downPayment} onChange={handleChange}
                                           placeholder="84.000" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
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
                                    placeholder={termUnit === 'years' ? '30' : '360'}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                />
                                {financing.termMonths && termUnit === 'years' && (
                                    <p className="text-xs text-gray-400 mt-1">{financing.termMonths} meses</p>
                                )}
                                {financing.termMonths && termUnit === 'months' && parseInt(financing.termMonths) >= 12 && (
                                    <p className="text-xs text-gray-400 mt-1">{(parseInt(financing.termMonths) / 12).toFixed(1).replace('.0', '')} anos</p>
                                )}
                            </div>

                            {/* Taxa com equivalente mensal */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Taxa de juros</label>
                                <div className="relative">
                                    <input
                                        name="annualInterestRate"
                                        type="number"
                                        step="0.01"
                                        value={financing.annualInterestRate}
                                        onChange={handleChange}
                                        placeholder="10,50"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Taxa nominal fixa a.a.</p>
                                {monthlyRate && (
                                    <p className="text-xs text-violet-600 font-medium mt-0.5">{monthlyRate}% a.m.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Amortização</label>
                                <select name="amortizationType" value={financing.amortizationType} onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                                    <option value="SAC">SAC — parcelas decrescentes</option>
                                    <option value="PRICE">PRICE — parcelas fixas</option>
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {financing.amortizationType === 'SAC'
                                        ? 'Amortização constante, juros decrescem.'
                                        : 'Parcela fixa, amortização crescente.'}
                                </p>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

                        <div className="flex items-center justify-between">
                            <button onClick={handleSimulateAlone} disabled={loading}
                                    className="px-5 py-2.5 border border-violet-200 text-violet-600 font-semibold rounded-lg text-sm hover:bg-violet-50 transition-colors disabled:opacity-60">
                                {loading ? 'Calculando...' : 'Ver resultado →'}
                            </button>
                            <button onClick={() => navigate('/menu/consorcio')}
                                    className="px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-lg text-sm hover:bg-violet-700 transition-colors">
                                Comparar com Consórcio →
                            </button>
                        </div>
                    </div>

                    {/* Summary sidebar */}
                    <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl shadow-sm p-5">
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">Resumo</h3>
                            <div className="flex flex-col gap-2.5">
                                <SummaryItem label="Valor financiado" value={`R$ ${financedAmount}`} />
                                <SummaryItem label="Prazo" value={financing.termMonths ? `${financing.termMonths} meses` : '—'} />
                                <SummaryItem label="Juros anuais" value={financing.annualInterestRate ? `${financing.annualInterestRate}% a.a.` : '—'} />
                                <SummaryItem label="Juros mensais" value={monthlyRate ? `${monthlyRate}% a.m.` : '—'} />
                                <SummaryItem label="Entrada" value={downPercent ? `${downPercent}% do imóvel` : '—'} />
                            </div>
                        </div>
                        <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                            <p className="text-xs font-semibold text-violet-700 mb-2">💡 Dicas</p>
                            <p className="text-xs text-gray-500">Entrada maior reduz o valor financiado e o total de juros pago.</p>
                            <p className="text-xs text-gray-500 mt-2">SAC tem parcelas decrescentes. PRICE tem parcelas fixas.</p>
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
