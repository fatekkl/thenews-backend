import safeJSONParse from "services/safeJsonParse";
import { Env } from "../../worker-configuration";



export default async function getReadPosts(email: string, env: Env) {

    try {
        const query = "SELECT read_posts FROM users WHERE email = ?;"

        const result = await env.D1_DB.prepare(query).bind(email).all()


        const readPostsParsed = safeJSONParse(result.results[0].read_posts as string, [])

        return readPostsParsed
    } catch (error) {
        throw new Error(`Falha ao tentar capturar readPosts de ${email}: ${error.message}`);
        
    }


}