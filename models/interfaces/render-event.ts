import { MutationEventType } from "../mutation-event-type";
import { PageEvent } from "./event";

export interface RenderEvent extends PageEvent {
    type: MutationEventType;
    change: IChange | null;
}

export interface IChange {

}

export interface AttributeChange extends IChange {
    name: string;
    newValue: string;
}

export interface TextChange extends IChange {
    newText: string;
}

export interface NodeChange extends IChange {
    index: number;
    addedNodes: string[];
    removedNodeCount: number;
}