import { Env } from "../../worker-configuration";
import { getStreak } from "./getStreak";

export default async function updateHigherStreak(email: string, env: Env) {
    try {
        // Obtém a streak atual do usuário
        const userStreak = await getStreak(email, env);

        if (!userStreak || typeof userStreak.streak !== "number") {
            console.error(`❌ Erro: Streak inválida para o usuário ${email}`);
            return;
        }

        // Obtém a maior streak registrada até agora (higher_streak)
        const query = "SELECT higher_streak FROM users WHERE email = ?;";
        const result = await env.D1_DB.prepare(query).bind(email).first();

        if (!result || typeof result.higher_streak !== "number") {
            console.error(`⚠️ Usuário ${email} não tem higher_streak registrada. Criando...`);
            await env.D1_DB.prepare("UPDATE users SET higher_streak = ? WHERE email = ?;")
                .bind(userStreak.streak, email)
                .run();
            return;
        }

        const { higher_streak } = result;

        // Se a streak atual for maior que a higher_streak, atualiza no banco
        if (userStreak.streak > higher_streak) {
            await env.D1_DB.prepare("UPDATE users SET higher_streak = ? WHERE email = ?;")
                .bind(userStreak.streak, email)
                .run();
            console.log(`✅ Maior streak atualizada para ${userStreak.streak} para o usuário ${email}`);
        } else {
            console.log(`ℹ️ Streak atual (${userStreak.streak}) não supera a maior streak registrada (${higher_streak}).`);
        }
    } catch (error) {
        console.error(`❌ Erro ao atualizar higher_streak para ${email}:`, error);
    }
}
