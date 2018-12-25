import { TaskWorkerScript } from "./task-script";
import { HtmlDiffUtility } from "../utilities/html-diff";
import { HtmlDiffRequest } from "../models/interfaces/html-diff-request";
import { HtmlDiffChange } from "../models/interfaces/html-diff-change";
import { TaskWorkerRequest } from "../models/interfaces/task-worker-request";
import { TaskWorkerResponse } from "../models/interfaces/task-worker-response";
import { WorkerTaskError } from "../models/worker-task-error";
import { WorkerTaskStatus } from "../models/worker-task-status";

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