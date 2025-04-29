// заглушечные «запросы»
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export async function fetchCarouselItems(caseId) {
  await delay(100);
  return [
    { img: '/src/assets/iconitems/egg.png',     price: 20 },
    { img: '/src/assets/iconitems/ring.png',    price: 25 },
    { img: '/src/assets/iconitems/cake.png',    price: 30 },
    { img: '/src/assets/iconitems/clownbox.png',price: 50 },
    { img: '/src/assets/iconitems/tophead.png', price: 150 },
  ];
}

export async function spinRoulette(caseId, cost) {
  await delay(1200);
  const wonIndex = Math.floor(Math.random() * 5);
  return { wonIndex };
}

export async function fetchChanceItems(caseId) {
  await delay(100);
  return {
    rare:   [{ name: 'Подарок #1', img: '/src/assets/iconitems/tophead.png', price: 200 }],
    common: [
      { name: 'Подарок #2', img: '/src/assets/iconitems/clownbox.png', price: 150 },
      { name: 'Подарок #3', img: '/src/assets/iconitems/cake.png',      price: 50  },
      { name: 'Подарок #4', img: '/src/assets/iconitems/ring.png',      price: 25  },
    ],
  };
}
