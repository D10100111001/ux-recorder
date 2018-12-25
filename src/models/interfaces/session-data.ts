import { HttpData } from "./http-data";
import { ConsoleLog } from "./console-log";
import { EventData } from "./event-data";

export interface SessionData {
    id: string;
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
    events: EventData[];
}