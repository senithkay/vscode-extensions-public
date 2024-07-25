/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import { Flow } from "../../interfaces/eggplant";
import {
    EggplantAvailableNodesRequest,
    EggplantAvailableNodesResponse,
    EggplantFlowModelResponse,
    EggplantNodeTemplateRequest,
    EggplantNodeTemplateResponse,
    EggplantSourceCodeRequest,
    EggplantSourceCodeResponse,
} from "../../interfaces/extended-lang-client";
import { RequestType } from "vscode-messenger-common";

const _preFix = "eggplant-diagram";
export const getFlowModel: RequestType<void, EggplantFlowModelResponse> = { method: `${_preFix}/getFlowModel` };
export const getSourceCode: RequestType<EggplantSourceCodeRequest, EggplantSourceCodeResponse> = { method: `${_preFix}/getSourceCode` };
export const getAvailableNodes: RequestType<EggplantAvailableNodesRequest, EggplantAvailableNodesResponse> = { method: `${_preFix}/getAvailableNodes` };
export const getNodeTemplate: RequestType<EggplantNodeTemplateRequest, EggplantNodeTemplateResponse> = { method: `${_preFix}/getNodeTemplate` };
