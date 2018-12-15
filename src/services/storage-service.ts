import { IStorageService } from "../models/interfaces/storage-service";
import { SessionData } from "../models/interfaces/session-data";
import { EventData } from "../models/interfaces/event-data";
import { LocalStorageUtilities } from "../utilities/local-storage";

export class LocalStorageService implements IStorageService {

    constructor(private _key: string = 'UX_RECORDER_STORAGE_SERVICE_DATA') {}

    async saveEvent(sessionId: string, event: EventData) {
        return true;
    }

    async saveEvents(sessionId: string, events: EventData[]) {
        return true;
    }

    async getSessions() {
        return LocalStorageUtilities.get<SessionData>(this._key);
    }

    async deleteStore() {
        return LocalStorageUtilities.delete(this._key);
    }

    async saveSession(session: SessionData) {
        return LocalStorageUtilities.store(this._key, session, session.id, (newData, oldData) => {
            newData.events = oldData.events.concat(newData.events);
            return newData;
        });
    }
}