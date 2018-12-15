import { ConsoleLogLevel } from "../console-log-level";

export interface ConsoleLog {
    date: number;
    logLevel: ConsoleLogLevel;
    message: string;
}