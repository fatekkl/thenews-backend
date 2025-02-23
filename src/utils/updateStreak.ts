import getNow from "services/getNow";
import { Env } from "../../worker-configuration";
import differenceInDays from "services/differenceInDays";
import { countSundaysBetween } from "services/countSundaysBetween";

function calculateNewStreak(previousStreak: number, daysSinceLastOpened: number, sundaysCount: number): number {
  const activeGap = daysSinceLastOpened - sundaysCount;
  if (activeGap === 0) {
    return previousStreak;
  } else if (activeGap === 1) {
    return previousStreak + 1;
  } else {
    return 0;
  }
}

export default async function updateStreak(email: string, env: Env): Promise<{ success: boolean; streak: number; }> {
  try {
    
    const query = "SELECT last_open_date, streak FROM users WHERE email = ?;";
    const userData = await env.D1_DB.prepare(query).bind(email).first();
    if (!userData) {
      throw new Error(`Usuário ${email} não encontrado.`);
    }

    const lastOpened = userData.last_open_date;
    const previousStreak = userData.streak;

    const currentDate = getNow();
    const daysSinceLastOpened = differenceInDays(currentDate, lastOpened as string);
    const sundaysCount = countSundaysBetween(lastOpened as string, currentDate);

    const newStreak = calculateNewStreak(previousStreak as number, daysSinceLastOpened, sundaysCount);

    const updateQuery = `
      UPDATE users 
      SET streak = ?, last_open_date = CURRENT_TIMESTAMP
      WHERE email = ?;
    `;
    await env.D1_DB.prepare(updateQuery).bind(newStreak, email).run();

    return { success: true, streak: newStreak };
  } catch (error: any) {
    throw new Error(`Falha ao tentar atualizar streak de ${email}: ${error.message}`);
  }
}
