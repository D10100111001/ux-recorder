import { IStorageService as IRecorderStorageService } from "../models/interfaces/storage-service";
import { SessionData } from "../models/interfaces/session-data";
import { UserEvent } from "../models/interfaces/user-event";
import { StorageUtility, Store } from "../utilities/local-storage";

export class LocalRecorderService implements IRecorderStorageService {

    constructor(private _key = 'UX_RECORDER_SESSIONS', private _store = Store.Local) {}

    async saveEvent(sessionId: string, event: UserEvent) {
        return true;
    }

    async saveEvents(sessionId: string, events: UserEvent[]) {
        return true;
    }

    async getSessions() {
        return StorageUtility.get<Record<string, SessionData>>(this._key, this._store);
    }

    async deleteStore() {
        StorageUtility.delete(this._key, this._store);
        return true;
    }

    async saveSession(session: SessionData) {
        return StorageUtility.mergeStore(this._key, session, session.id, (newData, oldData) => {
            newData.events = oldData.events.concat(newData.events);
            return newData;
        }, ['events.html'], this._store);
    }
}