import * as React from "react";
import * as ReactDOM from "react-dom";
import { PerformanceForcast } from "./performance-forcast/PerformanceForcast";


export function renderPerformance(data: any) {
    ReactDOM.render(
    <PerformanceForcast data={data} />,
    document.getElementById("performance")
    );
}