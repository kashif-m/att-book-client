import React from 'react'
import axios from 'axios'
import CSSTransitionGroup from 'react-addons-css-transition-group'

// UDTs
import Dashboard from './app-content/Dashboard'
import Welcome from './app-content/Welcome'

// css
import './styles/App.css'

class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      token: '',
      wait: false,
      user: {}
    }
  }

  componentDidCatch(err, info) {
    console.log(err, info)
  }

  async componentDidMount() {
    
    const data = window.localStorage.getItem('att-book-user')
    if(data && data.length === 0)
      return

    this.setState({
      wait: true
    })
    const result = await this.getUser(data)

    if(result !== 'Unauthorized')
      this.setState({
        token: data,
        user: result
      })
    this.setState({
      wait: false
    })
  }

  getUser = (token) => {
    return axios
      .get('http://localhost:5000/user/current', {
        headers: {
          Authorization: token
        }
      })
      .then(res => res.data)
      .catch(err => err.response.data)
  }

  updateToken = (token) => {
    this.setState({
      token
    })

    window.localStorage.setItem('att-book-user', token)
  }

  wait = (bool) => {
    this.setState({
      wait: bool
    })
  }

  render() {
    return (
      <div className="app-wrap">
        <CSSTransitionGroup
          className="wait-wrap"
          component="div"
          transitionName="wait-anim"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          {
            this.state.wait && (<div className="wait">LOADING</div>)
          }
        </CSSTransitionGroup>
        {
          this.state.token.length === 0
          ?
          <Welcome updateToken={this.updateToken} />
          :
          <Dashboard
            user={this.state.user}
            token={this.state.token}
          />
        }
      </div>
    )
  }
}

export default App
