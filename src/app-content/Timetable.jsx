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
      showTTPopup: false,
      timetable: {},
      editedTimetable: {}
    }
  }

  componentDidMount() {
    this.saveTimetable()
  }

  componentDidUpdate(prevProps) {
    const newTT = JSON.stringify(this.props.timetable)
    const current = JSON.stringify(prevProps.timetable)
    if((newTT !== current) || (newTT === current && this.state.timetable === {}))
      this.saveTimetable()
  }

  shouldComponentUpdate(nextProps, nextState) {

    if(Object.keys(this.state.popupAddSubject).length !== 0 &&
        (this.state.popupAddSubject.status === nextState.popupAddSubject.status)) {
      return false
    }

    return true
  }

  clearStates = () =>
  this.setState({
    showTTPopup: false,
    popupAddSubject: {},
    editSubject: {},
    newSubject: ''
  })

  saveTimetable = () => this.setState({ timetable: this.props.timetable })

  handleSubjectInput = (classNo, subject) => {

    const showTTPopup = this.state.showTTPopup

    const timetable = {...this.state.timetable}
    timetable[this.state.popupAddSubject.day] = timetable[this.state.popupAddSubject.day] || {}
    const classes = {...timetable[this.state.popupAddSubject.day.classes]} || {}
    
    if(subject.length !== 0)
    classes[classNo] = subject
    
    timetable[this.state.popupAddSubject.day][classNo] = classes[classNo]
    this.setState({
      timetable
    })

    if(showTTPopup.type === 'edit') {
      const editedTimetable = {...this.state.editedTimetable}
      editedTimetable[this.state.popupAddSubject.day] = editedTimetable[this.state.popupAddSubject.day] || {}
      const classes = {...editedTimetable[this.state.popupAddSubject.day.classes]} || {}
      
      if(subject.length !== 0)
      classes[classNo] = subject
      
      editedTimetable[this.state.popupAddSubject.day][classNo] = classes[classNo]
      this.setState({
        editedTimetable
      })
    }
  }

  getAbbreviation = (val) => {

    const arr = val.split(' ')
    if(arr.length < 2)
      return val.substr(0, 2).toUpperCase()

    else
      return (arr[0].charAt(0) + arr[1].charAt(0)).toUpperCase()
  }

  handleContinue = () =>
    this.setState(prevState => {
      if(prevState.popupAddSubject.status === 2)
        return { popupAddSubject: {} }
      else
        return {
          popupAddSubject: {
            day: prevState.popupAddSubject.day,
            new: prevState.popupAddSubject.new,
            status: prevState.popupAddSubject.status + 1
        }}
    })

  saveEdits = () => {

    const state = {...this.state}
    const { timetable, editSubject, newSubject, editedTimetable, showTTPopup } = state
    const day = editSubject.day
    const classNo = editSubject.classNo

    if(newSubject.length !== 0) {
      if(showTTPopup.type === 'edit') {
        editedTimetable[day] = editedTimetable[day] || {}
        editedTimetable[day][classNo] = newSubject
      }
      else
        timetable[editSubject.day][editSubject.classNo] = newSubject
    }
    else {
      if(showTTPopup.type === 'edit' && editedTimetable[day] && editedTimetable[day][classNo])
        delete editedTimetable[day][classNo]
      else
        delete timetable[editSubject.day][editSubject.classNo]
    }

    this.setState({
      editedTimetable,
      editSubject: {},
      timetable
    })
  }

  renderSubjectInputs = (subjects) => {

    const { popupAddSubject, timetable } = this.state
    let i = 0, length = 0
    const input = []

    if(timetable[popupAddSubject.day]) {
      length = Object.keys(timetable[popupAddSubject.day]).length
      i = parseInt(Object.keys(timetable[popupAddSubject.day]).reverse()[0], 10)
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
          onChange={key => this.handleSubjectInput(cloneI+1, key.target.value)}
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

    const { timetable, editSubject, editedTimetable } = this.state
    const cells = []
    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    for(let i = 0; i < daysList.length; i++) {

      let day = daysList[i]
      cells.push(
        <div className={`ttpopup--content--row ${day}`} key={i} >
          <div className={`row--day ${day}`} key={i} >
            {day}
          </div>

          <div className="row--subject">
            {
              timetable[day] &&
              Object
                .keys(timetable[day])
                .map(classNo => {
                  const subject = (editedTimetable[day] && editedTimetable[day][classNo]) || timetable[day][classNo]
                  return timetable[day][classNo] &&
                    (<div
                        className="row--subject--name" key={classNo}
                        onClick={() => this.setState(prevState => {
                          return {
                            editSubject: {
                              day: day,
                              subject: prevState.timetable[day][classNo],
                              classNo
                            },
                            newSubject: prevState.timetable[day][classNo]
                        }})}>
                        <div className="row--subject--abbreviation">
                          { this.getAbbreviation(subject) }
                        </div>
                        {
                          Object.keys(editSubject).length !== 0 && editSubject.classNo === classNo && editSubject.day === day
                          ?
                          <input type="text"
                            id="editsub" key={classNo} className={classNo}
                            defaultValue={editSubject.subject} autoFocus={true}
                            onChange={text => this.setState({newSubject: text.target.value})}
                            onKeyDown={key => key.keyCode === 13 && key.target.blur()}
                            onBlur={() => this.saveEdits()} />
                          : null
                        }
                    </div>)
                  }
                )
            }
            <button className="row--subject-add"
              onClick={() => this.setState({popupAddSubject: {
                day,
                new: true,
                status: 1
              }})}> + </button>
          </div>

          {
            Object.keys(this.state.popupAddSubject).length !== 0 && this.state.popupAddSubject.day === day
            ?
            <div className="row--subject--popup">
              <img src={require('../images/close.svg')} alt="x"
                onClick={() => this.setState({popupAddSubject: {}})}
                className="popup-close" />
              <span className="popup--subject">
                Classes on <br/> {day}
              </span>
              {
                this.state.popupAddSubject.status === 1
                ?
                <div className="row--popup--1">
                  <div className="popup--1--buttons">
                    <button className="button-add"
                        onClick={() => { this.day.value = parseInt(this.day.value, 10) - 1 }} > - </button>
                    <input type="number" defaultValue={1} ref={node => this.day = node}
                        autoFocus={true}
                        onKeyDown={key => {
                          if(key.keyCode === 13)
                            this.handleContinue()
                        }} />
                    <button className="button-sub"
                        onClick={() => { this.day.value = parseInt(this.day.value, 10) + 1 }} > + </button>
                  </div>
                  <label className="popup--1--label">Total number of classes</label>
                </div>
                : this.state.popupAddSubject.status === 2
                ? this.renderSubjectInputs(this.day.value)
                : null
              }
              <img src={require('../images/continue.svg')} alt="continue"
                  className="button-continue" onClick={this.handleContinue} />
            </div>
            : null
          }
        </div>
      )
    }
    return cells
  }

  submit = () => {
    
    if(this.state.showTTPopup.type === 'add')
      this.addTimetable(this.state.timetable)
    else if(this.state.showTTPopup.type === 'edit')
      this.updateTimetable(this.state.editedTimetable)
  }

  addTimetable = (timetable) => {
    axios
    .post('/timetable/add', {timetable}, {
        headers: {
          'Authorization': this.props.token
        }
    })
    .then(res => {
      if(res.status === 200) {
        this.clearStates()
        this.props.fetchTimetable()
      }
    })
    .catch(err => console.log(err.response.data))
  }

  updateTimetable = (timetable) => {
    axios
      .post('/timetable/update', {timetable}, {
        headers: {
          'Authorization': this.props.token
        }
      })
      .then(res => {
        if(res.status === 200) {
          this.clearStates()
          this.props.fetchTimetable()
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
          this.props.fetchTimetable()
      })
      .catch(err => console.log(err.response.data))
  }

  renderSavedTimetable = () => {

    const savedTimetable = []
    const timetable = {...this.state.timetable}
    
    Object.keys(timetable).length === 0 &&
    savedTimetable.push( <div className="empty" key="none" >No timetables found.</div> ) &&
    savedTimetable.push( <button className="tt--content--savedtt-add" key="add"
        onClick={() => this.setState({showTTPopup: {type: 'add'}})}>+ NEW TIMETABLE</button> )

    Object.keys(timetable).length !== 0 &&
      savedTimetable.push(
        <div className="savedtt" key="some" >
          <span className="savedtt--tag">Timetable</span>
          <div className="savedtt--options">
            <img src={require('../images/edit.svg')} alt="edit" className="savedtt--options-edit"
              onClick={() => this.setState({showTTPopup: {type: 'edit'}})} />
            <img src={require('../images/remove.svg')} alt="x" className="savedtt--options-remove"
              onClick={() => this.removeTimetable()} />
          </div>
        </div>
      )

    return <div className="tt--content--savedtt">{savedTimetable}</div>
  }

  render() {

    const ttStyle = {
      zIndex: this.state.showTTPopup ? -1 : 'auto'
    }
    return (
      <div className="timetable">
        <div className="tt--content" style={ttStyle}>
          <div className="tt--content--heading">TIMETABLES</div>
          {this.renderSavedTimetable()}
        </div>
        {/* popup */}
        {
          Object.keys(this.state.showTTPopup).length !== 0
          ?
          <div className="tt--popup">
            <img src={require('../images/close.svg')} className="popup-close"
              alt="x" onClick={() => this.clearStates()}/>
            <div className="tt--popup--content">
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
