import { PagePoint } from "@models/interfaces/page-point";
import { UserEvent } from "@models/interfaces/user-event";
import { SessionData } from "@models/interfaces/session-data";
import { getEventType as getUserEventType, UserEventType } from "@models/user-event-type";
import { getEventType as getMutationEventType, MutationEventType } from "@models/mutation-event-type";
import { UUIDUtility } from "../utilities/uuid";
import { ElementUtility as NodeUtility } from '../utilities/node-helper';
import { WebWorkerTaskRunner } from "../worker";
import { HtmlDiffRequest } from "src/worker/models/interfaces/html-diff-request";
import { HtmlDiffChange } from "src/worker/models/interfaces/html-diff-change";
import { WorkerCreator } from "../worker/worker-creator";
import { PageEvent, DomEvent, PageEventType } from "@models/interfaces/event";
import { RenderEvent, AttributeChange, TextChange, NodeChange } from "@models/interfaces/render-event";
import { ScriptErrorEvent } from "@models/interfaces/script-event";
import { NavigationEvent, Resource, ResourcePerformanceData } from "@models/interfaces/navigation-event";
import { LogEvent, LogType } from "@models/interfaces/log-event";
import { NetworkResponse, NetworkEvent } from "@models/interfaces/network-event";

export class EventRecorderService {

    //private _htmlDiffWorker: WebWorkerTaskRunner<HtmlDiffRequest, HtmlDiffChange>;
    //private _screenshotWorker: WebWorkerTaskRunner<string, string>;

    constructor(
        private _logger: Console,
        private _sessionData: SessionData,
        private _document: Document
    ) { }

    init() {
        // const htmlDiffWorkerCreator = new WorkerCreator(document, this._sessionData.scriptHostUrl, 'workers/html-diff.js');
        // await htmlDiffWorkerCreator.init();
        // this._htmlDiffWorker = new WebWorkerTaskRunner<HtmlDiffRequest, HtmlDiffChange>(htmlDiffWorkerCreator);
        // const screenshotWorkerCreator = new WorkerCreator(document, this._sessionData.scriptHostUrl, 'workers/screenshot.js');
        // await screenshotWorkerCreator.init();
        // this._screenshotWorker = new WebWorkerTaskRunner<string, string>(screenshotWorkerCreator, -1);
    }

    private createEvent(eventType: PageEventType) {
        const date = Date.now();
        const lastEvent = this._sessionData.events.slice(-1)[0];
        const eventData: PageEvent = {
            id: UUIDUtility.generate(),
            sessionId: this._sessionData.id,
            date,
            eventType
        };

        if (lastEvent) {
            eventData.previousId = lastEvent.id;
            lastEvent.nextId = eventData.id;
        }

        return eventData;
    }

    private addEventToSession(event: PageEvent) {
        this._sessionData.events.push(event);
        this._logger.log(PageEventType[event.eventType], event);
    }

    private createDomEvent(node?: Element | Text, eventType = PageEventType.Dom) {
        const domEvent: DomEvent = {
            ...this.createEvent(eventType),
            targetElementString: NodeUtility.getElementString(node),
            targetElementXPath: NodeUtility.getXPath(node),
        }

        return domEvent;
    }

    createRenderEvent(mutation: MutationRecord) {
        const node = NodeUtility.verifyTargetNode(mutation.target);
        const renderEvent: RenderEvent = {
            ...this.createDomEvent(node, PageEventType.Render),
            type: getMutationEventType(mutation.type),
            change: null
        };

        switch (renderEvent.type) {
            case MutationEventType.ATTRIBUTES:
                renderEvent.change = {
                    name: mutation.attributeName,
                    newValue: (node as Element).getAttribute(mutation.attributeName)
                } as AttributeChange;
                break;
            case MutationEventType.CHARACTER_DATA:
                renderEvent.change = {
                    newText: node.textContent
                } as TextChange;
                break;
            case MutationEventType.CHILD_LIST:
                const addedNodes = [...mutation.addedNodes.values()].map(NodeUtility.nodeToHtml);
                const index = NodeUtility.getNodeIndex(mutation.previousSibling);
                renderEvent.change = {
                    addedNodes,
                    removedNodeCount: mutation.removedNodes.length,
                    index: index === null ? 0 : index + 1
                } as NodeChange;
                break;
        }

        this.addEventToSession(renderEvent);
        return renderEvent;
    }

