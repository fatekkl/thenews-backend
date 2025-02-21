import { User } from "models/types";
import { Env } from "../../worker-configuration";
import getNow from "services/getNow";

async function addUser(
    env: Env,
    email: string,
    utm_source: string,
    utm_medium: string,
    utm_campaign: string,
    utm_channel: string
): Promise<User> {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
        throw { success: false, data: "Email inválido", code: 400 };
    }

    const query = `
    INSERT INTO users (email, utm_source, utm_medium, utm_campaign, utm_channel, openings, streak, last_open_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
  `;


    const streak = 1
    const openings = 1

    try {
        const result = await env.D1_DB
            .prepare(query)
            .bind(email, utm_source, utm_medium, utm_campaign, utm_channel, openings, streak)
            .run();

        if (!result.success) {
            throw new Error("Erro ao inserir usuário");
        }

        return { success: true, email, utm_source,utm_medium,utm_campaign, utm_channel, openings, streak};
    } catch (error: any) {
        throw { success: false, data: { message: `Erro ao inserir usuário: ${error.message}` }, code: 500 };
    }
}

async function registerUser(
    env: Env,
    email: string,
    utm_source: string,
    utm_medium: string,
    utm_campaign: string,
    utm_channel: string
): Promise<User> {
    try {
        return await addUser(env, email, utm_source, utm_medium, utm_campaign, utm_channel);
    } catch (error) {
        throw error;
    }
}

export default registerUser;
