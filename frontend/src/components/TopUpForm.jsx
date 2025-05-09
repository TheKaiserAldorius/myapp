import React, { useState } from 'react'
const API_URL = process.env.VITE_API_URL || ''

export default function TopUpForm({ userId, onBalanceUpdated }) {
  const [amt, setAmt] = useState('')
  const tg = window.Telegram.WebApp

  const handle = () => {
    const a = parseInt(amt)
    if (!a||a<=0) return tg.showAlert('Введите корректную сумму')

    fetch(`${API_URL}/api/create_invoice`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ telegram_id:userId, amount:a })
    })
    .then(r=>r.json())
    .then(d=>{
      if (!d.ok) throw new Error('Не удалось создать счёт')
      tg.openInvoice({
        chat_id: userId,
        title: `Пополнение на ${a} XTR`,
        description: `Зачисляется ${a} XTR`,
        payload: d.payload,
        provider_token: process.env.VITE_PROVIDER_TOKEN,
        currency: 'USD',
        prices: [{label:`${a} XTR`,amount:a*100}]
      }, status => {
        if (status==='paid'||status==='pending') {
          setTimeout(()=>{
            fetch(`${API_URL}/api/balance?telegram_id=${userId}`)
              .then(r=>r.json())
              .then(b=>onBalanceUpdated(b.balance_xtr))
          }, status==='pending'?3000:500)
          tg.showAlert(status==='paid'?'Оплачено!':'В обработке...')
        }
      })
    })
    .catch(e=>tg.showAlert(e.message))
  }

  return (
    <div style={{marginTop:20}}>
      <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Сумма XTR"/>
      <button onClick={handle}>Пополнить</button>
    </div>
  )
}
