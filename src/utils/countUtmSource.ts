import { Env } from "../../worker-configuration";
import capitalizeFirstLetter from "services/capitalizeFirstLetter";

export default async function countUtmSource(env: Env, utms: string[]) {

    try {
        const utmsToMap = await Promise.all(
            utms.map(async (utm: string) => {
                const result = await env.D1_DB.prepare(
                    "SELECT COUNT(*) AS total FROM users WHERE utm_source = ?"
                ).bind(utm).all();
    
                return {
                    success: true,
                    name: capitalizeFirstLetter(utm),
                    counter: result.results[0].total
                };
            })
        );

        return utmsToMap

    } catch (error) {
        return (`Erro ao contar UTMS: ${error.message}`)
    }    

}
