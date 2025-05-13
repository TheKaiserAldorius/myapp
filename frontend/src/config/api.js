import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

/** Получить список кейсов */
export async function fetchCases() {
  const res = await api.get('/cases');
  return res.data; // [{ id, name, price, image_url, is_new? }, …]
}

/** Статус отключения кейса */
export async function fetchCaseStatus(caseId) {
  const res = await api.get(`/status/${caseId}`);
  return res.data.success ? res.data.disabled : false;
}

/** Крутилка: запускает спин и возвращает { wonIndex, reward } */
export async function spinRoulette(caseId, cost) {
  const res = await api.post('/roulette/spin', { caseId, cost });
  return res.data;
}

/** Элементы карусели для рулетки */
export async function fetchCarouselItems(caseId) {
  const res = await api.get('/roulette/items', { params: { caseId } });
  return res.data.items;
}

/** Шансы выпадения для рулетки */
export async function fetchChanceItems(caseId) {
  const res = await api.get('/roulette/chances', { params: { caseId } });
  return res.data; // { rare: [ … ], common: [ … ] }
}
