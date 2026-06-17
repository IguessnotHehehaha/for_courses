import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Users from './pages/Users'

function RedirectHandler() {
    const navigate = useNavigate()
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect')
        if (redirect) navigate(redirect, { replace: true })
    }, [])
    return null
}

export default function App() {
    return (
        <BrowserRouter>
            <RedirectHandler />
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/users" element={<Users />} />
            </Routes>
        </BrowserRouter>
    )
}