import { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../services/api';

const SimulationContext = createContext();

const INITIAL_FINANCING = {
    propertyValue: '',
    downPayment: '',
    termMonths: '',
    annualInterestRate: '',
    amortizationType: 'SAC',
};

const INITIAL_CONSORTIUM = {
    termMonths: '',
    annualAdminFee: '',
    reserveFund: '',
    bidType: 'variable',
    bidPercentage: 15,
    bidFixedValue: '',
};

export function SimulationProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem(STORAGE_KEYS.USER);
        return stored ? JSON.parse(stored) : null;
    });

    const [financing, setFinancing] = useState(INITIAL_FINANCING);
    const [consortium, setConsortium] = useState(INITIAL_CONSORTIUM);
    const [results, setResults] = useState(null);

    const login = (userData, token) => {
        setUser(userData);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        if (token) sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    };

    const resetSimulation = useCallback(() => {
        setFinancing(INITIAL_FINANCING);
        setConsortium(INITIAL_CONSORTIUM);
        setResults(null);
    }, []);

    return (
        <SimulationContext.Provider
            value={{
                user, login, logout,
                financing, setFinancing,
                consortium, setConsortium,
                results, setResults,
                resetSimulation,
            }}
        >
            {children}
        </SimulationContext.Provider>
    );
}

export const useSimulation = () => useContext(SimulationContext);
