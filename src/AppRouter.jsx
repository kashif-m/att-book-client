import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

// UDCs
import App from './components/App'
import NotFound from './components/NotFound'
import PasswordReset from './components/PasswordReset'

export default class AppRouter extends Component {

  componentDidCatch(err, info) {
    console.log(err, info)
  }

  render() {
  
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={App} />
          <Route exact path="/password-reset/update/:token" component={PasswordReset} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    )
  }
}

