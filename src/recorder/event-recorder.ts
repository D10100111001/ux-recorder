import { GridPoint } from "../models/interfaces/grid-point";
import { PagePoint } from "../models/interfaces/page-point";
import { EventData } from "../models/interfaces/event-data";
import { SessionData } from "../models/interfaces/session-data";
import { getEventType } from "../models/event-type";
import { EventHelper } from "../helpers/event-helper";
import { HtmlDiff } from "../utilities/html-diff";
import { JobRunner } from "../job-runner";
import { Screenshot } from "../utilities/screenshot";
import { UUID } from "../utilities/uuid";

export class EventRecorder {

    private _screenshotUtility = new Screenshot();

    constructor() {}

    async createEvent(event: Event, sessionData: SessionData) {
        const lastEvent = sessionData.events.slice(-1)[0];
        const eventData: EventData = {
            id: UUID.generate(),
            siteState: {
                activeElementSelector: '',
                focusedElementSelector: ''
            },
            date: Date.now(),
            url: new URL(window.location.href),
            html: new XMLSerializer().serializeToString(document),
            type: getEventType(event.target, event.type),
            targetElementSelector: EventHelper.getElementId(event.target),
            previous: lastEvent,
            finishedProcessing: false
        };
        sessionData.events.push(eventData);

        lastEvent.next = eventData;

        if (event instanceof MouseEvent)
            eventData.screenPoint = this.getMouseEventData(event);

        const jobRunner = new JobRunner();
        await jobRunner.executeTask(
            async () => {
                eventData.htmlDiff = await HtmlDiff.diff(lastEvent.html, eventData.html);
                eventData.screenshotBase64 = await this._screenshotUtility.capture();
                eventData.finishedProcessing = true;
            });
    }

    private getMouseEventData(event: MouseEvent): PagePoint {
        return (({clientX: x, clientY: y, pageX, pageY}) => 
                ({x, y, pageX, pageY, height: window.innerHeight, width: window.innerWidth}))(event);
    }


}