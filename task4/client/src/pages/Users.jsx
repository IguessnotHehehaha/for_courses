import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Toolbar from '../components/Toolbar'
import UserTable from '../components/UserTable'

export default function Users() {
    const [users, setUsers] = useState([])
    const [selected, setSelected] = useState([])
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const [sortBy, setSortBy] = useState('lastLogin')
    const [order, setOrder] = useState('desc')

    const navigate = useNavigate()

    useEffect(() => {
        api.get('/auth/me')
            .then(() => fetchUsers())
            .catch(() => navigate('/login'))
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [sortBy, order])

    async function fetchUsers() {
        try {
            const res = await api.get(`/users?sortBy=${sortBy}&order=${order}`)
            setUsers(res.data)
        } catch (err) {
            setError('Failed to load users')
        }
    }

    function handleSort(field) {
        if (field === sortBy) {
            setOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setOrder('desc')
        }
    }

    async function handleAction(action) {
        setMessage('')
        setError('')
        try {
            if (action === 'block')
                await api.patch('/users/block', { ids: selected })
            else if (action === 'unblock')
                await api.patch('/users/unblock', { ids: selected })
            else if (action === 'delete')
                await api.delete('/users', { data: { ids: selected } })
            else if (action === 'deleteUnverified')
                await api.delete('/users/unverified')

            setSelected([])
            await fetchUsers()
            setMessage('Action completed successfully')
        } catch (err) {
            setError(err.response?.data?.error || 'Action failed')
        }
    }

    async function handleLogout() {
        await api.post('/auth/logout')
        navigate('/login')
    }

    return (
        <div>
            <nav className="navbar navbar-dark bg-dark px-4 mb-4">
                <span className="navbar-brand fw-bold">User Management</span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            <div className="container">
                {message && (
                    <div className="alert alert-success alert-dismissible">
                        {message}
                        <button className="btn-close" onClick={() => setMessage('')} />
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger alert-dismissible">
                        {error}
                        <button className="btn-close" onClick={() => setError('')} />
                    </div>
                )}

                <Toolbar selected={selected} onAction={handleAction} />
                <UserTable
                    users={users}
                    selected={selected}
                    setSelected={setSelected}
                    sortBy={sortBy}
                    order={order}
                    onSort={handleSort}
                />
            </div>
        </div>
    )
}