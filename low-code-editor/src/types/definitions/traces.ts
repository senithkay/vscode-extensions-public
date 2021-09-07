export interface Span {
    position: string;
    duration: number;
    errorStatus: boolean;
    httpStatusCode: string;
    errorMsg: string;
    checkpoints: Checkpoint[];
}

export interface Checkpoint {
    moduleId: string;
    positionId: string;
    timestamp: number;
}

export interface Trace {
    traceId: string;
    startTime: string;
    duration: number;
    errorStatus: "true" | "false";
    httpStatusCode: string;
    errorMsg : string;
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
