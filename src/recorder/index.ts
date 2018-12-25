import { SessionData } from "../models/interfaces/session-data";
import { CookieParserUtility } from "../utilities/cookie-parser";
import { EventType, EVENT_TYPE_REVERSE_MAP } from "../models/event-type";
import { ObjectUtility } from "../utilities/object";
import { EventRecorder } from "./event-recorder";
import { UUIDUtility } from "../utilities/uuid";
import { LocalStorageService } from "../services/storage-service";
import { IStorageService } from "../models/interfaces/storage-service";
import { EventData } from "../models/interfaces/event-data";

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
const SAVE_INTERVAL_MS = 10 * 1000;

type TargetMatchHandler = (target: EventTarget) => boolean;

const ELEMENT_TYPE_TARGET_MAP: Record<ElementType, TargetMatchHandler> = {
    [ElementType.ANY]: () => true,
    [ElementType.WINDOW]: (target) => target instanceof Window,
    [ElementType.INPUT]: elementMatcherFn(['input']),
    [ElementType.INTERACTABLE]: elementMatcherFn(['button', 'input', 'a', 'img'])
}

export class Recorder {

    public sessionData: SessionData;
    private _eventRecorder: EventRecorder;
    private _localStorage = new LocalStorageService(LOCAL_STORAGE_KEY);
    private _storageService: IStorageService = new LocalStorageService();

    constructor(
        public scriptHostUrl: string, 
        private _document: Document
    ) {
        this.sessionData = {
            id: UUIDUtility.generate(),
            scriptHostUrl,
            initialHtml: new XMLSerializer().serializeToString(document),
            cookies: CookieParserUtility.parse(document.cookie),
            startDate: Date.now(),
            url: _document.defaultView.location.href,
            events: [],
            activityTimeFrames: []
        };
        this.sessionData.lastActivityDate = this.sessionData.startDate;
    }

    public async init() {
        this._eventRecorder = new EventRecorder(this.sessionData);
        await this._eventRecorder.init();

        this.registerEventHandlers(this._document);
        for (const iframe of this._document.getElementsByTagName('iframe')) {
            try {
                const iframeDocument: Document = iframe.contentDocument || iframe.contentWindow.document;
                this.registerEventHandlers(iframeDocument);
            } catch(e) { }
        }

        this.syncData();
        setInterval(async () => {
            const result = await this._localStorage.saveSession(this.sessionData);
            if (result) this.sessionData.events = [];
        }, SAVE_INTERVAL_MS);
    }

    public async syncData() {
        const sessionsToSync = await this._localStorage.getSessions();
        if (sessionsToSync) {
            const syncPromises = Object.keys(sessionsToSync).map((sessionId) => this._storageService.saveSession(sessionsToSync[sessionId]));
            await Promise.all(syncPromises);
            await this._localStorage.deleteStore();
        }
    }

    private registerEventHandlers(doc: Document) {
        this.registerWindowEventHandlers(doc);
        this.registerMouseEventHandlers(doc);
        this.registerKeyboardEventHandlers(doc);
        this.registerMiscEventHandlers(doc);
        doc.defaultView.addEventListener('beforeunload', (e: BeforeUnloadEvent) => 
            this._storageService.saveSession(this.sessionData));
    }

    private registerMouseEventHandlers(doc: Document) {
        this.registerEvent(doc, EventType.MOUSE_DOWN, ElementType.INTERACTABLE);
        this.registerEvent(doc, EventType.MOUSE_UP, ElementType.INTERACTABLE);
        this.registerEvent(doc, EventType.MOUSE_CLICK, ElementType.ANY);
        this.registerEvent(doc, EventType.DRAG, ElementType.ANY);
        this.registerEvent(doc, EventType.DROP, ElementType.ANY);
        this.registerEvent(doc, EventType.MOUSE_HOVER, ElementType.INTERACTABLE);
        this.registerEvent(doc, EventType.MOUSE_SCROLL, ElementType.ANY);
    }

    private registerKeyboardEventHandlers(doc: Document) {
        this.registerEvent(doc, EventType.KEY_DOWN, ElementType.ANY);
        this.registerEvent(doc, EventType.KEY_PRESS, ElementType.INPUT);
        this.registerEvent(doc, EventType.KEY_UP, ElementType.INPUT);
 
    }

    private registerWindowEventHandlers(doc: Document) {
        this.registerEvent(doc, EventType.SITE_ENTER, ElementType.WINDOW, (e) => this.windowActivityCallback(e));
        this.registerEvent(doc, EventType.SITE_EXIT, ElementType.WINDOW, (e) => this.windowActivityCallback(e));
    }

    private windowActivityCallback(e: EventData) {
        this.sessionData.activityTimeFrames.push(e.date - this.sessionData.lastActivityDate);
        this.sessionData.lastActivityDate = e.date;
    }

    private registerMiscEventHandlers(doc: Document) {
        this.registerEvent(doc, EventType.INPUT_BLUR, ElementType.INPUT);
        this.registerEvent(doc, EventType.INPUT_FOCUS, ElementType.INPUT);
    }

    private registerEvent(doc: Document, eventType: EventType, elementType: ElementType, eventCallback?: (e: EventData) => void) {
        const supportedTargetTags = ELEMENT_TYPE_TARGET_MAP[elementType];
        const handler = this.eventHandlerFn(supportedTargetTags, eventCallback);
        doc.defaultView.addEventListener(EVENT_TYPE_REVERSE_MAP[eventType], handler);
    }

    private eventHandlerFn(tagFilterFn: TargetMatchHandler, eventCallback?: (e: EventData) => void) {
        return async (e: Event) => {
            const isMatch = tagFilterFn(e.target);
            if (!isMatch) return;

            const eventData = await this._eventRecorder.createEvent(e);
            eventCallback && eventCallback(eventData);
        }
    }
}