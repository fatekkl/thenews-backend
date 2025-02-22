import { Env } from "../../worker-configuration";

export async function getHigherStreak(email: string, env: Env) {

  const query = "SELECT higher_streak FROM users WHERE email = ?;"

  try {
    const result = await env.D1_DB
      .prepare(query)
      .bind(email)
      .first()

    if (!result ) {
      throw new Error(`Usuário: ${email} não encontrado.`);
    }

    return result.higher_streak
  } catch (error: any) {
    throw new Error(`Falha ao tentar capturar ${email}: ${error.message}`);
  }
}