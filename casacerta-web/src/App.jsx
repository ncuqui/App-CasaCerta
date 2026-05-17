import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import Financing from './pages/Financing';
import Consortium from './pages/Consortium';
import Results from './pages/Results';
import MySimulations from './pages/MySimulations';

function PrivateRoute({ children }) {
    const { user } = useSimulation();
    const stored = sessionStorage.getItem('casacerta_user');
    return (user || stored) ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Registration />} />

            {/* Dashboard — protected */}
            <Route path="/menu" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/menu/financiamento" element={<PrivateRoute><Financing /></PrivateRoute>} />
            <Route path="/menu/consorcio" element={<PrivateRoute><Consortium /></PrivateRoute>} />
            <Route path="/menu/comparacao" element={<PrivateRoute><Results /></PrivateRoute>} />
            <Route path="/menu/simulacoes" element={<PrivateRoute><MySimulations /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <SimulationProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </SimulationProvider>
    );
}