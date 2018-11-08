import React, { Component } from 'react'

export default class Sidebar extends Component {

  render() {

    const state = this.props.contentState
    const todayClass = state === 'today' ? 'today active' : 'today'
    const statsClass = state === 'stats' ? 'stats active' : 'stats'
    const profileClass = state === 'profile' ? 'profile active' : 'profile'
    
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
        </div>
      </div>
    )
  }
}
