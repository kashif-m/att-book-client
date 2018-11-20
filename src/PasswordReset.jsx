import React, { Component } from 'react'
import axios from 'axios'
import jwtDecode from 'jwt-decode'

// css
import './styles/password-reset.css'

export default class PasswordReset extends Component {

  constructor(props) {
    super(props)

    this.state = {
      token: this.props.match.params.token,
      state: 'valid',
      error: ''
    }
  }

  componentDidMount() {
    
    const token = 'Bearer ' + this.state.token
    let decoded
    try {
      decoded = jwtDecode(token)
      const data = {
        passHash: decoded.passHash
      }
      axios
        .post('/password/verify', data, {
          headers: {
            'Authorization': token
          }
        })
        .then(res => this.setState({state: res.data.msg}))
        .catch(err => console.log(err))
    } catch (err) {
      this.setState({
        state: 'invalid'
      })
    }
  }

  submit = () => {

    const token = 'Bearer ' + this.state.token
    const data = {
      password: this.password.value,
      passHash: jwtDecode(token).passHash
    }
    axios
      .post('/password/update', data, {
        headers: {
          'Authorization': token
        }
      })
      .then(res => {
        if(res.data === 'invalid')
          this.setState({state: 'invalid'})

        this.setState({
          state: 'success'
        })
      })
      .catch(err => this.setState({error: err.response.data}))
  }
  
  render() {
  
    const { state, error } = this.state
    return (
      <div className="password-reset">
        <div className="header-wrap" >
          <img src={require('./images/logo.svg')} alt="LOGO" className="logo"
              onClick={() => window.location.href = 'http://localhost:3002' } />
        </div>
        {
          state === 'valid' || state === 'success' ?
          <div className="valid-jwt">
            {
              state === 'success' ?
              <div className="password_reset-success" >
                <span>Successfully updated.</span>
                <div>
                  Click&nbsp;<a href="http://localhost:3002"> here </a>&nbsp;to go to homepage.
                </div>
              </div>
              :
              <div>
                <span className="info">Enter a new password</span>
                <input type="password" className="password" placeholder='New Password'
                  ref={node => this.password = node} autoFocus={true}
                  onKeyDown={key => key.keyCode === 13 && this.submit()}
                  onFocus={() => this.setState({error: ''})} />
                {
                  error !== '' ?
                  <div className="error">{error}</div>
                  : null
                }
                <img src={require('./images/continue.svg')} alt="->" className="submit"
                  onClick={() => this.submit()} />
              </div>
            }
          </div>
          : state === 'invalid' ?
          <div className="invalid-jwt">
            <span>Invalid link</span>
            <div>Click <a href="http://localhost:3002"> here </a> to go to homepage. </div>
          </div>
          : null
        }
      </div>
    )
  }
}
