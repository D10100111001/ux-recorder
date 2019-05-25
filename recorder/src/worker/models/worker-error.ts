import { WorkerStatus } from "./worker-status";

export class WorkerError extends Error {
    
    constructor(
        message: string,
        public status: WorkerStatus
    ) {
        super(message);  
    }
}