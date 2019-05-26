import { SessionData } from "@models/interfaces/session-data";
import { CookieParserUtility } from "../utilities/cookie-parser";
import { UserEventType, EVENT_TYPE_REVERSE_MAP } from "@models/user-event-type";
import { ObjectUtility } from "../utilities/object";
import { EventRecorderService } from "./event-recorder-service";
import { UUIDUtility } from "../utilities/uuid";
import { LocalRecorderService } from "./local-storage-service";
import { UserEvent } from "@models/interfaces/user-event";
import { Store, StorageUtility } from "../utilities/local-storage";
import { XHRProxy } from "../utilities/xhr";
import { fetchProxy } from "../utilities/fetch";
import { IRecorderStorageService } from "@models/interfaces/storage-service";
import { WebApiStorageService } from "./web-api-storage-service";

enum ElementType {
    WINDOW,
    ANY,
    INPUT,
    INTERACTABLE
}

const elementMatcherFn = ((tagFilters: string[]) => {
    const obj = ObjectUtility.arrayToObjBoolVal(tagFilters, (i) => i);
    return (target: Element) => target.tagName in obj;
});

const LOCAL_STORAGE_KEY = 'UX_RECORDER_PENDING_SYNC_SESSION_DATA';
const SESSION_STORAGE_KEY = 'UX_RECORDER_SESSION_DATA';
const SAVE_INTERVAL_MS = 10 * 1000;

type TargetMatchHandler = (target: EventTarget) => boolean;

const ELEMENT_TYPE_TARGET_MAP: Record<ElementType, TargetMatchHandler> = {
    [ElementType.ANY]: () => true,
    [ElementType.WINDOW]: (target) => target instanceof Window,
    [ElementType.INPUT]: elementMatcherFn(['input']),
    [ElementType.INTERACTABLE]: elementMatcherFn(['button', 'input', 'a', 'img'])
}

export class RecorderService {

    private _logger = document.defaultView.console;
    private _sessionData = this.getSessionData();
    private _eventRecorder: EventRecorderService = new EventRecorderService(this._logger, this._sessionData, this._document);
    private _storageService: IRecorderStorageService = new WebApiStorageService(this._apiSessionUrl, this._apiEventUrl);
    //private _localStorage: IStorageService = new LocalRecorderService(LOCAL_STORAGE_KEY);
    //private _storageService: IStorageService = new LocalRecorderService();

    constructor(
        private _scriptHostUrl: string,
        private _apiSessionUrl: string,
        private _apiEventUrl: string,
        private _appId: string,
        private _document: Document
    ) { }

    private getSessionData() {
        let sessionData: SessionData;
        const continuationSession = StorageUtility.get<SessionData>(SESSION_STORAGE_KEY, Store.LocalSession);

        if (!continuationSession) {
            sessionData = {
                id: UUIDUtility.generate(),
                userId: '',
                appId: this._appId,
                scriptHostUrl: this._scriptHostUrl,
                initialHtml: new XMLSerializer().serializeToString(document),
                cookies: CookieParserUtility.parse(document.cookie),
                startDate: Date.now(),
                url: this._document.defaultView.location.href,
                screenSize: this._eventRecorder.getScreenSizeData(),
                events: [],
                activityTimeFrames: [],
            };

            sessionData.lastActivityDate = sessionData.startDate;

            if (!this._storageService.createSession(sessionData)) {
                this._logger.error('Failed to create a session. Terminating recorder...');
                return null;
            } else {
                this._logger.debug('Successfully created session.');
            }
        } else {
            this._logger.log('Resuming session...');
            sessionData = continuationSession;
            sessionData.lastActivityDate = Date.now();
        }

        return sessionData;
    }

    public async init() {
        if (!this._sessionData) return;
        await this._eventRecorder.init();
        await this._eventRecorder.createNavigationEvent();

        this.registerEventHandlers(this._document);
        for (const iframe of this._document.getElementsByTagName('iframe')) {
            try {
                const iframeDocument: Document = iframe.contentDocument || iframe.contentWindow.document;
                this.registerEventHandlers(iframeDocument);
            } catch (e) { }
        }

        //this.syncData();
        /*setInterval(async () => {
            const result = await this._localStorage.saveSession(this._sessionData);
            if (result) this._sessionData.events = [];
        }, SAVE_INTERVAL_MS);*/

        return this._sessionData;
    }

    /*public async syncData() {
        const sessionsToSync = await this._localStorage.getSessions();
        if (sessionsToSync) {
            const syncPromises = Object.keys(sessionsToSync).map((sessionId) => this._storageService.saveSession(sessionsToSync[sessionId]));
            await Promise.all(syncPromises);
            await this._localStorage.deleteStore();
        }
    }*/

