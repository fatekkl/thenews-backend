import { User } from "../models/types";
import { Env } from "../../worker-configuration";


async function getAllUsers(env: Env): Promise<User[]> {
    try {
        const query = "SELECT * FROM users";  // Query para pegar todos os usuários
        const result = await env.D1_DB.prepare(query).all();

        if (!result.success || !result.results) {
            throw new Error("Erro ao buscar usuários");
        }

        // 🚀 Agora informamos ao TypeScript que cada `row` tem o formato esperado
        return result.results.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            email: row.email as string,
            utm_source: row.utm_source as string,
            utm_medium: row.utm_medium as string,
            utm_campaign: row.utm_campaign as string,
            utm_channel: row.utm_channel as string
        }));

    } catch (error) {
        throw new Error(`Erro ao buscar usuários: ${error}`);
    }
}

export default getAllUsers;
