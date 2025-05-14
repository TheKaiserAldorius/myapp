import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { backButton } from '@telegram-apps/sdk-react'

export function Page({ children, back = true, backTo }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (back) {
      backButton.show()
      const off = backButton.onClick(() => {
        backTo ? navigate(backTo) : navigate(-1)
      })
      return off
    } else {
      backButton.hide()
    }
  }, [back, backTo, navigate])

  return <>{children}</>
}
