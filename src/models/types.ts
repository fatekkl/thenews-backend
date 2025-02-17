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
    id: string;
    email: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_channel: string;
}

export interface ApiResponse {
    success: boolean,
    data: Object,
    code: number
}

export interface LastOpenedResponse {
    success: boolean;
    last_open_date: string;
  }