import { Env } from "../../worker-configuration";

export type Route = {
    method: string;
    path: string;
    handler: (request: Request, env: Env) => Promise<Response>;
};

export interface Post {
    success: boolean;
    post_id: number;
    resource_id: string;
    created_at: string;

    // outros campos, se houver
  }
  
export interface User {
    success: boolean;
    email: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_channel: string;
    openings: number;
    streak: number
    last_open_date: string
}


export interface LastOpenedResponse {
    success: boolean;
    last_open_date: string;
}

export interface StreakResponse {
    success: boolean,
    streak: number
}

export interface UtmSourceResponse {
    success: boolean,
    result: string[]
}