    createLogEvent(type: keyof typeof LogType, message: string, args: any[]) {
        const logEvent: LogEvent = {
            ...this.createEvent(PageEventType.Log),
            level: LogType[type],
            message,
            args
        };

        this.addEventToSession(logEvent);
        return logEvent;
    }

    createNetworkEvent(response: NetworkResponse) {
        const networkEvent: NetworkEvent = {
            ...this.createEvent(PageEventType.Network),
            request: response.request,
            response
        };

        this.addEventToSession(networkEvent);
        return networkEvent;
    }

    createScriptErrorEvent(event: ErrorEvent) {
        const errorEvent: ScriptErrorEvent = {
            ...this.createEvent(PageEventType.ScriptError),
            message: event.message,
            arguments: [],
            fileName: event.filename,
            lineNumber: event.lineno,
            columnNumber: event.colno,
            stackTrace: event.error ? event.error.stackTrace : ''
        };

        this.addEventToSession(errorEvent);
        return errorEvent;
    }

    createNavigationEvent() {

        const navigationEvent: NavigationEvent = {
            ...this.createEvent(PageEventType.Navigation),
            url: this._document.defaultView.location.href,
            resources: []
        };

        if (document.defaultView.performance !== undefined) {
            var resources = performance.getEntriesByType("resource");
            if (resources !== undefined && resources.length > 0) {
                resources.forEach((resource: any) => {
                    navigationEvent.resources.push({
                        performanceData: this.getResourceData(resource)
                    });
                });
            }
        }

        this.addEventToSession(navigationEvent);
        return navigationEvent;
    }

    createUserEvent(event: Event) {
        const element = NodeUtility.verifyTargetNode(event.target);
        const userEvent: UserEvent = {
            ...this.createDomEvent(element, PageEventType.User),
            type: getUserEventType(event.target, event.type),
        };

        if (event instanceof MouseEvent)
            userEvent.screenData = this.getMouseEventData(event);
        else if (userEvent.type === UserEventType.RESIZE)
            userEvent.screenData = this.getScreenSizeData();

        //eventData.htmlDiff = await this._htmlDiffWorker.execute({ source: lastEvent ? lastEvent.html : this._sessionData.initialHtml, target: eventData.html });
        //eventData.screenshotBase64 = await this._screenshotWorker.execute(eventData.html);
        this.addEventToSession(userEvent);
        return userEvent;
    }

    public getScreenSizeData() {
        return {
            height: this._document.defaultView.innerHeight,
            width: this._document.defaultView.innerWidth
        } as Screen;
    }

    private getMouseEventData(event: MouseEvent): PagePoint {
        return (({ clientX: x, clientY: y, pageX, pageY }) =>
            ({ x, y, pageX, pageY, ...this.getScreenSizeData() }))(event);
    }


    private getResourceData(resource: any): ResourcePerformanceData {
        const redirectTime = resource.redirectEnd - resource.redirectStart;
        const dnsLookupTime = resource.domainLookupEnd - resource.domainLookupStart;
        const tcpHandshakeTime = resource.connectEnd - resource.connectStart;
        const secureConnectionTime = (resource.secureConnectionStart > 0) ? (resource.connectEnd - resource.secureConnectionStart) : 0;
        const responseTime = resource.responseEnd - resource.responseStart;
        const fetchTime = (resource.fetchStart > 0) ? (resource.responseEnd - resource.fetchStart) : 0;
        const requestTime = (resource.requestStart > 0) ? (resource.responseEnd - resource.requestStart) : 0;
        const totalTime = (resource.startTime > 0) ? (resource.responseEnd - resource.startTime) : 0;

        return {
            name: resource.name,
            redirectTime,
            dnsLookupTime,
            tcpHandshakeTime,
            secureConnectionTime,
            responseTime,
            fetchTime,
            requestTime,
            totalTime
        };
    }

}