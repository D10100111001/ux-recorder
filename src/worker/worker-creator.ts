export class WorkerCreator {
    
    private _scriptUrl: string;

    constructor(
        private _document: Document,
        private _baseUrl: string,
        private _scriptRelativeUrl: string,
    ) {}
    
    private static async getWorkerContent(url: string) {
        var oReq = new XMLHttpRequest();
        const promise = new Promise<string>((resolve, reject) => {
            oReq.addEventListener('load', () => {
                resolve(oReq.responseText);
            });
        });
        oReq.open("get", url, true);
        oReq.send();
        return promise;
    }

    async init() {
        const docWindow = this._document.defaultView;
        if (!this._scriptUrl) {
            if (this._baseUrl === docWindow.location.origin) {
                this._scriptUrl = this._scriptRelativeUrl;
            } else {
                const url = new URL(this._baseUrl);
                url.pathname = this._scriptRelativeUrl;
                const workerContent = await WorkerCreator.getWorkerContent(url.href);
                this._scriptUrl = docWindow.URL.createObjectURL(new Blob([workerContent]));
            }
        }
    }

    create() {
        return new Worker(this._scriptUrl);
    }
}