export interface ITaskRunner<TIn, TOut> {
    execute(data: TIn): Promise<TOut>;
}