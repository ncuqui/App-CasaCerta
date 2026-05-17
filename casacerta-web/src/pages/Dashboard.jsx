import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useSimulation } from '../context/SimulationContext';
import { getUserSimulations } from '../services/api';

const fmt = (value) =>
    value != null
        ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
        : '—';

const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

export default function Dashboard() {
    const { user, setResults } = useSimulation();
    const navigate = useNavigate();
    const [simulations, setSimulations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getUserSimulations(user.id)
            .then((data) => setSimulations(data.slice(0, 5))) // últimas 5
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user]);

    const handleView = (sim) => {
        setResults(sim);
        navigate('/menu/comparacao');
    };

    return (
        <DashboardLayout title="Início">
            <div className="max-w-3xl">

                {/* Welcome banner */}
                <div className="bg-violet-600 rounded-2xl p-6 text-white mb-6">
                    <h1 className="text-xl font-bold mb-1">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-violet-200 text-sm">
                        Simule e compare financiamento e consórcio para tomar a melhor decisão na compra do seu imóvel.
                    </p>
                    <button
                        onClick={() => navigate('/menu/financiamento')}
                        className="mt-4 bg-white text-violet-700 font-semibold px-5 py-2 rounded-lg text-sm hover:bg-violet-50 transition-colors"
                    >
                        + Nova simulação
                    </button>
                </div>

                {/* Recent simulations */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-gray-800">Últimas simulações</h2>
                        {simulations.length > 0 && (
                            <button
                                onClick={() => navigate('/menu/simulacoes')}
                                className="text-sm text-violet-600 font-medium hover:underline"
                            >
                                Ver todas →
                            </button>
                        )}
                    </div>

                    {loading && (
                        <p className="text-sm text-gray-400 py-8 text-center">Carregando...</p>
                    )}

                    {!loading && simulations.length === 0 && (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                            <p className="text-3xl mb-2">🏠</p>
                            <p className="text-gray-500 font-medium mb-1">Nenhuma simulação ainda</p>
                            <p className="text-sm text-gray-400 mb-4">Crie sua primeira simulação e compare as modalidades.</p>
                            <button
                                onClick={() => navigate('/menu/financiamento')}
                                className="bg-violet-600 text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-violet-700 transition-colors"
                            >
                                Iniciar simulação
                            </button>
                        </div>
                    )}

                    {!loading && simulations.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {simulations.map((sim) => {
                                const hasBoth = sim.financing && sim.consortium;
                                const isCons = sim.recommendation === 'CONSORTIUM';
                                const badgeText = hasBoth
                                    ? (isCons ? 'Consórcio' : 'Financiamento')
                                    : (sim.financing ? 'Apenas Financiamento' : 'Apenas Consórcio');
                                const badgeColor = hasBoth
                                    ? (isCons ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')
                                    : 'bg-violet-100 text-violet-700';
                                const iconBg = isCons ? 'bg-green-100' : 'bg-blue-100';
                                return (
                                    <div
                                        key={sim.id}
                                        onClick={() => handleView(sim)}
                                        className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md cursor-pointer transition-shadow"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                                            <span className="text-lg">{isCons ? '🤝' : '🏦'}</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800 text-sm">{fmt(sim.propertyValue)}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                                                    {badgeText}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(sim.createdAt)}</p>
                                        </div>

                                        <div className="flex gap-5 text-right">
                                            {sim.financing && (
                                                <div>
                                                    <p className="text-xs text-gray-400">Financiamento</p>
                                                    <p className="text-sm font-semibold text-gray-700">{fmt(sim.financing.totalCost)}</p>
                                                </div>
                                            )}
                                            {sim.consortium && (
                                                <div>
                                                    <p className="text-xs text-gray-400">Consórcio</p>
                                                    <p className="text-sm font-semibold text-gray-700">{fmt(sim.consortium.totalCost)}</p>
                                                </div>
                                            )}
                                            <span className="text-gray-300 self-center">›</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}