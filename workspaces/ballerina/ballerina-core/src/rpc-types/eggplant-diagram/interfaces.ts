/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LinePosition } from "../../interfaces/common";
import { Flow, Node } from "../../interfaces/eggplant";
import { TextEdit } from "../../interfaces/extended-lang-client";

export interface EggplantModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export type EggplantModelResponse = {
    flowDesignModel: Flow;
};

export interface UpdateNodeRequest {
    diagramNode: Node;
}

export interface UpdateNodeResponse {
    textEdits: TextEdit[];
}
