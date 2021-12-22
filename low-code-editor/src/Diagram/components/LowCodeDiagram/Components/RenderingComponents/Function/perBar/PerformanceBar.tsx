import React from "react";

import Tooltip from "@material-ui/core/Tooltip";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../../../Contexts/Diagram";
import { addAdvancedLabels } from "../../../../../../../DiagramGenerator/performanceUtil";

import { generatePerfData } from "./PerformanceUtil";
import "./style.scss";

interface PerformanceProps {
    model: FunctionDefinition;
}

export function PerformanceBar(props: PerformanceProps) {
    const { model } = props;
    const {
        props: { performanceData },
        actions: { diagramCleanDraw },
    } = useDiagramContext();

    const { concurrency, latency, tps, isPerfDataAvailable, isAdvancedPerfDataAvailable } = generatePerfData(model, performanceData);

    const onClickPerformance = async () => {
        if (!isAdvancedPerfDataAvailable) {
            return;
        }

        let fullPath = "";
        for (const path of model.relativeResourcePath) {
            fullPath += (path as any).value;
        }

        await addAdvancedLabels(`${model.functionName.value.toUpperCase()} /${fullPath}`,
            model.position, diagramCleanDraw)
    };

    const perBar = (
        <div className={"performance-bar"}>
            <div className={"rectangle"}>&nbsp;</div>
            <p>
                {isAdvancedPerfDataAvailable ? `Forecasted performance for concurrency ${concurrency} | Latency: ${latency} | Tps: ${tps}` : `Forecasted performance for a single user: Latency: ${latency} | Tps: ${tps}`}
            </p>
            <Tooltip title={isAdvancedPerfDataAvailable ? "Click here to open the performance graph" : "Insufficient data to provide detailed estimations"}>
                <p className={"more"} onClick={onClickPerformance}>{"Show More →"}</p>
            </Tooltip>
        </div>
    );

    return (
        isPerfDataAvailable && perBar
    );
}
