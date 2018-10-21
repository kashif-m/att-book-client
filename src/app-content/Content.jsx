import React, { Component } from 'react'

// UDTs
import Calendar from './Calendar'

export default class Content extends Component {
  render() {

    const state = this.props.contentState
    return (
      <div className="content-wrap">
        {
          state === 'today'
          ?
          <Calendar />
          :
          null
        }
      </div>
    )
  }
}
