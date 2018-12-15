import { EventData } from "./event-data";
import { SessionData } from "./session-data";

export interface IStorageService {
    saveEvent(sessionId: string, event: EventData): Promise<boolean>;
    saveEvents(sessionId, string, events: EventData[]): Promise<boolean>;
    saveSession(session: SessionData): Promise<boolean>;
}