import React, { Component } from 'react'

export default class Sidebar extends Component {

  render() {

    const state = this.props.contentState
    const todayClass = state === 'today' ? 'today active' : 'today'
    const statsClass = state === 'stats' ? 'stats active' : 'stats'
    const profileClass = state === 'profile' ? 'profile active' : 'profile'
    const timetablesClass = state === 'timetables' ? 'timetables active' : 'timetables'
    
    return (
      <div className="side-wrap">
        <div className="list">
          <div onClick={() => this.props.changeContentState('today')}
            className={todayClass}
          >TODAY</div>
          <div onClick={() => this.props.changeContentState('stats')}
            className={statsClass}
          >STATS</div>
          <div onClick={() => this.props.changeContentState('profile')}
            className={profileClass}
          >PROFILE</div>
          <div onClick={() => this.props.changeContentState('timetables')}
            className={timetablesClass}
          >TIMETABLES</div>
        </div>
      </div>
    )
  }
}
