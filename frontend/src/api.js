// src/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function authLogin(initDataUnsafe) {
  const { data } = await axios.post(`${API_URL}/api/auth/login`, {
    initDataUnsafe,
  });
  return data;
}
