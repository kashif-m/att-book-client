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
      timetable: {},
      overallAttendance: {}
    }
  }

  componentDidMount() {
    this.fetchTimetable()
    this.fetchOverall()
  }

  fetchOverall = () => {
    axios
    .get('/stats/overall', {
      headers: {
        'Authorization': this.props.token
      }
    })
    .then(res => this.setState({overallAttendance: res.data}))
    .catch(err => console.log(err.response.data))
  }

  fetchTimetable = () => {
    axios
      .get('/timetable/fetch', {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        console.log('setting timetable')
        this.setState({ timetable: res.data })
      })
      .catch(err => console.log(err.response.data))
  }

  render() {

    const state = this.props.contentState
    const style = {
      overflow: 'hidden'
    }
    return (
      <div className="content-wrap" style={style} >
        {
          state === 'logger' ?
          <Logger
            token={this.props.token}
            timetable={this.state.timetable}
            // functions
            updateAttendance={this.fetchOverall}
          />
          : state === 'profile' ?
          <Profile
            token={this.props.token}
            timetable={this.state.timetable}
            fetchTimetable={this.fetchTimetable}
          />
          : state === 'stats' ?
          <Stats
            overallAttendance={this.state.overallAttendance}
          />
          : null
        }
      </div>
    )
  }
}
