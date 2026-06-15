import {Link} from "react-router-dom";

export default function Login(){

    return(
        <div className="container mt-5" style={{maxWidth:500}}>

            <h2 className="mb-4">
                Login
            </h2>

            <form>

                <div className="mb-3">
                    <label>Email</label>
                    <input
                        className="form-control"
                        type="email"
                    />
                </div>

                <div className="mb-3">
                    <label>Password</label>
                    <input
                        className="form-control"
                        type="password"
                    />
                </div>

                <button className="btn btn-primary w-100">
                    Login
                </button>

            </form>

            <div className="mt-3">
                <Link to="/register">
                    Register
                </Link>
            </div>

        </div>
    )
}