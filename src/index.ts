import { Env } from "../worker-configuration";
import { routes } from "./routes";

// 🚀 Substituímos `addEventListener` pelo `fetch` exportado corretamente
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  }
};

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  // Responde às requisições OPTIONS (para CORS, por exemplo)
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Rota de teste: /testing
  if (pathname === "/testing" && method === "GET") {
    return addCorsHeaders(
      new Response("Hello world", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }

  // Verifica se alguma rota do array 'routes' casa com o caminho e método da requisição
  for (const route of routes) {
    if (route.method.toUpperCase() === method && route.path === pathname) {
      try {
        // Passamos `env` corretamente para os handlers
        const result = await route.handler(request, env);

        if (result instanceof Response) {
          return addCorsHeaders(result);
        } else {
          return addCorsHeaders(
            new Response(JSON.stringify(result), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
      } catch (error) {
        return addCorsHeaders(
          new Response("Internal Server Error", { status: 500 })
        );
      }
    }
  }

  // Se nenhuma rota casar, retorna 404
  return addCorsHeaders(new Response("Not Found", { status: 404 }));
}

// Função para garantir que todas as respostas tenham cabeçalhos de CORS
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
