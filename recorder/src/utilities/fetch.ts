import { NetworkResponse } from "@models/interfaces/network-event";
import { HttpMethod } from "@models/http-method";

export const fetchProxy = (document: Document, loadCallback: (response: NetworkResponse) => void): GlobalFetch['fetch'] => {
	const origFetch: GlobalFetch['fetch'] = document.defaultView.fetch.bind(document.defaultView);

    return (requestInfo, requestInit) => {
        return origFetch(requestInfo, requestInit).then(async response => {
            const networkResponse = {
                request: {}
            } as NetworkResponse;

            if (typeof requestInfo === 'string') {
                networkResponse.request.url = requestInfo;
                networkResponse.request.body = requestInit.body;
                if (requestInit.headers instanceof Headers) {
                    networkResponse.request.headers = Array.from(requestInit.headers.entries()).reduce((map, [key, value]) => {
                        map[key] = value;
                        return map;
                    }, {} as Record<string, string>);
                } else if (Array.isArray(requestInit.headers)) {
                    networkResponse.request.headers = requestInit.headers.reduce((map, [key, value]) => {
                        map[key] = value;
                        return map;
                    }, {} as Record<string, string>);
                } else {
                    networkResponse.request.headers = requestInit.headers;
                }
                networkResponse.request.method = HttpMethod[requestInit.method];
            } else {
                networkResponse.request.url = requestInfo.url;
                networkResponse.request.body = await requestInfo.text();
                networkResponse.request.headers = Array.from(requestInfo.headers.entries()).reduce((map, [key, value]) => {
                    map[key] = value;
                    return map;
                }, {} as Record<string, string>);
                networkResponse.request.method = HttpMethod[requestInfo.method];
            }

            networkResponse.url = response.url;
            networkResponse.statusCode = response.status;
            networkResponse.body = await response.clone().text();
            networkResponse.headers = Array.from(response.headers.entries()).reduce((map, [key, value]) => {
                map[key] = value;
                return map;
            }, {} as Record<string, string>);;
            loadCallback(networkResponse);
            return response;  
        });
    };
}