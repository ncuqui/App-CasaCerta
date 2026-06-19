import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { createUser, loginUser } from '../services/api';

export default function Registration() {
    const navigate = useNavigate();
    const { login } = useSimulation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', monthlyIncome: '', downPayment: '', password: '',
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.name || !form.email || !form.monthlyIncome || !form.downPayment || !form.password) {
            setError('Preencha todos os campos.');
            return;
        }
        if (form.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        try {
            setLoading(true);
            await createUser({
                name: form.name,
                email: form.email,
                monthlyIncome: parseFloat(form.monthlyIncome),
                downPayment: parseFloat(form.downPayment),
                password: form.password,
            });
            // Após criar, faz login automático para obter o token
            const { token, user } = await loginUser(form.email, form.password);
            login(user, token);
            navigate('/menu');
        } catch (e) {
            setError(e.message || 'Erro ao cadastrar. O e-mail pode já estar em uso.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";

    return (
        <div className="min-h-screen bg-violet-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center">
                <span className="text-violet-700 font-bold text-base">🏠 CasaCerta</span>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-10">
                <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Criar conta</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Informe seus dados básicos para começar a simular.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome completo</label>
                            <input name="name" value={form.name} onChange={handleChange}
                                   placeholder="Digite seu nome" className={inputClass} />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                   placeholder="seu@email.com" className={inputClass} />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                >
                                    {showPassword ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Renda mensal</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                                    <input name="monthlyIncome" type="number" value={form.monthlyIncome}
                                           onChange={handleChange}
                                           className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Valor p/ entrada</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                                    <input name="downPayment" type="number" value={form.downPayment}
                                           onChange={handleChange}
                                           className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button onClick={handleSubmit} disabled={loading}
                                className="w-full bg-violet-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-violet-700 transition-colors disabled:opacity-60">
                            {loading ? 'Criando conta...' : 'Criar conta e entrar'}
                        </button>

                        <div className="text-center">
                            <span className="text-sm text-gray-500">Já tem conta? </span>
                            <Link to="/login" className="text-sm font-semibold text-violet-600 hover:text-violet-800">
                                Entrar
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
