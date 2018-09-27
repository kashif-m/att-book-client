import React, { Component } from 'react'
import axios from 'axios'

export default class Main extends Component {
  
  post = () => {
    axios.post('/user/register', {email: 'sakfssa@gmail.com', password: 'secasfsafs'})
    .then(res => console.log(res.data))
    .catch(err => console.log(err.response.data))
  }

  render() {
    return (
      <div className="main-wrap">
        <button
          onClick={this.post}
        >
          click.
        </button>
      </div>
    )
  }
}
