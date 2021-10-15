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

import { Range } from "vscode";

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

export class DataLabel {
    private file: String;
    private range: Range;
    private label: String;
    private resourceName: String;
    private resourcePos: Range;
    private data: any;

    constructor(file: String, range: Range, label: String, resourceName: String, resourcePos: Range, data: any) {
        this.file = file;
        this.range = range;
        this.label = label;
        this.resourceName = resourceName;
        this.resourcePos = resourcePos;
        this.data = data;
    }

    public get getFile(): String {
        return this.file;
    }

    public get getRange(): Range {
        return this.range;
    }

    public get getLabel(): String {
        return this.label;
    }

    public get getResourceName(): String {
        return this.resourceName;
    }

    public get getResourcePos(): Range {
        return this.resourcePos;
    }

    public get getData(): any {
        return this.data;
    }

}
