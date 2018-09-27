import React, { Component } from 'react'
import axios from 'axios'

export default class Main extends Component {
  
  post = () => {
    axios.post('http://localhost:5000/users/add', {email: 'sakfsa@gmail.com', passowrd: 'secasfsafs'})
    .then(res => console.log(res))
    .catch(err => console.log(err.response))
  }

  render() {
    return (
      <div className="main-wrap">
        <button
          onClick={this.post()}
        >
          click.
        </button>
      </div>
    )
  }
}
