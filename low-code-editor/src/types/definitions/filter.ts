import { ConstructIdentifier } from "@ballerina/syntax-tree";

import { TimeRangeISO } from "../../api/models";

export interface Filter {
    selectedConstruct?: ConstructIdentifier;
    timeRange: string | TimeRangeISO;
    timeZone: string;
    drillDownTimeRange?: TimeRangeISO;
    flameGraphSelectedTimeRange?: TimeRangeISO;
    err?: Error;
}
