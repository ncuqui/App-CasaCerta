import { createContext, useContext, useState } from 'react';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem('casacerta_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [financing, setFinancing] = useState({
        propertyValue: '',
        downPayment: '',
        termMonths: '',
        annualInterestRate: '',
        amortizationType: 'SAC',
    });

    const [consortium, setConsortium] = useState({
        termMonths: '',
        annualAdminFee: '',
        reserveFund: '',
        bidType: 'variable',
        bidPercentage: 15,
        bidFixedValue: '',
    });

    const [results, setResults] = useState(null);

    const login = (userData) => {
        setUser(userData);
        sessionStorage.setItem('casacerta_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('casacerta_user');
    };

    return (
        <SimulationContext.Provider
            value={{
                user, login, logout,
                financing, setFinancing,
                consortium, setConsortium,
                results, setResults,
            }}
        >
            {children}
        </SimulationContext.Provider>
    );
}

export const useSimulation = () => useContext(SimulationContext);