import { UUIDUtility } from "../utilities/uuid";
import { TimeStats } from "@models/time-stats";
import { MonoEventHandle } from "../utilities/event-handle";
import { WorkerCreator } from "./worker-creator";
import {
    WorkerStatus,
    WorkerError,
    TaskWorkerResponse,
    TaskWorkerRequest,
    WorkerTaskStatus,
    WorkerTaskError,
    TypedWorker,
    ITaskRunner
} from "./models";

export class WorkerTaskStats extends TimeStats { }

export interface ITaskHook<TIn, TOut> {
    startHandle: MonoEventHandle<TIn>;
    endHandle: MonoEventHandle<TOut | WorkerTaskError>;
}

export class WorkerTask<TIn, TOut> implements ITaskHook<TIn, TOut> {

    public id: string = UUIDUtility.generate();
    private _stats?: WorkerTaskStats;

    public startHandle: MonoEventHandle<TIn> = new MonoEventHandle();
    public endHandle: MonoEventHandle<TOut | WorkerTaskError> = new MonoEventHandle();

    /* public startFn?: (this: WorkerTask<TIn, TOut>) => void;
    public endFn?: (this: WorkerTask<TIn, TOut>, result: TOut | WorkerTaskError) => void; */

    constructor(
        public taskWorker: TaskWorker<TIn, TOut>,
        public message: TIn,
        public status: WorkerTaskStatus = WorkerTaskStatus.QUEUED,
    ) { }

    public start() {
        this._stats = new WorkerTaskStats();
        this._stats.collectStart();
        this.status = WorkerTaskStatus.RUNNING;
        this.startHandle.dispatchEvent();
    }

    public end(result: TOut | WorkerTaskError) {
        this.endHandle.dispatchEvent(result);
        this.status = result instanceof WorkerTaskError ? result.status : WorkerTaskStatus.SUCCESS;
        this._stats.collectEnd();
    }

    public get stats() {
        return this._stats;
    }

}

export class TaskWorker<TIn, TOut> {

    private _instance: TypedWorker<TaskWorkerRequest<TIn>, TaskWorkerResponse<TOut>> = this._workerCreator.create();
    private _taskQueue: WorkerTask<TIn, TOut>[] = [];
    private _taskMap: Record<string, WorkerTask<TIn, TOut>> = {};

    public id: string = UUIDUtility.generate();
    public stats: WorkerStats = new WorkerStats();
    public tasks: WorkerTask<TIn, TOut>[] = [];

    constructor(
        private _workerCreator: WorkerCreator,
        public timeoutMs = 250,
        private _maxTaskCount = 8,
        private _taskCount = 0,
        public status: WorkerStatus = WorkerStatus.READY,
    ) {
        this._instance.onmessage = (e) => {
            const data = e.data;
            const task = this._taskMap[data.id];
            if (task) {
                task.end(data.result);
            }
        }
        this.init();
    }

    private init() {
        this.stats.collectStart();
    }

    public get executionCount() {
        return this.tasks
            .filter(t => t.status === WorkerTaskStatus.SUCCESS && t.stats.executionTime && t.stats.endDate).length;
    }

    public get totalExecutionTimeMs() {
        return this.tasks
            .reduce((sum, task) =>
                sum + (task.stats.executionTime || 0), 0);
    }

    public get averageExecutionTimeMs() {
        return Math.round(this.totalExecutionTimeMs / this.executionCount);
    }

    queueTask(message: TIn) {
        if (!this._instance || this.status === WorkerStatus.DECOMMISSIONED)
            throw new WorkerError("The worker has been decommissioned and cannot fulfill any new task requests.", this.status);
        const task = new WorkerTask(this, message);
        this._taskQueue.push(task);
        this.tasks.push(task);
        this._taskMap[task.id] = task;
        const promise = new Promise<TOut>((resolve, reject) => {
            task.endHandle.attachHook(result => this.taskResultHandler(resolve, reject, result));
        });
        this.executeNextAvailable();
        return promise;
    }

    async executeNextAvailable() {
        if (this._taskCount >= this._maxTaskCount) return;
        const task = this._taskQueue.shift();
        if (!task) return;
        try {
            await this.executeTask(task);
        } finally {
            this.executeNextAvailable();
        }
    }

