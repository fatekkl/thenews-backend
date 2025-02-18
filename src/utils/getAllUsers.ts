import { User } from "../models/types";
import { Env } from "../../worker-configuration";


async function getAllUsers(env: Env) {
    try {
        const query = "SELECT * FROM users";  // Query para pegar todos os usuários
        const result = await env.D1_DB.prepare(query).all();

        if (!result.success || !result.results) {
            throw new Error("Erro ao buscar usuários");
        }

        return result.results

    } catch (error) {
        throw new Error(`Erro ao buscar usuários: ${error}`);
    }
}

export default getAllUsers;
