import getNow from "services/getNow";
import { getLastOpened } from "./getLastOpened";
import { Env } from "../../worker-configuration";
import differenceInDays from "services/differenceInDays";
import { getStreak } from "./getStreak";
import { StreakResponse } from "models/types";
import { countSundaysBetween } from "services/countSundaysBetween";



export default async function updateStreak(email: string, env: Env): Promise<StreakResponse> {

    try {
        const currentDate = getNow();

        const userData = await getLastOpened(email, env);
        const lastOpened = userData.last_open_date;
        const previousStreak = (await getStreak(email, env)).streak

        const totalDiff = differenceInDays(currentDate, lastOpened);
        const sundaysCount = countSundaysBetween(lastOpened, currentDate);
        const activeGap = totalDiff - sundaysCount;

        console.log(`last_open_date: ${lastOpened}`);
        console.log(`currentDate: ${currentDate}`);
        console.log(`totalDiff: ${totalDiff}, sundaysCount: ${sundaysCount}, activeGap: ${activeGap}`);

        let newStreak = 1;

        if (activeGap === 0) {
            newStreak = previousStreak;
        } else if (activeGap === 1) {
            newStreak = previousStreak + 1;
        } else {
            newStreak = 0;
        }

        return {success: true, streak: newStreak }
    } catch (error: any) {
        throw new Error(`Falha ao tentar capturar streak de ${email}: ${error.message}`);
    }
}
