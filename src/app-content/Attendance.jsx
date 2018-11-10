import React, { Component } from 'react'
import dateFns from 'date-fns'
import axios from 'axios'

// functions
import functions from './Attendance/AttendanceHelpers'

// css
import '../styles/Attendance.css'

export default class Attendance extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentMonth: new Date(),
      selectedDate: new Date(),
      dayTimetable: {},
      format: 'weekly',
      attendance: {},
      newSubject: '',
      weeklyPopup: {}
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
    axios
      .get(`/attendance/${dateFns.format(this.state.selectedDate, 'YYYY-MM-DD')}/get`, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => res.data && this.setState({attendance: res.data}))
      .catch(err => console.log(err.response.data))
  }

  fetchAttendanceByDate = (date) => {
    axios
      .get(`/attendance/${dateFns.format(date, 'YYYY-MM-DD')}/get`, {
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

  renderHeader = () => {
    
    const header = []
    const selectedDate = this.state.selectedDate
    header.push(
      <div className="att--header" key="header">
        <div className="att--header--day">
          <img src={require('../images/arrow-left.svg')} alt="<-" className="att--header--day-prev"
              onClick={this.prevDay}
            />
          <span className="att--header--day-current">
            {dateFns.format(selectedDate, 'dddd').toUpperCase()}
          </span>
          <img src={require('../images/arrow-right.svg')} alt="->" className="att--header--day-next"
              onClick={this.advanceDay}
            />
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

  renderAttendanceOptions = (i) =>
      <div className="att--options">
        <img src={require('../images/attended.svg')} alt="attended"
            className="att--options-attended" onClick={() => this.updateAttendance(i, 'present')}/>
        <img src={require('../images/pending.svg')} alt="pending"
            className="att--options-pending" onClick={() => this.updateAttendance(i, 'pending')}/>
        <img src={require('../images/not-attended.svg')} alt="absent"
            className="att--options-absent" onClick={() => this.updateAttendance(i, 'absent')}/>
      </div>

  renderAttendanceStatus = (data, day, i) => 
      <div className="att--status">
        <span className={`att--status-${data.status}`}> {data.status.toUpperCase()} </span>
        <img src={require('../images/edit-attendance.svg')} alt="edit" className="att--status-edit"
            onClick={() => this.editAttendance(day, i)}/>
      </div>

  renderEditSubject = (data, i) =>
      <input id={`edit-subject-${i}`} type="text" className="att--subject-edit"
        defaultValue={data.subject}
        onChange={text => this.setState({newSubject: text.target.value})}
        onBlur={() => this.updateSubject(i)}
        onKeyDown={key => key.keyCode === 13 && this.updateSubject(i)}
        onFocus={() => this.setState({ newSubject: data.subject })} />


  renderSubjects = () => {

    const subjects = []
    const state = {...this.state}
    const { dayTimetable, selectedDate, attendance } = state
    const day = dateFns.format(selectedDate, 'dddd')
    const att = attendance[day] || {}

    const totalSubjects = (dayTimetable !== {} && Object.keys(dayTimetable).reverse()[0]) || 0
    const totalLoggedSubjects = (att && Object.keys(att).reverse()[0]) || 0
    const max = totalSubjects > totalLoggedSubjects ? totalSubjects : totalLoggedSubjects

    if(max === 0)
      subjects.push(
        <div className="att--classes-none" key="no-class">No classes found.</div>
      )

    for(let i = 1; i <= max; i++) {
      const data = att[i] || dayTimetable[i]
      subjects.push(
        data ?
        <div className="att--daily--subject_row" key={i}>
          {functions.renderSubjectName(data)}
          {
            data.status
            ? this.renderAttendanceStatus(data, day, i)
            : this.renderAttendanceOptions(i)
          }
          {
            data.status === undefined
            ? this.renderEditSubject(data, i)
            : null
          }
        </div>
        : null
      )
    }

    return <div className="att--daily--subject" key="subject" >{subjects}</div>
  }

  renderDaily = () => {

    const daily = []
    daily.push(
      this.renderHeader()
    )
    daily.push(
      this.renderSubjects()
    )
    return <div className="att--daily">{daily}</div>
  }

  renderDays = () => {

    let date = this.state.selectedDate
    const startOfWeek = dateFns.startOfISOWeek(date)
    date = startOfWeek
    const endOfWeek = dateFns.endOfISOWeek(date)
    const days = []

    while(!dateFns.isSameDay(date, endOfWeek)) {
      days.push(
        <div className="att--weekly--days--day" key={date}>{dateFns.format(date, 'ddd').toUpperCase()}</div>
      )

      date = dateFns.addDays(date, 1)
    }

    return <div className="att--weekly--days" key="days">{days}</div>
  }

  renderWeeklyHeader = () => {
    
    const header = []
    const date = this.state.selectedDate

    header.push(
      <div className="att--weekly--header--week" key="week-number">WEEK&nbsp;#{dateFns.getISOWeek(date)}</div>
    )

    return <div className="att--weekly--header" key="header">{header}</div>
  }

  renderWeeklySubjects = () => {

    let date = this.state.selectedDate
    const startOfWeek = dateFns.startOfISOWeek(date)
    date = startOfWeek
    const endOfWeek = dateFns.endOfISOWeek(date)
    const subjectsWrap = []

    while(!dateFns.isSameDay(date, endOfWeek)) {

        const subjects = []
        const state = {...this.state}
        const { dayTimetable, selectedDate, attendance } = state
        const day = dateFns.format(selectedDate, 'dddd')
        const att = attendance[day] || {}
    
        const totalSubjects = (dayTimetable !== {} && Object.keys(dayTimetable).reverse()[0]) || 0
        const totalLoggedSubjects = (att && Object.keys(att).reverse()[0]) || 0
        const max = totalSubjects > totalLoggedSubjects ? totalSubjects : totalLoggedSubjects

        for(let i = 1; i <= max; i++) {
          const data = att[i] || dayTimetable[i]
          subjects.push(
            data ?
            <div className="att--weekly--subjects_row_wrap" key={i}>
              <div className="att--weekly--subjects_row_wrap--subject"
                onClick={() => this.setState({weeklyPopup: {
                  subject: data.subject,
                  classNo: i
                }})} >
                {functions.renderSubjectName(data)}
              </div>
              {
                Object.keys(this.state.weeklyPopup).length > 0 &&
                this.state.weeklyPopup.subject === data.subject &&
                this.state.weeklyPopup.classNo === data.classNo
                ?
                this.renderAttendanceOptions(i)
                : null
              }
            </div>
            : null
          )
        }
    
        subjectsWrap.push(
          <div className="att--weekly--subjects_row">{subjects}</div>
        )
      
      date = dateFns.addDays(date, 1)
      // this.fetchAttendanceByDate(date)
    }

    return <div className="att--weekly--subjects">{subjectsWrap}</div>
  }

  renderWeekly = () => {

    const weekly = []
    weekly.push(
      this.renderWeeklyHeader()
    )
    weekly.push(
      this.renderDays()
    )
    weekly.push(
      this.renderWeeklySubjects()
    )

    return <div className="att--weekly">{weekly}</div>
  }
  
  render() {
  
    const state = {...this.state}
    const { format } = state
    return (
      <div className="att">
        {
          format === 'daily'
          ? this.renderDaily()
          : format === 'weekly'
          ? this.renderWeekly()
          : null
        }

        <div className="viewer">
          <button className={`viewer--switch-daily ${this.state.format === 'daily' ? 'active': null}`}
            onClick={() => this.setState({format: 'daily'})} >DAILY</button>
          <button className={`viewer--switch-weekly ${this.state.format === 'weekly' ? 'active': null}`}
            onClick={() => this.setState({format: 'weekly'})} >WEEKLY</button>
        </div>
      </div>
    )
  }
}
