import React, { Component } from 'react'
import axios from 'axios'

// css
import '../styles/Timetable.css'

export default class Timetable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      editSubject: {},
      newSubject: '',
      popupAddSubject: {},
      savedTimetable: '',
      showTTPopup: false,
      timetable: {}
    }
  }

  componentWillMount() {
    this.fetchTimetable()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.state.popupAddSubject.status || this.state.popupAddSubject.status !== nextState.popupAddSubject.status
  }

  fetchTimetable = () => {
    axios
      .get('/timetable/fetch', {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        this.setState({
          savedTimetable: res.data
        })
      })
      .catch(err => this.setState({
        savedTimetable: '',
        err: err.response.data.msg
      }))
  }

  handleSubjectInput = (event, i) => {

    const timetable = {...this.state.timetable}
    timetable[this.state.popupAddSubject.day] = timetable[this.state.popupAddSubject.day] || {}

    const classes = {...timetable[this.state.popupAddSubject.day.classes]}    
    const subject = event.target.value
    if(subject.length !== 0)
      classes[i] = { subject }

    timetable[this.state.popupAddSubject.day][i] = classes[i]
    this.setState({
      timetable
    })
  }

  getAcronym = (val) => {
    const arr = val.split(' ')
    if(arr.length < 2)
      return val.substr(0, 2)

    else
      return arr[0].charAt(0) + arr[1].charAt(0)
  }

  handleContinue = () => {
    this.setState(prevState => {
      if(prevState.popupAddSubject.status === 2)
        return {
          popupAddSubject: {}
        }
      else
        return {
          popupAddSubject: {
            day: prevState.popupAddSubject.day,
            new: prevState.popupAddSubject.new,
            status: prevState.popupAddSubject.status + 1
          }
        }
    })
  }

  saveEdits = () => {

    const state = {...this.state}
    const { timetable, editSubject, newSubject, showTTPopup } = state

    if(newSubject.length !== 0)
      timetable[editSubject.day][editSubject.classNo].subject = newSubject
    else if(newSubject.length === 0 && showTTPopup.type === 'edit')
      timetable[editSubject.day][editSubject.classNo].delete = true
    else if(newSubject.length === 0 && showTTPopup.type === 'add')
      delete timetable[editSubject.day][editSubject.classNo]

    this.setState({
      timetable,
      editSubject: {}
    })
  }

  renderSubjectInputs = (subjects) => {

    const state = {...this.state}
    const { popupAddSubject, timetable } = state
    let i = 0, length = 0
    const input = []

    if(timetable[popupAddSubject.day] && Object.keys(timetable[popupAddSubject.day]).length !== 0) {
      length = Object.keys(timetable[popupAddSubject.day]).length
      i = parseInt(Object.keys(timetable[popupAddSubject.day])[length - 1], 10)
      subjects = parseInt(subjects, 10) + i
    }

    for(; i < subjects; i++) {
      const cloneI = i
      input.push(
        <input
          key={i}
          type="text"
          placeholder={`Subject ${++length}`}
          autoFocus={(i === 0)}
          onChange={(event) => this.handleSubjectInput(event, cloneI+1)}
          onKeyDown={key => {
            if(key.keyCode === 13 && cloneI === subjects - 1)
              this.handleContinue()
          }}
        />
      )
    }

    return <div className="input-wrap">{input}</div>
  }

  renderInputRows = () => {
    const cells = []
    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    for(let i = 0; i < daysList.length; i++) {

      let day = daysList[i]
      cells.push(
        <div className={`row-wrap ${daysList[i]}`} key={i} >
          <div className={`${daysList[i]} popup-day`} key={i} >
            {daysList[i]}
          </div>

          <div className="subject-wrap">
            {
              this.state.timetable[day] &&
              Object.keys(this.state.timetable[day]).length !== 0
              ?
              Object
                .keys(this.state.timetable[day])
                .map(key => {
                  if(!this.state.timetable[day][key].delete)
                    return (
                      <div
                        className="subject-name"
                        key={key}
                        onClick={() => this.setState(prevState => {
                          return {
                            editSubject: {
                              day: day,
                              subject: prevState.timetable[day][key].subject,
                              classNo: key
                            },
                            newSubject: prevState.timetable[day][key].subject
                          }
                        })}
                      >
                        <div className="subject-acronym">
                          { this.getAcronym(this.state.timetable[day][key].subject) }
                        </div>
                        {
                          Object.keys(this.state.editSubject).length !== 0 && this.state.editSubject.classNo === key && this.state.editSubject.day === day
                          ?
                          <div className="edit-subject-popup">
                            <input type="text"
                              id="editsub"
                              key={key}
                              className={key}
                              defaultValue={this.state.editSubject.subject}
                              autoFocus={true}
                              onChange={text => this.setState({newSubject: text.target.value})}
                              onKeyDown={key => key.keyCode === 13 ? this.saveEdits() : null}
                              onBlur={() => this.saveEdits()}
                            />
                          </div>
                          : null
                        }
                      </div>
                    )}
                )
              : null
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

          {
            Object.keys(this.state.popupAddSubject).length !== 0 && this.state.popupAddSubject.day === day
            ?
            <div className="add-subject-popup">
              <img src={require('../images/close.svg')} alt="x"
                onClick={() => this.setState({popupAddSubject: {}})}
                className="close-button" />
              <span className="add-subject-day">
                Classes on <br/> {day}
              </span>
              {
                this.state.popupAddSubject.status === 1
                ?
                <div className="add-subject-classes-wrap">
                  <div className="classes-wrap">
                    <button className="add-subject-sub-classes" onClick={() => { this.day.value = parseInt(this.day.value, 10) - 1 }} >
                      -
                    </button>
                    <input type="number" defaultValue={1} ref={node => this.day = node} onKeyDown={key => { if(key.keyCode === 13) this.handleContinue() }} />
                    <button className="add-subject-add-classes" onClick={() => { this.day.value = parseInt(this.day.value, 10) + 1 }} >
                      +
                    </button>
                  </div>
                  <label className="classes-label">Total number of classes</label>
                </div>
                : this.state.popupAddSubject.status === 2
                ? this.renderSubjectInputs(this.day.value)
                : null
              }
              <img src={require('../images/continue.svg')} alt="continue" className="continue" onClick={this.handleContinue} />
            </div>
            : null
          }
        </div>
      )
    }
    return <div className="input-row-wrap">{cells}</div>
  }

  clearStates = () => {
    this.setState({
      showTTPopup: false,
      popupAddSubject: {},
      editSubject: {},
      timetable: {},
      newSubject: ''
    })
  }

  editTimetable = () => {
    this.setState({
      showTTPopup: {
        type: 'edit'
      },
      timetable: this.state.savedTimetable
    })
  }

  submit = () => {
    const timetable = this.state.timetable
    const data = {timetable}
    if(this.state.showTTPopup.type === 'add')
      this.addTimetable(data)
    else if(this.state.showTTPopup.type === 'edit')
      this.updateTimetable(data)
  }

  addTimetable = (data) => {
    axios
    .post('/timetable/add', data, {
        headers: {
          'Authorization': this.props.token
        }
    })
    .then(res => {
      if(res.status === 200) {
        this.clearStates()
        this.fetchTimetable()
      }
    })
    .catch(err => console.log(err.response.data))
  }

  updateTimetable = (data) => {
    axios
      .post('/timetable/update', data, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        if(res.status === 200) {
          this.clearStates()
          this.fetchTimetable()
        }
      })
      .catch(err => console.log(err.response.data))
  }

  removeTimetable = () => {
    
    axios
      .delete(`/timetable/`, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        if(res.status === 200)
          this.fetchTimetable()
      })
      .catch(err => console.log(err.response.data))
  }

  renderSavedTimetable = () => {

    const savedTimetable = []
    this.state.savedTimetable.length === 0 &&
    savedTimetable.push(
      <div className="empty" key="none" >{this.state.err}</div>
    )

    this.state.savedTimetable.length !== 0 &&
      savedTimetable.push(
        <div className="saved-timetable" key="some" >
          <span className="tag">Timetable</span>
          <div className="timetable-options">
            <img src={require('../images/edit.svg')} alt="edit" className="edit" onClick={() => this.editTimetable()} />
            <img src={require('../images/remove.svg')} alt="x" className="remove" onClick={() => this.removeTimetable()} />
          </div>
        </div>
      )
    return <div className="saved-timetable-wrap">{savedTimetable}</div>
  }

  render() {

    const ttStyle = {
      zIndex: this.state.showTTPopup ? -1 : 'auto'
    }
    return (
      <div className="timetable-wrap">
        <div className="timetable-content" style={ttStyle}>
          <div className="timetable-heading">TIMETABLES</div>
          {this.renderSavedTimetable()}
          {
            this.state.savedTimetable.length === 0
            ? <button className='add-timetable' onClick={() => this.setState({showTTPopup: {type: 'add'}})}>+ NEW TIMETABLE</button>
            : null
          }
        </div>
        {/* popup */}
        {
          Object.keys(this.state.showTTPopup).length !== 0
          ?
          <div className="tt-popup-wrap">
            <img src={require('../images/close.svg')} className="close-button"
              alt="x" onClick={() => this.clearStates()}/>
            <div className="tt-popup-content">
              {this.renderInputRows()}
            </div>
            <button className="save-button" onClick={this.submit}>SAVE</button>
          </div>
          :
          null
        }
      </div>
    )
  }
}
