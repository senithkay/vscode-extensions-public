export interface InvocationMetric {
    name: string;
    value: number;
}

export interface HistogramValue {
    time: string;
    value: number;
}

export interface ExecCounts {
    success: InvocationMetric[],
    failed: InvocationMetric[]
}

export interface ExecCountsHistogramValue {
    success: HistogramValue[],
    failed: HistogramValue[],
    total?: HistogramValue[]
}

export interface RespTimeHistogramsValue {
    time: string;
    99: number,
    95: number,
    50: number
}

export interface RespTimeHistogramValue {
    responseTime: HistogramValue[];
}

export interface StackValue {
    name: string;
    value: number;
    children: StackValue[];
}

export interface FlameGraphValue {
    flameGraph: StackValue[];
}

export interface MetricsInfo {
    invocationExecTimes?: InvocationMetric[];
    invocationExecCounts?: ExecCounts;
    reqCountHistogram?: ExecCountsHistogramValue;
    respTimeHistograms?: RespTimeHistogramsValue[];
    isLoading: boolean;
    error?: Error;
}

export interface RCAMetricsInfo {
    reqCountHistogram?: ExecCountsHistogramValue;
    respTimeHistogram?: RespTimeHistogramValue;
    isLoading: boolean;
    error?: Error;
}

export interface FlameGraphInfo {
    flameGraphData?: FlameGraphValue;
    isLoading: boolean;
    error?: Error;
}

export interface SystemMetrics {
    timestamp: string;
    cpu: string;
    memory: string;
}

export interface SystemMetricsInfo {
    systemMetrics?: SystemMetrics[];
    isLoading: boolean;
    error?: Error;
}

