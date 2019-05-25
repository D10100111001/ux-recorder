import { HttpData } from "./http-data";
import { PageEvent } from "./event";
import { Point } from "./point";

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
    endDate?: number;
    lastActivityDate?: number;
    activityTimeFrames: number[];
    initialHtml: string;
    screenSize: Screen;
    events: PageEvent[];
}