import React, { useEffect, useState } from 'react';
import './YourRouletteComponent.css'; // стили под рулетку

export default function YourRouletteComponent({ caseId, onClose }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    // здесь ваш алгоритм/запрос к бэку для “отираживания” случайного подарка по caseId
    // Пример:
    fetch(`/api/roulette/spin?caseId=${caseId}`)
      .then(r => r.json())
      .then(data => setResult(data))
      .catch(console.error);
  }, [caseId]);

  if (!result) {
    return <div className="roulette-loading">Крутится…</div>;
  }

  return (
    <div className="roulette-result">
      <h2>Вы выиграли!</h2>
      <img src={result.image_url} alt={result.name} />
      <p>{result.name}</p>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
}
