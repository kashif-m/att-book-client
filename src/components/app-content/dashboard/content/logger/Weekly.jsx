import React, { Component } from 'react'
import axios from 'axios'
import dateFns from 'date-fns'

// helpers
import helpers from './AttendanceHelpers'

export default class Weekly extends Component {

  constructor(props) {
    super(props)

    const date = new Date()
    const { attendance, timetable } = this.props

    this.state = {
      attendance: attendance,
      timetable: timetable,
      selectedWeek: dateFns.startOfISOWeek(date),
      attOptionsPopup: {},
      newSubject: '',
      attSubEdit: {}
    }
  }

  componentDidMount() {
    this.updateTimetable(this.props.timetable)
    this.updateAttendance(this.props.attendance)
  }

  shouldComponentUpdate(nextProps, nextState) {

    if(JSON.stringify(this.props.timetable) !== JSON.stringify(nextProps.timetable)) {
      this.updateTimetable(nextProps.timetable)
      return false
    }

    if(this.state.selectedWeek !== nextState.selectedWeek) {
      this.props.fetchWeekAttendance(nextState.selectedWeek)
      return false
    }

    if(JSON.stringify(this.props.attendance) !== JSON.stringify(nextProps.attendance)) {
      this.updateAttendance(nextProps.attendance)
      return false
    }

    return true
  }

  prevWeek = () => this.setState(prevState => {
    return {
      selectedWeek: dateFns.subWeeks(prevState.selectedWeek, 1)
    }
  })

  advanceWeek = () => this.setState(prevState => {
    return {
      selectedWeek: dateFns.addWeeks(prevState.selectedWeek, 1)
    }
  })

  updateTimetable = timetable => {
    this.setState({
      timetable
    })
  }

  updateAttendance = attendance => {
    this.setState({
      attendance
    })
  }

  updateSubject = (day, classNo) => {

    this.setState({attSubEdit: {}})

    const state = {...this.state}
    let { attendance, newSubject, timetable } = state
    const att = attendance[day] || {}

    if(newSubject.length !== 0) {

      if(att[classNo] && !att[classNo].status) {
        attendance[day][classNo].subject = newSubject
        this.setState({
          attendance
        })
      } else {
        timetable[day][classNo] = newSubject
        this.setState({
          timetable
        })
      }

      this.setState({
        newSubject: ''
      })
    }
  }
  
  renderSubjectEdit = (day, classNo, subject) =>
    <input type="text" className="att--subject-edit" key={`${day}${classNo}`}
      id={`edit-subject-${classNo}`} defaultValue={subject}
      autoFocus={true}
      onChange={text => this.setState({newSubject: text.target.value})}
      onBlur={() => this.updateSubject(day, classNo) }
      onKeyDown={key => key.keyCode === 13 && key.target.blur()} />

  handleEdit = (day, classNo, subject) => {
    
    const attendance = {...this.state.attendance}
    const att = attendance[day] || {}
    if(att[classNo])
      delete attendance[day][classNo].status
    else {
      attendance[day] = attendance[day] || {}
      attendance[day][classNo] = {subject}
    }
    const attSubEdit = {
      day, classNo, subject
    }
    this.setState({
      attendance,
      attSubEdit
    })
  }

