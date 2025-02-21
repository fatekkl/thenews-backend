import { Env } from "../../worker-configuration";
import { LastOpenedResponse } from "models/types";


export async function getLastOpened(email: string, env: Env): Promise<LastOpenedResponse> {
  
  const query = "SELECT last_open_date FROM users WHERE email = ?;"

  try {
    const result = await env.D1_DB
      .prepare(query)
      .bind(email)
      .first<{ last_open_date: string }>();

    if (!result) {
      throw new Error(`Usuário ${email} não encontrado.`);
    }

    return { success: true, last_open_date: result.last_open_date };
  } catch (error: any) {
    throw new Error(`Falha ao tentar capturar last_open_date de ${email}: ${error.message}`);
  }
}
