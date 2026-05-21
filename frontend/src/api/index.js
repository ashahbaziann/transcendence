const BASE = 'https://localhost:8443';

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// Auth
export const getMe = () => request('/auth/me');

// User
export const getUserStats  = (id)         => request(`/api/user/users/${id}/stats`);
export const getFriends    = (id)         => request(`/api/user/users/${id}/friends`);
export const getMatchHistory = (id)       => request(`/api/user/users/${id}/stats`);
export const updateStatus  = (id, status) => request(`/api/user/users/status`, {
  method: 'PUT',
  body: JSON.stringify({ userId: id, status }),
});
export const getUsers      = ()           => request('/api/user/users');
export const getUserById   = (id)         => request(`/api/user/users/${id}`);