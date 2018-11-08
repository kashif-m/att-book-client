import React, { Component } from 'react'

import Timetable from './Timetable'

// css
import '../styles/Profile.css'

export default class Profile extends Component {
  
  render() {
  
    return (
      <div className="profile-wrap">
        <Timetable
          token={this.props.token}
          timetable={this.props.timetable}
          fetchTimetable={this.props.fetchTimetable}
        />
      </div>
    )
  }
}
