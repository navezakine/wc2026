import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Inspector } from 'react-dev-inspector'

const isDev = import.meta.env.DEV

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {isDev ? (
        <Inspector>
          <App />
        </Inspector>
      ) : (
        <App />
      )}
    </BrowserRouter>
  </React.StrictMode>,
)
