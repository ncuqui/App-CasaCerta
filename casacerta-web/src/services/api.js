const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Request failed: ${res.status}`);
    }
    return res.json();
}

export const createUser = (data) =>
    request('/users', { method: 'POST', body: JSON.stringify(data) });

export const findUserByEmail = (email) =>
    request(`/users/email?email=${encodeURIComponent(email)}`);

export const runSimulation = (data) =>
    request('/simulations', { method: 'POST', body: JSON.stringify(data) });

export const getSimulation = (id) => request(`/simulations/${id}`);

export const getUserSimulations = (userId) =>
    request(`/simulations?userId=${userId}`);

export const deleteSimulation = async (id) => {
    const res = await fetch(`${BASE_URL}/simulations/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Delete failed: ${res.status}`);
    }
};