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

import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';
import "./graph-styles.css";
import { DataGrid } from '@mui/x-data-grid';

export interface DataPoint {
    concurrency: number,
    latency: number,
    thinkTime: number,
    tps: number
}

export interface PerformanceForecastProps {
    name: String,
    data: DataPoint[]
}

interface vscode {
    postMessage(message: any): void;
}

const columns = [
    {
        field: "A/I",
        maxWidth: 50,
        flex: 1
    },
    {
        field: "Title",
        flex: 1
    },
    {
        field: "Completed",
        flex: 1
    }
];

function createData(number: any, item: any, qty: any, price: any) {
    return { id: number, "Title": item, "A/I": qty, "Completed": price };
}

const rows = [
    createData(1, "Apple", 5, 3),
    createData(2, "Orange", 2, 2),
    createData(3, "Grapes", 3, 1),
    createData(4, "Tomato", 2, 1.6),
    createData(5, "Mango", 1.5, 4)
];


declare const vscode: vscode;
let currentConcurrency = 1;
let hoverConcurrency = 1;
export const PerformanceForecast = ({ name, data }: PerformanceForecastProps) => {

    return (
        <div className="performance-forcast">
            <h1 className="center">Performance Graph - {name}</h1>

            <div>

                <DataGrid
                    rows={rows}
                    columns={columns}
                    hideFooter={true}
                    onRowClick={(param: any, event: any, detail: any) => {console.log(param);
                    }}
                    disableExtendRowFullWidth={true}
                    autoHeight={true}
                />

            </div>

            <div className="diagram">
                <div className="y-label">

                </div>
                <ResponsiveContainer height={250}>
                    <LineChart
                        width={500}
                        height={300}
                        data={data}
                        syncId="performance"
                        onMouseMove={handleHover}
                        onClick={handleClick}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        {getXAxis()}
                        <YAxis
                            tick={{ strokeWidth: 0, fontSize: 10 }}
                            axisLine={false}
                            tickSize={0}
                            tickMargin={15}
                            label={{ value: 'Throughput (req/s)', angle: -90, position: 'insideBottomLeft' }}
                        />
                        <YAxis />
                        <Tooltip cursor={{ strokeWidth: 2 }} />
                        <CartesianGrid strokeDasharray="0" />
                        <Line type="monotone" dataKey="tps" activeDot={{ onClick: handleClick }} baseLine={8}
                            stroke="#5567D5" strokeWidth="2" fillOpacity={1} fill="url(#colorThroughput)" />
                    </LineChart>
                </ResponsiveContainer>
                <div className="x-label">
                    User Count
                </div>
            </div>

            <div className="diagram latency">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                        width={500}
                        height={300}
                        data={data}
                        syncId="performance"
                        onMouseMove={handleHover}
                        onClick={handleClick}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        {getXAxis()}
                        <YAxis
                            tick={{ strokeWidth: 0, fontSize: 10 }}
                            axisLine={false}
                            tickSize={0}
                            tickMargin={15}
                            label={{ value: 'Latency (ms)', angle: -90, position: 'insideBottomLeft' }}

                        />
                        <YAxis />
                        <Tooltip cursor={{ strokeWidth: 2 }} />
                        <CartesianGrid strokeDasharray="0" />
                        <Line type="monotone" dataKey="latency" activeDot={{ onClick: handleClick }}
                            stroke="#EA4C4D" strokeWidth="2" fillOpacity={1} fill="url(#colorLatency)" />
                    </LineChart>
                </ResponsiveContainer>
                <div className="x-label">
                    User Count
                </div>
            </div>
            <a href="https://wso2.com/choreo/docs/references/performance-analysis/">
                How Performance Analyzer Works
            </a>
        </div>
    );
};

/**
 * Handle mouse click event.
 * 
 * @param index clicked index
 * @param data event data
 */
const handleClick = (index: any, data: any) => {
    if (index.chartX && index.activeCoordinate) {

        // if click on line
        const activeCoordinateX = index.activeCoordinate.x;
        if (index.chartX > activeCoordinateX - 2 && index.chartX < activeCoordinateX + 2) {

            const concurrenct = index.activeLabel;
            currentConcurrency = concurrenct;
            updateConcurrency(concurrenct);
        }

    } else {

        // if click on dot
        const payload: DataPoint = data.payload;
        currentConcurrency = payload.concurrency;
        updateConcurrency(payload.concurrency);
    }

}

/**
 * Handle mouse hover event.
 * 
 * @param data event data
 */
const handleHover = (data: any) => {
    if (!data.activeLabel) {

        updateConcurrency(currentConcurrency);
    }

    if (data.activeLabel && data.activeLabel != hoverConcurrency) {

        hoverConcurrency = data.activeLabel;
        updateConcurrency(data.activeLabel);

    }
}

/**
 * Send concurrency to update codelenses.
 * 
 * @param concurrency Concurrency
 */
function updateConcurrency(concurrency: number) {
    vscode.postMessage({
        command: 'updateCodeLenses',
        text: concurrency
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

const getYAxis = () =>
    <YAxis
        tick={{ strokeWidth: 0, fontSize: 10 }}
        axisLine={false}
        tickSize={0}
        tickMargin={15}
    />;
