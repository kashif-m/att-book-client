import React, { Component } from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'

// css
import '../styles/Welcome.css'

// UDTs
import Login from './Login'
import Register from './Register'

export default class Welcome extends Component {

  constructor(props) {
    super(props)

    this.state = {
      showPopup: false,
      popupState: ''
    }
  }

  popup = (state) => {
    this.setState((prevState) => {
      return {
        showPopup: !prevState.showPopup,
        popupState: state
      }
    })
  }
  
  render() {

    const loginButton = this.state.popupState === 'login' ? 'login active' : 'login'
    const registerButton = this.state.popupState === 'register' ? 'register active' : 'register'
    return (
      <div className="welcome-wrap" >
        <div className="main-cover">
          <img className="logo" src={require('../images/spiral_top.svg')} alt="LOGO."/>
          <span className="heading" >
            ATTENDANCE NOTEBOOK
          </span>        
        </div>

        <CSSTransitionGroup
          className="user-section"
          component="div"
          transitionName="popup"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          <div className="buttons">
            <button className="login" onClick={() => this.popup('login')} >LOGIN</button>
            <button className="register" onClick={() => this.popup('register')} >REGISTER</button>
          </div>
          {
            this.state.showPopup
            ?
            <div className="popup">
              <img src={require('../images/close.svg')} alt="x" className="close-popup" onClick={() => this.setState({showPopup: false})}/>
              <div className="popup-buttons">
                <button className={loginButton} onClick={() => this.setState({popupState: 'login'})} >LOGIN</button>
                <button className={registerButton} onClick={() => this.setState({popupState: 'register'})} >REGISTER</button>
              </div>
              {
                this.state.popupState === 'login'
                ?
                <Login />
                :
                <Register />
              }
            </div>
            : null
          }
        </CSSTransitionGroup>
      </div>
    )
  }
}
