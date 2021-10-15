import React, { PureComponent } from 'react';
import { AreaChart, Area, Label, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
                        <Tooltip />
                        <Legend />
                        <CartesianGrid strokeDasharray="0" />
                        {/* <Line type="monotone" dataKey="tps" stroke="#5567D5" activeDot={{ r: 8 }} /> */}
                        <Area type="monotone" dataKey="tps" stroke="#5567D5" strokeWidth="2" fillOpacity={1} fill="url(#colorThroughput)" />
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
                        <Tooltip />
                        <Legend />
                        <CartesianGrid strokeDasharray="0" />
                        {/* <Line type="monotone" dataKey="latency" stroke="#EA4C4D" activeDot={{ r: 8 }} /> */}
                        <Area type="monotone" dataKey="latency" stroke="#EA4C4D" strokeWidth="2" fillOpacity={1} fill="url(#colorLatency)" />
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
