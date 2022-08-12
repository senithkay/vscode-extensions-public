import React, { useContext, useEffect, useState } from "react";

import { ANALYZE_TYPE } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../Context/diagram";

import { generatePerfData } from "./PerformanceUtil";
import "./style.scss";

interface PerformanceProps {
    model: FunctionDefinition;
}

export function PerformanceBar(props: PerformanceProps) {
    const { model } = props;
    const diagramContext = useContext(Context);
    const openPerformanceChart = diagramContext?.api?.edit?.openPerformanceChart;
    const { diagramCleanDraw } = diagramContext?.actions;
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);

    const { concurrency, latency, tps, analyzeType, isDataAvailable } = generatePerfData(model);

    const onClickPerformance = async () => {
        let fullPath = "";
        for (const path of model.relativeResourcePath) {
            fullPath += (path as any).value;
        }

        if (openPerformanceChart) {
            await openPerformanceChart(`${model.functionName.value.toUpperCase()} /${fullPath}`,
                model.position, diagramCleanDraw);
        }
    };
    const element = (
        <p className={"more"} onClick={onClickPerformance}>{"Reveal critical path"}</p>
    );

    const content = "Click here to open the performance graph";

    useEffect(() => {
        if (model && showTooltip) {
            setTooltip(showTooltip(element, content));
        }
    }, [model]);

    const perBar = (
        <div className={"performance-bar"}>
            <div className={"rectangle"}>&nbsp;</div>
            <p>
                {`Forecasted performance of the ${isRealtime() ? "critical" : "selected"} path: Concurrency ${concurrency} | Latency: ${latency} | Tps: ${tps}`}
            </p>
            {isRealtime() && (tooltip ? tooltip : element)}
        </div>
    );

    return (
        isDataAvailable && perBar
    );

    function isRealtime() {
        return analyzeType === ANALYZE_TYPE.REALTIME;
    }
}
