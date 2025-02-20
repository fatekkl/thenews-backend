import { UtmResponse } from "models/types";
import { Env } from "../../worker-configuration";

export default async function getUtms(env: Env, utm: string): Promise<UtmResponse> {
  const query = `SELECT DISTINCT ${utm} FROM users`;

  // Executa a query
  const { results } = await env.D1_DB.prepare(query).all();

  // Acessando a chave dinamicamente com colchetes []
  const utmsList = results
    .map((row: Record<string, string | null>) => row[utm]?.trim()) // Usa row[utm] para acessar a coluna dinamicamente
    .filter((utmValue) => utmValue && utmValue.length > 0); // Remove valores null e strings vazias

  console.log(utmsList);
  return {
    success: true,
    result: utmsList, // Retorna no formato correto
  };
}
