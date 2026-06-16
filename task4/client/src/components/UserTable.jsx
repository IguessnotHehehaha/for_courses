function Icon({ name }) {
    return <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle' }}>{name}</span>
}

export default function UserTable({ users, selected, setSelected, sortBy, order, onSort }) {
    const allSelected = users.length > 0 && selected.length === users.length

    function toggleAll(e) {
        setSelected(e.target.checked ? users.map(u => u.id) : [])
    }

    function toggleOne(id) {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    function formatDate(date) {
        if (!date) return 'Never'
        return new Date(date).toLocaleString()
    }

    function statusBadge(status) {
        const colors = { active: 'success', blocked: 'danger', unverified: 'secondary' }
        return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status}</span>
    }

    function sortArrow(field) {
        if (sortBy !== field) return <Icon name="unfold_more" />
        return order === 'asc' ? <Icon name="arrow_upward" /> : <Icon name="arrow_downward" />
    }

    function SortTh({ field, children }) {
        return (
            <th
                onClick={() => onSort(field)}
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
            >
                {children}{sortArrow(field)}
            </th>
        )
    }

    return (
        <table className="table table-striped table-hover table-bordered align-middle">
            <thead className="table-dark">
            <tr>
                <th style={{ width: 40 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <SortTh field="name">Name</SortTh>
                <SortTh field="email">Email</SortTh>
                <SortTh field="status">Status</SortTh>
                <SortTh field="lastLogin">Last Login</SortTh>
            </tr>
            </thead>
            <tbody>
            {users.map(u => (
                <tr key={u.id} className={selected.includes(u.id) ? 'table-active' : ''}>
                    <td>
                        <input type="checkbox"
                               checked={selected.includes(u.id)}
                               onChange={() => toggleOne(u.id)} />
                    </td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{statusBadge(u.status)}</td>
                    <td>{formatDate(u.lastLogin)}</td>
                </tr>
            ))}
            {users.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center text-muted py-4">No users found</td>
                </tr>
            )}
            </tbody>
        </table>
    )
}