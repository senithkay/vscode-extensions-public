/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useState } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';
import "./graph-styles.css";
import { DataGrid } from '@mui/x-data-grid';
import { ConnectorPosition, PerformanceForecastProps, Values, VSCode } from './model';

declare const vscode: VSCode;
export const PerformanceForecast = ({ name, data }: PerformanceForecastProps) => {
    const criticalPathId = data.criticalPath;
    const paths = data.paths;
    const pathMaps = data.pathmaps;
    const positions = data.positions;

    const rows: any = [];
    const [graphData, setGraphData] = useState(paths[criticalPathId].graphData);
    const [selectedRow, setSelectedRow] = useState(criticalPathId);

    for (const key in pathMaps) {
        const latency = paths[key].sequenceDiagramData.latency;
        rows.push(createData(Number(key), pathMaps[key], positions, getPerfValuesWithUnit(latency)))
    }

    const isGraphDataAvailable = graphData.length === 0;
    const graph = (
        <>
            <div className="diagram-wrapper">
                {isGraphDataAvailable && <div className="overlay"></div>}
                {isGraphDataAvailable && <div className="no-data-dialog">Insufficient data to plot performance curves for the selected path</div>}
                <div className="diagram">
                    <div className="y-label">
                    </div>
                    <ResponsiveContainer height={250}>
                        <LineChart
                            width={500}
                            height={300}
                            data={graphData}
                            syncId="performance"
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5
                            }}
                        >
                            {getXAxis()}
                            <YAxis
                                tick={{ strokeWidth: 0, fontSize: 10 }}
                                axisLine={false}
                                tickSize={0}
                                tickMargin={15}
                                label={{ value: 'Throughput (req/s)', angle: -90, position: 'insideBottomLeft' }} />
                            <YAxis />
                            <Tooltip cursor={{ strokeWidth: 2 }} />
                            <CartesianGrid strokeDasharray="0" />
                            <Line type="monotone" dataKey="tps" baseLine={8}
                                stroke="#5567D5" strokeWidth="2" fillOpacity={1} fill="url(#colorThroughput)" />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="x-label">
                        User Count
                    </div>
                </div>
            </div>
            <div className="diagram-wrapper">
                {isGraphDataAvailable && <div className="overlay"></div>}
                {isGraphDataAvailable && <div className="no-data-dialog">Insufficient data to plot performance curves for the selected path</div>}
                <div className="diagram latency">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                            width={500}
                            height={300}
                            data={graphData}
                            syncId="performance"
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5
                            }}
                        >
                            {getXAxis()}
                            <YAxis
                                tick={{ strokeWidth: 0, fontSize: 10 }}
                                axisLine={false}
                                tickSize={0}
                                tickMargin={15}
                                label={{ value: 'Latency (ms)', angle: -90, position: 'insideBottomLeft' }} />
                            <YAxis />
                            <Tooltip cursor={{ strokeWidth: 2 }} />
                            <CartesianGrid strokeDasharray="0" />
                            <Line type="monotone" dataKey="latency"
                                stroke="#EA4C4D" strokeWidth="2" fillOpacity={1} fill="url(#colorLatency)" />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="x-label">
                        User Count
                    </div>
                </div>
            </div></>
    );

    const columns = [
        {
            field: `LATENCY`,
            headerName: `LATENCY (User Count 1 - ${paths[criticalPathId].sequenceDiagramData.concurrency.max})`,
            minWidth: 215,
            flex: 0.2,
            sortable: false,
        },
        {
            field: "PATH",
            minWidth: 700,
            flex: 1,
            sortable: false
        }
    ];

    return (
        <div className="performance-forcast">
            <h1 className="center">Performance Graph - {name}</h1>
            <h3>Paths</h3>

            <div>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    hideFooter={true}
                    disableColumnMenu={true}
                    disableExtendRowFullWidth={true}
                    autoHeight={true}
                    onRowClick={(param: any) => {
                        const id = param.id;
                        setGraphData(paths[id].graphData);
                        setSelectedRow(id);
                        updatePath(id.toString());
                    }}
                    selectionModel={selectedRow}
                />

            </div>

            {graphData && graph}

            <div className="link">
                <a href="https://wso2.com/choreo/docs/references/performance-analysis/">
                    How Performance Analyzer Works
                </a>
            </div>
        </div>
    );
};

/**
 * Send path to update UI.
 * 
 * @param pathId Path Id
 */
function updatePath(pathId: string) {
    vscode.postMessage({
        command: 'updatePerfPath',
        text: pathId
    });
}

const getXAxis = () =>
    <XAxis
        dataKey="concurrency"
        ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
        tick={{ strokeWidth: 0, fontSize: 10 }}
        axisLine={false}
        tickSize={0}
        tickMargin={15}
        scale="linear"
        type="number"
    >
    </XAxis>;

function createData(id: number, connectors: string[], positions: Record<string, ConnectorPosition>, latency: string) {
    let pathName = "Start";

    connectors.forEach((connectorId) => {
        const position = positions[connectorId];
        pathName += ` - ${position.pkgID}/${position.name}`;
    });
    pathName += " - End";
    return { id, "LATENCY": latency, "PATH": pathName };
}

function getPerfValuesWithUnit(latencies: Values): string {

    return `${getResponseTime(latencies.min!)} ${getResponseUnit(latencies.min!)} - ${getResponseTime(latencies.max)} ${getResponseUnit(latencies.max)}`;
}

function getResponseTime(responseTime: number) {
    return responseTime > 1000 ? (responseTime / 1000).toFixed(2) : responseTime
}

function getResponseUnit(responseTime: number) {
    return responseTime > 1000 ? " s" : " ms";
}
