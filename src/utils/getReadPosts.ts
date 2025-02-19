import { Env } from "../../worker-configuration";



export default async function getReadPosts(email: string, env: Env) {
    const query = "SELECT read_posts FROM users WHERE email = ?;"

    const result = await env.D1_DB.prepare(query).bind(email).all()


    const readPostsParsed = JSON.parse(result.results[0].read_posts as string)

    return readPostsParsed
}