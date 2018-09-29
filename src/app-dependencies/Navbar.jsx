import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class Navbar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      popup: false
    }
  }

  popup = () => {
    console.log('safs')
    this.setState(state => {
      return {
        popup: !state.popup
      }
    })
  }

  submit = (event) => {
    event.preventDefault()
  }

  render() {

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

        {
          this.state.popup
          ?
          <div className="login-popup-wrap">
            <button className="close-login-popup" onClick={this.popup}>x</button>
            <form onSubmit={this.submit} >
              <input type="text"
                placeholder="E-mail"
                ref={(node) => this.email = node}/>
              <input type="password"
                placeholder="Password"
                ref={(node) => this.password = node}/>
            </form>
          </div>
          :
          null
        }
      </ReactCSSTransitionGroup>
    )
  }
}
