import getNow from "services/getNow";
import { Env } from "../../worker-configuration";
import { getPost } from "./getPost";
import { ReadPost } from "models/types";
import safeJSONParse from "services/safeJsonParse";





export default async function addReadPost(email: string, resource_id: string, env: Env): Promise<{ success: boolean; message: string; }> {
  try {
    // Verifica se o post existe no banco
    const post = await getPost(resource_id, env);
    if (!post) {
      throw new Error(`Post ${resource_id} não encontrado.`);
    }

    // Busca o read_posts atual do usuário
    const query = "SELECT read_posts FROM users WHERE email = ?;";
    const userQuery = await env.D1_DB.prepare(query).bind(email).first();

    // Se read_posts não existir ou não for uma string, usamos array vazio
    let readPosts: ReadPost[] = [];
    if (userQuery && typeof userQuery.read_posts === "string") {
      readPosts = safeJSONParse<ReadPost[]>(userQuery.read_posts, []);
    }

    // Adiciona o novo postId somente se ainda não estiver presente
    const exists = readPosts.some((item) => item.postId === resource_id);
    if (!exists) {
      readPosts.push({ postId: resource_id, created_at: getNow() });

      // Atualiza o banco de dados com o novo JSON
      const updateQuery = "UPDATE users SET read_posts = ? WHERE email = ?;";
      await env.D1_DB.prepare(updateQuery)
        .bind(JSON.stringify(readPosts), email)
        .run();

      console.log(`✅ Post ${resource_id} adicionado ao read_posts de ${email}.`);
    } else {
      console.log(`ℹ️ Post ${resource_id} já existe em read_posts de ${email}.`);
    }

    return { success: true, message: `Post ${resource_id} processado para ${email}.` };
  } catch (error: any) {
    throw new Error(`Erro ao adicionar post lido: ${error.message}`);
  }
}
