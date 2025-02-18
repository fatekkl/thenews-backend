
import getAllUsers from "utils/getAllUsers";
import getAllPosts from "utils/getAllPosts";
import addPost from "utils/addPost";
import updateOpenings from "utils/updateOpenings";
import updateLastOpened from "utils/updateLastOpened";
import registerUser from "utils/addUser";
import { Route } from "models/types";
import { Env } from "../worker-configuration";
import checkEmail from "services/checkEmail";
import getNow from "services/getNow";
import updateStreak from "utils/updateStreak";
import getUtmSource from "utils/getUtmSource";
import countUtmSource from "utils/countUtmSource";

export const routes: Route[] = [

  {
    method: "get",
    path: "/",
    handler: async (request: Request, env: Env): Promise<Response> => {
      try {
        const url = new URL(request.url);
        const email = url.searchParams.get("email");
        const resource_id = url.searchParams.get("id");
        const utm_source = url.searchParams.get("utm_source") || "";
        const utm_medium = url.searchParams.get("utm_medium") || "";
        const utm_campaign = url.searchParams.get("utm_campaign") || "";
        const utm_channel = url.searchParams.get("utm_channel") || "";

        if (!email || !resource_id) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Os parâmetros 'email' e 'id' são obrigatórios.",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        console.log(
          `/ chamado com GET | email: ${email}, resource_id: ${resource_id}, utm_source: ${utm_source}, utm_medium: ${utm_medium}, utm_campaign: ${utm_campaign}, utm_channel: ${utm_channel}`
        );

        // ✅ Criamos ou verificamos se o post já existe
        const post = await addPost(env, resource_id);

        // ✅ Verificamos se o email já existe no banco
        const emailExists = await checkEmail(email, env)

        if (emailExists) {
          // 🔹 Se o email existe, atualizamos os dados do usuário
          const updatedOpenings = await updateOpenings(email, env);
          await updateStreak(email, env)
          await updateLastOpened(email, getNow(), env);

          return new Response(
            JSON.stringify({ success: true, data: { openings: updatedOpenings.data } }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } else {
          // 🔹 Se o email não existe, criamos o usuário
          const user = await registerUser(env, email, utm_source, utm_medium, utm_campaign, utm_channel);
          await updateStreak(email, env)

          return new Response(
            JSON.stringify({ user, post }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } catch (error) {
        console.error("Erro na rota /:", error);
        return new Response(
          JSON.stringify({ success: false, message: `Erro interno: ${error}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },
  },
  {
    method: "get",
    path: "/add_user",
    handler: async (request: Request, env: Env): Promise<Response> => {
      try {
        const url = new URL(request.url);
        const email = url.searchParams.get("email");

        // Validação do email utilizando regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "O parâmetro 'email' é obrigatório e deve ser válido."
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Parâmetros opcionais
        const utm_source = url.searchParams.get("utm_source") || "";
        const utm_medium = url.searchParams.get("utm_medium") || "";
        const utm_campaign = url.searchParams.get("utm_campaign") || "";
        const utm_channel = url.searchParams.get("utm_channel") || "";

        const result = await registerUser(env, email, utm_source, utm_medium, utm_campaign, utm_channel);

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, message: `Erro ao adicionar usuário: ${error}` }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
  },
  {
    method: "get",
    path: "/add_post",
    handler: async (request: Request, env: Env): Promise<Response> => {
      try {
        // 🚀 Pegamos os parâmetros da URL (Query Strings)
        const url = new URL(request.url);
        const email = url.searchParams.get("email");
        const resource_id = url.searchParams.get("id");

        // 🚨 Se `id` ou `email` estiverem vazios, retornamos um erro
        if (!resource_id || !email) {
          return new Response(
            JSON.stringify({ success: false, message: "Os parâmetros 'email' e 'id' são obrigatórios." }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // ✅ Chamamos `addPost` e inserimos o post no banco
        const result = await addPost(env, resource_id);

        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 409, // 409 = Conflito (caso o post já exista)
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, message: `Erro ao adicionar post: ${error}` }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
  },
  {
    method: "get",
    path: "/all_users",
    handler: async (request: Request, env: Env): Promise<Response> => {
      try {
        const users = await getAllUsers(env); // ✅ Agora passamos `env` corretamente
        return new Response(JSON.stringify({ success: true, data: users }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: unknown) {
        return new Response(
          JSON.stringify({ success: false, message: `Erro: ${error}` }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
  },
  {
    method: "get",
    path: "/all_posts",
    handler: async (request: Request, env: Env): Promise<Response> => {
      try {
        const posts = await getAllPosts(env);
        return new Response(JSON.stringify({ success: true, data: posts }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: unknown) {
        return new Response(
          JSON.stringify({ success: false, message: `Erro: ${error}` }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
  },
  {
    method: "get",
    path: "/test_db",
    handler: async (request: Request, env: Env): Promise<Response> => {
      try {
        const utms = (await getUtmSource(env)).result

        const result = await countUtmSource(env, utms)

        return new Response(JSON.stringify({ success: true, data: result }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
  },
  {
    method: "get",
    path: "/get_utm",
    handler: async (request: Request, env: Env): Promise<Response> => {
      try {

        const utms = (await getUtmSource(env)).result

        return new Response(
          JSON.stringify({ success: true, data: utms}),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, message: `Erro: ${error}` }),
          {
            status: 500, // 🔹 Agora o status está corretamente dentro do Response
            headers: { "Content-Type": "application/json" } // 🔹 Headers agora estão corretamente configurados
          }
        );
      }
    }
  }

];
