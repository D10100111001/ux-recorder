import { PageEvent } from "./event";

export enum LogType {
    LOG = 1,
    WARN,
    ERROR
}

export interface LogEvent extends PageEvent {
    level: LogType;
    message: string;
    args: any[];
}