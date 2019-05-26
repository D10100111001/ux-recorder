import { LinkedListItem } from "./linked-list";

export interface PageEvent extends LinkedListItem<string> {
    id: string;
    sessionId: string;
    date: number;
    //url: string;
    eventType: PageEventType;
}

export enum PageEventType {
    Dom,
    Render,
    Log,
    Network,
    ScriptError,
    Navigation,
    User
}

export interface DomEvent extends PageEvent {
    targetElementString: string;
    targetElementXPath: string;
}