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

import { Uri } from 'vscode';

export interface DiagramOptions {
    startLine?: number;
    startColumn?: number;
    isDiagram: boolean;
    fileUri?: Uri;
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

interface Position {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}

interface ResourcePath {
    value: string;
}

export interface DiagnosticInfo {
    code: string;
    severity: string;
}

export interface Diagnostic {
    message: string;
    diagnosticInfo: DiagnosticInfo;
    range: Position;
}

export interface CommandResponse {
    error: boolean;
    message: string;
}
