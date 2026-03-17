import React from 'react'
import ReactDOMServer from 'react-dom/server'
import App from './App'

export function render(url) {
  // This converts your React component tree into an HTML string
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  return html
}