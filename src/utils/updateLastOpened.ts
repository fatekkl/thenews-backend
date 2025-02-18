import { Env } from "../../worker-configuration";

async function updateLastOpened(email: string, date: string, env: Env) {
  const query = "UPDATE users SET last_open_date = ? WHERE email = ?";
  
  try {
    const result = await env.D1_DB.prepare(query).bind(date, email).run();

    if (!result.success) {
      throw new Error("A atualização não foi realizada com sucesso.");
    }

    return { 
      success: true, 
      data: `${date} é a última data aberta do usuário ${email}`, 
      code: 200 
    };
  } catch (error: any) {
    throw new Error(`Erro ao registrar atualizar a última data do usuário ${email}: ${error.message}`);
  }
}

export default updateLastOpened;
