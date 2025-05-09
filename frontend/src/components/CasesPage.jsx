// src/components/CasesPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CasesPage.scss'; // Убедитесь, что файл CasesPage.scss существует
import starIcon from '../assets/buttonsicons/StarTg.png';
import { fetchCases } from '../api/game'; // Импортируем функцию fetchCases

export default function CasesPage() {
  const [casesList, setCasesList] = useState([]); // Список кейсов
  const [error, setError] = useState(null); // Ошибка загрузки
  const navigate = useNavigate(); // Для навигации между страницами

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await fetchCases(); // Получаем кейсы через API
        setCasesList(data); // Сохраняем кейсы в состояние
      } catch (err) {
        console.error(err); // Логируем ошибку
        setError(err.message); // Сохраняем сообщение об ошибке
      }
    };

    loadCases(); // Загружаем кейсы при монтировании компонента
  }, []);

  // Если произошла ошибка, отображаем сообщение
  if (error) {
    return <div className="error-message">Ошибка загрузки кейсов: {error}</div>;
  }

  // Отображаем список кейсов
  return (
    <div className="cases-page">
      <div className="cases-grid">
        {casesList.map(c => (
          <div
            key={c.id}
            className="case-card"
            style={{ backgroundImage: `url(${c.image_url})` }} // Фон карточки - изображение кейса
            onClick={() => navigate(`/game/${c.id}`)} // Переход на страницу игры
          >
            <div className="case-footer">
              <img src={starIcon} alt="звезда" className="case-star-icon" />
              <span className="case-price">{c.price}</span> {/* Цена кейса */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}