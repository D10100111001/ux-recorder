import { HttpMethod } from "../http-method";

export interface HttpData {
    headers: Record<string, string>;
    cookies: Record<string, string>;
    url: string;
    method: HttpMethod;
    body: string;
    contentType?: string;
    date?: string;
    processedBody?: string;
}