import { Post } from "../models/types";
import { Env } from "../../worker-configuration";

async function getAllPosts(env: Env) {
  try {
    const query = "SELECT * FROM posts";
    const result = await env.D1_DB.prepare(query).all();

    if (!result.success || !result.results) {
      throw new Error("Erro ao buscar posts");
    }

    return result.results
  } catch (error) {
    throw new Error(`Erro ao buscar posts: ${error}`);
  }
}

export default getAllPosts;