  setAttendance = (date, classNo, status) => {
    
    const day = dateFns.format(date, 'dddd')
    const { attendance, timetable } = this.state
    const dayAtt = attendance[day] || {}
    const dayTT = timetable[day] || {}
    const subject = dayAtt[classNo]
        ? dayAtt[classNo].subject
        : dayTT[classNo]
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
          attendance[day] = attendance[day] || {}
          attendance[day][classNo] = {
            subject: data.subject,
            status
          }
          this.setState({ attendance })
        }
      })
      .catch(err => console.log(err.response.data))
  }

  attOptionsPopup = (day, classNo, subject) => this.setState({
    attOptionsPopup: {
      day,
      classNo,
      subject
    }})

  renderAttendanceOptions = (date, classNo) =>
    <div className="att--options">
      <img src={require('../../../../../images/attended.svg')} alt="attended"
          className="att--options-attended" onClick={() => this.setAttendance(date, classNo, 'present')}/>
      <img src={require('../../../../../images/pending.svg')} alt="pending"
          className="att--options-pending" onClick={() => this.setAttendance(date, classNo, 'pending')}/>
      <img src={require('../../../../../images/not-attended.svg')} alt="absent"
          className="att--options-absent" onClick={() => this.setAttendance(date, classNo, 'absent')}/>
    </div>

  renderSubjects = () => {

    const startOfWeek = this.state.selectedWeek
    const endOfWeek = dateFns.endOfISOWeek(startOfWeek)
    const subjectsWrap = []
    const state = {...this.state}
    const { attendance, timetable, attOptionsPopup, attSubEdit } = state
    let date = startOfWeek
    
    while(!dateFns.isSameDay(date, endOfWeek)) {

        const subjects = []
        const day = dateFns.format(date, 'dddd')
        const att = (attendance && attendance[day]) || {}
        const dayTimetable = (timetable && timetable[day]) || {}
        const totalSubjects = (dayTimetable && Object.keys(dayTimetable).reverse()[0]) || 0
        const maxClassLogged = (att && Object.keys(att).reverse()[0]) || 0
        const max = totalSubjects > maxClassLogged ? totalSubjects : maxClassLogged

        if(max === 0)
          subjects.push(
            <div className="att--classes-none" key="no-class">No classes found.</div>            
          )

        for(let i = 1; i <= max; i++) {
          const data = att[i] || dayTimetable[i]
          const subject = (data && data.subject) || data
          let attSub = Object.keys(attSubEdit).length > 0 &&
              attSubEdit.subject === subject &&
              attSubEdit.classNo === i &&
              attSubEdit.day === day ? true : false
          let editOptions = !attSub && Object.keys(attOptionsPopup).length > 0 &&
              attOptionsPopup.subject === subject &&
              attOptionsPopup.classNo === i &&
              attOptionsPopup.day === day ? true : false

          let attOptions = !attSub && Object.keys(attOptionsPopup).length > 0 &&
              attOptionsPopup.subject === subject &&
              attOptionsPopup.classNo === i &&
              attOptionsPopup.day === day ? !att[i] ? true
                : ((att[i] && !att[i].status) ? true : false)
                : false

          data &&
            subjects.push(
            <div className={`att--weekly--subjects_row_wrap att--weekly--subjects_row_wrap-${data.status}`}
                key={`${day}${i}`}
                onClick={() => this.attOptionsPopup(day, i, subject)}
                onMouseOver={() => this.attOptionsPopup(day, i, subject)}
              >
                {helpers.renderSubjectName(subject)}
              { attOptions ? this.renderAttendanceOptions(date, i) : null }
              {
                editOptions ? <img src={require('../../../../../images/edit-attendance.svg')}
                  alt='edit' className="att--weekly--subjects-edit"
                  onClick={() => this.handleEdit(day, i, subject)}
                /> : null
              }
              { attSub ? this.renderSubjectEdit(day, i, subject) : null }
            </div>
          )
        }

        subjectsWrap.push(
          <div className="att--weekly--subjects_row" key={`${day}`}
            onMouseLeave={() => this.setState({attOptionsPopup: {}})} >{subjects}</div>
        )
      
      date = dateFns.addDays(date, 1)
    }

    return <div className="att--weekly--subjects" key="subjects-wrap" >{subjectsWrap}</div>
  }

  renderDays = () => {

    const days = []
    const startOfWeek = this.state.selectedWeek
    const endOfWeek = dateFns.endOfISOWeek(startOfWeek)
    let date = startOfWeek

    while(!dateFns.isSameDay(date, endOfWeek)) {
      days.push(
        <div className="att--weekly--days--day" key={date}>{dateFns.format(date, 'ddd').toUpperCase()}</div>
      )
      date = dateFns.addDays(date, 1)
    }

    return <div className="att--weekly--days" key="days">{days}</div>
  }

  renderHeader = () => {

    const date = this.state.selectedWeek
    const endWeek = dateFns.subDays(dateFns.endOfISOWeek(date), 1)
    const format = dateFns.isSameMonth(date, endWeek) ? 'D, YYYY' : 'MMMM D, YYYY'

    return (
      <div className="att--weekly--header" key="header" >
        <div className="att--weekly--header--main">
          <img src={require('../../../../../images/arrow-left.svg')} alt="<-" className="att--weekly--header--day-prev"
              onClick={this.prevWeek} />
          <div className="att--weekly--header--week" key="week-number">WEEK&nbsp;#{dateFns.getISOWeek(date)}</div>
          <img src={require('../../../../../images/arrow-right.svg')} alt="->" className="att--weekly--header--day-next"
              onClick={this.advanceWeek} />
        </div>
        <div className="att--weekly--header--range">
          {(dateFns.format(date, 'MMMM D')+ ' - ' + dateFns.format(endWeek, format)).toUpperCase()}
        </div>
      </div>
    )
  }
  
  render() {
  
    return (
      <div className="att--weekly">
        {this.renderHeader()}
        {this.renderDays()}
        {this.renderSubjects()}
      </div>
    )
  }
}
