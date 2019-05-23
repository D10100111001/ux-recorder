import { PageEvent } from "./event";

export interface ScriptEvent extends PageEvent {

}

export interface ScriptLogEvent extends ScriptEvent {
    message: string;
    arguments: any[];
}

export interface ScriptErrorEvent extends ScriptLogEvent {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
    stackTrace: string;
}