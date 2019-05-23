import { PageEvent } from "./event";
import { HttpMethod } from "../http-method";

export interface NetworkEvent<TBodyRequest = any, TBodyResponse = any> extends PageEvent {
    request: NetworkRequest<TBodyRequest>;
    response: NetworkResponse<TBodyResponse>;
}

export interface NetworkData<T = any> {
    url: string;
    headers: Record<string, string>;
    body: T;
}

export interface NetworkRequest<T = any> extends NetworkData<T> {
    method: HttpMethod;
    async: boolean;
}

export interface NetworkResponse<TBodyRequest = any, TBodyResponse = any> extends NetworkData<TBodyResponse> {
    request: NetworkRequest<TBodyRequest>;
    statusCode: number;
}