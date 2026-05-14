import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

console.log('Starting application...')

const queryClient = new QueryClient()

// Clear any existing content
const rootElement = document.getElementById('root')
if (rootElement) {
  rootElement.innerHTML = ''
}

// Create a new root
const root = ReactDOM.createRoot(rootElement!)

console.log('Root element:', rootElement)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

console.log('Application rendered') 