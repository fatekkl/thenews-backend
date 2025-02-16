import { Post } from "../models/types";
import { Env } from "../../worker-configuration";

async function addPost(env: Env, resource_id: string): Promise<Post> {
  try {
    const query = `INSERT INTO posts (resource_id, created_at) VALUES (?, ?);`;

    // 📌 Ajustando a data para UTC-3
    const now = new Date();
    now.setHours(now.getHours() - 3); // 🔹 Ajusta para UTC-3
    const createdAt = now.toISOString().replace("T", " ").slice(0, 19); // Formato YYYY-MM-DD HH:MM:SS

    // 🚀 Executa a query no D1
    const result = await env.D1_DB.prepare(query).bind(resource_id, createdAt).run();

    if (!result.success) {
      throw new Error("Erro ao registrar post");
    }

    return {
      success: true,
      post_id: result.meta.last_row_id as number, // ID do post inserido
      resource_id,
      created_at: createdAt, // ✅ Agora a data está correta no fuso horário
    };
  } catch (error) {
    // 📌 Se for um erro de chave duplicada, buscamos o post existente
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      console.error("POST JÁ EXISTE:", resource_id);

      // 🔍 Buscamos o post existente para pegar `created_at`
      const existingPost = await env.D1_DB.prepare("SELECT id, created_at FROM posts WHERE resource_id = ?;")
        .bind(resource_id)
        .first<{ id: number; created_at: string }>(); // 🚀 Definimos o tipo corretamente

      if (!existingPost) {
        throw new Error("Erro ao buscar post existente.");
      }

      return {
        success: false,
        post_id: existingPost.id, // ✅ Agora `id` existe e não gera erro de tipo
        resource_id,
        created_at: existingPost.created_at, // ✅ Garantimos `created_at`
      };
    }

    throw new Error(`Erro ao registrar post: ${error}`);
  }
}

export default addPost;
