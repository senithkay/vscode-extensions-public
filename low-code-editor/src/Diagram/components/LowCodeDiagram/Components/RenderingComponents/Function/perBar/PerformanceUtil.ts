import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";

import { ANALYZE_TYPE } from "../../../../../../../DiagramGenerator/performanceUtil";

export function generatePerfData(model: FunctionDefinition) {
    let concurrency: string;
    let latency: string;
    let tps: string;
    let isPerfDataAvailable = false;
    let isAdvancedPerfDataAvailable = false;

    if ((model as any).performance) {
        const perfData = (model as any).performance;
        const analyzeType: ANALYZE_TYPE = perfData.analyzeType;
        const concurrencies = perfData.concurrency;
        const latencies = perfData.latency;
        const tpss = perfData.tps;

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
