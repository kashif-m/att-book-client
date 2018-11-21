import React, { Component } from 'react'
import axios from 'axios'
import dateFns from 'date-fns'

// helpers
import helpers from './AttendanceHelpers'

export default class Daily extends Component {

  constructor(props) {
    super(props)

    const date = new Date()
    const { attendance, timetable } = this.props
    const day = dateFns.format(date, 'DDDD')

    this.state = {
      selectedDate: date,
      attendance: attendance[day] || {},
      dayTimetable: timetable[day] || {},
      newSubject: ''
    }
  }

  componentDidMount() {
    this.updateDayTimetable(this.state.selectedDate)
    this.updateDayAttendance(this.state.selectedDate)
  }

  async shouldComponentUpdate(nextProps, nextState) {

    // when new timetable
    if(JSON.stringify(this.props.timetable) !== JSON.stringify(nextProps.timetable)) {
      this.updateDayTimetable(nextState.selectedDate, nextProps.timetable)
      return false
    }

    // when date is changed
    if(this.state.selectedDate !== nextState.selectedDate) {
      if(dateFns.isSameISOWeek(this.state.selectedDate, nextState.selectedDate))
        await this.props.fetchWeekAttendance(nextState.selectedDate)
      this.updateDayAttendance(nextState.selectedDate)
      this.updateDayTimetable(nextState.selectedDate)
      return false
    }

    // when attendance is updated
    if(JSON.stringify(this.props.attendance) !== JSON.stringify(nextProps.attendance)) {
      this.updateDayAttendance(nextState.selectedDate, nextProps.attendance)
      return false
    }

    return true
  }

  updateDayAttendance = (date, newAttendance) => {

    const attendance = newAttendance || {...this.props.attendance}
    const day = dateFns.format(date, 'dddd')
    this.setState({
      attendance: attendance[day] || {}
    })
  }

  updateDayTimetable = (date, newTimetable) => {

    const timetable = newTimetable || {...this.props.timetable}
    const day = dateFns.format(date, 'dddd')

    this.setState({
      dayTimetable: timetable[day] || {}
    })
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

  updateSubject = classNo => {

    const attendance = {...this.state.attendance}
    const newSubject = this.state.newSubject
    if(newSubject.length !== 0) {

      if(attendance[classNo] && !attendance[classNo].status) {
        attendance[classNo].subject = newSubject
        this.setState({
          attendance
        })
      } else {
        const dayTimetable = {...this.state.dayTimetable}
        dayTimetable[classNo] = newSubject
        this.setState({
          dayTimetable
        })
      }

      this.setState({
        newSubject: ''
      })
    }
    else
      document.getElementById(`edit-subject-${classNo}`).value = this.state.dayTimetable[classNo]
  }

  renderSubjectEdit = (classNo, subject, autoFocus) =>
    <input type="text" className="att--subject-edit" key={`${classNo}${subject}`}
      id={`edit-subject-${classNo}`} defaultValue={subject}
      autoFocus={autoFocus}
      onChange={text => this.setState({newSubject: text.target.value})}
      onBlur={() => this.updateSubject(classNo)}
      onKeyDown={key => key.keyCode === 13 && key.target.blur()} />

  setAttendance = (classNo, status) => {

    const { attendance, dayTimetable } = this.state
    const date = this.state.selectedDate
    const subject = attendance[classNo]
        ? attendance[classNo].subject
        : dayTimetable[classNo]
    const data = {
      classNo,
      status,
      _date: dateFns.format(date, 'YYYY-MM-DD'),
      subject: subject
    }

    axios
      .post('/attendance/set', data, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        if(res.status === 200) {
          attendance[classNo] = {
            subject: data.subject,
            status
          }
          this.setState({ attendance })
        }
      })
      .catch(err => console.log(err.response.data))
  }

  renderAttendanceOptions = classNo =>
      <div className="att--options">
        <img src={require('../../../../../images/attended.svg')} alt="attended"
            className="att--options-attended" onClick={() => this.setAttendance(classNo, 'present')}/>
        <img src={require('../../../../../images/pending.svg')} alt="pending"
            className="att--options-pending" onClick={() => this.setAttendance(classNo, 'pending')}/>
        <img src={require('../../../../../images/not-attended.svg')} alt="absent"
            className="att--options-absent" onClick={() => this.setAttendance(classNo, 'absent')}/>
      </div>

  editAttendance = classNo => {
    
    const attendance = {...this.state.attendance}
    delete attendance[classNo].status

    this.setState({
      attendance
    })
  }

  removeAttendance = classNo => {

    const date = dateFns.format(this.state.selectedDate, 'YYYY-MM-DD')
    const data = {
      date,
      classNo
    }
    axios
      .post('/attendance/remove', data, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => res.status === 200 && this.props.fetchWeekAttendance(date))
      .catch(err => console.log(err.response.data))
  }

  renderAttendanceStatus = (classNo, status) => 
      <div className="att--status">
        <span className={`att--status-${status}`}> {status.toUpperCase()} </span>
        <img src={require('../../../../../images/edit-attendance.svg')} alt="edit" className="att--status-edit"
            onClick={() => this.editAttendance(classNo)}/>
        <img src={require('../../../../../images/close-err.svg')} className="att--status-remove" alt="x"
            onClick={() => this.removeAttendance(classNo)} />
      </div>

  renderSubjects = () => {

    const subjects = []
    const state = {...this.state}
    const { dayTimetable, selectedDate, attendance, newSubject } = state
    const totalSubjects = (dayTimetable !== {} && Object.keys(dayTimetable).reverse()[0]) || 0
    const totalLoggedSubjects = (attendance && Object.keys(attendance).reverse()[0]) || 0
    const max = totalSubjects > totalLoggedSubjects ? totalSubjects : totalLoggedSubjects

    if(max === 0)
      subjects.push(
        <div className="att--classes-none" key="no-class">No classes found.</div>
      )

    for(let i = 1; i <= max; i++) {
      const data = attendance[i] || dayTimetable[i] || undefined
      const subject = (data && data.subject) || data
      subjects.push(
        data &&
        <div className="att--daily--subject_row" key={i}>
          {helpers.renderSubjectName(subject)}
          {
            data.status
            ? this.renderAttendanceStatus(i, data.status)
            : this.renderAttendanceOptions(i, selectedDate)
          }
          { !data.status && this.renderSubjectEdit(i, subject, (attendance[i]
                ? (!attendance[i].status && newSubject.length !== 0)
                : false)) }
        </div>
      )
    }

    return <div className="att--daily--subject" key="subject" >{subjects}</div>
  }

  renderHeader = () => {

    const selectedDate = this.state.selectedDate
    return(
      <div className="att--header">
        <div className="att--header--day">
          <img src={require('../../../../../images/arrow-left.svg')} alt="<-" className="att--header--day-prev"
              onClick={this.prevDay} />
          <span className="att--header--day-current">
            {dateFns.format(selectedDate, 'dddd').toUpperCase()}
          </span>
          <img src={require('../../../../../images/arrow-right.svg')} alt="->" className="att--header--day-next"
              onClick={this.advanceDay} />
        </div>
        <span className="att--header--month">{dateFns.format(selectedDate, 'MMMM D, YYYY').toUpperCase()}</span>
        <span className="att--header--info">
          Classes
          {
            dateFns.isSameDay(this.state.selectedDate, new Date()) ?
            ' today'
            : null
          }
        </span>
      </div>
    )
  }
  
  render() {
  
    return (
      <div className="att--daily">
        {this.renderHeader()}
        {this.renderSubjects()}
      </div>
    )
  }
}
