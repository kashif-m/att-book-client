import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import axios from 'axios'

export default class Popup extends Component {

  constructor(props) {
    super(props)

    this.state = {
      submission: 'register',
      validationErrors: {},
      generalErrors: {}
    }
  }

  submit = () => {

    // this.props.wait(true)
    this.clearErrors()
    const data = {
      email: this.email.value,
      password: this.password.value
    }

    axios.post(`/user/${this.state.submission}`, data)
    .then(res => {
      this.clearErrors()
      if(this.state.submission === 'login')
        this.props.popup(res.data.token)

      this.props.wait(false)
    })
    .catch(err => {
      const errors = err.response.data
      this.setState({
        validationErrors: errors.msg ? {}: errors,
        generalErrors: errors.msg ? errors : {}
      })

      this.props.wait(false)
    })
  }

  form = (val) => {
    this.clearErrors()
    this.setState({
      submission: val
    })
  }

  clearErrors = () => {
    this.setState({
      generalErrors: {},
      validationErrors: {}
    })
  }

  render() {
  
    var signup = 'signup-button'
    var login = 'login-button'
    if(this.state.submission === 'login')
      login += ' active'
    else
      signup += ' active'

    return (
      <ReactCSSTransitionGroup
        className="login-popup-wrap"
        component="div"
        transitionName="errors"
        transitionEnterTimeout={150}
        transitionLeaveTimeout={150}
      >
        <img className="close-popup" src={require('../../images/close.svg')} alt="close" onClick={this.props.popup}/>
        {
          this.state.generalErrors.msg &&
          (<div className="general-error">
            <span>
              {this.state.generalErrors.msg}
            </span>
            <img src={require('../../images/close-err.svg')} alt="close" onClick={this.clearErrors} />
          </div>)
        }
        <div className="button-section">
          <button className={signup} onClick={() => this.form('register')} >SIGNUP</button>
          <button className={login} onClick={() => this.form('login')} >LOGIN</button>
        </div>
        <div className="form" >
          <div className="email-section">
            <input type="text"
              placeholder="E-mail"
              ref={(node) => this.email = node}/>
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
              ref={(node) => this.password = node}/>
            {
              this.state.validationErrors.password &&
              (
                <div className="password-error">{this.state.validationErrors.password}</div>
              )
            }          
          </div>
          <img src={require('../../images/continue.svg')} alt="continue" onClick={this.submit} />
          <div className="reset-section">
            Forgot password?
            <button className="reset-password">RESET</button>
          </div>
        </div>
      </ReactCSSTransitionGroup>
    )
  }
}
