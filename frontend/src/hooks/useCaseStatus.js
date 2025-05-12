import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export function useCaseStatus(caseId) {
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (caseId == null) return;
    async function fetchStatus() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/status/${caseId}`);
        const json = await res.json();
        setIsDisabled(json.success ? json.disabled : false);
      } catch (err) {
        console.error('Ошибка при получении статуса кейса:', err);
        setIsDisabled(false);
      }
    }
    fetchStatus();
  }, [caseId]);

  return isDisabled;
}
