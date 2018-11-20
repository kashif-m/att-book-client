import React, { Component } from 'react'

// css
import '../../styles/Dashboard.css'

// UDCs
import Header from './dashboard/Header'
import Sidebar from './dashboard/Sidebar'
import Content from './dashboard/Content'

export default class Dashboard extends Component {

  constructor(props) {
    super(props)

    this.state = {
      contentState: 'logger'
    }
  }

  changeContentState = state =>
    this.setState({
      contentState: state
    })

  render() {
    return (
      <div className="dashboard-wrap">
        <Header />
        <Sidebar
          changeContentState={this.changeContentState}
          contentState={this.state.contentState}
        />
        <Content
          contentState={this.state.contentState}
          user={this.props.user}
          token={this.props.token}
        />
      </div>
    )
  }
}

