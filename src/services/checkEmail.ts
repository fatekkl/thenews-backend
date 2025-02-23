import { Env } from "../../worker-configuration";


async function checkEmail(email: string, env: Env) {
    const query = "SELECT 1 FROM users WHERE email = ? LIMIT 1;";
    const result = await env.D1_DB.prepare(query).bind(email).first();
    return !!result;
}


export default checkEmail