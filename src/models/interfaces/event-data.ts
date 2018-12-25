import { SiteState } from "./site-state";
import { EventType } from "../event-type";
import { PagePoint } from "./page-point";
import { LinkedListItem } from "./linked-list";

export interface EventData extends LinkedListItem<string> {
    id: string;
    screenPoint?: PagePoint;
    siteState: SiteState; 
    date: number;
    url: string;
    htmlDiff?: any;
    html: string;
    screenshotBase64?: string;
    waitTime?: number;
    targetElementSelector: string;
    type: EventType;
    finishedProcessing: boolean;
}