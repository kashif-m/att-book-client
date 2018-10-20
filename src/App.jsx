import React from 'react'
import axios from 'axios'

// UDTs
import Footer from './app-content/Footer'
import Header from './app-content/Header'
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
    this.setState({
      wait: true
    })
    const data = window.localStorage.getItem('att-book-user')
    const result = await this.getUser(data)

    console.log(result)
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
        {
          this.state.token.length === 0 ? <Welcome /> : null
        }
      </div>
    )
  }
}

export default App
