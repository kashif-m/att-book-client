import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

// UDCs
import App from './App'
import NotFound from './NotFound'
import PasswordReset from './PasswordReset'

export default class AppRouter extends Component {

  render() {
  
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={App} />
          <Route path="/password-reset/update/:token" component={PasswordReset} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    )
  }
}

