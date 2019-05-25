import { ScreenshotUtility } from "../../utilities/screenshot";
import { TaskWorkerScript } from "./task-script";
import { WorkerTaskStatus, TaskWorkerRequest, WorkerTaskError, TaskWorkerResponse } from "../models";

export class ScreenshotWorkerScript extends TaskWorkerScript<string, string> {
    private _screenshotUtility = new ScreenshotUtility();

    async run(request: TaskWorkerRequest<string>) {
        const response: TaskWorkerResponse<string> = { id: request.id } as any;
        try {
            const siteHtml = request.data;
            const iframeElement = await this.loadIFrame(siteHtml);
            const iframeDocument: Document = iframeElement.contentDocument || iframeElement.contentWindow.document;
            const base64Image = await this._screenshotUtility.capture(iframeDocument.body);
            document.body.removeChild(iframeElement);
            response.result = base64Image;
        } catch (e) {
            response.result = new WorkerTaskError((e as Error).message, WorkerTaskStatus.ERROR);
        }
        return response;
    }

    async loadIFrame(siteHtml: string) {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        iframe.sandbox.value = '';
        const iframeDocument: Document = iframe.contentDocument || iframe.contentWindow.document;
        iframeDocument.body.innerHTML = siteHtml;
        return iframe;
    }

}

new ScreenshotWorkerScript();