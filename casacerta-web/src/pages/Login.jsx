import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { loginUser } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useSimulation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Informe seu e-mail e senha.');
            return;
        }
        try {
            setLoading(true);
            const { token, user } = await loginUser(email, password);
            login(user, token);
            setTimeout(() => navigate('/menu'), 50);
        } catch (e) {
            setError('E-mail ou senha incorretos.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="min-h-screen bg-violet-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center">
                <span className="text-violet-700 font-bold text-base">🏠 CasaCerta</span>
            </header>

            <main className="flex-1 flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Acesse com seu e-mail e senha para continuar
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="seu@email.com"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="••••••••"
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

                        {error && (
                            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-violet-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-violet-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>

                        <div className="text-center">
                            <span className="text-sm text-gray-500">Não tem conta? </span>
                            <Link to="/cadastro" className="text-sm font-semibold text-violet-600 hover:text-violet-800">
                                Criar conta
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
