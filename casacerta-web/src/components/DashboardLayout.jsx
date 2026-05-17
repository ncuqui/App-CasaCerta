import { NavLink, useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';

const navItems = [
    { to: '/menu/financiamento', icon: '🏦', label: 'Financiamento' },
    { to: '/menu/consorcio', icon: '🤝', label: 'Consórcio' },
    { to: '/menu/comparacao',  icon: '⚖️', label: 'Comparação',  desc: 'Resultado final' },
    { to: '/menu/simulacoes',  icon: '📋', label: 'Minhas simulações', desc: 'Histórico' },
];

export default function DashboardLayout({ children, title }) {
    const { user, logout } = useSimulation();
    const navigate = useNavigate();    const firstName = user?.name?.split(' ')[0];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-violet-50 flex flex-col">

            {/* Top Bar */}
            <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 h-14">
                <span className="text-violet-700 font-bold text-base">🏠 CasaCerta</span>
                <div className="w-px h-5 bg-gray-200" />
                <span className="text-sm font-semibold text-gray-600">{title || 'Menu'}</span>
                <div className="flex-1" />
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">

                    {/* User greeting */}
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-xs text-gray-400 mb-0.5">Bem-vindo,</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{firstName}</p>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 p-3 flex flex-col gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                        isActive
                                            ? 'bg-violet-100 text-violet-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                    }`
                                }
                            >
                                <span className="text-base">{item.icon}</span>
                                <div>
                                    <p className="font-medium leading-tight">{item.label}</p>
                                    <p className="text-xs text-gray-400 leading-tight">{item.desc}</p>
                                </div>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-3 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <span>🚪</span>
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>

            </div>
        </div>
    );
}