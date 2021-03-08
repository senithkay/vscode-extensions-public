export interface Span {
    position: string;
    duration: number;
}

export interface Trace {
    traceId: string;
    startTime: string;
    duration: number;
    errorStatus: "true" | "false";
    httpStatusCode: string;
}

export interface TraceInfo {
    traces?: Trace[];
    totalCount?: number;
    selectedTraceId?: string;
    selectedTrace?: Span[];
    error?: Error;
    isLoading: boolean;
    isDrilledDown: boolean;
}
