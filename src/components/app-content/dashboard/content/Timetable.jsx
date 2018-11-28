import React, { Component } from 'react'
import axios from 'axios'
import CSSTransitionGroup from 'react-addons-css-transition-group'

// css
import '../../../../styles/Timetable.css'

export default class Timetable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      editSubject: {},
      newSubject: '',
      popupAddSubject: {},
      showTTPopup: {},
      timetable: props.timetable,
      editedTimetable: {},
      ttErr: ''
    }  
  }

  componentDidUpdate(prevProps, prevState) {
    const current = JSON.stringify(prevProps.timetable)
    const newTT = JSON.stringify(this.props.timetable)
    if((newTT !== current) || (newTT === current && this.state.timetable === {})) {
      this.saveTimetable()
    }
  }

  shouldComponentUpdate(nextProps, nextState) {

    const { popupAddSubject } = this.state
    const currentStatus = popupAddSubject.status

    if(Object.keys(nextState.showTTPopup).length !== 0)
      this.props.toggleShow(true)
    else if(nextState.showTTPopup !== this.state.showTTPopup)
      this.props.toggleShow(false)

    if(Object.keys(popupAddSubject).length !== 0 &&
        (currentStatus === nextState.popupAddSubject.status && currentStatus !== 1))
      return false

    return true
  }

  clearStates = () =>
  this.setState({
    showTTPopup: false,
    popupAddSubject: {},
    editSubject: {},
    newSubject: '',
    timetable: this.props.timetable
  })

  saveTimetable = () => this.setState({ timetable: this.props.timetable })

  handleSubjectInput = (classNo, subject) => {

    const timetable = {...this.state.timetable}
    timetable[this.state.popupAddSubject.day] = timetable[this.state.popupAddSubject.day] || {}
    const classes = {...timetable[this.state.popupAddSubject.day.classes]} || {}
    
    if(subject.length !== 0)
    classes[classNo] = subject
    
    timetable[this.state.popupAddSubject.day][classNo] = classes[classNo]
    this.setState({
      timetable
    })
  }

  getAbbreviation = (val) => {

    const arr = val.split(' ')
    if(arr.length < 2)
      return val.substr(0, 2).toUpperCase()

    else
      return (arr[0].charAt(0) + arr[1].charAt(0)).toUpperCase()
  }

  handleContinue = () => {

    if(this.state.popupAddSubject.status === 1) {
      const { popupAddSubject, timetable } = this.state
      let i = 0

      if(timetable[popupAddSubject.day])
        i = parseInt(Object.keys(timetable[popupAddSubject.day]).reverse()[0], 10)

      let totClasses = parseInt(this.day.value, 10) + i
      if(totClasses > 8) {
        setTimeout(() => this.setState({maxClassErr: ''}), 3000)
        return this.setState({maxClassErr: 'There can be only 8 classes in a day.'})
      }
    }
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
  }
      
  saveEdits = () => {

    const { editSubject, newSubject } = this.state
    let timetable
    const day = editSubject.day
    const classNo = editSubject.classNo

    if(newSubject.length !== 0) {
      const classes = {...this.state.timetable[day], [classNo]: newSubject}
      timetable = {...this.state.timetable, [day]: classes}
    }
    else {
      const classes = {...this.state.timetable[day], [classNo]: null}
      timetable = {...this.state.timetable, [day]: classes}
    }

    this.setState({
      editSubject: {},
      timetable
    })
  }

  renderSubjectInputs = subjects => {

    const { popupAddSubject, timetable } = this.state
    let i = 0, length = 0
    const input = []

    if(timetable[popupAddSubject.day]) {
      const classes = Object.keys(timetable[popupAddSubject.day])
      length = classes.length
      i = parseInt(classes.reverse()[0], 10)
      subjects = parseInt(subjects, 10) + i
    }

    for(; i < subjects; i++) {
      const cloneI = i
      input.push(
        <input
          key={i} type="text"
          autoFocus={(i === length)} placeholder={`Subject ${i+1}`}
          onChange={key => this.handleSubjectInput(cloneI+1, key.target.value)}
          onKeyDown={key => {
            if(key.keyCode === 27)
              this.setState({popupAddSubject: {}})

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
              <img src={require('../../../../images/close.svg')} alt="x"
                onClick={() => this.setState({popupAddSubject: {}})} className="popup-close" />
              <span className="popup--subject"> Classes on <br/> {day} </span>
              {
                this.state.popupAddSubject.status === 1 ?
                <div className="row--popup--1">
                  <div className="popup--1--buttons">
                    <button className="button-add"
                        onClick={() => { this.day.value = parseInt(this.day.value, 10) - 1 }} > - </button>
                    <input type="number" defaultValue={1} ref={node => this.day = node}
                        autoFocus={true}
                        onKeyDown={key => {
                          this.setState({maxClassErr: ''})
                          if(key.keyCode === 27)
                            this.setState({popupAddSubject: {}})
                          if(key.keyCode === 13)
                            this.handleContinue()
                        }} />
                    <button className="button-sub"
                        onClick={() => { this.day.value = parseInt(this.day.value, 10) + 1 }} > + </button>
                  </div>
                  <label className="popup--1--label">Total number of classes</label>
                  <CSSTransitionGroup
                    component="div"
                    className="max_class-container"
                    transitionName="err"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={500}
                  >
                  {
                    this.state.maxClassErr
                    && (<div className="max_class--err">{this.state.maxClassErr}</div>)
                  }
                  </CSSTransitionGroup>
                </div>
                : this.state.popupAddSubject.status === 2
                ? this.renderSubjectInputs(this.day.value)
                : null
              }
              <img src={require('../../../../images/continue.svg')} alt="continue"
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
    
    this.setState({ttErr: ''})
    if(this.state.showTTPopup.type === 'add')
      this.addTimetable(this.state.timetable)
    else if(this.state.showTTPopup.type === 'edit')
      this.updateTimetable(this.state.timetable)
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
    .catch(err => this.setState({ttErr: err.response.data.timetable}))
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
            <img src={require('../../../../images/edit.svg')} alt="edit" className="savedtt--options-edit"
              onClick={() => this.setState({showTTPopup: {type: 'edit'}})} />
            <div className="savedtt--options-remove" onClick={() => this.removeTimetable()} >
              DELETE
            </div>
          </div>
        </div>
      )

    return <div className="tt--content--savedtt">{savedTimetable}</div>
  }

  renderTTPopup = () =>
    <div className="tt--popup">
      <img src={require('../../../../images/close.svg')} className="popup-close"
        alt="x" onClick={() => this.clearStates()}/>
      <div className="tt--popup--content">
        {this.renderInputRows()}
      </div>
      <div className="tt--popup--last_row">
        {
          this.state.ttErr ?
          <div className="tt--popup--err">
            {this.state.ttErr}
          </div>
          : null
        }
        <button className="save-button" onClick={this.submit}>SAVE</button>
      </div>
    </div>

  render() {

    return (
      <div className="timetable--content">
        {
          Object.keys(this.state.showTTPopup).length !== 0
          ? null
          : this.renderSavedTimetable()
        }

        <CSSTransitionGroup
          className="tt--popup--anim--wrap"
          component="div"
          transitionName="tt--popup"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}
          >
          {
            Object.keys(this.state.showTTPopup).length !== 0
            ? this.renderTTPopup()
            : null
          }
        </CSSTransitionGroup>
      </div>
    )
  }
}
