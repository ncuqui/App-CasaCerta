import { NavLink, useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';

export default function Header() {
    const { user, logout } = useSimulation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-6">
            {/* Logo */}
            <button
                onClick={() => navigate(user ? '/simulacao' : '/')}
                className="flex items-center gap-2 text-violet-700 font-bold text-base tracking-tight hover:text-violet-900 transition-colors mr-2"
            >
                🏠 CasaCerta
            </button>

            {/* Nav links — só aparecem quando logado */}
            {user && (
                <nav className="flex items-center gap-1 flex-1">
                    <NavItem to="/simulacao">Nova simulação</NavItem>
                    <NavItem to="/minhas-simulacoes">Minhas simulações</NavItem>
                </nav>
            )}

            <div className="flex-1" />

            {/* User area */}
            {user ? (
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
                    >
                        Sair
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                >
                    Entrar
                </button>
            )}
        </header>
    );
}

function NavItem({ to, children }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                        ? 'bg-violet-100 text-violet-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`
            }
        >
            {children}
        </NavLink>
    );
}