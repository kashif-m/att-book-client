import React, { Component } from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import axios from 'axios'

// css
import '../styles/Welcome.css'

export default class Welcome extends Component {

  constructor(props) {
    super(props)

    this.state = {
      showPopup: false,
      popupState: '',
      validationErrors: {},
      generalError: {}
    }
  }

  popup = (state, popup) => {
    console.log(popup)
    this.setState({
      showPopup: popup ? popup : true,
      popupState: state,
      validationErrors: {},
      generalError: {}
    })
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
          validationErrors: errors.msg ? {} : errors,
          generalError: errors.msg ? errors : {}
        })
      })
  }

  clearErrors = () => {
    this.setState({
      validationErrors: {},
      generalError: {}
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
          transitionLeaveTimeout={500}>
          {/* button-section */}
          <div className="buttons">
            <button className="login"
              onClick={() => this.popup('login', true)}>LOGIN</button>
            <button className="register"
              onClick={() => this.popup('register', true)}>REGISTER</button>
          </div>

          {/* popup */}
          {
            this.state.showPopup
            ?
            <div className="popup">
              <img
                src={require('../images/close.svg')}
                alt="x" className="close-popup"
                onClick={() => this.setState({showPopup: false})}/>
              {/* general-error */}
              {
                this.state.generalError.msg &&
                <div className="general-error">
                  <img src={require('../images/close-err.svg')}
                    alt="x" className="close-err"
                    onClick={() => this.setState({generalError: {}})}/>
                  <span className="error">{this.state.generalError.msg}</span>
                </div>
              }
              {/* popup-buttons (nav) */}
              {
                this.state.popupState === 'login' || this.state.popupState === 'register'
                ?
                <div className="popup-buttons">
                  <button
                    className={loginButton}
                    onClick={() => this.popup('login')}>LOGIN</button>
                  <button
                    className={registerButton}
                    onClick={() => this.popup('register')}>REGISTER</button>
                </div>
                :
                null
              }
              {/* login/register */}
              {
                this.state.popupState === 'login'
                ?
                <div className="login-section">
                  <div className="email-section">
                    <input type="text"
                      placeholder="Registered E-Mail"
                      ref={node => this.email = node}
                    />
                    {
                      this.state.validationErrors.email &&
                      (
                        <div className="email-error">{this.state.validationErrors.email}</div>
                      )
                    }
                  </div>
                  <div className="password-section">
                    <input type="password"
                      placeholder="Password"
                      ref={node => this.password = node}
                    />
                    {
                      this.state.validationErrors.password &&
                      (
                        <div className="password-error">{this.state.validationErrors.password}</div>
                      )
                    }
                  </div>
                  <img src={require('../images/continue.svg')} alt="->" className="submit" onClick={() => this.submit('login')} />
                </div>
                :
                this.state.popupState === 'register'
                ?
                <div className="register-section">
                  <div className="email-section">
                    <input type="text"
                      placeholder="E-mail"
                      ref={node => this.email = node}/>
                    {
                      this.state.validationErrors.email &&
                      (
                        <div className="email-error">{this.state.validationErrors.email}</div>
                      )
                    }
                  </div>
                  <div className="password-section">
                    <input type="password"
                      placeholder="Password"
                      ref={node => this.password = node}/>
                    {
                      this.state.validationErrors.password &&
                      (
                        <div className="password-error">{this.state.validationErrors.password}</div>
                      )
                    }
                  </div>
                  <img src={require('../images/continue.svg')} alt="->" className="submit" onClick={() => this.submit('register')} />
                </div>
                :
                null
              }
              {/* success */}
              {
                this.state.popupState === 'success'
                ?
                <div className="success">
                  Successfully registered.
                  Click <a onClick={() => this.setState({popupState: 'login'})}>here</a> to login.
                </div>
                :
                null                
              }
            </div>
            : null
          }
        </CSSTransitionGroup>
      </div>
    )
  }
}
