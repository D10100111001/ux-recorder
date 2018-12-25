import { WorkerTaskError } from "../worker-task-error";

export interface TaskWorkerResponse<T> {
    id: string;
    result: T | WorkerTaskError;
}