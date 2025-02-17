import getAllUsers from "utils/getAllUsers";
import { Env } from "../../worker-configuration";


async function checkEmail(email: string, env: Env) {
    const allUsers = await getAllUsers(env);

    let repeated = false


    allUsers.forEach(x => {
        if (x.email == email) {
            repeated = true
        }
    })

    return repeated;
}


export default checkEmail