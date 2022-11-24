import React, { useContext, useEffect, useState } from "react";

import { ANALYZE_TYPE, WarningIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";
import { debounce } from "lodash";

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
    const [revealGraphTooltip, setTooltip] = useState(undefined);
    const [warningTooltip, setWarningTooltip] = useState(undefined);

    const [concurrency, setConcurrency] = useState("");
    const [latency, setLatency] = useState("");
    const [tps, setTps] = useState("");
    const [analyzeType, setAnalyzeType] = useState(ANALYZE_TYPE.REALTIME);
    const [isDataAvailable, setIsDataAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const addPerfData = React.useRef(
        debounce(st => {
            const data = generatePerfData(st);
            setConcurrency(data.concurrency);
            setLatency(data.latency);
            setTps(data.tps);
            setAnalyzeType(data.analyzeType);
            setIsDataAvailable(data.isDataAvailable);
            setIsLoading(false);
        }, 3500)
    ).current;

    addPerfData(model);

    const onClickPerformance = async () => {
        let fullPath = "";
        for (const path of model.relativeResourcePath) {
            const p = path as any;
            if (p.kind === "ResourcePathSegmentParam") {
                fullPath += p.source;
            } else {
                fullPath += p.value;
            }
        }

        if (openPerformanceChart) {
            await openPerformanceChart(`${model.functionName.value.toUpperCase()} /${fullPath}`,
                model.position, diagramCleanDraw);
        }
    };
    const revealGraph = (
        <p className={"more"} onClick={onClickPerformance}>{"Reveal performance-critical path"}</p>
    );
    const RevealGraphTooltipText = "Click here to open the performance forecast";

    const warning = (
        <div className={"more"}><WarningIcon /></div>
    );
    const warningTooltipText = "Outdated data. Please wait a few seconds for the updated data.";

    useEffect(() => {
        setIsLoading(true);
        if (model && showTooltip) {
            setTooltip(showTooltip(revealGraph, RevealGraphTooltipText));
            setWarningTooltip(showTooltip(warning, warningTooltipText));
        }
    }, [model]);

    const perBar = (
        <div className={"performance-bar"}>
            <div className={'rectangle  ' + (isLoading ? 'outdated-rectangle' : 'active-rectangle')}>&nbsp;</div>
            <p className={isLoading ? 'outdated-text' : 'active-text'}>
                {`Forecasted performance of the ${isRealtime() ? "performance-critical" : "selected"} path: User Count: ${concurrency} | Latency: ${latency} | Tps: ${tps}`}
            </p>
            {!isLoading && isRealtime() && (revealGraphTooltip ? revealGraphTooltip : revealGraph)}
            {isLoading && (warningTooltip ? warningTooltip : warning)}
        </div>
    );

    return (
        isDataAvailable && perBar
    );

    function isRealtime() {
        return analyzeType === ANALYZE_TYPE.REALTIME;
    }
}
