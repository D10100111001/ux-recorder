import { TaskWorkerScript } from "./task-script";
import { HtmlDiffUtility } from "../../utilities/html-diff";
import { 
    WorkerTaskStatus, 
    TaskWorkerRequest, 
    WorkerTaskError, 
    TaskWorkerResponse, 
    HtmlDiffRequest, 
    HtmlDiffChange 
} from "../models";

export class HtmlDiffWorkerScript extends TaskWorkerScript<HtmlDiffRequest, HtmlDiffChange> {
    async run(request: TaskWorkerRequest<HtmlDiffRequest>) {
        const response: TaskWorkerResponse<HtmlDiffChange> = { id: request.id } as any;
        try {
            const diffRequest = request.data;
            response.result = await HtmlDiffUtility.diff(diffRequest.source, diffRequest.target);;
        } catch (e) {
            response.result = new WorkerTaskError((e as Error).message, WorkerTaskStatus.ERROR);
        }
        return response;
    }
}

new HtmlDiffWorkerScript();