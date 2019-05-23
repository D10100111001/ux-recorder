import { UserEvent } from "./user-event";
import { SessionData } from "./session-data";

export interface IRecorderStorageService {
    saveEvent(sessionId: string, event: UserEvent): Promise<boolean>;
    saveEvents(sessionId, string, events: UserEvent[]): Promise<boolean>;
    getSessions(): Promise<Record<string, SessionData>>;
    saveSession(session: SessionData): Promise<boolean>;
    deleteStore(): Promise<boolean>;
}