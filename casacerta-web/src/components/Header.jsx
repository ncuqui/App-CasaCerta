import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-violet-700 hover:text-violet-900 transition-colors"
      >
        <span className="text-lg">🏠</span>
        <span className="font-semibold text-base tracking-tight">CasaCerta</span>
      </button>
    </header>
  );
}
