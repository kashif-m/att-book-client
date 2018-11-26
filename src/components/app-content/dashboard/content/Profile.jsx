import React, { Component } from 'react'
import axios from 'axios'

import Timetable from './Timetable'

// css
import '../../../../styles/Profile.css'

export default class Profile extends Component {

  constructor(props) {
    super(props)
    
    this.state = {
      show: false,
      confirm: false
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextState.confirm !== this.state.confirm)
      return true
    if(nextState.show === this.state.show)
      return false

    return true
  }

  toggleShow = bool => {
    this.setState({
      show: bool,
      confirm: false
    })
  }

  deleteAccount = () => {
    axios
      .delete('/user/delete', {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => res.status === 200 && window.location.reload())
      .catch(err => console.log(err.response.data))
  }
  
  render() {

    const dStyle = {
      zIndex: this.state.show ? '-1' : 'auto'
    }

    return (
      <div className="profile">
        <div className="profile--heading"> PROFILE </div>
        <div className="profile--content">
          <div className="content--timetable">
            <div className="timetable--heading"> TIMETABLES </div>
            <Timetable
              token={this.props.token}
              timetable={this.props.timetable}
              // functions
              fetchTimetable={this.props.fetchTimetable}
              toggleShow={this.toggleShow}
            />
          </div>

          <div className="content--delete" style={dStyle}>
            <div className="delete--heading"> DELETE </div>
            <div className="delete--content">
              <div className="content--info">Permenantly delete account.</div>
              <div className="content--delete_account" onClick={() => this.setState({confirm: true})}>
                DELETE
              </div>
            </div>
            {
              this.state.confirm ?
              (<div className="content--delete-confirm">
                <div className="content--delete-confirm-info">
                  You sure? This is not reversible. All your data will be deleted.
                  <div className="content--delete--buttons">
                    <div className="buttons-delete" onClick={() => this.deleteAccount()}> DELETE </div>
                    <div className="buttons-cancel" onClick={() => this.setState({confirm: false})} > CANCEL </div>
                  </div>
                </div>
              </div>)
              : null
            }
          </div>
        </div>
      </div>
    )
  }
}
