import { AppInfo } from "../../api/models";

import { AnalysisInfo } from "./analyze";
import { ASTInfo } from "./ast";
import { Filter } from "./filter";
import { CollectedLogs, GroupedLogs } from "./logs";
import { FlameGraphInfo, MetricsInfo, RCAMetricsInfo, SystemMetricsInfo } from "./metrics";
import { TraceInfo } from "./traces";

export interface ObserveViewError {
    cause?: any;
    shown?: boolean;
}

export interface LinkedAppState {
    isLinked: boolean,
    isAppFetchInProgress: boolean;
    linkedApp?: AppInfo;
    isLinkInProgress?: boolean;
}

export interface ObserveViewState {
    observeId?: string;
    isShared?: boolean;
    version?: string;
    linkedAppInfo?: LinkedAppState;
    astInfo?: ASTInfo;
    filter?: Filter;
    metricsInfo?: MetricsInfo;
    rcaMetricsInfo?: RCAMetricsInfo;
    flameGraphInfo?: FlameGraphInfo;
    systemMetricsInfo? : SystemMetricsInfo;
    collectedLogs?: CollectedLogs;
    groupedLogs?: GroupedLogs;
    traceInfo?: TraceInfo;
    analysisInfo?: AnalysisInfo;
    errors?: ObserveViewError[];
}
