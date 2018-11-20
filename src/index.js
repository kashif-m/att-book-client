import React from 'react'
import { render } from 'react-dom'

// css
import './styles/style.css'

// UDC - Router
import AppRouter from './AppRouter'

render(
  <AppRouter />,
  document.getElementById('react-app')
)
