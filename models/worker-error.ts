import { WorkerStatus } from "../worker";

export class WorkerError extends Error {
    
    constructor(
        message: string,
        public status: WorkerStatus
    ) {
        super(message);  
    }
}