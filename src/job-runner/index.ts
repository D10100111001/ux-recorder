import { ITaskRunner, TaskFunction } from "../models/interfaces/task-runner";
import { FunctionTaskRunner } from "./function-task";
import { WebWorkerTaskRunner } from "./web-worker-task";


export class JobRunner {

    private _taskRunner: ITaskRunner;

    constructor(useWebWorker = true) {
        this._taskRunner = new (useWebWorker ? WebWorkerTaskRunner : FunctionTaskRunner)();
    }

    async executeTask<TOut>(taskFn: TaskFunction<TOut>) {
        return await this._taskRunner.executeTask(taskFn);
    }
}