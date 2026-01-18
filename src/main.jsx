// Main mejorado
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterApp } from "./router/RouterApp"
import "./index.css"
import "./styles/minimalist-design.css"
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { TaskHistoryProvider } from './context/TaskHistoryContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <TaskHistoryProvider>
          <RouterApp />
        </TaskHistoryProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
