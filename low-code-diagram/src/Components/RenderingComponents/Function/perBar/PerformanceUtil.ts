import { TopBarData } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";

export function generatePerfData(model: FunctionDefinition) {
    let concurrency: string;
    let latency: string;
    let tps: string;
    let isDataAvailable = false;

    const data: TopBarData = (model as any).performance;

    if (data) {
        isDataAvailable = true;
        concurrency = data.concurrency;
        latency = data.latency;
        tps = data.tps;
        // isAdvancedPerfDataAvailable = data.
    }

    return { concurrency, latency, tps, isDataAvailable };
}
