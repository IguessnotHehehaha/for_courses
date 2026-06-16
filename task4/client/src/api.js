import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    withCredentials: true
})

api.interceptors.response.use(
    res => res,
    err => {
        const url = err.config?.url || ''
        const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register')
        const isMeCheck = url.includes('/auth/me')

        if (isMeCheck && (err.response?.status === 401 || err.response?.status === 403)) {
            window.location.href = '/login'
            return Promise.reject(err)
        }

        if (!isAuthCall && !isMeCheck && (err.response?.status === 401 || err.response?.status === 403)) {
            window.location.href = '/login?reason=blocked'
        }

        return Promise.reject(err)
    }
)

export default api