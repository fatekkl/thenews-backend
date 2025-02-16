import getAllUsers from "../utils/getAllUsers";

async function checkEmail(email: string) {
    const allUsers = await getAllUsers();

    let repeated = false


    allUsers.forEach(x => {
        if (x.email == email) {
            repeated = true
        }
    })

    return repeated;
}


export default checkEmail