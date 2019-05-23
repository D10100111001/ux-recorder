import { HttpData } from "./http-data";
import { ConsoleLog } from "./console-log";
import { UserEvent } from "./user-event";
import { RenderEvent } from "./render-event";
import { PageEvent } from "./event";

export interface SessionData {
    id: string;
    userId: string; // SessionId, token, fingerprint, etc
    appId: string;
    cookies: Record<string, string>;
    request?: HttpData;
    response?: HttpData;
    consoleLogs?: ConsoleLog[];
    scriptHostUrl: string;
    url: string;
    startDate: number;
    endData?: number;
    lastActivityDate?: number;
    activityTimeFrames: number[];
    initialHtml: string;
    events: PageEvent[];
}