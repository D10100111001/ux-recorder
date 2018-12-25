import { PagePoint } from "../models/interfaces/page-point";
import { EventData } from "../models/interfaces/event-data";
import { SessionData } from "../models/interfaces/session-data";
import { getEventType } from "../models/event-type";
import { UUIDUtility } from "../utilities/uuid";
import { ElementUtility } from '../utilities/element-helper';
import { WebWorkerTaskRunner } from "../worker";
import { HtmlDiffRequest } from "../models/interfaces/html-diff-request";
import { HtmlDiffChange } from "../models/interfaces/html-diff-change";
import { WorkerCreator } from "../worker/worker-creator";

export class EventRecorder {

    private _htmlDiffWorker: WebWorkerTaskRunner<HtmlDiffRequest, HtmlDiffChange>;
    //private _screenshotWorker: WebWorkerTaskRunner<string, string>;

    constructor(private _sessionData: SessionData) {}

    async init() {
        const htmlDiffWorkerCreator = new WorkerCreator(document, this._sessionData.scriptHostUrl, 'workers/html-diff.js');
        await htmlDiffWorkerCreator.init();
        this._htmlDiffWorker = new WebWorkerTaskRunner<HtmlDiffRequest, HtmlDiffChange>(htmlDiffWorkerCreator);
        // const screenshotWorkerCreator = new WorkerCreator(document, this._sessionData.scriptHostUrl, 'workers/screenshot.js');
        // await screenshotWorkerCreator.init();
        // this._screenshotWorker = new WebWorkerTaskRunner<string, string>(screenshotWorkerCreator, -1);
    }

    async createEvent(event: Event) {
        const date = Date.now();
        const lastEvent = this._sessionData.events.slice(-1)[0];
        const eventData: EventData = {
            id: UUIDUtility.generate(),
            siteState: {
                activeElementSelector: '',
                focusedElementSelector: ''
            },
            date,
            url: window.location.href,
            html: new XMLSerializer().serializeToString(document),
            type: getEventType(event.target, event.type),
            targetElementSelector: ElementUtility.getElementId(event.target),
            finishedProcessing: false
        };
        this._sessionData.events.push(eventData);
        if (lastEvent) {
            eventData.previousId = lastEvent.id;
            lastEvent.nextId = eventData.id;
        }

        if (event instanceof MouseEvent)
            eventData.screenPoint = this.getMouseEventData(event);

        eventData.htmlDiff = await this._htmlDiffWorker.execute({ source: lastEvent ? lastEvent.html : this._sessionData.initialHtml, target: eventData.html });
        //eventData.screenshotBase64 = await this._screenshotWorker.execute(eventData.html);
        eventData.finishedProcessing = true;

        return eventData;
    }

    private getMouseEventData(event: MouseEvent): PagePoint {
        return (({clientX: x, clientY: y, pageX, pageY}) => 
                ({x, y, pageX, pageY, height: window.innerHeight, width: window.innerWidth}))(event);
    }


}