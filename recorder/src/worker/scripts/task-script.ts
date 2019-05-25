import { TaskWorkerRequest, WorkerTaskError, TaskWorkerResponse, TypedMessageEvent } from "../models";

export abstract class TaskWorkerScript<TIn, TOut> {
    abstract run(data: TaskWorkerRequest<TIn>): Promise<TaskWorkerResponse<TOut | WorkerTaskError>>;

    public constructor() {
        this.init();
    }

    public init() {
        onmessage = (e: TypedMessageEvent<TaskWorkerRequest<TIn>>) => {
            this.run(e.data).then(
                result => {
                    (postMessage as any as Worker["postMessage"])(result)
                });
        }

    }
}