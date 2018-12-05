import React, { Component } from 'react'

export default class Sidebar extends Component {

  render() {

    const state = this.props.contentState
    const todayClass = state === 'logger' ? 'active' : ''
    const statsClass = state === 'stats' ? 'active' : ''
    const profileClass = state === 'profile' ? 'active' : ''

    return (
      <div className="side-wrap">
        <div className="list">
          <div onClick={() => this.props.changeContentState('logger')}
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
