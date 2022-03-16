import { PerformanceAnalyzerRealtimeResponse } from "./lang-client-extended";

export interface PerformanceData {
    data: PerformanceAnalyzerRealtimeResponse,
    type: ANALYZE_TYPE
}

export enum ANALYZE_TYPE {
    ADVANCED = "advanced",
    REALTIME = "realtime",
}
