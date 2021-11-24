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
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./graph-styles.css";

export interface DataPoint {
    concurrency: number,
    latency: number,
    thinkTime: number,
    tps: number
}

export interface PerformanceForcastProps {
    name: String,
    data: DataPoint[]
}

interface vscode {
    postMessage(message: any): void;
}

declare const vscode: vscode;

export const PerformanceForcast = ({ name, data }: PerformanceForcastProps) => {
    return (
        <div className="performance-forcast">
            <h1 className="center">Performance Graph - {name}</h1>
            <div className="diagram">
                <div className="y-label">

                </div>
                <ResponsiveContainer height={250}>
                    <AreaChart
                        width={500}
                        height={300}
                        data={data}
                        syncId="performance"
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
                        <Area type="monotone" dataKey="tps" activeDot={{ onClick: handleClick }} baseLine={8}
                            stroke="#5567D5" strokeWidth="2" fillOpacity={1} fill="url(#colorThroughput)" />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="x-label">
                    User Count
                </div>
            </div>

            <div className="diagram latency">
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                        width={500}
                        height={300}
                        data={data}
                        syncId="performance"
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
                        <Area type="monotone" dataKey="latency" activeDot={{ onClick: handleClick }}
                            stroke="#EA4C4D" strokeWidth="2" fillOpacity={1} fill="url(#colorLatency)" />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="x-label">
                    User Count
                </div>
            </div>
            <a href="https://wso2.com/choreo/docs/observability/analyze-performance/">
                How Performance Analyzer Works
            </a>
        </div>
    );
};

/**
 * Send clicked data point to update codelenses,
 * @param index Point index
 * @param data Point data
 */
const handleClick = (index: any, data: any) => {
    const payload: DataPoint = data.payload;
    vscode.postMessage({
        command: 'updateCodeLenses',
        text: payload.concurrency
    })
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
