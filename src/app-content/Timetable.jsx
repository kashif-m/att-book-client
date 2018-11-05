import React, { Component } from 'react'
import axios from 'axios'

// css
import '../styles/Timetable.css'

export default class Timetable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      showTTPopup: false,
      popupAddSubject: {},
      editSubject: {},
      timetable: {},
      newSubject: ''
    }
  }

  componentWillMount() {
    this.fetchTags()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.state.popupAddSubject.status || this.state.popupAddSubject.status !== nextState.popupAddSubject.status
  }

  fetchTags = () => {
    axios
      .get('/timetable/get-all', {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        this.setState({
          savedTimetables: res.data
        })
      })
      .catch(err => console.log(err.response.data))
  }

  handleChange = (event, i) => {

    const timetable = {...this.state.timetable}
    timetable[this.state.popupAddSubject.day] = timetable[this.state.popupAddSubject.day] || {}

    const classes = {...timetable[this.state.popupAddSubject.day.classes]}    
    const subject = event.target.value
    if(subject.length !== 0)
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
    let i = 0, length = 0
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
          onChange={(event) => this.handleChange(event, cloneI+1)}
          onKeyDown={key => {
            if(key.keyCode === 13 && cloneI === subjects - 1)
              this.handleContinue()
          }}
        />
      )
    }

    return <div className="input-wrap">{input}</div>
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
    const timetable = {...this.state.timetable}
    if(this.state.newSubject.length !== 0)
      timetable[this.state.editSubject.day][this.state.editSubject.classNo].subject = this.state.newSubject
    else if(this.state.newSubject.length === 0 && this.state.showTTPopup.type === 'edit')
      timetable[this.state.editSubject.day][this.state.editSubject.classNo].delete = true
    else if(this.state.newSubject.length === 0 && this.state.showTTPopup.type === 'add')
      delete timetable[this.state.editSubject.day][this.state.editSubject.classNo]

    this.setState({
      timetable,
      editSubject: {}
    })
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
                    {
                      this.getAcronym(this.state.timetable[day][key].subject)
                    }
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
                    :
                    null
                  }
                </div>
                )}
              )
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

          {
            Object.keys(this.state.popupAddSubject).length !== 0 && this.state.popupAddSubject.day === day
            ?
            <div className="add-subject-popup">
              <img src={require('../images/close.svg')} alt="x"
                onClick={() => this.setState({popupAddSubject: {}})}
                className="close-button" />
              <span className="add-subject-day">
                Classes on <br/>
                {day}
              </span>
              {
                this.state.popupAddSubject.status === 1
                ?
                <div className="add-subject-classes-wrap">
                  <div className="classes-wrap">
                    <button
                      className="add-subject-sub-classes"
                      onClick={() => {
                        this.day.value = parseInt(this.day.value, 10) - 1
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      defaultValue={1}
                      ref={node => this.day = node}
                      onKeyDown={key => {
                        if(key.keyCode === 13)
                          this.handleContinue()
                      }}
                    />
                    <button
                      className="add-subject-add-classes"
                      onClick={() => {
                        this.day.value = parseInt(this.day.value, 10) + 1
                      }}
                    >
                      +
                    </button>
                  </div>
                  <label className="classes-label">Total number of classes</label>
                </div>
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
                onClick={this.handleContinue}
              />
            </div>
            :
            null
          }
        </div>
      )
    }
    return <div className="input-row-wrap">{cells}</div>
  }

  submit = () => {
    const timetable = this.state.timetable
    const data = {
      timetable,
      tag: document.getElementById('save_as').value
    }
    if(this.state.showTTPopup.type === 'add')
      this.addTimetable(data)
    else if(this.state.showTTPopup.type === 'edit')
      this.updateTimetable(data)
  }

  editTimetable = (tag) => {
    this.setState({
      showTTPopup: {
        type: 'edit'
      }
    })
    const data = {
      tag
    }
    axios
      .post('/timetable/fetch', data, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        this.setState({
          timetable: res.data
        })
        document.getElementById('save_as').value = res.data.tag
      })
      .catch(err => console.log(err.response.data))
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
        this.fetchTags()
      }
    })
    .catch(err => console.log(err.response.data))
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

  updateTimetable = (data) => {
    data.newTag = data.tag
    data.tag = this.state.timetable.tag
    axios
      .post('/timetable/update', data, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        if(res.status === 200) {
          this.clearStates()
          this.fetchTags()
        }
      })
      .catch(err => console.log(err.response.data))
  }

  removeTimetable = tag => {
    axios
      .delete(`/timetable/${tag}`, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        if(res.status === 200)
          this.fetchTags()
      })
      .catch(err => console.log(err.response.data))
  }

  renderSavedTimetable = () => {

    const savedTimetable = []
    this.state.savedTimetable.length === 0 &&
    savedTimetable.push(
      <div className="empty" key="none" >No saved timetable found.</div>
    )

    this.state.savedTimetable.length !== 0 &&
      savedTimetable.push(
        <div className="saved-timetable">
          <span className="tag">{this.state.savedTimetable}</span>
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
          <button className='add-timetable' onClick={() => this.setState({showTTPopup: {type: 'add'}})}>+ NEW TIMETABLE</button>
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
            <div className="save-as-wrap">
              <span>Save As</span>
              <input id="save_as" type="text" defaultValue="Timetable 1" />
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
