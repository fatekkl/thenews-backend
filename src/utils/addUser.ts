import { ApiResponse } from "../models/types";
import { Env } from "../../worker-configuration";

async function addUser(
    env: Env,
    email: string,
    utm_source: string,
    utm_medium: string,
    utm_campaign: string,
    utm_channel: string
): Promise<ApiResponse> {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
        throw { success: false, data: "Email inválido", code: 400 };
    }

    const query = `
    INSERT INTO users (email, utm_source, utm_medium, utm_campaign, utm_channel, openings)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

    try {
        const result = await env.D1_DB
            .prepare(query)
            .bind(email, utm_source, utm_medium, utm_campaign, utm_channel, 1)
            .run();

        if (!result.success) {
            throw new Error("Erro ao inserir usuário");
        }

        console.log("Usuário inserido na tabela com sucesso!");
        return { success: true, data: { email, utm_source, utm_medium, utm_campaign, utm_channel }, code: 201 };
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
): Promise<ApiResponse> {
    try {
        return await addUser(env, email, utm_source, utm_medium, utm_campaign, utm_channel);
    } catch (error) {
        throw error;
    }
}

export default registerUser;
