import { SessionData } from "../models/interfaces/session-data";
import { CookieParser } from "../helpers/cookie-parser";
import { EventType, EVENT_TYPE_REVERSE_MAP } from "../models/event-type";
import { ObjectUtilities } from "../utilities/object";
import { EventRecorder } from "./event-recorder";
import { UUID } from "../utilities/uuid";
import { LocalStorageUtilities } from "../utilities/local-storage";
import { LocalStorageService } from "../services/storage-service";
import { IStorageService } from "../models/interfaces/storage-service";

enum ElementType {
    WINDOW,
    ANY,
    INPUT,
    INTERACTABLE
}

const elementMatcherFn = ((tagFilters: string[]) => {
    const obj = ObjectUtilities.arrayToObjBoolVal(tagFilters, (i) => i);
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
    private _eventRecorder = new EventRecorder();
    private _localStorage = new LocalStorageService(LOCAL_STORAGE_KEY);
    private _storageService: IStorageService = new LocalStorageService();

    constructor(
        private _document: Document
    ) {
        this.sessionData = {
            id: UUID.generate(),
            initialHtml: new XMLSerializer().serializeToString(document),
            cookies: CookieParser.parse(document.cookie),
            startDate: Date.now(),
            url: new URL(_document.defaultView.location.href),
            events: [],
            activityTimeFrames: []
        };
    }

    public async init() {
        this.registerEventHandlers();
        this.syncData();
        setInterval(async () => {
            const result = await this._storageService.saveSession(this.sessionData);
            if (result) this.sessionData.events = [];
        }, SAVE_INTERVAL_MS);
    }

    public async syncData() {
        const sessionsToSync = await this._localStorage.getSessions();
        const syncPromises = Object.keys(sessionsToSync).map((sessionId) => this._storageService.saveSession(sessionsToSync[sessionId]));
        await Promise.all(syncPromises);
        await this._localStorage.deleteStore();
    }

    private registerEventHandlers() {
        this.registerWindowEventHandlers();
        this.registerMouseEventHandlers();
        this.registerKeyboardEventHandlers();
        this.registerMiscEventHandlers();
        window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => 
            this._storageService.saveSession(this.sessionData));
    }

    private registerMouseEventHandlers() {
        this.registerEvent(EventType.MOUSE_DOWN, ElementType.INTERACTABLE);
        this.registerEvent(EventType.MOUSE_UP, ElementType.INTERACTABLE);
        this.registerEvent(EventType.MOUSE_CLICK, ElementType.ANY);
        this.registerEvent(EventType.DRAG, ElementType.ANY);
        this.registerEvent(EventType.DROP, ElementType.ANY);
        this.registerEvent(EventType.MOUSE_HOVER, ElementType.INTERACTABLE);
        this.registerEvent(EventType.MOUSE_SCROLL, ElementType.ANY);
    }

    private registerKeyboardEventHandlers() {
        this.registerEvent(EventType.KEY_DOWN, ElementType.ANY);
        this.registerEvent(EventType.KEY_PRESS, ElementType.INPUT);
        this.registerEvent(EventType.KEY_UP, ElementType.INPUT);
 
    }

    private registerWindowEventHandlers() {
        this.registerEvent(EventType.SITE_ENTER, ElementType.WINDOW);
        this.registerEvent(EventType.SITE_EXIT, ElementType.WINDOW);
    }

    private registerMiscEventHandlers() {
        this.registerEvent(EventType.INPUT_BLUR, ElementType.INPUT);
        this.registerEvent(EventType.INPUT_FOCUS, ElementType.INPUT);
    }

    private registerEvent(eventType: EventType, elementType: ElementType) {
        const supportedTargetTags = ELEMENT_TYPE_TARGET_MAP[elementType];
        const handler = this.eventHandlerFn(supportedTargetTags);
        this._document.defaultView.addEventListener(EVENT_TYPE_REVERSE_MAP[eventType], handler);
    }

    private eventHandlerFn(tagFilterFn: TargetMatchHandler) {
        return (e: Event) => tagFilterFn(e.target) && this._eventRecorder.createEvent(event, this.sessionData);
    }
}