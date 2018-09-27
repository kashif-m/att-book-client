import React from 'react'

import Navbar from './app-dependencies/Navbar'
import Footer from './app-dependencies/Footer'

class App extends React.Component {

  render() {
    return (
      <div className="app-wrap">
        <Navbar />
        <Footer />
      </div>
    )
  }
}

export default App
