import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        if (searchParams.get('verified') === 'true')
            setSuccess('Email verified successfully! You can now log in.')
        if (searchParams.get('reason') === 'blocked')
            setError('Your account has been blocked or deleted. Please contact an administrator.')
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        try {
            const res = await api.post('/auth/login', { email, password })
            localStorage.setItem('token', res.data.token)
            navigate('/users')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
        }
    }

    return (
        <div className="container mt-5" style={{ maxWidth: 400 }}>
            <h2 className="mb-4">Login</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email"
                           value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password"
                           value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-primary w-100" type="submit">Login</button>
            </form>

            <div className="mt-3 text-center">
                <Link to="/register">Don't have an account? Register</Link>
            </div>
        </div>
    )
}