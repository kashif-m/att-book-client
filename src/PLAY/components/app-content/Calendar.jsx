import React, { Component } from 'react'
import axios from 'axios'
import dateFns from 'date-fns'
import CSSTransitionGroup from 'react-addons-css-transition-group'

// css
import '../styles/Calendar.css'

export default class Calendar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentMonth: new Date(),
      selectedDate: new Date(),
      timetable: {},
      dayTimetable: {}
    }
  }

  componentDidMount() {
    this.fetchTimetable()
  }

  fetchTimetable = () => {
    axios
      .get('/timetable/fetch', {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => res.data && this.setState({timetable: res.data}))
      .catch(err => console.log(err.response.data))
  }

  prevMonth = () => {
    this.setState(prevState => {
      return {
        currentMonth: dateFns.subMonths(prevState.currentMonth, 1)
      }
    })
  }

  advanceMonth = () => {
    this.setState(prevState => {
      return {
        currentMonth: dateFns.addMonths(prevState.currentMonth, 1)
      }
    })
  }

  renderHeader = () => {
    return (
      <div className="calendar-header">
        <img src={require('../images/arrow-left.svg')} alt="<-" className="prev" onClick={this.prevMonth} />
        <div className="month">{dateFns.format(this.state.currentMonth, "MMMM")}</div>
        <img src={require('../images/arrow-right.svg')} alt="->" className="next" onClick={this.advanceMonth} />
      </div>
    )
  }

  renderDays = () => {
    const days = []
    const startDate = dateFns.startOfWeek(this.state.currentMonth)

    for(let i = 0; i < 7; i++)
      days.push(
        <div className={`${dateFns.format(dateFns.addDays(startDate, i), "dddd")} day`} key={i}>
          {
            dateFns.format(dateFns.addDays(startDate, i), "ddd")
          }
        </div>
      )

    return <div className="days-wrap">{days}</div>
  }

  renderWeekNumbers = () => {
    const weeks = []
    const monthStart = dateFns.startOfMonth(this.state.currentMonth)
    const monthEnd = dateFns.endOfMonth(this.state.currentMonth)
    const startDate = dateFns.startOfWeek(monthStart)
    const endDate = dateFns.endOfWeek(monthEnd)

    let date = startDate
    while(date < endDate) {

      date = dateFns.addWeeks(date, 1)
      weeks.push(
        <div className="week" key={date} >
          {
            dateFns.getISOWeek(date)
          }
        </div>
      )
    }

    return <div className="weeks-wrap">{weeks}</div>
  }

  renderPopup = () => {

    const popup = []
    const state = {...this.state}
    const { timetable, selectedDate } = state
    const day = dateFns.format(selectedDate, 'dddd')
    Object
    .keys(timetable[day])
    .forEach(classNo => {
        popup.push(
          <div className="attendance-row-wrap" key={classNo}>
            <span className="attendance-subject">{timetable[day][classNo].subject}</span>
          </div>
        )
      })

    return <div className="attendance-popup-wrap">{popup}</div>
  }

  renderCells = () => {
    const cells = []
    const monthStart = dateFns.startOfMonth(this.state.currentMonth)
    const monthEnd = dateFns.endOfMonth(monthStart)

    let selectedDate = this.state.selectedDate
    let date = monthStart
    let row = 1
    while(date < monthEnd) {
      
      let cloneDate = date
      cells.push(
        <div
          className={`${dateFns.format(date, "dddd")} ${row} ${dateFns.isSameDay(date, selectedDate) ? ' active' : ''} cell`}
          key={date}
          onClick={() => this.handleClick(cloneDate)} >
          <span>{ dateFns.format(date, "D") }</span>
          {
            dateFns.isSameDay(date, selectedDate) && Object.keys(this.state.dayTimetable).length !== 0
            ?
            <div className="attendance-popup">
              <div className="popup-heading">Attendance</div>
              {this.renderPopup()}
            </div>
            : null
          }
        </div>
      )

      date = dateFns.addDays(date, 1)
      if(dateFns.getMonth(date) !== dateFns.getMonth(monthStart))
        break

      if(dateFns.format(date, "dddd") === "Saturday")
       row++
    }

    return <div className="cells-wrap">{cells}</div>
  }

  handleClick = (date) => {
    this.setState({
      selectedDate: date
    })

    const day = dateFns.format(date, "dddd")
    this.setState({
      dayTimetable: this.state.timetable[day] || {}
    })
  }

  render() {

    return (
      <div className="calendar-wrap">
        {this.renderHeader()}
        <div className="calendar-body">
          <div className="week-number">WEEK #</div>
          {this.renderDays()}
          {this.renderWeekNumbers()}
          {this.renderCells()}
        </div>
      </div>
    )
  }
}
