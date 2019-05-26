export interface ResponseData<TData = any> {
    success: boolean;
    status?: number;
    data?: TData;
}

export class ApiClient {

    constructor(
        private _baseApiUrl: string
    ) {

    }

    private processUrl(url: string) {
        const isAbsoluteUrl = url.startsWith('http') || url.startsWith('//');
        if (!isAbsoluteUrl)
            url = `${this._baseApiUrl}/${url.startsWith('/') ? url.slice(1) : url}`;
        return url;
    }

    private async sendRequest<TData>(url: string, options?: RequestInit) {
        const processedUrl = this.processUrl(url);
        try {
            const response = await fetch(processedUrl, options);
            return {
                success: response.status >= 200 && response.status < 300,
                status: response.status,
                data: await response.json()
            } as ResponseData<TData>;
        } catch (err) {
            return {
                success: false,
            } as ResponseData<TData>;
        }
    }

    async get<TResponseData>(url: string) {
        return this.sendRequest<TResponseData>(url);
    }

    async post<TResponseData, TRequestData>(url: string, data: TRequestData) {
        return this.sendRequest<TResponseData>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
}