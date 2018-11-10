import React from 'react'

const functions = {
  renderSubjectName: (data) => 
      <div className="helper-subject-abbreviation">{functions.getAbbreviation(data.subject)}</div>,
  getAbbreviation: (subject) => {
    if(!subject)
      return
    const arr = subject.split(' ')
    if(arr.length > 1)
      return (arr[0].charAt(0) + arr[1].charAt(0)).toUpperCase()

    return subject.substr(0, 2).toUpperCase()
  }
}

export default functions
