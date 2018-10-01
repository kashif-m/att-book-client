import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import Popup from './popup/Popup'

export default class Navbar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      popup: false,
      state: ''
    }
  }

  popup = (data) => {
    this.setState(state => {
      return {
        popup: !state.popup
      }
    })
    if(typeof data === 'string')
      this.props.updateToken(data)
  }

  render() {

    var signup = 'signup-button'
    var login = 'login-button'
    const props = this.props
    return (
      <ReactCSSTransitionGroup
        component="div"
        className="nav-wrap"
        transitionName="login-popup"
        transitionEnterTimeout={250}
        transitionLeaveTimeout={250}
      >
        <div className="heading" >
          <div className="main-heading"> ATTENDANCE NOTEBOOK </div>
          <div className="sub-heading">  </div>
        </div>

        <img className="user-icon" src={require('../images/user.svg')}
          alt="user-img" onClick={this.popup}/>

        <div className="button-section">
          <button className={signup} onClick={() => this.popup('signup')} >SIGNUP</button>
          <button className={login} onClick={() => this.popup('login')} >LOGIN</button>
        </div>

        {
          this.state.popup ? <Popup popup={this.popup}
                                    wait={this.props.wait}
                                    state={this.state.state}
                              />
                           : null
        }
      </ReactCSSTransitionGroup>
    )
  }
}
