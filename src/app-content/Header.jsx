import React from 'react'

// css
import '../styles/Header.css'

export default () => {
  return (
    <div className="header-wrap" >
      <img src={require('../images/logo.svg')} alt="LOGO."/>
      <span>
        ATTENDANCE NOTEBOOK.
      </span>
    </div>
  )
}
