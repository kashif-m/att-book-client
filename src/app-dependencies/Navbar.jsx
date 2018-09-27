import React, { Component } from 'react'

export default class Navbar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      popupSignUp: false,
      popupLogin: false
    }
  }

  signUp = () => {
    this.setState({
      popup
    })
  }

  login = () => {
    console.log('safsa')
  }

  render() {
    return (
      <div className="nav-wrap">
        <div>
          <div> ONE LINERS </div>
          <div> ONE LINER AGAIN. </div>
        </div>

        <div className="buttons">
          <button className="log-in" onClick={this.signUp} > LOG IN </button>
          <button className="sign-up" onClick={this.login} > SIGN UP </button>
        </div>

        {

        }

      </div>
    )
  }
}
