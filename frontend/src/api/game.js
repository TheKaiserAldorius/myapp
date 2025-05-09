// src/api/game.js
//console.log('API BASE URL =', import.meta.env.VITE_API_URL);
// Базовый URL вашего бэкенда (будет подставлен при сборке)
const BASE = import.meta.env.VITE_API_URL || '';

export async function fetchCases() {
  const response = await fetch(`${BASE}/api/cases/`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.statusText}`);
  }
  return await response.json();
}

// То же проделайте для всех fetch-ов:
export async function fetchCarouselItems() {
  const response = await fetch(`${BASE}/api/carousel-items/`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

export async function fetchChanceItems() {
  const response = await fetch(`${BASE}/api/chance-items/`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

export async function spinRoulette(caseId) {
  const response = await fetch(`${BASE}/api/spin/${caseId}`, { method: 'POST' });
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}