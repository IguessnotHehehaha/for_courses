import Toolbar from "../components/Toolbar";
import UserTable from "../components/UserTable";

export default function Users(){


    const users=[
        {
            id:1,
            name:"Alice",
            email:"alice@test.com",
            status:"active",
            lastLogin:"2025-07-01"
        },
        {
            id:2,
            name:"Bob",
            email:"bob@test.com",
            status:"blocked",
            lastLogin:"2025-06-30"
        }
    ]

    return(

        <div className="container mt-4">

            <h2>
                Users
            </h2>

            <Toolbar/>

            <UserTable users={users}/>

        </div>

    )

}