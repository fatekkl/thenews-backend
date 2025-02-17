import { StreakResponse } from "models/types";
import { Env } from "../../worker-configuration";


export async function getStreak(email: string, env: Env): Promise<StreakResponse> {
  try {
    const row = await env.D1_DB
      .prepare("SELECT streak FROM users WHERE email = ?;")
      .bind(email)
      .first<{ streak: number }>();

    if (!row) {
      throw new Error(`Usuário ${email} não encontrado.`);
    }

    return { success: true, streak: row.streak };
  } catch (error: any) {
    throw new Error(`Falha ao tentar capturar last_open_date de ${email}: ${error.message}`);
  }
}