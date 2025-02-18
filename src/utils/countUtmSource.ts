import { UtmSourceResponse } from "models/types";
import { Env } from "../../worker-configuration";

export default async function countUtmSource(env: Env, utms: string[]) {

    try {
        const utms_counter = await Promise.all(
            utms.map(async (utm: string) => {
                const result = await env.D1_DB.prepare(
                    "SELECT COUNT(*) AS total FROM users WHERE utm_source = ?"
                ).bind(utm).all();
    
                return {
                    success: true,
                    name: utm,
                    counter: result.results[0].total
                };
            })
        );

        return { success: true, results: utms_counter };

    } catch (error) {
        return (`Erro ao contar UTMS: ${error.message}`)
    }    

}
