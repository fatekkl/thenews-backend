

export default function safeJsonParse<T>(data: string, fallback: T): T {
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error("Erro ao analisar JSON", e);
    return fallback;
  }
}