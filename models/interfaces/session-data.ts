import { HttpData } from "./http-data";
import { PageEvent } from "./event";

export interface SessionData {
    id: string;
    userId: string; // SessionId, token, fingerprint, etc
    appId: string;
    cookies: Record<string, string>;
    request?: HttpData;
    response?: HttpData;
    scriptHostUrl: string;
    url: string;
    startDate: number;
    endData?: number;
    lastActivityDate?: number;
    activityTimeFrames: number[];
    initialHtml: string;
    events: PageEvent[];
}