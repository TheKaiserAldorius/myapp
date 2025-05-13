// src/components/Page.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backButton } from '@telegram-apps/sdk-react';

/**
 * Обёртка для страницы: показывает/скрывает системную кнопку «назад».
 * Props:
 * - back?: boolean — показывать ли кнопку «назад» (по умолчанию true)
 * - backTo?: string — если указано, будет переходить не по истории, а на этот путь
 */
export function Page({ children, back = true, backTo }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (back) {
      backButton.show();
      const off = backButton.onClick(() => {
        if (backTo) navigate(backTo);
        else navigate(-1);
      });
      return off;
    } else {
      backButton.hide();
    }
  }, [back, backTo, navigate]);

  return <>{children}</>;
}