    private registerEventHandlers(doc: Document) {
        this.setupLoggingProxies(doc);
        this.setupNetworkRequestProxy(doc);

        this.registerWindowEventHandlers(doc);
        this.registerMouseEventHandlers(doc);
        this.registerKeyboardEventHandlers(doc);
        this.registerMiscEventHandlers(doc);
        this.registerWindowErrorHandler(doc);
        this.registerDocumentMutations(doc);

        doc.defaultView.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
            const sessionData: SessionData = {
                ...this._sessionData,
                events: []
            };
            StorageUtility.set(SESSION_STORAGE_KEY, sessionData, Store.LocalSession);
            //this._storageService.saveSession(this._sessionData);
        });
    }

    private setupNetworkRequestProxy(doc: Document) {
        (doc.defaultView as any).XMLHttpRequest = XHRProxy(doc, (response) =>
            this._eventRecorder.createNetworkEvent(response)
        );
        doc.defaultView.fetch = fetchProxy(doc, (response) =>
            this._eventRecorder.createNetworkEvent(response)
        );
    }

    private setupLoggingProxies(doc: Document) {
        const recorder = this._eventRecorder;
        const handler: ProxyHandler<Console> = {
            get(target, propKey, receiver) {
                const origMethod = target[propKey];
                if (['log', 'warn', 'error'].indexOf(propKey.toString()) >= 0) {
                    return function (...args) {
                        let result = origMethod.apply(this, args);
                        recorder.createLogEvent(propKey.toString().toUpperCase() as any, arguments[0], [...arguments].slice(1));
                        return result;
                    };
                } else {
                    return origMethod;
                }
            }
        };

        (doc.defaultView.console as any) = new Proxy(doc.defaultView.console, handler);
    }

    private registerWindowErrorHandler(doc: Document) {
        doc.defaultView.addEventListener('error', (event) =>
            this._eventRecorder.createScriptErrorEvent(event)
        );
    }

    private registerDocumentMutations(doc: Document) {
        const mutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
            mutationRecords.map(async mutation =>
                this._eventRecorder.createRenderEvent(mutation)
            );
        });

        mutationObserver.observe(doc.documentElement, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        });
    }

    private registerMouseEventHandlers(doc: Document) {
        this.registerEvent(doc, UserEventType.MOUSE_DOWN, ElementType.INTERACTABLE);
        this.registerEvent(doc, UserEventType.MOUSE_UP, ElementType.INTERACTABLE);
        this.registerEvent(doc, UserEventType.MOUSE_CLICK, ElementType.ANY);
        this.registerEvent(doc, UserEventType.DRAG, ElementType.ANY);
        this.registerEvent(doc, UserEventType.DROP, ElementType.ANY);
        this.registerEvent(doc, UserEventType.MOUSE_HOVER, ElementType.INTERACTABLE);
        this.registerEvent(doc, UserEventType.MOUSE_SCROLL, ElementType.ANY);
    }

    private registerKeyboardEventHandlers(doc: Document) {
        this.registerEvent(doc, UserEventType.KEY_DOWN, ElementType.ANY);
        this.registerEvent(doc, UserEventType.KEY_PRESS, ElementType.INPUT);
        this.registerEvent(doc, UserEventType.KEY_UP, ElementType.INPUT);

    }

    private registerWindowEventHandlers(doc: Document) {
        this.registerEvent(doc, UserEventType.SITE_ENTER, ElementType.WINDOW, (e) => this.windowActivityCallback(e));
        this.registerEvent(doc, UserEventType.SITE_EXIT, ElementType.WINDOW, (e) => this.windowActivityCallback(e));
        this.registerEvent(doc, UserEventType.RESIZE, ElementType.WINDOW);
    }

    private windowActivityCallback(e: UserEvent) {
        this._sessionData.activityTimeFrames.push(e.date - this._sessionData.lastActivityDate);
        this._sessionData.lastActivityDate = e.date;
    }

    private registerMiscEventHandlers(doc: Document) {
        this.registerEvent(doc, UserEventType.INPUT_BLUR, ElementType.INPUT);
        this.registerEvent(doc, UserEventType.INPUT_FOCUS, ElementType.INPUT);
    }

    private registerEvent(doc: Document, eventType: UserEventType, elementType: ElementType, eventCallback?: (e: UserEvent) => void) {
        const supportedTargetTags = ELEMENT_TYPE_TARGET_MAP[elementType];
        const handler = this.eventHandlerFn(supportedTargetTags, eventCallback);
        doc.defaultView.addEventListener(EVENT_TYPE_REVERSE_MAP[eventType], handler);
    }

    private eventHandlerFn(tagFilterFn: TargetMatchHandler, eventCallback?: (e: UserEvent) => void) {
        return async (e: Event) => {
            const isMatch = tagFilterFn(e.target);
            if (!isMatch) return;

            const eventData = await this._eventRecorder.createUserEvent(e);
            eventCallback && eventCallback(eventData);
        }
    }
}