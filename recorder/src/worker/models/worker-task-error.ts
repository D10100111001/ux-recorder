import { WorkerTaskStatus } from "./worker-task-status";

export class WorkerTaskError {
    constructor(
        public message: string,
        public status: WorkerTaskStatus = WorkerTaskStatus.ERROR
    ) {}
}