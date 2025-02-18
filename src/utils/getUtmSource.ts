import { UtmSourceResponse } from "models/types";
import { Env } from "../../worker-configuration";

export default async function getUtmSource(env: Env): Promise<UtmSourceResponse> {
  // Query para obter todos os utm_source distintos
  const query = "SELECT DISTINCT utm_source FROM users";

  // Executa a query
  const { results } = await env.D1_DB.prepare(query).all();

  const utmSourcesList = results
    .map((row: { utm_source: string | null }) => row.utm_source?.trim())
    .filter((utm) => utm && utm.length > 0)
   ;

  return {
    success: true,
    result: utmSourcesList, // Retorna no formato correto
  };
}
