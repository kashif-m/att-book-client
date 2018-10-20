import React, { Component } from 'react'
import axios from 'axios'

// css
import '../styles/Login.css'

export default class Login extends Component {

  constructor(props) {
    super(props)
  }

  submit = () => {

    const user = {}
    user.email = this.email.value
    user.password = this.password.value

    axios
      .post('/user/login', user)
      .then(res => {
        if(this.state.emailError)
          delete this.state.emailError
      })
      .catch(err => {
        const { email, password } = err.response.data
        this.setState({
          emailError: email,
          passwordError: password
        })
      })
  }
  
  render() {
  
    return (
      <div className="login-section">
        <input type="text"
          placeholder="Registered E-Mail"
          ref={node => this.email = node}
        />
        <input type="password"
          placeholder="Password"
          ref={node => this.password = node}
        />
        <img src={require('../images/continue.svg')} alt="->" className="submit" onClick={this.submit} />
      </div>
    )
  }
}
