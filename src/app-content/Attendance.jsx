import React, { Component } from 'react'
import dateFns from 'date-fns'
import axios from 'axios'

// css
import '../styles/Attendance.css'

export default class Attendance extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentMonth: new Date(),
      selectedDate: new Date(),
      dayTimetable: {},
      format: 'daily',
      attendance: {},
      newSubject: ''
    }
  }

  componentDidMount() {
    this.updateDayTimetable()
    this.fetchAttendance()
  }

  componentDidUpdate(prevProps, prevState) {

    if(this.state.selectedDate !== prevState.selectedDate) {
      this.updateDayTimetable()
      this.fetchAttendance()
    }
    if(JSON.stringify(prevProps.timetable) !== JSON.stringify(this.props.timetable))
      this.updateDayTimetable()
  }

  updateDayTimetable = () => {
    
    const { timetable } = this.props
    const { selectedDate } = this.state

    this.setState({
      dayTimetable: timetable[dateFns.format(selectedDate, 'dddd')] || {}
    })
  }

  fetchAttendance = () => {
    this.setState({
      attendance: {}
    })
    axios
      .get(`/attendance/${dateFns.format(this.state.selectedDate, 'YYYY-MM-DD')}/get`, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => res.data && this.setState({attendance: res.data}))
      .catch(err => console.log(err.response.data))
  }

  advanceDay = () => {
    this.setState(prevState => {
      return {
        selectedDate: dateFns.addDays(prevState.selectedDate, 1)
      }
    })
  }

  prevDay = () => {
    this.setState(prevState => {
      return {
        selectedDate: dateFns.subDays(prevState.selectedDate, 1)
      }
    })
  }

  renderDays = () => {
    
    // const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', ]

  }

  renderHeader = () => {
    
    const header = []
    const selectedDate = this.state.selectedDate
    header.push(
      <div className="attendance-header-wrap" key="header">
        <div className="header-week-day">
          <img src={require('../images/arrow-left.svg')} alt="<-" className="prev"
              onClick={this.prevDay}
            />
          <span className="current-day">
            {dateFns.format(selectedDate, 'dddd').toUpperCase()}
          </span>
          <img src={require('../images/arrow-right.svg')} alt="->" className="next"
              onClick={this.advanceDay}
            />
        </div>
        <span className="header-month">{dateFns.format(selectedDate, 'MMMM D, YYYY').toUpperCase()}</span>
        <span className="header-info">
          Classes
          {
            dateFns.isSameDay(this.state.selectedDate, new Date()) ?
            ' today'
            : null
          }
        </span>
      </div>
    )

    return header
  }

  editAttendance = (day, classNo) => {
    
    const attendance = {...this.state.attendance}
    delete attendance[day][classNo].status

    this.setState({
      attendance
    })
  }

  updateAttendance = (classNo, status) => {

    const attendance = {...this.state.attendance}
    const day = dateFns.format(this.state.selectedDate, 'dddd')
    const subject = (attendance[day] && attendance[day][classNo]) ? attendance[day][classNo].subject : undefined
    const data = {
      classNo,
      status,
      _date: dateFns.format(this.state.selectedDate, 'YYYY-MM-DD'),
      subject: subject || this.props.timetable[day][classNo].subject
    }
    axios
      .post('/attendance/set', data, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        const attendance = {...this.state.attendance}
        attendance[day] = {...attendance[day]} || {}
        attendance[day][classNo] = {
          subject: data.subject,
          status
        }
        res.status === 200 &&
        this.setState({
          attendance
        })
        this.updateDayTimetable()
        this.updateAttendance()
      })
      .catch(err => console.log(err.response.data))
  }

  updateSubject = (classNo) => {

    const input = document.getElementById(`edit-subject-${classNo}`)
    input.blur()

    const { attendance, newSubject, selectedDate, dayTimetable } = this.state
    const day = dateFns.format(selectedDate, 'dddd')
    const att = attendance[day]

    if(newSubject.length !== 0) {
      if(att && att[classNo] && !att[classNo].status)
        attendance[day][classNo].subject = newSubject
      else
        dayTimetable[classNo].subject = newSubject
    }
    else
      input.value = dayTimetable[classNo].subject

    this.setState({
      attendance,
      dayTimetable,
      newSubject: ''
    })
  }

  getAbbreviation = subject => {

    if(!subject)
      return
    const arr = subject.split(' ')
    if(arr.length > 1)
      return (arr[0].charAt(0) + arr[1].charAt(0)).toUpperCase()

    return subject.substr(0, 2).toUpperCase()
  }

  renderSubjects = () => {

    const subjects = []
    const state = {...this.state}
    const { dayTimetable, selectedDate, attendance } = state
    const day = dateFns.format(selectedDate, 'dddd')
    const att = attendance[day] || {}

    const totalSubjects = (dayTimetable !== {} && Object.keys(dayTimetable).reverse()[0]) || 0
    const totalLoggedSubjects = att && Object.keys(att).reverse()[0] || 0
    const max = totalSubjects > totalLoggedSubjects ? totalSubjects : totalLoggedSubjects

    if(max === 0)
      subjects.push(
        <div className="no-classes" key="no-class">No classes found.</div>
      )

    for(let i = 1; i <= max; i++) {
      const data = att[i] || dayTimetable[i]
      subjects.push(
        data ?
        <div className="subject-row-wrap" key={i}>
          <div className="attendance-subject-abbreviation">{this.getAbbreviation(data.subject)}</div>
          {
            data.status ?
            <div className="attendance-status-wrap">
              <span className={`attendance-status ${data.status}`} >
                {data.status.toUpperCase()}
              </span>
              <img src={require('../images/edit-attendance.svg')} alt="edit" className="attendance-edit"
                  onClick={() => this.editAttendance(day, i)}
                />
            </div>
            :
            <div className="attendance-buttons">
              <img src={require('../images/attended.svg')} alt="attended"
                  className="button-attended" onClick={() => this.updateAttendance(i, 'present')}
                />
              <img src={require('../images/pending.svg')} alt="pending"
                  className="button-pending" onClick={() => this.updateAttendance(i, 'pending')}
                />
              <img src={require('../images/not-attended.svg')} alt="absent"
                  className="button-absent" onClick={() => this.updateAttendance(i, 'absent')}
                />
            </div>
          }
          {
            data.status === undefined ?
            <input id={`edit-subject-${i}`} type="text" className="edit-subject"
              defaultValue={data.subject}
              onChange={text => this.setState({newSubject: text.target.value})}
              onBlur={() => this.updateSubject(i)}
              onKeyDown={key => key.keyCode === 13 && this.updateSubject(i)}
              onFocus={() => this.setState({ newSubject: data.subject })} />
            : null
          }
        </div>
        : null
      )
    }

    return <div className="attendance-subject-wrap" key="subject" >{subjects}</div>
  }

  renderDaily = () => {
    
    const daily = []
    daily.push(
      this.renderHeader()
    )
    daily.push(
      this.renderSubjects()
    )
    return <div className="daily-wrap">{daily}</div>
  }

  renderWeekly = () => {
    this.renderWeeklyHeader()
  }
  
  render() {
  
    const state = {...this.state}
    const { format } = state
    return (
      <div className="attendance-wrap">
        {
          format === 'daily'
          ? this.renderDaily()
          : format === 'weekly'
          ? this.renderWeekly()
          : format === 'monthly'
          ? this.renderMonthly()
          : null
        }

        <div className="viewer-wrap">
          <button className={`daily-switch ${this.state.format === 'daily' ? 'active': null}`}
            onClick={() => this.setState({format: 'daily'})} >DAILY</button>
          <button className={`weekly-switch ${this.state.format === 'weekly' ? 'active': null}`}
            onClick={() => this.setState({format: 'weekly'})} >WEEKLY</button>
          <button className={`monthly-switch ${this.state.format === 'monthly' ? 'active': null}`}
            onClick={() => this.setState({format: 'monthly'})} >MONTHLY</button>
        </div>
      </div>
    )
  }
}
