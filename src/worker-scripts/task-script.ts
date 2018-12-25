import { WorkerTaskError } from "../models/worker-task-error";
import { TypedMessageEvent } from "../models/interfaces/typed-worker";
import { TaskWorkerRequest } from "../models/interfaces/task-worker-request";
import { TaskWorkerResponse } from "../models/interfaces/task-worker-response";

export abstract class TaskWorkerScript<TIn, TOut> {
    abstract run(data: TaskWorkerRequest<TIn>): Promise<TaskWorkerResponse<TOut | WorkerTaskError>>;

    public constructor() {
        this.init();
    }

    public init() {
        onmessage = (e: TypedMessageEvent<TaskWorkerRequest<TIn>>) => {
            this.run(e.data).then(
                result => {
                    console.log(JSON.stringify(result));
                    (postMessage as any as Worker["postMessage"])(result)
                });
        }

    }
}