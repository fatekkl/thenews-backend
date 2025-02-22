import { Env } from "../../worker-configuration";
import { getStreak } from "./getStreak";

export default async function updateHigherStreak(email: string, env: Env): Promise<void> {
  try {
    const userStreak = await getStreak(email, env);
    if (!userStreak || typeof userStreak.streak !== "number") {
      console.error(`❌ Erro: Streak inválida para o usuário ${email}`);
      return;
    }
    
    const streakValue = userStreak.streak;
    const updateQuery = `
      UPDATE users 
      SET higher_streak = ? 
      WHERE email = ? AND (? > IFNULL(higher_streak, 0));
    `;
    const result = await env.D1_DB.prepare(updateQuery)
      .bind(streakValue, email, streakValue)
      .run();
      
    const changes = (result as any).changes as number | undefined;
    
    if (changes && changes > 0) {
      console.log(`✅ Maior streak atualizada para ${streakValue} para o usuário ${email}`);
    } else {
      console.log(`ℹ️ Streak atual (${streakValue}) não supera a maior streak registrada para o usuário ${email}.`);
    }
  } catch (error: any) {
    console.error(`❌ Erro ao atualizar higher_streak para ${email}:`, error);
  }
}
