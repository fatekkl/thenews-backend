import { Post } from "../models/types";
import { Env } from "../../worker-configuration";
import getNow from "services/getNow";

async function addPost(env: Env, resource_id: string): Promise<Post> {
  const query = `INSERT INTO posts (resource_id, created_at) VALUES (?, ?);`
  const time = getNow()

  try {
    const result = await env.D1_DB.prepare(query).bind(resource_id, time ).run()

    if (!result.success) {
      throw "Erro ao inserir Post"
    }

    console.log("Post inserido na tabela com sucesso!!")

    return {success: true, resource_id: resource_id, created_at: time}
  } catch (error) {
   console.log({ success: false, data: { message: `Erro ao inserir post: ${error.message}` }, code: 500 });
  }


}

export default addPost;
