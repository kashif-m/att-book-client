import React, { Component } from 'react'

// css
import '../styles/Dashboard.css'

// UDTs
import Header from './Header'
import Sidebar from './Sidebar'
import Content from './Content'

export default class Dashboard extends Component {

  constructor(props) {
    super(props)

    this.state = {
      contentState: 'today'
    }
  }

  changeContentState = (state) => {
    this.setState({
      contentState: state
    })
  }

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
        />
      </div>
    )
  }
}

