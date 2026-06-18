import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ayuda de QA/capturas: con ?reveal en la URL, todas las animaciones de
// aparición se muestran ya reveladas (útil para screenshots estáticos).
if (window.location.search.includes('reveal')) {
  document.documentElement.classList.add('reveal-all')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
