import { Post } from "../models/types";
import { Env } from "../../worker-configuration";

async function addPost(env: Env, resource_id: string): Promise<Post> {
  const query = `INSERT INTO posts (resource_id, created_at) VALUES (?, CURRENT_TIMESTAMP);
`

  try {
    const result = await env.D1_DB.prepare(query).bind(resource_id).run()

    if (!result.success) {
      throw "Erro ao inserir Post"
    }


    return {success: true, resource_id: resource_id}
  } catch (error) {
    console.error({ success: false, data: { message: `Erro ao inserir post: ${error.message}` }, code: 500 });
  }


}

export default addPost;
