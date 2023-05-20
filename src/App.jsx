import { useState } from 'react'

import './App.css'
import { Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import Simulation from './components/Simulation'

function App() {

  return (
    <Box sx={{display: 'flex', height: '100vh', width: '100vw', flexDirection: 'row'}}>
      <Sidebar />
      <Simulation />
    </Box>
  )
}

export default App
