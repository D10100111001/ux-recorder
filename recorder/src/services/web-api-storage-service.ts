import { IRecorderStorageService } from "@models/interfaces/storage-service";
import { SessionData } from "@models/interfaces/session-data";
import { UserEvent } from "@models/interfaces/user-event";
import { ApiClient } from "../utilities/api-client";

export class WebApiStorageService implements IRecorderStorageService {

    private _sessionClient: ApiClient;
    private _eventClient: ApiClient;

    constructor(
        baseSessionApiUrl: string,
        baseEventApiUrl: string,        
    ) {
        this._sessionClient = new ApiClient(baseSessionApiUrl);
        this._eventClient = new ApiClient(baseEventApiUrl);
    }

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
        const response = await this._sessionClient.post<boolean, SessionData>('', session);
        return response.success;
    }
}