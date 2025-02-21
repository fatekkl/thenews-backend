import { StreakResponse } from "models/types";
import { Env } from "../../worker-configuration";


export async function getStreak(email: string, env: Env): Promise<StreakResponse> {

  const query = "SELECT streak FROM users WHERE email = ?;"
  try {
    const row = await env.D1_DB
      .prepare(query)
      .bind(email)
      .first<{ streak: number }>();

    if (!row) {
      throw new Error(`Usuário ${email} não encontrado.`);
    }

    return { success: true, streak: row.streak };
  } catch (error: any) {
    throw new Error(`Falha ao tentar capturar streak de ${email}: ${error.message}`);
  }
}