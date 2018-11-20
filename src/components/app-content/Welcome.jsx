import React, { Component } from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import axios from 'axios'

// css
import '../../styles/Welcome.css'

export default class Welcome extends Component {

  constructor(props) {
    super(props)

    this.state = {
      generalError: {},
      popupState: '',
      showPopup: false,
      validationErrors: {}
    }
  }

  popup = (state, popup) => {
    if(this.email)
      this.email.value = ''
    if(this.password)
      this.password.value = ''
    this.setState({
      generalError: {},
      popupState: state,
      showPopup: popup ? popup : true,
      validationErrors: {}
    })

    // autofocus on email field
    const input = document.getElementById('email')
    if(input)
      input.focus()
  }

  submit = (submission) => {

    this.clearErrors()
    const data = {
      email: this.email.value,
      password: this.password.value
    }

    axios
      .post(`/user/${submission}`, data)
      .then(res => {
        if(submission === 'register')
          return this.setState({popupState: 'success'})
        
        this.props.updateToken(res.data.token)
      })
      .catch(err => {
        const errors = err.response.data
        this.setState({
          generalError: errors.msg ? errors : {},
          validationErrors: errors.msg ? {} : errors
        })
      })
  }

  clearErrors = () => {
    this.setState({
      generalError: {},
      validationErrors: {}
    })
  }

  passwordReset = () => {
    const data = {
      email: this.email.value
    }
    axios
      .post('/password/send', data)
      .then(res => {
        this.setState({
          popupState: 'forgot-password-success'
        })
      })
      .catch(err => {
        const errors = err.response.data
        this.setState({
          generalError: errors.msg ? errors : {},
          validationErrors: errors.msg ? {} : errors
        })
      })
  }

  render() {

    const loginButton = this.state.popupState === 'login' ? 'login active' : 'login'
    const registerButton = this.state.popupState === 'register' ? 'register active' : 'register'
    const { popupState, validationErrors, generalError } = this.state

    return (
      <div className="welcome-wrap" >
        <div className="main-cover">
          <img className="spiral" src={require('../../images/spiral_top.svg')} alt="LOGO"/>
          <span className="heading" > ATTENDANCE NOTEBOOK </span>
        </div>

        <CSSTransitionGroup
          className="user-section"
          component="div"
          transitionName="popup"
          transitionEnterTimeout={350}
          transitionLeaveTimeout={350} >
          {/* button-section */}
          <div className="buttons">
            <button className="login"
              onClick={() => this.popup('login', true)}>LOGIN</button>
            <button className="register"
              onClick={() => this.popup('register', true)}>REGISTER</button>
          </div>

          {/* popup */}
          {
            this.state.showPopup ?
            <div className="popup">
              <img src={require('../../images/close.svg')} alt="x" className="close-popup"
                onClick={() => this.setState({showPopup: false})} />
              {/* general-error */}
              {
                generalError.msg &&
                <div className="general-error">
                  <img src={require('../../images/close-err.svg')} alt="x" className="close-err"
                    onClick={() => this.setState({generalError: {}})} />
                  <span className="error">{generalError.msg}</span>
                </div>
              }
              {/* popup-buttons (nav) */}
              {
                popupState === 'login' || popupState === 'register' ?
                <div className="popup-buttons">
                  <button
                    className={loginButton}
                    onClick={() => this.popup('login')}>LOGIN</button>
                  <button
                    className={registerButton}
                    onClick={() => this.popup('register')}>REGISTER</button>
                </div>
                : null
              }
              {/* popup body */}
              {
                popupState === 'login' || popupState === 'register' ?
                <div className="input-section">
                  <div className="email-section">
                    <input type="text" id="email" autoFocus={true}
                      placeholder={popupState === 'login' ? 'Registered E-mail' : 'E-mail'}
                      ref={node => this.email = node} />
                    {
                      validationErrors.email &&
                      ( <div className="email-error">{validationErrors.email}</div> )
                    }
                  </div>
                  <div className="password-section">
                    <input type="password" placeholder="Password" ref={node => this.password = node}
                      onKeyDown={(key) => {
                        if(key.keyCode === 13)
                          this.submit(popupState)
                      }}
                    />
                    {
                      validationErrors.password &&
                      ( <div className="password-error">{validationErrors.password}</div> )
                    }
                  </div>
                  <div className="last-row">
                    {
                      popupState === 'login' ?
                      <div onClick={() => this.setState({popupState: 'forgot-password'})} >
                      Forgot password? </div>
                      : null
                    }
                    <img src={require('../../images/continue.svg')} alt="->" className="submit"
                      onClick={() => this.submit(popupState)} />
                  </div>
                </div>
                : null
              }
              {/* success */}
              {
                popupState === 'success' ?
                <div className="success">
                  Successfully registered.
                  Click <a onClick={() => this.setState({popupState: 'login'})}>here</a> to login.
                </div>
                : null
              }
              {/* forgot password */}
              {
                popupState === 'forgot-password' ?
                <div className="forgot-password">
                  <span className="fg--heading">Password Reset</span>
                  <input type="text" id="email" autoFocus={true}
                    placeholder='E-mail'
                    ref={node => this.email = node} />
                  {
                    validationErrors.email &&
                    ( <div className="email-error">{validationErrors.email}</div> )
                  }
                  <img src={require('../../images/continue.svg')} alt="->" className="submit"
                      onClick={() => this.passwordReset()} />                  
                </div>
                : null
              }
              {/* success */}
              {
                popupState === 'forgot-password-success' ?
                <div className="forgot-password">
                  <span className="fg--heading">Password Reset</span>
                  <span className="info">Please check your e-mail.</span>
                </div>
                : null
              }
            </div>
            : null
          }
        </CSSTransitionGroup>
      </div>
    )
  }
}
