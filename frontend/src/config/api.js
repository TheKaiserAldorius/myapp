import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'
export const api = axios.create({ baseURL: BASE })

export async function fetchCases() {
  const { data } = await api.get('/cases')
  return data
}
export async function fetchCaseStatus(id) {
  const { data } = await api.get(`/status/${id}`)
  return data.success ? data.disabled : false
}
export async function fetchCarouselItems(caseId) {
  const { data } = await api.get('/roulette/items', { params: { caseId } })
  return data.items
}
export async function spinRoulette(caseId) {
  const { data } = await api.post('/roulette/spin', { caseId })
  return data
}
