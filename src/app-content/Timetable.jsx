import React, { Component } from 'react'

// css
import '../styles/Timetable.css'

export default class Timetable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      showTTPopup: false,
      popupAddSubject: {},
      timetable: {}
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.state.popupAddSubject.status || this.state.popupAddSubject.status !== nextState.popupAddSubject.status
  }

  renderDays = () => {
    const days = []
    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    for(let i = 0; i < daysList.length; i++)
      days.push(
        <div
          className={`${daysList[i]} popup-day`}
          key={i}
        >
          {
            daysList[i]
          }
        </div>
     )

     return <div className="day-wrap">{days}</div>
  }

  handleChange = (event, i) => {
    
    const timetable = {...this.state.timetable}
    timetable[this.state.popupAddSubject.day] = timetable[this.state.popupAddSubject.day] || {}
    
    const classes = {...timetable[this.state.popupAddSubject.day.classes]}    
    const subject = event.target.value
    classes[i] = {
      subject
    }
    
    timetable[this.state.popupAddSubject.day][i] = classes[i]
    this.setState({
      timetable
    })
  }

  renderSubjectInputs = (subjects) => {
    const input = []

    const state = this.state
    const { popupAddSubject, timetable } = state
    let i = 0
    if(timetable[popupAddSubject.day] &&
        Object.keys(timetable[popupAddSubject.day]).length !== 0) {
          i = Object.keys(timetable[popupAddSubject.day]).length
          subjects = parseInt(subjects) + i
        }
        
    for(; i < subjects; i++) {
      const cloneI = i
      input.push(
        <input
          key={i}
          type="text"
          placeholder={`Subject ${i+1}`}
          onChange={(event) => this.handleChange(event, cloneI+1)}
        />
      )
    }

    return <div className="input-wrap">{input}</div>
  }

  renderInputRows = () => {
    const cells = []
    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    for(let i = 0; i < daysList.length; i++) {

      const day = daysList[i]
      cells.push(
        <div
        className={`row-wrap ${daysList[i]}`}
        key={i}
        >
          {
            Object.keys(this.state.popupAddSubject).length !== 0 && this.state.popupAddSubject.day === day
            ?
            <div className="add-subject-popup">
              <img src={require('../images/close.svg')} alt="x" onClick={() => this.setState({popupAddSubject: {}})} className="close" />
              {day}
              {console.log(day)}
              {
                this.state.popupAddSubject.status === 1
                ?
                <input
                  type="number"
                  placeholder="Classes"
                  defaultValue={1}
                  ref={node => this.day = node}
                />
                :
                this.state.popupAddSubject.status === 2
                ?
                this.renderSubjectInputs(this.day.value)
                :
                null
              }
              <img
                src={require('../images/continue.svg')}
                alt="continue" className="continue"
                onClick={() => this.setState(prevState => {
                  return {
                    popupAddSubject: {
                      day: prevState.popupAddSubject.day,
                      new: prevState.popupAddSubject.new,
                      status: prevState.popupAddSubject.status + 1
                    }
                  }
                })}
              />
            </div>
            :
            null
          }
          <button className="add-button"
            onClick={() => this.setState({popupAddSubject: {
              day,
              new: true,
              status: 1
            }})}
          >
            +
          </button>
        </div>
      )
    }

    return <div className="input-row-wrap">{cells}</div>
  }
  
  render() {
  
    const addTimetableClass = this.state.showTTPopup ? 'add-timetable popup-active' : 'add-timetable'
    return (
      <div className="timetable-wrap">
        <button
          className={addTimetableClass}
          onClick={() => this.setState({showTTPopup: true})}
        >
          + NEW TIMETABLE
        </button>
        {
          this.state.showTTPopup
          ?
          <div className="tt-popup-wrap">
            <img
              src={require('../images/close.svg')}
              alt="x" className="close-button"
              onClick={() => this.setState({showTTPopup: false})}
              />
            <div className="tt-popup-content">
              {this.renderDays()}
              {this.renderInputRows()}
            </div>
            <button className="save-button">SAVE</button>
          </div>
          :
          null
        }
      </div>
    )
  }
}
