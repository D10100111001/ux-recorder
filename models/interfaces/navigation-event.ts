import { PageEvent } from "./event";

export interface NavigationEvent extends PageEvent {
    url: string;
    resources: Resource[];
}

export interface Resource {
    performanceData: ResourcePerformanceData;
}

export interface ResourcePerformanceData {
    name: string;
    redirectTime?: number;
    dnsLookupTime?: number;
    tcpHandshakeTime?: number;
    secureConnectionTime?: number;
    responseTime?: number;
    fetchTime?: number;
    requestTime?: number;
    totalTime?: number;
}