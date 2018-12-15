import { ITaskRunner, TaskFunction } from "../models/interfaces/task-runner";

export class FunctionTaskRunner implements ITaskRunner {
    async executeTask<TOut>(taskFn: TaskFunction<TOut>) {
        return await taskFn();
    }
}