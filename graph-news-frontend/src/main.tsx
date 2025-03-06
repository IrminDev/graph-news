import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignInPage from './views/SignInPage'
import SignUpPage from './views/SignUpPage'
import UserProfilePage from './views/user/UserProfilePage'
import AdminDashboardPage from './views/admin/AdminDashboardPage'
import UserUpdatePage from './views/admin/UserUpdatePage'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')!).render(
  <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path='/sign-in' element={<SignInPage />} />
      <Route path='/sign-up' element={<SignUpPage />} />
      <Route path='/user/me' element={<UserProfilePage />} />
      <Route path='/admin/dashboard' element={<AdminDashboardPage />} />
      <Route path='/admin/update/:id' element={<UserUpdatePage/>} />
    </Routes>
  </BrowserRouter>
  <ToastContainer />
  </>
)
