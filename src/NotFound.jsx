import React from 'react'

// css
import './styles/not-found.css'

export default function NotFound() {
  
  return (
    <div className="not-found">
      <div className="header-wrap" >
        <img src={require('./images/logo.svg')} alt="LOGO" className="logo"
          onClick={() => window.location.href = 'http://localhost:3002'} />
      </div>

    <span className="info">
      404. Page Not Found.
    </span>
    </div>
  )
}
