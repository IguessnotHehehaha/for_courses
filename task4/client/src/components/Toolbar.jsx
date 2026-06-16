function Icon({ name }) {
    return <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle' }}>{name}</span>
}

export default function Toolbar({ selected, onAction }) {
    const hasSelection = selected.length > 0

    return (
        <div className="d-flex gap-2 mb-3 p-2 border rounded bg-light">

            <button className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                    disabled={!hasSelection}
                    onClick={() => onAction('block')}
                    title="Block selected users">
                <Icon name="lock" /> Block
            </button>

            <button className="btn btn-success btn-sm"
                    disabled={!hasSelection}
                    onClick={() => onAction('unblock')}
                    title="Unblock selected users">
                <Icon name="lock_open_right" />
            </button>

            <button className="btn btn-danger btn-sm"
                    disabled={!hasSelection}
                    onClick={() => onAction('delete')}
                    title="Delete selected users">
                <Icon name="delete" />
            </button>

            <button className="btn btn-secondary btn-sm"
                    onClick={() => onAction('deleteUnverified')}
                    title="Delete all unverified users">
                <Icon name="cleaning_services" />
            </button>

        </div>
    )
}