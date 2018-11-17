import React, { Component } from 'react'
import axios from 'axios'
import dateFns from 'date-fns'

// css
import '../styles/stats.css'

export default class Stats extends Component {

  constructor(props) {
    super(props)

    this.state = {
      overall: {}
    }
  }

  componentDidMount() {
    this.fetchOverall()
  }

  fetchOverall = () => {
    axios
    .get('/stats/overall', {
      headers: {
        'Authorization': this.props.token
      }
    })
    .then(res => this.setState({overall: res.data}))
    .catch(err => console.log(err.response.data))
  }

  renderOverallFooter = () => {

    const overall = this.state.overall
    const totalClasses = Object.keys(overall).reduce((total, subject) => total + overall[subject].total, 0)
    const totalPresent = Object.keys(overall).reduce((total, subject) => total + overall[subject].present, 0)
    const totalPending = Object.keys(overall).reduce((total, subject) => total + overall[subject].pending, 0)
    const totalAbsent = Object.keys(overall).reduce((total, subject) => total + overall[subject].absent, 0)

    return (
      <div className="overall--footer" key="footer" >
        <div className="footer--total">{totalClasses}</div>
        <div className="footer--present">{totalPresent}</div>
        <div className="footer--pending">{totalPending}</div>
        <div className="footer--absent">{totalAbsent}</div>
        <div className="footer--perc">{this.round((totalPresent / totalClasses) * 100)} %</div>
      </div>
    )
  }

  renderOverallHeader = () => 
    <div className="overall--header" key='header'>
      <div className="header--subject">SUBJECT</div>
      <div className="header--total">Total</div>
      <div className="header--present">Present</div>
      <div className="header--pending">Pending</div>
      <div className="header--absent">Absent</div>
      <div className="header--perc">Attendance</div>
    </div>

  round = value => Number(Math.round(value+'e'+2) +'e-'+2)

  renderOverall = () => {

    const overall = []
    const data = this.state.overall
    if(Object.keys(data).length === 0)
      overall.push(
          <div className="no--logs" key='no log' >No attendance logged.</div>
        )

    else {
      overall.push(this.renderOverallHeader())
      const subjects = []
      
      Object.keys(data)
      .forEach(subject => subjects.push(
        <div className="overall--data" key={subject}>
          <div className="overall--subject">{subject}</div>
          <div className="overall--total">{data[subject].total}</div>
          <div className="overall--present">{data[subject].present}</div>
          <div className="overall--pending">{data[subject].pending}</div>
          <div className="overall--absent">{data[subject].absent}</div>
          <div className="overall--perc">{this.round((data[subject].present / data[subject].total) * 100)} %</div>
        </div>
      ))
      
      overall.push( <div className="overall--content" key="content" >{subjects}</div> )
      overall.push(this.renderOverallFooter())
    }

    return <div className="overall">{overall}</div>
  }
  
  render() {
  
    return (
      <div className="stats">
        <div className="stats--header">STATISTICS</div>
        <div className="stats--content">
          {this.renderOverall()}
        </div>
      </div>
    )
  }
}
