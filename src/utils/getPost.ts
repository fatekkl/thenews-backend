import { Env } from "../../worker-configuration";

export async function getPost(resource_id: string, env: Env) {

  const query = "SELECT resource_id FROM posts WHERE resource_id = ?;"

  try {
    const result = await env.D1_DB
      .prepare(query)
      .bind(resource_id)
      .first()

    if (!result ) {
      throw new Error(`Post ${resource_id} não encontrado.`);
    }

    return result.resource_id
  } catch (error: any) {
    throw new Error(`Falha ao tentar capturar ${resource_id}: ${error.message}`);
  }
}