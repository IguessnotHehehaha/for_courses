import {Link} from "react-router-dom";

export default function Register(){

    return(
        <div className="container mt-5" style={{maxWidth:500}}>

            <h2>Register</h2>

            <form>

                <div className="mb-3">
                    <label>Name</label>
                    <input className="form-control"/>
                </div>

                <div className="mb-3">
                    <label>Email</label>
                    <input className="form-control"/>
                </div>

                <div className="mb-3">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                    />
                </div>

                <button className="btn btn-success w-100">
                    Register
                </button>

            </form>

            <div className="mt-3">
                <Link to="/login">
                    Back to login
                </Link>
            </div>

        </div>
    )
}