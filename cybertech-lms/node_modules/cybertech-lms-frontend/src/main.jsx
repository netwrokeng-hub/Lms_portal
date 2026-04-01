import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12121A',
              color: '#E2E8F0',
              border: '1px solid rgba(245,197,24,0.2)',
              borderRadius: '12px',
              fontFamily: 'Sora, sans-serif',
            },
            success: { iconTheme: { primary: '#F5C518', secondary: '#0A0A0F' } },
            error: { iconTheme: { primary: '#FF3366', secondary: '#0A0A0F' } },
            duration: 4000,
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
