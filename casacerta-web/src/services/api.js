const BASE_URL = 'http://localhost:8080/api';

function getToken() {
    return sessionStorage.getItem('casacerta_token');
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Request failed: ${res.status}`);
    }
    return res.json();
}

export const loginUser = (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

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
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}/simulations/${id}`, { method: 'DELETE', headers });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Delete failed: ${res.status}`);
    }
};
