export interface TaskWorkerRequest<T> {
    id: string;
    data: T;
}