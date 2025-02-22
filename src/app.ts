import { Hono } from "hono";
import { Env } from "../worker-configuration";
import { cors } from "hono/cors"; // Importando CORS

import getAllUsers from "utils/getAllUsers";
import getAllPosts from "utils/getAllPosts";
import addPost from "utils/addPost";
import updateOpenings from "utils/updateOpenings";
import updateLastOpened from "utils/updateLastOpened";
import registerUser from "utils/addUser";
import checkEmail from "services/checkEmail";
import getNow from "services/getNow";
import updateStreak from "utils/updateStreak";
import addReadPost from "utils/addReadPost";
import getReadPosts from "utils/getReadPosts";
import { getStreak } from "utils/getStreak";
import { getOpenings } from "utils/getOpenings";
import getUtms from "utils/getUtm";
import countUtms from "utils/countUtm";
import { getUser } from "utils/getUser";
import updateHigherStreak from "utils/updateHigherStreak";
import { getHigherStreak } from "utils/getHigherStreak";

// Criamos o app Hono
const app = new Hono<{ Bindings: Env }>();

// Cache do Cloudflare
const cache = caches.default;

// Middleware de CORS
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

async function handleCache(c: any, handler: Function) {
  const cacheKey = new Request(c.req.url);
  let cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    console.log(`✅ [${c.req.path}] Cache HIT - Servindo do cache.`);
    return cachedResponse;
  }

  console.log(`❌ [${c.req.path}] Cache MISS - Processando...`);
  const data = await handler(c);

  // Somente cachear se não houver erro
  if (data.status === 200) {
    cache.put(cacheKey, data.clone());
    console.log(`✅ [${c.req.path}] Cache SAVE - Resposta armazenada.`);
  }

  return data;
}

// ROTA "/"
app.get("/", async (c) =>
  handleCache(c, async () => {
    const url = new URL(c.req.url);
    const email = url.searchParams.get("email");
    const resource_id = url.searchParams.get("id");

    if (!email || !resource_id) {
      return c.json(
        { success: false, message: "Os parâmetros 'email' e 'id' são obrigatórios." },
        400
      );
    }

    const env = c.env;
    const post = await addPost(env, resource_id);
    const emailExists = await checkEmail(email, env);

    if (emailExists) {
      const updatedOpenings = await updateOpenings(email, env);
      await updateStreak(email, env);
      await updateHigherStreak(email, env)
      await updateLastOpened(email, getNow(), env);
      await addReadPost(email, resource_id, env);

      return c.json({ success: true, data: { openings: updatedOpenings.data } });
    } else {
      const user = await registerUser(env, email, "", "", "", "");
      await updateStreak(email, env);
      await updateHigherStreak(email, env)
      await addReadPost(email, resource_id, env);

      return c.json({ success: true, user, post });
    }
  })
);

// ROTA "/add_user"
app.get("/add_user", async (c) =>
  handleCache(c, async () => {
    const email = c.req.query("email");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || !emailRegex.test(email)) {
      return c.json(
        { success: false, message: "O parâmetro 'email' é obrigatório e deve ser válido." },
        400
      );
    }

    const env = c.env;
    const result = await registerUser(env, email, "", "", "", "");
    return c.json({ success: true, result });
  })
);

// ROTA "/all_users"
app.get("/all_users", async (c) =>
  handleCache(c, async () => {
    const users = await getAllUsers(c.env);
    return c.json({ success: true, data: users });
  })
);

// ROTA "/all_posts"
app.get("/all_posts", async (c) =>
  handleCache(c, async () => {
    const posts = await getAllPosts(c.env);
    return c.json({ success: true, data: posts });
  })
);

// ROTA "/get_streak"
app.get("/get_streak", async (c) =>
  handleCache(c, async () => {
    const email = c.req.query("email");
    if (!email) {
      return c.json(
        { success: false, message: "O parâmetro 'email' é obrigatório." },
        400
      );
    }
    const streak = (await getStreak(email, c.env)).streak;
    return c.json({ success: true, data: streak });
  })
);

// ROTA "/get_openings"
app.get("/get_openings", async (c) =>
  handleCache(c, async () => {
    const email = c.req.query("email");
    if (!email) {
      return c.json(
        { success: false, message: "O parâmetro 'email' é obrigatório." },
        400
      );
    }
    const openings = (await getOpenings(email, c.env)).openings;
    return c.json({ success: true, data: openings });
  })
);

// ROTA "/get_readPosts"
app.get("/get_readPosts", async (c) =>
  handleCache(c, async () => {
    const email = c.req.query("email");
    if (!email) {
      return c.json(
        { success: false, message: "O parâmetro 'email' é obrigatório." }, 400
      );
    }
    const readPosts = await getReadPosts(email, c.env);
    return c.json({ success: true, data: readPosts });
  })
);

// ROTA "/get_utm"
app.get("/get_utm", async (c) =>
  handleCache(c, async () => {
    const utm_name = c.req.query("utm_name");
    if (!utm_name) {
      return c.json(
        { success: false, message: "O parâmetro 'utm_name' é obrigatório." },
        400
      );
    }

    const env = c.env;
    const utmsName = (await getUtms(env, utm_name)).result;
    const utmsCount = await countUtms(env, utmsName, utm_name);

    return c.json({ success: true, data: utmsCount });
  })
);

app.get("/get_user", async (c) =>
  handleCache(c, async () => { // Adicionado return para garantir a resposta
    try {
      const emailInput = c.req.query("email");

      if (!emailInput) {
        console.error("❌ Erro: Email não foi fornecido.");
        return c.json(
          { success: false, message: "O parâmetro 'email' é obrigatório." },
          400
        );
      }

      const env = c.env;
      const email = await getUser(emailInput, env);

      return c.json({ success: true, data: email });
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error);
      return c.json(
        { success: false, message: "Erro interno no servidor." },
        500
      );
    }
  })
);

app.get("get_higher_streak", async (c) =>
  handleCache(c, async () => {
    try {
      const emailInput = c.req.query("email")

      if (!emailInput) {
        console.error("❌ Erro: Email não foi fornecido.");
        return c.json(
          { success: false, message: "O parâmetro 'email' é obrigatório." },
          400
        );
      }

      const env = c.env

      const higherStreak = await getHigherStreak(emailInput, env)

      return c.json({success: true, data: higherStreak});
    } catch (error) {
      console.error("❌ Erro ao buscar higherStreak:", error)
    }
  })
)

// Exporta o app Hono
export default app;
