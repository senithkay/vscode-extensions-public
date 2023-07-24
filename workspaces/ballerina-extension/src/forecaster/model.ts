/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PerformanceAnalyzerResponse, Range } from "../core";
import { CODELENSE_TYPE } from "./codelens-provider";

export enum ANALYZETYPE {
    ADVANCED = "advanced",
    REALTIME = "realtime",
}

export interface GraphData {
    name: String;
    graphData: GraphPoint[];
}

export interface PFSession {
    choreoAPI: String;
    choreoToken: String | undefined;
    choreoCookie?: String | undefined;
}

export interface PerformanceGraphRequest {
    file: string;
    data: PerformanceAnalyzerAdvancedResponse;
}

export interface SyntaxTree {
    members: Member[];
}

export interface Member {
    kind: string;
    position: Position;
    functionName?: {
        value: string;
        position: Position;
    };
    members: Member[];
    relativeResourcePath?: ResourcePath[];
}

export interface Position {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}

interface ResourcePath {
    value: string;
}

export class CurrentResource {
    private position: Range;
    private latency: String;

    constructor(position: Range, latency: String) {
        this.position = position;
        this.latency = latency;
    }

    public get getPosition(): Range {
        return this.position;
    }

    public get getLatency(): String {
        return this.latency;
    }
}

export interface Values {
    min?: number;
    max: number;
}
export class DataLabel {
    private type: CODELENSE_TYPE;
    private file: String;
    private range: Range;
    private concurrency: Values;
    private latency: Values;
    private tps: Values;
    private data: any;

    constructor(type: CODELENSE_TYPE, file: String, range: Range, concurrency: Values, latency: Values, tps: Values, data: any) {
        this.type = type;
        this.file = file;
        this.range = range;
        this.concurrency = concurrency;
        this.latency = latency;
        this.tps = tps;
        this.data = data;
    }

    public get getType(): CODELENSE_TYPE {
        return this.type;
    }

    public get getFile(): String {
        return this.file;
    }

    public get getRange(): Range {
        return this.range;
    }

    public get getConcurrency(): Values {
        return this.concurrency;
    }

    public get getLatency(): Values {
        return this.latency;
    }

    public get getTps(): Values {
        return this.tps;
    }

    public get getData(): any {
        return this.data;
    }

}

export interface PerfContext {
    resourceData: PerformanceAnalyzerResponse | undefined;
    advancedData: PerformanceAnalyzerAdvancedResponse | undefined;
    file: string | undefined;
}

export interface PerformanceAnalyzerRealtimeResponse {
    message: string;
    type: any;
    positions: Record<string, ConnectorPosition>;
    concurrency: Values;
    latency: Values;
    tps: Values;
    connectorLatencies: Record<string, Values>;
}

export interface PerformanceAnalyzerAdvancedResponse {
    message?: string;
    criticalPath: number;
    pathmaps: Record<string, string[]>;
    paths: Record<string, PathData>;
    positions: Record<string, ConnectorPosition>;
}

interface PathData {
    graphData: GraphPoint[];
    sequenceDiagramData: SequenceDiagramData;
}

interface ConnectorPosition {
    name: string;
    pkgID: string;
    pos: string;
}

export interface GraphPoint {
    concurrency: number;
    latency: number;
    tps: number;
}

export interface Values {
    min?: number;
    max: number;
}

interface SequenceDiagramData {
    concurrency: Values;
    latency: Values;
    tps: Values;
    connectorLatencies: Record<string, Values>;
}

export interface PerformanceGraphRequest {
    file: string;
    name: string;
    data: PerformanceAnalyzerAdvancedResponse;
}
