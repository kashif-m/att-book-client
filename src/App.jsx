import React from 'react'

import Navbar from './app-dependencies/Navbar'
import Main from './app-dependencies/Main'
import Footer from './app-dependencies/Footer'

class App extends React.Component {

  render() {
    return (
      <div className="app-wrap">
        <Navbar />
        <Main />
        <Footer />
      </div>
    )
  }
}

export default App
