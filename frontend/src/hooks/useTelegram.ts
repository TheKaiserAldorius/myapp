import { useEffect, useState } from 'react';
import { initDataUnsafe, WebApp } from '@tma.js/sdk';

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

export const useTelegram = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    WebApp.ready();
    setUser(initDataUnsafe.user as TelegramUser);
  }, []);

  return { user, WebApp };
};
