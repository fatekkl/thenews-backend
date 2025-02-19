import getNow from "services/getNow";
import { Env } from "../../worker-configuration";
import { getPost } from "./getPost";

export default async function addReadPost(email: string, resource_id: string, env: Env) {
    try {
        // Verifica se o post existe no banco
        const post = await getPost(resource_id, env);
        if (!post) {
            throw new Error(`Post ${resource_id} não encontrado.`);
        }

        // Busca o read_posts atual do usuário
        const userQuery = await env.D1_DB
            .prepare("SELECT read_posts FROM users WHERE email = ?;")
            .bind(email)
            .first();

        let readPosts: any[] = [];

        // Se existir read_posts e for uma string, convertemos para JSON
        if (userQuery && typeof userQuery.read_posts === "string") {
            try {
                readPosts = JSON.parse(userQuery.read_posts);
            } catch (e) {
                console.error("Erro ao analisar JSON de read_posts:", e);
            }
        }

        // Adiciona o novo postId apenas se ainda não estiver no array
        if (!readPosts.some(post => post.postId === resource_id)) {
            readPosts.push({ postId: resource_id, created_at: getNow() });

            // Atualiza o banco de dados com o novo JSON
            await env.D1_DB.prepare(
                "UPDATE users SET read_posts = ? WHERE email = ?;"
            )
            .bind(JSON.stringify(readPosts), email)
            .run();
        }

        return { success: true, message: `Post ${resource_id} adicionado ao read_posts de ${email}.` };
    } catch (error: any) {
        throw new Error(`Erro ao adicionar post lido: ${error.message}`);
    }
}
