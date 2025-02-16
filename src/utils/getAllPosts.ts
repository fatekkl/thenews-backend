import { Post } from "../models/types";
import { Env } from "../../worker-configuration";

async function getAllPosts(env: Env): Promise<Post[]> {
  try {
    const query = "SELECT * FROM posts";
    const result = await env.D1_DB.prepare(query).all();

    if (!result.success || !result.results) {
      throw new Error("Erro ao buscar posts");
    }

    return result.results.map((row: Record<string, unknown>) => ({
      success: true,
      post_id: row.id as number, // mapeando "id" da tabela para "post_id"
      resource_id: row.resource_id as string,
      created_at: row.created_at as string,
    })) as Post[];
  } catch (error) {
    throw new Error(`Erro ao buscar posts: ${error}`);
  }
}

export default getAllPosts;
