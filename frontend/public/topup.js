(async () => {
  // Инициализация WebApp
  window.Telegram.WebApp.init();
  const initData = window.Telegram.WebApp.initDataUnsafe;
  const tgUserId = initData.user.id;
  const providerToken = import.meta.env.VITE_PROVIDER_TOKEN; // Vite

  // Ноды уведомления
  const notif = document.getElementById('notification');
  const notifText = document.getElementById('notif-text');
  const notifClose = document.getElementById('notif-close');
  notifClose.addEventListener('click', () => notif.classList.add('hidden'));

  function showNotification(msg) {
    notifText.textContent = msg;
    notif.classList.remove('hidden');
  }

  // Подгрузить текущий баланс
  async function fetchBalance() {
    try {
      const resp = await fetch(`/api/balance?telegram_id=${tgUserId}`);
      const { balance_xtr } = await resp.json();
      document.getElementById('amountInput').placeholder = `Текущий: ${balance_xtr} XTR`;
    } catch {
      /* silent */
    }
  }

  // Создание инвойса и вызов окна оплаты
  async function topUp() {
    const amount = Number(document.getElementById('amountInput').value) || 0;
    if (amount <= 0) {
      showNotification('Введите корректную сумму');
      return;
    }

    showNotification('Генерируем счёт…');
    const resp = await fetch('/api/create_invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: tgUserId, amount })
    });
    const { payload } = await resp.json();

    showNotification('Откройте окно оплаты в Telegram');
    window.Telegram.WebApp.openInvoice({
      chat_id: tgUserId,
      title: `Пополнение на ${amount} XTR`,
      description: `Ваш баланс пополняется`,
      payload,
      provider_token: providerToken,
      currency: 'RUB',
      prices: [{ label: `${amount} XTR`, amount: amount * 100 }]
    });
  }

  // Привязка кнопки
  document.getElementById('topUpBtn').addEventListener('click', topUp);

  // Первый рендер
  await fetchBalance();
})();
