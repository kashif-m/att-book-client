import React from 'react'

// css
import '../styles/Header.css'

export default (props) => {
  function logout() {
    window.localStorage.setItem('att-book-user', null)
    window.location.reload()
  }

  return (
    <div className="header-wrap" >
      <img src={require('../images/logo.svg')} alt="LOGO" className="logo" onClick={() => window.location.reload()} />
      <img src={require('../images/log.svg')} alt="POWER" className="power" onClick={logout} />
    </div>
  )
}
