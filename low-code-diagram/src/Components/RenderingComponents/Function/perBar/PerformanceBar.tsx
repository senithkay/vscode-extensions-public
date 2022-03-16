import React, { useContext, useEffect, useState } from "react";

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
    const { performanceData } = diagramContext?.props;
    const [tooltip, setTooltip] = useState(undefined);

    const { concurrency, latency, tps, isPerfDataAvailable, isAdvancedPerfDataAvailable } = generatePerfData(model, performanceData);

    const onClickPerformance = async () => {
        if (!isAdvancedPerfDataAvailable) {
            return;
        }

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
        <p className={"more"} onClick={onClickPerformance}>{"Show More →"}</p>
    );

    //TODO:Add new tooltip component to support this scenario
    // useEffect(() => {
    //     if (showTooltip) {
    //         setTooltip(showTooltip(element, "heading-content", {
    //             heading: "Performance graph",
    //             content: (
    //                 isAdvancedPerfDataAvailable
    //                     ? "Click here to open the performance graph"
    //                     : "Insufficient data to provide detailed estimations"
    //             )
    //         }));
    //     }
    // }, [model]);

    const perBar = (
        <div className={"performance-bar"}>
            <div className={"rectangle"}>&nbsp;</div>
            <p>
                {isAdvancedPerfDataAvailable ? `Forecasted performance for concurrency ${concurrency} | Latency: ${latency} | Tps: ${tps}` : `Forecasted performance for a single user: Latency: ${latency} | Tps: ${tps}`}
            </p>
            {element}
        </div>
    );

    return (
        isPerfDataAvailable && perBar
    );
}
