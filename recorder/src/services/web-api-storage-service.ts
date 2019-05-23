import { IRecorderStorageService } from "@models/interfaces/storage-service";
import { SessionData } from "@models/interfaces/session-data";
import { UserEvent } from "@models/interfaces/user-event";

export class WebApiStorageService implements IRecorderStorageService {

    async saveEvent(sessionId: string, event: UserEvent) {
        return true;
    }

    async saveEvents(sessionId: string, events: UserEvent[]) {
        return true;
    }

    async getSessions() {
        return {};
    }

    async deleteStore() {
        return true;
    }

    async saveSession(session: SessionData) {
        return true;
    }

    async createSession(session: SessionData) {
        
    }
}