import { Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/layout/ProtectedRoute/ProtectedRoute'
import HomePage from './features/home/HomePage'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ConfirmEmail from './features/auth/pages/ConfirmEmail'

const App = () => {

  return (
        <Routes>
            {/* Protected, only accessible if logged in */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                }
            />
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
        </Routes>
  )
}

export default App
