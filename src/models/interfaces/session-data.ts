import { HttpData } from "./http-data";
import { ConsoleLog } from "./console-log";
import { EventData } from "./event-data";

export interface SessionData {
    id: string;
    cookies: Record<string, string>;
    request?: HttpData;
    response?: HttpData;
    consoleLogs?: ConsoleLog[];
    url: URL;
    startDate: number;
    endData?: number;
    activityTimeFrames: number[];
    initialHtml: string;
    events: EventData[];
}