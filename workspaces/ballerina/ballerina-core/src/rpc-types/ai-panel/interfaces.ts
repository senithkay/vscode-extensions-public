/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { AIMachineStateValue } from "../../state-machine-types";

export type ErrorCode = {
    code: number;
    message: string;
};

export interface AIVisualizerState {
    state: AIMachineStateValue;
}
export interface AddToProjectRequest {
    content: string;
}

export interface GenerateMappingsRequest {
    position: NodePosition;
    filePath: string;
}

export interface GenerateMappingsResponse {
    newFnPosition?: NodePosition;
    error?: ErrorCode;
    userAborted?: boolean;
}

export interface NotifyAIMappingsRequest {
    newFnPosition: NodePosition;
    prevFnSource: string;
    filePath: string;
}
