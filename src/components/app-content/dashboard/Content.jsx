import React, { Component } from 'react'
import axios from 'axios'

// UDTs
import Logger from './content/Logger'
import Stats from './content/Stats'
import Profile from './content/Profile'

export default class Content extends Component {

  constructor(props) {
    super(props)

    this.state = {
      timetable: {}
    }
  }

  componentDidMount() {
    this.fetchTimetable()
  }

  fetchTimetable = () => {
    axios
      .get('/timetable/fetch', {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => this.setState({ timetable: res.data }))
      .catch(err => console.log(err.response.data))
  }

  render() {

    const state = this.props.contentState
    return (
      <div className="content-wrap">
        {
          state === 'logger' ?
          <Logger
            token={this.props.token}
            timetable={this.state.timetable}
          />
          : state === 'profile' ?
          <Profile
            token={this.props.token}
            timetable={this.state.timetable}
            fetchTimetable={this.fetchTimetable}
          />
          : state === 'stats' ?
          <Stats
            token={this.props.token}
          />
          : null
        }
      </div>
    )
  }
}
