// frontend/src/hooks/useTelegram.js

/**
 * Простейший хук/утилита для получения initData из Telegram WebApp
 * @returns {any|null} initDataUnsafe или null, если Telegram.WebApp не инициализирован
 */
export function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      return window.Telegram.WebApp.initDataUnsafe;
    }
    return null;
  }
  