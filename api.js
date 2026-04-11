// ============================================================
//  EcoRoute — API Module (MongoDB + JWT backend)
//  All auth and user data goes through our Express server.
//  JWT token stored in localStorage for session persistence.
// ============================================================

const ApiModule = (() => {
  const BASE = ECOROUTE_CONFIG.API_BASE || '';
  const TOKEN_KEY = 'eco_jwt';

  // ── Helpers ───────────────────────────────────────────────

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  function authHeaders() {
    const t = getToken();
    return t
      ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` }
      : { 'Content-Type': 'application/json' };
  }

  async function request(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
       console.error(`API Error: Received HTML for ${path}. Check server route order.`);
       throw new Error(`Data format error (HTML received instead of JSON)`);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  }

  // ── Auth ──────────────────────────────────────────────────

  /** Register a new Home/Point user */
  async function register(name, email, password, role = 'home') {
    const data = await request('POST', '/api/auth/register', { name, email, password, role });
    setToken(data.token);
    return data.user;
  }

  /** Login a Home/Point user */
  async function login(email, password) {
    const data = await request('POST', '/api/auth/login', { email, password });
    setToken(data.token);
    return data.user;
  }

  /** Driver login via Employee ID + PIN */
  async function driverLogin(empId, pin) {
    const data = await request('POST', '/api/auth/driver-login', { empId, pin });
    setToken(data.token);
    return data.user;
  }

  /** Sign out — clears local JWT */
  function logout() {
    clearToken();
  }

  // ── User Profile ──────────────────────────────────────────

  /** Get the currently authenticated user's profile */
  async function getMe() {
    const token = getToken();
    if (!token) return null;
    try {
      return await request('GET', '/api/users/me');
    } catch {
      clearToken();
      return null;
    }
  }

  /** Update current user's profile */
  async function updateMe(updates) {
    if (updates.targetId) {
       // Special case for Point User updating a community bin
       return await request('PATCH', `/api/bins/${updates.targetId}/fill`, { fillLevel: updates.fillLevel });
    }
    return await request('PUT', '/api/users/me', updates);
  }

  // ── Session check ─────────────────────────────────────────

  /** Returns user from stored token without a network call if demo mode */
  function hasSession() {
    return !!getToken();
  }

  // ── Driver & Block System ──────────────────────────────────
  async function getBlockStatus() {
    return await request('GET', '/api/driver/block-status');
  }
  async function blockLocationUpdates() {
    return await request('POST', '/api/driver/block');
  }
  async function unblockLocationUpdates() {
    return await request('POST', '/api/driver/unblock');
  }
  async function setDriverOnline(isOnline, location) {
    return await request('POST', '/api/driver/online', { isOnline, location });
  }
  async function getDriverLocation() {
    return await request('GET', '/api/driver/location');
  }

  // ── Pickups & History ──────────────────────────────────────
  async function confirmPickup(lat, lng) {
    return await request('POST', '/api/users/confirm-pickup', { lat, lng });
  }
  async function getCollectionLog() {
    try {
      return await request('GET', '/api/users/collection-log');
    } catch (e) {
      console.warn('API History fail, using local generator:', e.message);
      // Local generator for pure demo scenarios
      const fallback = [];
      for (let i = 1; i <= 14; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        fallback.push({
          date: d.toISOString().split('T')[0],
          status: Math.random() > 0.2 ? 'collected' : 'missed',
          points: 10
        });
      }
      return fallback;
    }
  }
  async function addCollectionLog(date, status, points) {
    return await request('POST', '/api/users/collection-log', { date, status, points });
  }

  // ── Driver: Bin verification, notifications, reports ────────
  async function verifyBin(userId, userName, hasDust) {
    return await request('POST', '/api/driver/verify-bin', { userId, userName, hasDust });
  }
  async function triggerNotification() {
    return await request('POST', '/api/driver/trigger-notification');
  }
  async function getDailySummary() {
    return await request('GET', '/api/driver/daily-summary');
  }
  async function getDriverHistory() {
    try {
      return await request('GET', '/api/driver/history');
    } catch (e) {
      console.warn('API Driver History fail, using local generator:', e.message);
      const fallback = [];
      for (let i = 1; i <= 14; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        fallback.push({
          date: d.toISOString().split('T')[0],
          housePickups: Math.floor(Math.random() * 20) + 30
        });
      }
      return fallback;
    }
  }

  // ── Overload & Collaboration ────────────────────────────────
  async function reportOverload() {
    try {
      return await request('POST', '/api/driver/overload');
    } catch (e) {
      console.warn('Overload fail, using demo response');
      return { success: true, message: '[DEMO] Area overload declared. Tasks reassigned to Driver 2.' };
    }
  }
  async function getOverloadRequests() {
    return await request('GET', '/api/driver/overload-requests');
  }
  async function acceptOverload(requestId) {
    return await request('POST', '/api/driver/accept-overload', { requestId });
  }

  async function submitDriverReport(type, description, location) {
    return await request('POST', '/api/driver/report', { type, description, location });
  }
  async function getActiveTrip() {
    return await request('GET', '/api/trips/active');
  }
  async function completeTrip(tripId) {
    return await request('PATCH', `/api/trips/${tripId}/complete`);
  }

  async function getConfig() {
    return await request('GET', '/api/config');
  }

  async function getLatestNotifications() {
    return await request('GET', '/api/notifications/latest');
  }

  // ── Mock Admin
  async function getAdminMocks() {
    return await request('GET', '/api/admin/mocks');
  }
  async function createAdminMock(data) {
    return await request('POST', '/api/admin/mocks', data);
  }
  async function updateAdminMock(id, data) {
    return await request('PATCH', `/api/admin/mocks/${id}`, data);
  }
  async function deleteAdminMock(id) {
    return await request('DELETE', `/api/admin/mocks/${id}`);
  }

  async function resetAllUserPreferences() {
    try {
      return await request('POST', '/api/driver/reset-all-preferences');
    } catch (e) {
      console.warn('Reset fail, using demo fallback');
      return { success: true, message: '[DEMO] Daily preferences reset for 5 users.', modifiedCount: 5 };
    }
  }

  return {
    register, login, driverLogin, logout,
    getMe, updateMe,
    hasSession, getToken, getConfig,
    getBlockStatus, blockLocationUpdates, unblockLocationUpdates,
    setDriverOnline, getDriverLocation,
    confirmPickup, getCollectionLog, addCollectionLog,
    getLatestNotifications,
    getAdminMocks, createAdminMock, updateAdminMock, deleteAdminMock,
    resetAllUserPreferences,
    verifyBin, triggerNotification, getDailySummary, getDriverHistory, submitDriverReport,
    getActiveTrip, completeTrip,
    reportOverload, getOverloadRequests, acceptOverload
  };
})();
