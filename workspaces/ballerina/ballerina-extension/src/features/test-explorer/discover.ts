'use strict';
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function getDummyTestExecutorPositions() : KolaTestExecutorPositionsResponse {
    const e1 : ExecutorPosition = {
        kind: "function",
        range: {
            startLine: {
                line: 1,
                offset: 0
            },
            endLine: {
                line: 1,
                offset: 10
            }
        },
        name: "test1",
        filePath: "file1.bal",
        groups: ["group1"]
    };

    const e2 : ExecutorPosition = {
        kind: "function",
        range: {
            startLine: {
                line: 2,
                offset: 0
            },
            endLine: {
                line: 2,
                offset: 10
            }
        },
        name: "test2",
        filePath: "file1.bal",
        groups: ["group1", "group2"]
    };

    const e3 : ExecutorPosition = {
        kind: "function",
        range: {
            startLine: {
                line: 3,
                offset: 0
            },
            endLine: {
                line: 3,
                offset: 10
            }
        },
        name: "test3",
        filePath: "file1.bal",
        groups: ["group2"]
    };

    const executorPositions:  Map<string, ExecutorPosition[]>  = new Map<string, ExecutorPosition[]>();
    executorPositions.set("group1", [e1, e2]);
    executorPositions.set("group2", [e2, e3]);
    return {
        executorPositions
    };
}

export interface KolaTestExecutorPositionsResponse {
    executorPositions?: Map<string, ExecutorPosition[]>;
}

export interface ExecutorPosition {
    kind: string;
    range: LineRange;
    name: string;
    filePath: string;
    groups: string[];
}

export interface LineRange {
    startLine: LinePosition;
    endLine: LinePosition;
}
export interface LinePosition {
    line: number;
    offset: number;
}