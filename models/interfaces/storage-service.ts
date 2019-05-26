import { SessionData } from "./session-data";
import { PageEvent } from "./event";

export interface IRecorderStorageService {
    saveEvent(sessionId: string, event: PageEvent): Promise<boolean>;
    saveEvents(sessionId, string, events: PageEvent[]): Promise<boolean>;
    getSessions(): Promise<Record<string, SessionData>>;
    saveSession(session: SessionData): Promise<boolean>;
    deleteStore(): Promise<boolean>;
    createSession(session: SessionData): Promise<boolean>;
}