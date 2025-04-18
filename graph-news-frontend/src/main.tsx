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
import UploadNewsPage from './views/user/UploadNewsPage'
import UserSettingsPage from './views/user/UserSettingsProfile'
import CreateUserPage from './views/admin/CreateUserPage'
import NewsDetailPage from './views/user/NewsDetailPage'
import GraphVisualization from './views/Test'

createRoot(document.getElementById('root')!).render(
  <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path='/sign-in' element={<SignInPage />} />
      <Route path='/sign-up' element={<SignUpPage />} />
      <Route path='/user/profile' element={<UserProfilePage />} />
      <Route path='/user/upload' element={<UploadNewsPage />} />
      <Route path='/user/settings' element={<UserSettingsPage />} />
      <Route path='/user/news/:id' element={<NewsDetailPage />} />
      <Route path='/admin/dashboard' element={<AdminDashboardPage />} />
      <Route path='/admin/update/:id' element={<UserUpdatePage/>} />
      <Route path="/admin/create-user" element={<CreateUserPage />} />
      <Route path="/graph/:newsId" element={<GraphVisualization />} />
    </Routes>
  </BrowserRouter>
  <ToastContainer />
  </>
)
