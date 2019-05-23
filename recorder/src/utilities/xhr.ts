import { NetworkResponse } from '@models/interfaces/network-event';
import { HttpMethod } from "@models/http-method";

export const XHRProxy = (document: Document, loadCallback: (response: NetworkResponse) => void) => {
	const origXMLHttpRequest = (document.defaultView as any).XMLHttpRequest;

	class XHRProxy {

		private actual = new origXMLHttpRequest();

		private data = {
			request: {
				headers: {}
			}
		} as NetworkResponse;

		constructor() {
			["status", "statusText", "responseType", "response", "readyState", "responseXML", "upload", "responseText", // Properties
				"ontimeout", "timeout", "withCredentials", "onload", "onerror", "onprogress", "onreadystatechange"] // Events handlers
				.forEach((item) => {
					Object.defineProperty(this, item, {
						get: () => this.actual[item],
						set: (val) => this.actual[item] = val
					});
				});
		}

		public getAllResponseHeaders() {
			return origXMLHttpRequest.prototype.getAllResponseHeaders.call(this.actual);
		}

		public getResponseHeader() {
			const [headerName] = arguments;
			return origXMLHttpRequest.prototype.getResponseHeader.call(this.actual, headerName);
		}

		public setRequestHeader() {
			const [header, value] = arguments;
			this.data.request.headers[header] = value;

			return origXMLHttpRequest.prototype.setRequestHeader.call(this.actual, header, value);
		}

		public open() {
			let method: string;
			[method, this.data.request.url, this.data.request.async] = arguments;
			this.data.request.method = HttpMethod[method.toUpperCase()];

			this.actual.addEventListener("loadend", () => {
				this.data.url = this.actual.responseURL;
				this.data.headers = this.actual.getAllResponseHeaders().split('\r\n').reduce((map, header) => {
					const [key, value] = header.split(': ');
					map[key] = value;
					return map;
				}, {} as Record<string, string>);
				this.data.statusCode = this.actual.status;
				this.data.body = this.actual.response;
				loadCallback(this.data);
			});
			return origXMLHttpRequest.prototype.open.call(this.actual, method, this.data.request.url, this.data.request.async);
		}

		public send() {
			[this.data.request.body] = arguments;
			return origXMLHttpRequest.prototype.send.call(this.actual, this.data.request.body);
		}

	}

	["addEventListener", "abort", "overrideMimeType"].forEach((item) => {
		XHRProxy.prototype[item] = function () {
			return origXMLHttpRequest.prototype[item].apply(this.actual, arguments);
		};
	});

	return XHRProxy;
};
