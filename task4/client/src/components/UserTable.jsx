export default function UserTable({users}){

    return(

        <table className="table table-striped">

            <thead>

            <tr>

                <th>
                    <input type="checkbox"/>
                </th>

                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last login</th>

            </tr>

            </thead>

            <tbody>

            {users.map(u=>

                <tr key={u.id}>

                    <td>
                        <input type="checkbox"/>
                    </td>

                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.status}</td>
                    <td>{u.lastLogin}</td>

                </tr>

            )}

            </tbody>

        </table>

    )

}