    private dequeueTask(task: WorkerTask<TIn, TOut>) {
        //const
        delete this._taskMap[task.id];
        if (task.status === WorkerTaskStatus.QUEUED) {
            const taskIndex = this._taskQueue.indexOf(task);
            if (taskIndex >= 0)
                this._taskQueue.splice(taskIndex, 1);
        }

    }

    private taskResultHandler(resolve: (value?: (TOut | WorkerTaskError) | PromiseLike<(TOut | WorkerTaskError)>) => void, reject: (reason?: any) => void, result?: TOut | WorkerTaskError) {
        if (result instanceof WorkerTaskError) reject(result);
        else resolve(result);
    }

    private executeTask(task: WorkerTask<TIn, TOut>) {
        this.status = WorkerStatus.BUSY;
        task.start();
        const promise = new Promise<TOut>((resolve, reject) => {
            task.endHandle.attachHook(result => {
                this._taskCount--;
                this.taskResultHandler(resolve, reject, result);
            });
            setTimeout(() => {
                if (task.status !== WorkerTaskStatus.RUNNING || this.timeoutMs === -1) return;
                this.restart();
                task.endHandle.dispatchEvent(new WorkerTaskError(`Task failed to finish within the set timeout period: ${this.timeoutMs}`, WorkerTaskStatus.TIMED_OUT));
            }, this.timeoutMs);
        });
        this._instance.postMessage({ id: task.id, data: task.message });
        this._taskCount++;
        return promise;
    }

    public decommission() {
        this.stats.collectEnd();
        this.stop();
        this.status = WorkerStatus.DECOMMISSIONED;
        this._instance = null;
    }

    private stop() {
        if (this.status === WorkerStatus.DECOMMISSIONED)
            return false;
        if (this.status !== WorkerStatus.STOPPED) {
            this.status = WorkerStatus.STOPPED;
            this._instance.terminate();
        }
        return true;
    }

    private start() {
        if (this.status === WorkerStatus.DECOMMISSIONED)
            return false;
        if (this.status !== WorkerStatus.READY) {
            this._instance = this._workerCreator.create();
            this.stats.restartCount++;
            this.status = WorkerStatus.READY;
        }
        return true;
    }

    private restart() {
        let success = this.stop();
        if (success) success = this.start();
        return success;
    }
}

export interface AvailableWorkerContext<TIn, TOut> {
    worker: TaskWorker<TIn, TOut>;
    queue: WorkerStatus;
    queueIndex: number;
}

export class WorkerStats extends TimeStats {
    public restartCount = 0;
}

export class WebWorkerTaskRunner<TIn, TOut> implements ITaskRunner<TIn, TOut> {

    private _workers: Record<Exclude<WorkerStatus, WorkerStatus.STOPPED | WorkerStatus.DECOMMISSIONED>, TaskWorker<TIn, TOut>[]> = {
        [WorkerStatus.READY]: [],
        [WorkerStatus.BUSY]: []
    };

    private _workerCount = 0;

    constructor(
        private _workerCreator: WorkerCreator,
        private _timeoutMs = 250,
        private _poolWorkerMaxCount = 16,
    ) { }

    public async execute(message: TIn) {
        const worker = this.scheduleWorker();
        try {
            return await worker.queueTask(message);
        } catch (e) {
            console.log(e);
        }
    }

    private getNextAvailableWorker() {
        let context: AvailableWorkerContext<TIn, TOut> = {} as any;
        const readyWorkers = this._workers[WorkerStatus.READY];
        const busyWorkers = this._workers[WorkerStatus.BUSY];
        if (this._workerCount < this._poolWorkerMaxCount) {
            this._workerCount++;
            context.worker = new TaskWorker(this._workerCreator, this._timeoutMs);
            context.queue = WorkerStatus.READY;
            context.queueIndex = readyWorkers.push(context.worker) - 1;
        } else {
            if (readyWorkers.length) {
                context.queue = WorkerStatus.READY;
                context.worker = readyWorkers[context.queueIndex = 0];
            } else {
                context.queue = WorkerStatus.BUSY;
                context.worker = busyWorkers[context.queueIndex = 0];
            }
        }
        return context;
    }

    private scheduleWorker() {
        const context = this.getNextAvailableWorker();
        const queue = this._workers[context.queue];
        queue.push(queue.splice(context.queueIndex, 1)[0]);
        return context.worker;
    }

}