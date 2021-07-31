import { LogLevel, TimeRangeISO } from "../../api/models";

export interface CollectedLogLine {
    timestamp: string;
    level: LogLevel;
    logLine: string;
}

export interface GroupedLogLine {
    bin: string;
    groupLogs: string;
}

export interface GroupedLogs {
    timeRange?: TimeRangeISO;
    logs: GroupedLogLine[];
    isLoading: boolean;
    error?: Error;
}
