export default function Toolbar(){

    return(

        <div className="mb-3 d-flex gap-2">

            <button className="btn btn-warning">
                Block
            </button>

            <button className="btn btn-success">
                Unblock
            </button>

            <button className="btn btn-danger">
                Delete
            </button>

            <button className="btn btn-secondary">
                Delete unverified
            </button>

        </div>

    )

}