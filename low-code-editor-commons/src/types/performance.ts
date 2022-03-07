import { PerformanceAnalyzerRealtimeResponse } from ".";

export interface PerformanceData {
    data: PerformanceAnalyzerRealtimeResponse,
    type: ANALYZE_TYPE
}

export enum ANALYZE_TYPE {
    ADVANCED = "advanced",
    REALTIME = "realtime",
}
