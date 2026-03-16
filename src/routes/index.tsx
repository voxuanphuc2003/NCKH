import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from '@/pages/Home'
import Login from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'
import OAuth2Callback from '@/pages/Auth/OAuth2Callback'
import Profile from '@/pages/Profile/Profile'
import UserDetail from '@/pages/Users/UserDetail'
import MyTrees from '@/pages/Trees/MyTrees'
import TreeDetailPage from '@/pages/Trees/TreeDetail'
import TreeGraph from '@/pages/Trees/TreeGraph'
import PersonsSearch from '@/pages/Persons/PersonsSearch'
import PersonDetailPage from '@/pages/Persons/PersonDetail'
import ShareGraph from '@/pages/Share/ShareGraph'

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('accessToken')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

const PublicOnly = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    return <Navigate to="/trees" replace />
  }
  return children
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/trees"
          element={
            <RequireAuth>
              <MyTrees />
            </RequireAuth>
          }
        />
        <Route
          path="/trees/:id"
          element={
            <RequireAuth>
              <TreeDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/trees/:id/graph"
          element={
            <RequireAuth>
              <TreeGraph />
            </RequireAuth>
          }
        />
        <Route
          path="/persons"
          element={
            <RequireAuth>
              <PersonsSearch />
            </RequireAuth>
          }
        />
        <Route
          path="/persons/:id"
          element={
            <RequireAuth>
              <PersonDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />
        <Route path="/auth/callback" element={<OAuth2Callback />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/users/:id"
          element={
            <RequireAuth>
              <UserDetail />
            </RequireAuth>
          }
        />
        <Route path="/share/graph" element={<ShareGraph />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Router>
  )
}
