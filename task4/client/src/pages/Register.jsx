import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        try {
            const res = await api.post('/auth/register', form)
            setSuccess(res.data.message)
            setForm({ name: '', email: '', password: '' })
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        }
    }

    return (
        <div className="container mt-5" style={{ maxWidth: 400 }}>
            <h2 className="mb-4">Register</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" name="name"
                           value={form.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className="form-control" name="email" type="email"
                           value={form.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input className="form-control" name="password" type="password"
                           value={form.password} onChange={handleChange} required />
                </div>
                <button className="btn btn-success w-100" type="submit">Register</button>
            </form>

            <div className="mt-3 text-center">
                <Link to="/login">Already have an account? Login</Link>
            </div>
        </div>
    )
}