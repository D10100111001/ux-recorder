import { ITaskRunner, TaskFunction } from "../models/interfaces/task-runner";

export class WebWorkerTaskRunner implements ITaskRunner {
    constructor(private _timeoutMs = 250) {}

    static async workerMessageHandler<TOut>(e: MessageEvent) {
        const taskFn: TaskFunction<TOut> = e.data;
        (postMessage as any)(await taskFn());
    }

    static toFunctionString(fn: Function) {
        const fnStr = fn.toString();
        const fnStrConst = 'function';
        const startsWithFunction = fnStr.lastIndexOf(fnStrConst, 0) === 0;
        return `${(startsWithFunction ? '' : fnStrConst)} ${fnStr}`;
    }

    static workerFileStr = `
        onmessage = ${WebWorkerTaskRunner.toFunctionString(WebWorkerTaskRunner.workerMessageHandler)}
    `

    async executeTask<TOut>(taskFn: TaskFunction<TOut>) {
        const blob = new Blob([WebWorkerTaskRunner.workerFileStr], {type: 'application/javascript'});
        const worker = new Worker(URL.createObjectURL(blob));
        let timedOut = false;
        return new Promise<TOut>((resolve, reject) => {
            worker.onmessage = (e: MessageEvent) => !timedOut && resolve(e.data);
            setTimeout(() => { timedOut = true; reject(); }, this._timeoutMs);
            worker.postMessage(taskFn);
        });
    }
}