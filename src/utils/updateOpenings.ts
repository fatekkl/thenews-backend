import { Env } from "../../worker-configuration";

async function updateOpenings(email: string, env: Env) {
  const query = "UPDATE users SET openings = openings + 1 WHERE email = ?;";
  
  try {
    const result = await env.D1_DB.prepare(query).bind(email).run();
    
    if (!result.success) {
      throw new Error("Erro ao tentar atualizar a base de dados");
    }
    
    return {
      success: true,
      data: { message: `As openings de ${email} foram incrementadas em +1` },
      code: 200,
    };
  } catch (error: any) {
    throw {
      success: false,
      data: { message: `Erro ao tentar atualizar a base de dados: ${error.message}` },
      code: 500,
    };
  }
}

export default updateOpenings;
