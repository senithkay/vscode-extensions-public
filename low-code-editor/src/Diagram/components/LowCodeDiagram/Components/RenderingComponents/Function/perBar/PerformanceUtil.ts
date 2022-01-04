import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";

import { ANALYZE_TYPE, PerformanceData } from "../../../../../../../DiagramGenerator/performanceUtil";

export function generatePerfData(model: FunctionDefinition, performanceData: Map<string, PerformanceData>) {
    let concurrency: string;
    let latency: string;
    let tps: string;
    let isPerfDataAvailable = false;
    let isAdvancedPerfDataAvailable = false;

    if (!performanceData) {
        return { concurrency, latency, tps, isPerfDataAvailable, isAdvancedPerfDataAvailable };
    }

    let data;
    let analyzeType: ANALYZE_TYPE;
    const pos = model.position;
    const position = `${pos.startLine},${pos.startColumn},${pos.endLine},${pos.endColumn}`;
    if ((model as any).performance) {
        data = (model as any).performance;
        analyzeType = data.analyzeType;
    } else if (performanceData.get(position)) {
        data = performanceData.get(position).data;
        analyzeType = performanceData.get(position).type;
    }

    if (data) {
        const concurrencies = data.concurrency as any;
        const latencies = data.latency as any;
        const tpss = data.tps;

        if (analyzeType === ANALYZE_TYPE.REALTIME && latencies && concurrencies && tpss) {
            isPerfDataAvailable = true;
            const minLatency = latencies.min ? `${latencies.min > 1000 ? latencies.min / 1000 :
                latencies.min} ${latencies.min > 1000 ? " s" : " ms"}` : '0';
            const maxLatency = latencies.max ? `${latencies.max > 1000 ? latencies.max / 1000 :
                latencies.max} ${latencies.max > 1000 ? " s" : " ms"}` : '0';

            isAdvancedPerfDataAvailable = concurrencies.max !== 1;

            concurrency = isAdvancedPerfDataAvailable ? `${concurrencies.min} - ${concurrencies.max}` : concurrencies;
            latency = isAdvancedPerfDataAvailable ? `${minLatency} - ${maxLatency}` : maxLatency;
            tps = isAdvancedPerfDataAvailable ? `${tpss.min} - ${tpss.max} req/s` : `${tpss.max} req/s`;

        } else if (analyzeType === ANALYZE_TYPE.ADVANCED) {
            isPerfDataAvailable = true;
            isAdvancedPerfDataAvailable = true;
            concurrency = concurrencies;
            latency = `${latencies > 1000 ? latencies / 1000 : latencies} ${latencies > 1000 ? " s" : " ms"}`;
            tps = `${tpss} req/s`;
        }

    }

    return { concurrency, latency, tps, isPerfDataAvailable, isAdvancedPerfDataAvailable };
}
