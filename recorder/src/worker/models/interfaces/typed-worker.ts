export interface TypedWorker<TIn, TOut> extends Worker {
    postMessage(message: TIn, transfer?: Transferable[]): void;
    onmessage: ((this: Worker, ev: TypedMessageEvent<TOut>) => any) | null;
}

export interface TypedMessageEvent<TOut> extends MessageEvent {
    readonly data: TOut;
}