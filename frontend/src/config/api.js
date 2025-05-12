import axios from 'axios';

// Базовый URL: если есть VITE_API_URL, добавляем его, иначе относительный '/api'
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Список кейсов: GET /api/cases
 */
export async function fetchCases() {
  const res = await api.get('/cases');
  return res.data; // ожидаем массив {id, name, price, image_url}
}

/**
 * Статус кейса: GET /api/status/:caseId
 */
export async function fetchCaseStatus(caseId) {
  const res = await api.get(`/status/${caseId}`);
  // { success: true, disabled: boolean }
  return res.data.success ? res.data.disabled : false;
}

/**
 * Создать счёт-фактуру (пополнение): POST /api/create_invoice
 */
export async function createInvoice(telegram_id, amount) {
  const res = await api.post('/create_invoice', { telegram_id, amount });
  return res.data; // { ok: true }
}

/**
 * Баланс пользователя: GET /api/balance?telegram_id=...
 */
export async function fetchBalance(telegram_id) {
  const res = await api.get('/balance', { params: { telegram_id } });
  return res.data.balance_xtr;
}

/**
 * История транзакций: GET /api/history?telegram_id=...
 */
export async function fetchHistory(telegram_id) {
  const res = await api.get('/history', { params: { telegram_id } });
  if (res.data.success) return res.data.data;
  return [];
}

/**
 * Общий лидерборд: GET /api/leaderboard
 */
export async function fetchGlobalLeaders() {
  const res = await api.get('/leaderboard');
  if (res.data.success) return res.data.data;
  throw new Error('Bad response: ' + JSON.stringify(res.data));
}

/**
 * Недельный лидерборд: GET /api/leaderboard?period=weekly
 */
export async function fetchWeeklyLeaders() {
  const res = await api.get('/leaderboard', { params: { period: 'weekly' } });
  if (res.data.success) return res.data.data;
  throw new Error('Bad response: ' + JSON.stringify(res.data));
}

/**
 * Ранг пользователя: GET /api/user/:id/rank
 */
export async function fetchUserRank(userId) {
  const res = await api.get(`/user/${userId}/rank`);
  if (typeof res.data.rank === 'number') return res.data.rank;
  throw new Error('Bad rank response: ' + JSON.stringify(res.data));
}

/**
 * Крутилка (рулетка): GET /api/roulette/spin?caseId=...
 */
export async function spinRoulette(caseId) {
  const res = await api.get('/roulette/spin', { params: { caseId } });
  return res.data; // ожидаем { id, name, image_url, ... }
}
