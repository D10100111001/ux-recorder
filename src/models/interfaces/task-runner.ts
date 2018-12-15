export type TaskFunction<TOut> = (...params: any[]) => Promise<TOut>;

export interface ITaskRunner {
    executeTask<TOut>(taskFn: TaskFunction<TOut>): Promise<TOut>;
}