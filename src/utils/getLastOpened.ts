import { Env } from "../../worker-configuration";
import { LastOpenedResponse } from "models/types";


export async function getLastOpened(email: string, env: Env): Promise<LastOpenedResponse> {
  try {
    const row = await env.D1_DB
      .prepare("SELECT last_open_date FROM users WHERE email = ?;")
      .bind(email)
      .first<{ last_open_date: string }>();

    if (!row) {
      throw new Error(`Usuário ${email} não encontrado.`);
    }

    return { success: true, last_open_date: row.last_open_date };
  } catch (error: any) {
    throw new Error(`Falha ao tentar capturar last_open_date de ${email}: ${error.message}`);
  }
}
