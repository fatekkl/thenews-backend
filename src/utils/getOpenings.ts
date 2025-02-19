import { StreakResponse } from "models/types";
import { Env } from "../../worker-configuration";


export async function getOpenings(email: string, env: Env) {
  try {
    const row = await env.D1_DB
      .prepare("SELECT openings FROM users WHERE email = ?;")
      .bind(email)
      .first<{ openings: number }>();

    if (!row) {
      throw new Error(`Usuário ${email} não encontrado.`);
    }

    return { success: true, openings: row.openings};
  } catch (error: any) {
    throw new Error(`Falha ao tentar capturar last_open_date de ${email}: ${error.message}`);
  }
}